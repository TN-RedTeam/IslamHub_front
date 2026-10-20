-- ============================================================================
-- « Questions fréquentes » — sous-partie 6 : circuit ADMIN
-- ============================================================================
-- RPC protégées (SECURITY DEFINER + is_admin()) :
--   admin_list_questions()           : toutes les questions (brouillons inclus)
--   admin_get_question(p_id)         : une question + liens thèmes & dossiers
--   admin_save_question(p jsonb)     : upsert + remplace les liens thèmes/dossiers
--   admin_delete_question(p_id)      : supprime la question (+ ses blocs & liens)
-- Le développement sourcé reste géré par les blocs composables génériques
-- (admin_get_blocs / admin_save_blocs avec parent_type='question').
-- Enfin : enregistre 'question' dans admin_translation_status (panneau de
-- traduction). admin_add_translation n'est PAS redéfini ici : sa version
-- autoritaire (avec 'question' + copie des enfants) est celle de phase15.7e.
-- Ordre INDIFFÉRENT vis-à-vis de 15.7e (fonctions distinctes). À exécuter
-- après questions_01/02.
-- ============================================================================

-- 1) Liste admin ------------------------------------------------------------
create or replace function public.admin_list_questions()
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare v json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  select coalesce(json_agg(row_to_json(x) order by x.ordre, x.question), '[]'::json) into v from (
    select q.id, q.question, q.slug, q.publiee, q.ordre, q.locale,
      (select count(*) from public.contenu_blocs b
         where b.parent_type='question' and b.parent_id=q.id::text) as n_blocs
    from public.questions q
  ) x;
  return v;
end $function$;

-- 2) Lecture pour édition ---------------------------------------------------
create or replace function public.admin_get_question(p_id bigint)
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare v json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  select json_build_object(
    'id', q.id, 'question', q.question, 'slug', q.slug, 'reponse_courte', q.reponse_courte,
    'variantes', to_json(q.variantes), 'publiee', q.publiee, 'ordre', q.ordre,
    'locale', q.locale, 'translation_group', q.translation_group,
    'theme_slugs', coalesce((select json_agg(qt.theme_slug order by qt.theme_slug)
                             from public.question_themes qt where qt.question_id=q.id), '[]'::json),
    'dossier_ids', coalesce((select json_agg(qd.dossier_id order by qd.ordre, qd.dossier_id)
                             from public.question_dossiers qd where qd.question_id=q.id), '[]'::json)
  ) into v from public.questions q where q.id = p_id;
  return v; -- null si introuvable
end $function$;

-- 3) Upsert + liens ---------------------------------------------------------
create or replace function public.admin_save_question(p jsonb)
 returns bigint language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_question text := btrim(coalesce(p->>'question',''));
  v_slug text := btrim(coalesce(p->>'slug',''));
  v_variantes text[] := coalesce(array(select btrim(e) from jsonb_array_elements_text(coalesce(p->'variantes','[]'::jsonb)) e where btrim(e) <> ''), '{}');
  v_ord int;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if v_question = '' then raise exception 'La question est requise.'; end if;
  if v_slug = '' then raise exception 'Le slug est requis.'; end if;

  if v_id is null then
    insert into public.questions (question, slug, reponse_courte, variantes, publiee, ordre, locale)
    values (v_question, v_slug, nullif(p->>'reponse_courte',''), v_variantes,
            coalesce((p->>'publiee')::boolean, false), coalesce((p->>'ordre')::int, 0),
            coalesce(nullif(p->>'locale',''), 'fr'))
    returning id into v_id;
  else
    update public.questions set
      question = v_question, slug = v_slug, reponse_courte = nullif(p->>'reponse_courte',''),
      variantes = v_variantes, publiee = coalesce((p->>'publiee')::boolean, publiee),
      ordre = coalesce((p->>'ordre')::int, ordre)
    where id = v_id;
    if not found then raise exception 'Question introuvable (id %).', v_id; end if;
  end if;

  -- Liens thèmes (remplacement complet)
  delete from public.question_themes where question_id = v_id;
  insert into public.question_themes (question_id, theme_slug)
    select v_id, s from jsonb_array_elements_text(coalesce(p->'theme_slugs','[]'::jsonb)) s
    on conflict do nothing;

  -- Liens dossiers (remplacement complet, ordre = position dans le tableau)
  delete from public.question_dossiers where question_id = v_id;
  v_ord := 0;
  insert into public.question_dossiers (question_id, dossier_id, ordre)
    select v_id, d::bigint, row_number() over () - 1
    from jsonb_array_elements_text(coalesce(p->'dossier_ids','[]'::jsonb)) d
    on conflict do nothing;

  return v_id;
end $function$;

-- 4) Suppression (dédiée : blocs polymorphes non couverts par les FK) --------
create or replace function public.admin_delete_question(p_id bigint)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'Suppression réservée à l''administrateur.'; end if;
  delete from public.contenu_blocs where parent_type='question' and parent_id = p_id::text;
  delete from public.questions where id = p_id; -- cascade : question_themes / question_dossiers
end $function$;

grant execute on function public.admin_list_questions()        to authenticated;
grant execute on function public.admin_get_question(bigint)     to authenticated;
grant execute on function public.admin_save_question(jsonb)     to authenticated;
grant execute on function public.admin_delete_question(bigint)  to authenticated;

-- 5) Traduction générique : enregistrer le type 'question' ------------------
-- NB. admin_add_translation est désormais défini (avec 'question' ET la copie
-- des enfants) par phase15.7e — on NE le redéfinit PAS ici pour ne pas écraser
-- sa version. On ne (re)déclare ici que admin_translation_status, qui doit
-- connaître 'question' pour alimenter le panneau de traduction.
create or replace function public.admin_translation_status(p_kind text, p_source_id bigint)
 returns json language plpgsql security definer set search_path to 'public'
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
    ('sourate','sourates','publiee'), ('question','questions','publiee'),
    ('nom','noms_allah',null), ('attribut','attributs',null),
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

-- ---- PREUVE : les RPC admin questions existent ----------------------------
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace='public'::regnamespace
  and proname in ('admin_list_questions','admin_get_question','admin_save_question','admin_delete_question')
order by proname;
