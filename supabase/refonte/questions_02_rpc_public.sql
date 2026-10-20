-- ============================================================================
-- « Questions fréquentes » — sous-partie 2 : RPC publiques (locale-aware)
-- ============================================================================
-- questions_all(p_locale)  : liste des questions publiées (une par
--   translation_group ; repli FR pour 'en', strict 'ar'), avec leurs thèmes
--   (libellés via themes_i18n + repli FR) pour le regroupement de la liste.
-- get_question(p_slug, p_locale) : la question (résolue par son slug localisé)
--   + thèmes + dossiers liés. Le développement sourcé vient de l'existant
--   get_blocs('question', id). publiee respecté (en plus de la RLS).
-- SECURITY INVOKER → la RLS « publié uniquement » s'applique aussi.
-- ============================================================================

create or replace function public.questions_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with picked as (
    select id, slug, question, reponse_courte, ordre,
           row_number() over (
             partition by translation_group
             order by case locale when p_locale then 0 when 'fr' then 1 else 2 end
           ) as rn
    from public.questions
    where publiee and (locale = p_locale or (p_locale <> 'ar' and locale = 'fr'))
  )
  select coalesce(json_agg(row_to_json(x) order by x.ordre, x.question), '[]'::json) from (
    select p.id, p.slug, p.question, p.reponse_courte, p.ordre,
      coalesce((select json_agg(json_build_object(
          'slug', t.slug,
          'nom',  coalesce((select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale=p_locale), t.nom),
          'famille', t.famille
        ) order by t.ordre, t.nom)
        from public.question_themes qt join public.themes t on t.slug = qt.theme_slug
        where qt.question_id = p.id), '[]'::json) as themes
    from picked p where p.rn = 1
  ) x;
$function$;

create or replace function public.get_question(p_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with q as (select * from public.questions where slug = p_slug and publiee)
  select case when not exists (select 1 from q) then null else json_build_object(
    'question', (select row_to_json(x) from (
        select id, slug, question, reponse_courte, variantes, ordre, locale, translation_group from q) x),
    'themes', coalesce((select json_agg(json_build_object(
        'slug', t.slug,
        'nom',  coalesce((select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale=p_locale), t.nom),
        'famille', t.famille
      ) order by t.ordre, t.nom)
      from public.question_themes qt join public.themes t on t.slug = qt.theme_slug
      where qt.question_id = (select id from q)), '[]'::json),
    'dossiers', coalesce((select json_agg(json_build_object('slug', d.slug, 'h1', d.h1) order by qd.ordre, d.h1)
      from public.question_dossiers qd join public.dossiers d on d.id = qd.dossier_id
      where qd.question_id = (select id from q) and d.published), '[]'::json)
  ) end;
$function$;

-- ---- PREUVE : les RPC existent -------------------------------------------
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace='public'::regnamespace and proname in ('questions_all','get_question')
order by proname;
