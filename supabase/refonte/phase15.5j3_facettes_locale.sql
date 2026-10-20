-- ============================================================================
-- Phase 15.5 — vague 5j-3 : facettes & compteurs locale-aware (lot principal)
--   site_stats, sujets_hadiths_counts, sujets_paroles_counts, tags_hadiths,
--   hadith_rubriques, related_by_theme, personnes_published, savants_mini
-- ============================================================================
-- Facettes AGRÉGÉES (compteurs, listes de sujets/tags/rubriques) : filtrées par
-- « locale effective » (fr/en → 'fr' ; 'ar' → 'ar' strict). Les facettes
-- dérivent du corpus affiché ; l'EN retombe sur FR tant qu'il est vide.
-- Fonctions renvoyant du CONTENU (related_by_theme, personnes_published,
-- savants_mini) : prédicat de repli par groupe (comme les listings).
-- p_locale='fr' = comportement identique. Anciennes signatures droppées.
-- ============================================================================

drop function if exists public.site_stats();
drop function if exists public.sujets_hadiths_counts();
drop function if exists public.sujets_paroles_counts();
drop function if exists public.tags_hadiths();
drop function if exists public.hadith_rubriques();
drop function if exists public.related_by_theme(text,bigint,integer);
drop function if exists public.personnes_published();
drop function if exists public.savants_mini();

-- ---- Statistiques d'accueil -----------------------------------------------
create or replace function public.site_stats(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select json_build_object(
    'hadiths',    (select count(*) from public.hadiths where locale = (case when p_locale='ar' then 'ar' else 'fr' end)),
    'dhikrs',     (select case when p_locale='ar' then 0 else count(*) end from public.dhikrs),
    'douaas',     (select case when p_locale='ar' then 0 else count(*) end from public.douaas),
    'coran',      (select count(*) from public.coran where locale = (case when p_locale='ar' then 'ar' else 'fr' end)),
    'versets',    (select count(*) from public.coran where locale = (case when p_locale='ar' then 'ar' else 'fr' end)),
    'paroles',    (select count(*) from public.paroles where locale = (case when p_locale='ar' then 'ar' else 'fr' end)),
    'savants',    (select count(*) from public.paroles where locale = (case when p_locale='ar' then 'ar' else 'fr' end)),
    'multimedia', (select case when p_locale='ar' then 0 else count(*) end from public.multimedia),
    'videos',     (select case when p_locale='ar' then 0 else count(*) end from public.multimedia)
  );
$function$;

-- ---- Compteurs de sujets --------------------------------------------------
create or replace function public.sujets_hadiths_counts(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(json_build_object('sujet', s, 'n', n) order by s), '[]'::json)
  from (select btrim(sujet) as s, count(*) as n from public.hadiths
        where sujet is not null and btrim(sujet) <> ''
          and locale = (case when p_locale='ar' then 'ar' else 'fr' end)
        group by btrim(sujet)) t;
$function$;

create or replace function public.sujets_paroles_counts(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(json_build_object('sujet', s, 'n', n) order by s), '[]'::json)
  from (select btrim(sujet) as s, count(*) as n from public.paroles
        where sujet is not null and btrim(sujet) <> ''
          and locale = (case when p_locale='ar' then 'ar' else 'fr' end)
        group by btrim(sujet)) t;
$function$;

-- ---- Tags hadiths ---------------------------------------------------------
create or replace function public.tags_hadiths(p_locale text default 'fr')
 returns text[] language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from public.hadiths, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> ''
    and hadiths.locale = (case when p_locale='ar' then 'ar' else 'fr' end);
$function$;

-- ---- Rubriques hadiths (statuts / rapporteurs / narrateurs) ---------------
create or replace function public.hadith_rubriques(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select json_build_object(
    'statuts',     (select coalesce(json_agg(v order by v), '[]'::json) from (
                     select distinct statut v from public.hadiths
                     where statut is not null and btrim(statut)<>''
                       and locale = (case when p_locale='ar' then 'ar' else 'fr' end)) s),
    'rapporteurs', (select coalesce(json_agg(v order by v), '[]'::json) from (
                     select distinct s.nom v from public.hadith_rapporteurs jr
                       join public.savants s on s.id=jr.savant_id
                       join public.hadiths h on h.id=jr.hadith_id
                     where h.locale = (case when p_locale='ar' then 'ar' else 'fr' end)) s),
    'narrateurs',  (select coalesce(json_agg(v order by v), '[]'::json) from (
                     select distinct n.nom v from public.hadith_narrateurs jn
                       join public.narrateurs n on n.id=jn.narrateur_id
                       join public.hadiths h on h.id=jn.hadith_id
                     where h.locale = (case when p_locale='ar' then 'ar' else 'fr' end)) s)
  );
$function$;

-- ---- Contenus liés (par rubrique / thème) ---------------------------------
create or replace function public.related_by_theme(p_kind text, p_id bigint, p_limit integer default 8, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with me as (
    select case
      when p_kind='hadith' then (select coalesce(nullif(btrim(h.rubrique),''), nullif(btrim(split_part(h.sujet,':',1)),'')) from public.hadiths h where h.id=p_id)
      when p_kind='parole' then (select nullif(btrim(split_part(pa.sujet,':',1)),'') from public.paroles pa where pa.id=p_id)
      when p_kind in ('verset','coran') then (select nullif(btrim(split_part(c.sujet,':',1)),'') from public.coran c where c.id=p_id)
    end as rubrique
  ),
  mine as (
    select ht.theme_slug from public.hadith_themes ht where p_kind='hadith' and ht.hadith_id=p_id
    union select pt.theme_slug from public.parole_themes pt where p_kind='parole' and pt.parole_id=p_id
    union select ct.theme_slug from public.coran_themes ct where p_kind in ('verset','coran') and ct.coran_id=p_id
  ),
  by_rub as (
    select 0 as prio, 'hadith'::text as kind, h.id, h.slug, h.sujet, null::text as savant, null::text as sourate
    from public.hadiths h, me
    where me.rubrique is not null
      and coalesce(nullif(btrim(h.rubrique),''), nullif(btrim(split_part(h.sujet,':',1)),'')) = me.rubrique
      and not (p_kind='hadith' and h.id=p_id)
      and (h.locale = p_locale or (p_locale='en' and h.locale='fr' and not exists (select 1 from public.hadiths e where e.translation_group=h.translation_group and e.locale='en')))
    union all
    select 0, 'parole', pa.id, pa.slug, pa.sujet, coalesce(sv.nom, pa.savant), null
    from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, me
    where me.rubrique is not null and nullif(btrim(split_part(pa.sujet,':',1)),'') = me.rubrique
      and not (p_kind='parole' and pa.id=p_id)
      and (pa.locale = p_locale or (p_locale='en' and pa.locale='fr' and not exists (select 1 from public.paroles e where e.translation_group=pa.translation_group and e.locale='en')))
    union all
    select 0, 'verset', c.id, null, c.sujet, null, c.sourate
    from public.coran c, me
    where me.rubrique is not null and nullif(btrim(split_part(c.sujet,':',1)),'') = me.rubrique
      and not (p_kind in ('verset','coran') and c.id=p_id)
      and (c.locale = p_locale or (p_locale='en' and c.locale='fr' and not exists (select 1 from public.coran e where e.translation_group=c.translation_group and e.locale='en')))
  ),
  by_theme as (
    select 1 as prio, 'hadith'::text as kind, h.id, h.slug, h.sujet, null::text as savant, null::text as sourate
    from public.hadith_themes ht join public.hadiths h on h.id=ht.hadith_id
    where ht.theme_slug in (select theme_slug from mine) and not (p_kind='hadith' and h.id=p_id)
      and (h.locale = p_locale or (p_locale='en' and h.locale='fr' and not exists (select 1 from public.hadiths e where e.translation_group=h.translation_group and e.locale='en')))
    union all
    select 1, 'parole', pa.id, pa.slug, pa.sujet, coalesce(sv.nom, pa.savant), null
    from public.parole_themes pt join public.paroles pa on pa.id=pt.parole_id
      left join public.savants sv on sv.id=pa.savant_id
    where pt.theme_slug in (select theme_slug from mine) and not (p_kind='parole' and pa.id=p_id)
      and (pa.locale = p_locale or (p_locale='en' and pa.locale='fr' and not exists (select 1 from public.paroles e where e.translation_group=pa.translation_group and e.locale='en')))
    union all
    select 1, 'verset', c.id, null, c.sujet, null, c.sourate
    from public.coran_themes ct join public.coran c on c.id=ct.coran_id
    where ct.theme_slug in (select theme_slug from mine) and not (p_kind in ('verset','coran') and c.id=p_id)
      and (c.locale = p_locale or (p_locale='en' and c.locale='fr' and not exists (select 1 from public.coran e where e.translation_group=c.translation_group and e.locale='en')))
  ),
  combined as (select * from by_rub union all select * from by_theme),
  ranked as (
    select distinct on (kind, id) prio, kind, id, slug, sujet, savant, sourate
    from combined order by kind, id, prio
  )
  select coalesce(json_agg(row_to_json(r)), '[]'::json)
  from (select kind, id, slug, sujet, savant, sourate from ranked order by prio, kind, id limit p_limit) r;
$function$;

-- ---- Biographies : personnes publiées + mini-liste ------------------------
create or replace function public.personnes_published(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.ordre, x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, s.sous_categorie, s.sexe,
           s.naissance, s.deces, s.resume, s.generation, s.role, s.ordre,
           s.est_savant, s.est_narrateur,
           coalesce(s.domaines, array[]::text[]) as domaines,
           e.nom as ecole, e.slug as ecole_slug,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles,
           case
             when s.role = 'calife_rachidoun' then 'calife'
             when s.role = 'epouse_prophete'  then 'femme'
             when coalesce(s.generation='sahabi' or s.domaines @> array['Compagnon']
                           or exists(select 1 from public.narrateurs n where n.savant_id=s.id), false) then 'compagnon'
             else 'savant'
           end as categorie
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where s.publiee = true
      and (s.locale = p_locale or (p_locale='en' and s.locale='fr'
           and not exists (select 1 from public.savants es where es.translation_group=s.translation_group and es.locale='en')))
  ) x;
$function$;

create or replace function public.savants_mini(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.nom), '[]'::json) from (
    select s.nom, s.slug, e.nom as ecole, s.resume
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where (s.locale = p_locale or (p_locale='en' and s.locale='fr'
           and not exists (select 1 from public.savants es where es.translation_group=s.translation_group and es.locale='en')))
  ) x;
$function$;

-- ---- PREUVE : FR non vide vs AR vide -------------------------------------
select 'fr' loc,
       (public.site_stats('fr')->>'hadiths') stats_hadiths,
       json_array_length(public.sujets_hadiths_counts('fr')) sujets_h,
       array_length(public.tags_hadiths('fr'),1) tags_h,
       json_array_length(public.personnes_published('fr')) personnes
union all select 'ar',
       (public.site_stats('ar')->>'hadiths'),
       json_array_length(public.sujets_hadiths_counts('ar')),
       array_length(public.tags_hadiths('ar'),1),
       json_array_length(public.personnes_published('ar'));
