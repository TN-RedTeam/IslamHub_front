-- ============================================================================
-- Phase 15.7 — vague b : circuit de traduction GÉNÉRIQUE (tous les types)
-- ============================================================================
-- Remplace la version paroles-spécifique de 15.7a (create or replace, mêmes
-- signatures). Applique DIRECTEMENT ce fichier (il se suffit à lui-même).
--
-- Copie dynamique par introspection : pour un `kind` donné, on copie toutes les
-- colonnes de la ligne source SAUF id, locale, translation_group, le slug et le
-- flag de publication (surchargés), les colonnes générées (arabe_hash) et les
-- vecteurs de recherche (search_fr) — recalculés par trigger. L'arabe sacré est
-- donc conservé (copié). EN et AR sont reliés au même translation_group ;
-- publiee/published=false (brouillon) ; slug suffixé -en/-ar si la table en a un.
--
-- LIMITE assumée (fondations) : les ENFANTS (blocs d'article, sources, images,
-- citations, liens de thèmes) ne sont PAS dupliqués ici — ils se re-saisissent /
-- se relient dans l'entrée traduite (les liens de thèmes se reconstruisent au
-- 1er enregistrement via le champ tag pour les types qui le gèrent).
--
-- exposes (clé primaire = slug texte) n'est pas couvert par cette mécanique
-- (id bigint) ; il aura un traitement dédié si besoin.
-- ============================================================================

create or replace function public.admin_add_translation(p_kind text, p_source_id bigint, p_locale text)
 returns bigint
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_table text; v_slugcol text; v_pubcol text;
  v_tg uuid; v_cols text; v_slug text; v_new_id bigint; v_n int;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if p_locale not in ('en','ar') then raise exception 'Langue cible invalide : %', p_locale; end if;

  select t, s, pub into v_table, v_slugcol, v_pubcol
  from (values
    ('hadith','hadiths','slug','publiee'),
    ('parole','paroles','slug','publiee'),
    ('recit','recits','slug','published'),
    ('dossier','dossiers','slug','published'),
    ('savant','savants','slug','publiee'),
    ('equivoque','versets_equivoques','slug','published'),
    ('sourate','sourates','slug','publiee'),
    ('nom','noms_allah','slug',null),
    ('attribut','attributs','slug',null),
    ('coran','coran',null,'publiee'),
    ('invocation','invocations',null,'publiee'),
    ('femme','femmes',null,'publiee'),
    ('fiqh','fiqh',null,'publiee')
  ) as m(k,t,s,pub) where m.k = p_kind;

  if v_table is null then raise exception 'Type non pris en charge : %', p_kind; end if;

  execute format('select translation_group from public.%I where id=$1', v_table) into v_tg using p_source_id;
  if v_tg is null then raise exception '% source introuvable (id %).', p_kind, p_source_id; end if;

  execute format('select count(*) from public.%I where translation_group=$1 and locale=$2', v_table)
    into v_n using v_tg, p_locale;
  if v_n > 0 then raise exception 'Une version % existe déjà pour ce groupe.', p_locale; end if;

  -- colonnes copiables (ordre stable, identique pour INSERT et SELECT)
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into v_cols
    from information_schema.columns
    where table_schema='public' and table_name=v_table
      and is_generated='NEVER' and data_type <> 'tsvector'
      and column_name not in ('id','locale','translation_group')
      and column_name is distinct from v_slugcol
      and column_name is distinct from v_pubcol;

  -- slug suffixé si la table en a un (valeur générée côté serveur → littéral sûr)
  if v_slugcol is not null then
    execute format('select %I from public.%I where id=$1', v_slugcol, v_table) into v_slug using p_source_id;
    v_slug := coalesce(nullif(v_slug,''), p_kind) || '-' || p_locale;
    execute format('select count(*) from public.%I where %I=$1', v_table, v_slugcol) into v_n using v_slug;
    if v_n > 0 then v_slug := v_slug || '-' || floor(random()*100000)::text; end if;
  end if;

  execute format(
    'insert into public.%1$I (%2$s, locale, translation_group%3$s%4$s) '
    'select %2$s, $1, $2%5$s%6$s from public.%1$I where id=$3 returning id',
    v_table, v_cols,
    case when v_slugcol is not null then ', '||quote_ident(v_slugcol) else '' end,
    case when v_pubcol  is not null then ', '||quote_ident(v_pubcol)  else '' end,
    case when v_slugcol is not null then ', '||quote_literal(v_slug)  else '' end,
    case when v_pubcol  is not null then ', false'                    else '' end
  ) into v_new_id using p_locale, v_tg, p_source_id;

  return v_new_id;
end $function$;

create or replace function public.admin_translation_status(p_kind text, p_source_id bigint)
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_table text; v_pubcol text; v_pubexpr text; v_tg uuid; v_result json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;

  select t, pub into v_table, v_pubcol
  from (values
    ('hadith','hadiths','publiee'), ('parole','paroles','publiee'),
    ('recit','recits','published'), ('dossier','dossiers','published'),
    ('savant','savants','publiee'), ('equivoque','versets_equivoques','published'),
    ('sourate','sourates','publiee'), ('nom','noms_allah',null), ('attribut','attributs',null),
    ('coran','coran','publiee'), ('invocation','invocations','publiee'),
    ('femme','femmes','publiee'), ('fiqh','fiqh','publiee')
  ) as m(k,t,pub) where m.k = p_kind;

  if v_table is null then raise exception 'Type non pris en charge : %', p_kind; end if;

  execute format('select translation_group from public.%I where id=$1', v_table) into v_tg using p_source_id;
  if v_tg is null then raise exception '% source introuvable (id %).', p_kind, p_source_id; end if;

  v_pubexpr := case when v_pubcol is not null then quote_ident(v_pubcol) else 'true' end;

  execute format(
    'select json_build_object('
    '''translation_group'', $1,'
    '''fr'', json_build_object(''exists'', bool_or(locale=''fr''), ''id'', max(id) filter (where locale=''fr''), ''publiee'', coalesce(bool_or(locale=''fr'' and %1$s), false)),'
    '''en'', json_build_object(''exists'', bool_or(locale=''en''), ''id'', max(id) filter (where locale=''en''), ''publiee'', coalesce(bool_or(locale=''en'' and %1$s), false)),'
    '''ar'', json_build_object(''exists'', bool_or(locale=''ar''), ''id'', max(id) filter (where locale=''ar''), ''publiee'', coalesce(bool_or(locale=''ar'' and %1$s), false))'
    ') from public.%2$I where translation_group=$1',
    v_pubexpr, v_table
  ) into v_result using v_tg;

  return v_result;
end $function$;

grant execute on function public.admin_add_translation(text,bigint,text)   to authenticated;
grant execute on function public.admin_translation_status(text,bigint)      to authenticated;

-- ---- PREUVE : les RPC existent (exécution réelle = via session admin) -----
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace='public'::regnamespace
  and proname in ('admin_add_translation','admin_translation_status')
order by proname;
