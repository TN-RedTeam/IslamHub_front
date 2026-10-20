-- ============================================================================
-- Phase 15.5 — vague 5j-1 : lecture locale-aware (sourates, femmes, fiqh,
--   invocations du jour, encarts du jour coran/invocation/douaa)
-- ============================================================================
-- Même prédicat de repli (langue demandée ; repli FR pour 'en' ; 'ar' strict).
-- p_locale='fr' = comportement identique. Fiches (get_sourate, get_blocs)
-- inchangées. douaas = table legacy (sans locale) → daily_douaa renvoie null en
-- 'ar' (garde-fou), FR/EN inchangés. Anciennes signatures droppées.
-- ============================================================================

drop function if exists public.sourates_all();
drop function if exists public.femmes_all();
drop function if exists public.fiqh_by_ecole(text);
drop function if exists public.journee_invocations();
drop function if exists public.daily_coran(integer);
drop function if exists public.daily_invocation(integer,text);
drop function if exists public.daily_douaa(integer);

-- ---- Sourates (index exégèse) --------------------------------------------
create or replace function public.sourates_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.numero), '[]'::json) from (
    select s.numero, s.nom, s.nom_arabe, s.slug, s.revelation, s.nb_versets,
           exists(select 1 from public.versets v where v.sourate_id = s.id) as a_du_contenu,
           exists(select 1 from public.exegeses e join public.versets v on v.id=e.verset_id where v.sourate_id = s.id) as a_exegese
    from public.sourates s
    where (s.locale = p_locale or (p_locale='en' and s.locale='fr'
           and not exists (select 1 from public.sourates e where e.translation_group=s.translation_group and e.locale='en')))
  ) x;
$function$;

-- ---- Femmes (chapitres + segments) ---------------------------------------
create or replace function public.femmes_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(chap order by cat_ord nulls last, ord, nom), '[]'::json)
  from (
    select chapitre as nom, min(ordre) as ord, min(cat_ordre) as cat_ord,
      json_build_object(
        'chapitre', chapitre, 'categorie', max(categorie), 'cat_ordre', min(cat_ordre),
        'segments', json_agg(json_build_object(
          'id', id, 'matn', matn, 'commentaire', commentaire,
          'texte_arabe', texte_arabe, 'source', source,
          'section_titre', section_titre, 'section_ordre', section_ordre
        ) order by section_ordre nulls first, ordre, id)
      ) as chap
    from public.femmes
    where (femmes.locale = p_locale or (p_locale='en' and femmes.locale='fr'
           and not exists (select 1 from public.femmes e where e.translation_group=femmes.translation_group and e.locale='en')))
    group by chapitre
  ) s;
$function$;

-- ---- Fiqh par école -------------------------------------------------------
create or replace function public.fiqh_by_ecole(ecole_param text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(chap order by ord, nom), '[]'::json)
  from (
    select chapitre as nom, min(ordre) as ord,
      json_build_object(
        'chapitre', chapitre,
        'points', json_agg(json_build_object(
          'id', id, 'sujet', sujet, 'type', type,
          'texte', texte, 'texte_arabe', texte_arabe, 'source', source, 'tag', tag
        ) order by ordre, id)
      ) as chap
    from public.fiqh
    where lower(ecole) = lower(ecole_param)
      and (fiqh.locale = p_locale or (p_locale='en' and fiqh.locale='fr'
           and not exists (select 1 from public.fiqh e where e.translation_group=fiqh.translation_group and e.locale='en')))
    group by chapitre
  ) s;
$function$;

-- ---- Invocations de la journée (invocations + hadiths-invocation) --------
create or replace function public.journee_invocations(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.sujet), '[]'::json) from (
    select id, type_id, sujet, texte_arabe, texte_francais, phonetique as "phonétique", explication, commentaire, tag, moments,
           'invocation'::text as kind, null::text as slug, null::bigint as hadith_id
    from public.invocations
    where moments is not null and btrim(moments) <> ''
      and (invocations.locale = p_locale or (p_locale='en' and invocations.locale='fr'
           and not exists (select 1 from public.invocations e where e.translation_group=invocations.translation_group and e.locale='en')))
    union all
    select id, invocation_type as type_id, sujet, texte_arabe, texte_francais, phonetique as "phonétique", explication, invocation_commentaire as commentaire, tag, invocation_moments as moments,
           'hadith'::text as kind, slug, id as hadith_id
    from public.hadiths
    where invocation_type is not null and invocation_moments is not null and btrim(invocation_moments) <> ''
      and (hadiths.locale = p_locale or (p_locale='en' and hadiths.locale='fr'
           and not exists (select 1 from public.hadiths e where e.translation_group=hadiths.translation_group and e.locale='en')))
  ) x;
$function$;

-- ---- Encarts du jour ------------------------------------------------------
create or replace function public.daily_coran(day integer, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with pool as (
    select * from public.coran c
    where (c.locale = p_locale or (p_locale='en' and c.locale='fr'
           and not exists (select 1 from public.coran e where e.translation_group=c.translation_group and e.locale='en')))
  )
  select row_to_json(x) from (
    select id, sujet, sourate, texte_arabe, texte_francais, phonetique as "phonétique", explication, tag
    from pool order by id offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

create or replace function public.daily_invocation(day integer, type_filter text default '1', p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with pool as (
    select * from public.invocations i
    where (type_filter = '' or i.type_id::text = type_filter)
      and (i.locale = p_locale or (p_locale='en' and i.locale='fr'
           and not exists (select 1 from public.invocations e where e.translation_group=i.translation_group and e.locale='en')))
  )
  select row_to_json(x) from (
    select id, type_id, sujet, texte_arabe, texte_francais, phonetique as "phonétique", explication, tag, commentaire
    from pool order by id offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

create or replace function public.daily_douaa(day integer, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  -- douaas : table legacy (sans locale) → FR/EN inchangés, 'ar' = rien.
  with pool as (select * from public.douaas where p_locale <> 'ar')
  select row_to_json(x) from (
    select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique", explication, tag, commentaire
    from pool order by id offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

-- ---- PREUVE : FR non vide vs AR vide -------------------------------------
select 'fr' loc, json_array_length(public.sourates_all('fr')) sourates, json_array_length(public.femmes_all('fr')) femmes, json_array_length(public.journee_invocations('fr')) journee
union all select 'ar', json_array_length(public.sourates_all('ar')), json_array_length(public.femmes_all('ar')), json_array_length(public.journee_invocations('ar'));
