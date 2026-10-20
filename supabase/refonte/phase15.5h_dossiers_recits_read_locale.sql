-- ============================================================================
-- Phase 15.5 — vague 5h : lecture locale-aware des LISTINGS éditoriaux
--   dossiers_all, recits_all
-- ============================================================================
-- Modèle ligne-par-langue (option 1, slugs localisés) : une entrée a une ligne
-- FR (locale='fr'), et plus tard une ligne EN et/ou AR (slug propre), reliées
-- par translation_group. Le LISTING choisit UNE ligne par groupe selon la
-- langue demandée :
--   • priorité à la langue demandée, repli FR pour 'en', strict pour 'ar' ;
--   • un seul résultat par translation_group.
-- Pour p_locale='fr', résultat IDENTIQUE à l'existant (aucune régression).
--
-- Les FICHES (get_dossier / get_recit) restent inchangées : elles résolvent par
-- slug, et avec des slugs localisés le slug identifie déjà la bonne ligne de
-- langue (ses preuves/enfants pointent le contenu de la même ligne).
--
-- Anciennes signatures sans p_locale droppées (anti-surcharge ambiguë).
-- ============================================================================

drop function if exists public.dossiers_all();
drop function if exists public.recits_all();

-- ---- Listing des dossiers ------------------------------------------------
create or replace function public.dossiers_all(p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with picked as (
    select slug, h1, meta_description,
           row_number() over (
             partition by translation_group
             order by case locale when p_locale then 0 when 'fr' then 1 else 2 end
           ) as rn
    from public.dossiers
    where published
      and (locale = p_locale or (p_locale <> 'ar' and locale = 'fr'))
  )
  select coalesce(
    json_agg(json_build_object('slug', slug, 'h1', h1, 'meta_description', meta_description) order by h1),
    '[]'::json)
  from picked where rn = 1;
$function$;

-- ---- Listing des récits (parents de 1er niveau + nb enfants) -------------
create or replace function public.recits_all(p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with picked as (
    select id, slug, categorie, titre, image_url, ordre,
           row_number() over (
             partition by translation_group
             order by case locale when p_locale then 0 when 'fr' then 1 else 2 end
           ) as rn
    from public.recits
    where parent_recit_id is null and published
      and (locale = p_locale or (p_locale <> 'ar' and locale = 'fr'))
  )
  select coalesce(json_agg(row_to_json(r) order by r.categorie, r.ordre, r.titre), '[]'::json)
  from (
    select p.slug, p.categorie, p.titre, p.image_url, p.ordre,
           (select count(*) from public.recits c
            where c.parent_recit_id = p.id and c.published
              and c.locale = (case when p_locale = 'ar' then 'ar' else 'fr' end)) as nb_enfants
    from picked p where p.rn = 1
  ) r;
$function$;

-- ---- PREUVE : non-régression FR + AR strict ------------------------------
select 'fr_dossiers' scope, json_array_length(public.dossiers_all('fr')) nb
union all select 'en_dossiers', json_array_length(public.dossiers_all('en'))
union all select 'ar_dossiers', json_array_length(public.dossiers_all('ar'))
union all select 'fr_recits',  json_array_length(public.recits_all('fr'))
union all select 'en_recits',  json_array_length(public.recits_all('en'))
union all select 'ar_recits',  json_array_length(public.recits_all('ar'));
