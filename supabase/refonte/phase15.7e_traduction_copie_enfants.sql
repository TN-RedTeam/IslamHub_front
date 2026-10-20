-- ============================================================================
-- Phase 15.7 — vague e : la traduction COPIE AUSSI LES ENFANTS
-- ============================================================================
-- Remplace admin_add_translation (create or replace, même signature). Version
-- autoritaire : inclut le type 'question' dans le registre ET, après avoir créé
-- la ligne traduite, DUPLIQUE ses enfants pour éviter de tout re-saisir :
--
--   • BLOCS composables (contenu_blocs) pour les types qui en utilisent
--     (dossier / parole / equivoque / question). L'arabe des preuves (citation
--     ou saisie libre) est conservé ; la prose (texte_md, commentaire_md,
--     libre_traduction) est copiée telle quelle → à traduire dans la version
--     cible. Chaque bloc copié reçoit un translation_group neuf + la locale
--     cible (l'index UNIQUE (translation_group, locale) l'exige).
--   • LIENS DE THÈMES (taxonomie partagée, langue-neutre) : hadith_themes /
--     parole_themes / coran_themes / question_themes.
--   • LIENS DE DOSSIERS : question_dossiers et dossiers_lies.
--
-- NB. Les preuves par citation_id pointent encore la source FR (même arabe) ;
-- à re-cibler manuellement si une version traduite de la citation existe.
-- Prérequis : phase15.7d (unicité arabe par langue) doit être appliqué avant,
-- sinon la copie d'une entrée à arabe identique échouerait déjà à l'INSERT.
-- ============================================================================

create or replace function public.admin_add_translation(p_kind text, p_source_id bigint, p_locale text)
 returns bigint language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_table text; v_slugcol text; v_pubcol text;
  v_tg uuid; v_cols text; v_slug text; v_new_id bigint; v_n int;
  v_bloc_pt text;
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
    ('question','questions','slug','publiee'),
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

  -- ----- COPIE DES ENFANTS -------------------------------------------------
  -- 1) Blocs composables (translation_group neuf par bloc + locale cible).
  v_bloc_pt := case p_kind
                 when 'dossier'   then 'dossier'
                 when 'parole'    then 'parole'
                 when 'equivoque' then 'equivoque'
                 when 'question'  then 'question'
                 else null end;
  if v_bloc_pt is not null then
    insert into public.contenu_blocs
      (parent_type, parent_id, ordre, type, texte_md, citation_type, citation_id,
       commentaire_md, libre_arabe, libre_traduction, libre_ref, locale, translation_group)
    select v_bloc_pt, v_new_id::text, ordre, type, texte_md, citation_type, citation_id,
           commentaire_md, libre_arabe, libre_traduction, libre_ref, p_locale, gen_random_uuid()
    from public.contenu_blocs
    where parent_type = v_bloc_pt and parent_id = p_source_id::text;
  end if;

  -- 2) Liens de thèmes (références de taxonomie partagée, langue-neutres).
  if p_kind = 'hadith' then
    insert into public.hadith_themes (hadith_id, theme_slug)
      select v_new_id, theme_slug from public.hadith_themes where hadith_id = p_source_id
      on conflict do nothing;
  elsif p_kind = 'parole' then
    insert into public.parole_themes (parole_id, theme_slug)
      select v_new_id, theme_slug from public.parole_themes where parole_id = p_source_id
      on conflict do nothing;
  elsif p_kind = 'coran' then
    insert into public.coran_themes (coran_id, theme_slug)
      select v_new_id, theme_slug from public.coran_themes where coran_id = p_source_id
      on conflict do nothing;
  elsif p_kind = 'question' then
    insert into public.question_themes (question_id, theme_slug)
      select v_new_id, theme_slug from public.question_themes where question_id = p_source_id
      on conflict do nothing;
    insert into public.question_dossiers (question_id, dossier_id, ordre)
      select v_new_id, dossier_id, ordre from public.question_dossiers where question_id = p_source_id
      on conflict do nothing;
  end if;

  -- 3) Dossiers liés (maillage dossier → dossier).
  if p_kind = 'dossier' then
    insert into public.dossiers_lies (dossier_id, dossier_lie_id)
      select v_new_id, dossier_lie_id from public.dossiers_lies where dossier_id = p_source_id
      on conflict do nothing;
  end if;

  return v_new_id;
end $function$;

grant execute on function public.admin_add_translation(text,bigint,text) to authenticated;

-- ---- PREUVE : la fonction existe (exécution réelle = via session admin) ----
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace='public'::regnamespace and proname='admin_add_translation';
