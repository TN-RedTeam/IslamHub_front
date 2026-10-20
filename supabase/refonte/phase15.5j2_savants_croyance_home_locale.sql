-- ============================================================================
-- Phase 15.5 — vague 5j-2 : lecture locale-aware (biographies/savants, croyance
--   attributs + versets/hadiths équivoques, accueil)
-- ============================================================================
-- Même prédicat de repli (langue demandée ; repli FR pour 'en' ; 'ar' strict).
-- p_locale='fr' = comportement identique. Fiches (savant_by_slug,
-- get_verset_equivoque) inchangées. Anciennes signatures droppées.
-- ============================================================================

drop function if exists public.savants_all();
drop function if exists public.get_attributs();
drop function if exists public.home_dossier_vedette();
drop function if exists public.home_recent(integer);
drop function if exists public.search_versets_equivoques(text,text,text,integer,integer);
drop function if exists public.search_versets_equivoques(text,text,text,integer,integer,text);

-- ---- Biographies / savants ------------------------------------------------
create or replace function public.savants_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.rang, x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, e.nom as ecole, e.slug as ecole_slug,
           s.naissance, s.deces, s.resume, s.generation,
           coalesce(s.domaines, array[]::text[]) as domaines,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles,
           s.est_savant, s.est_narrateur,
           (s.role is not null or s.generation = 'sahabi' or s.domaines @> array['Compagnon']
              or exists (select 1 from public.narrateurs n where n.savant_id = s.id)) as is_compagnon,
           coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id = s.id and n.role is not null limit 1)) as role,
           case
             when coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id=s.id and n.role is not null limit 1)) = 'calife_rachidoun' then 0
             when coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id=s.id and n.role is not null limit 1)) = 'epouse_prophete' then 1
             when (s.role is not null or s.generation='sahabi' or s.domaines @> array['Compagnon']
                   or exists (select 1 from public.narrateurs n where n.savant_id=s.id)) then 2
             else 3
           end as rang
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where (s.est_savant or s.est_narrateur)
      and (s.locale = p_locale or (p_locale='en' and s.locale='fr'
           and not exists (select 1 from public.savants es where es.translation_group=s.translation_group and es.locale='en')))
  ) x;
$function$;

-- ---- Croyance : noms & attributs ------------------------------------------
create or replace function public.get_attributs(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.ordre), '[]'::json) from (
    select a.id, a.ordre, a.slug, a.nom, a.gloss, a.explication,
      coalesce((select json_agg(row_to_json(c)) from (
        select
          ic.id,
          ic.type,
          case when ic.type = 'parole' then p.texte_arabe else ic.arabe end as arabe,
          case when ic.type = 'parole' then p."phonétique" else ic.phonetique end as phonetique,
          case when ic.type = 'parole' then p.texte_francais else ic.signification end as signification,
          case
            when ic.type = 'parole'
              then nullif(concat_ws(' — ', nullif(p.source_livre, ''),
                     case when nullif(p.page, '') is not null then 'p. ' || p.page end), '')
            else ic.ref
          end as ref,
          case when ic.type = 'parole' then p.slug end as parole_slug,
          case when ic.type = 'parole' then coalesce(sv.nom, p.savant) end as savant,
          case when ic.type = 'parole' then sv.slug end as savant_slug,
          case when ic.type = 'parole' then sv.generation end as generation
        from public.attribut_citations ic
        left join public.paroles p on p.id = ic.parole_id and ic.type = 'parole'
        left join public.savants sv on sv.id = p.savant_id
        where ic.attribut_id = a.id
        order by ic.ordre, ic.id
      ) c), '[]'::json) as citations
    from public.attributs a
    where (a.locale = p_locale or (p_locale='en' and a.locale='fr'
           and not exists (select 1 from public.attributs e where e.translation_group=a.translation_group and e.locale='en')))
  ) x;
$function$;

-- ---- Croyance : versets & hadiths équivoques (listing + recherche) --------
create or replace function public.search_versets_equivoques(
  q text default '', theme_filter text default '', sourate_filter text default '',
  page_num integer default 0, page_size integer default 24, type_filter text default '', p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from public.versets_equivoques v
    where v.published
      and (v.locale = p_locale or (p_locale='en' and v.locale='fr'
           and not exists (select 1 from public.versets_equivoques e where e.translation_group=v.translation_group and e.locale='en')))
      and (type_filter = '' or v.type = type_filter)
      and (theme_filter = '' or v.theme = theme_filter)
      and (sourate_filter = '' or v.sourate = sourate_filter)
      and (q = '' or (
        public.unaccent(coalesce(v.theme,''))             ilike '%'||public.unaccent(q)||'%' or
        public.unaccent(coalesce(v.sourate,''))           ilike '%'||public.unaccent(q)||'%' or
        public.unaccent(coalesce(v.verset_traduction,'')) ilike '%'||public.unaccent(q)||'%' or
        public.unaccent(coalesce(v.sens_juste,''))        ilike '%'||public.unaccent(q)||'%' or
        public.unaccent(coalesce(v.rapporteur,''))        ilike '%'||public.unaccent(q)||'%' or
        v.verset_arabe ilike '%'||q||'%'))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
      select id, slug, type, theme, sourate, sourate_num, ayah, rapporteur, recueil, numero,
             verset_arabe, verset_traduction, sens_juste
      from filtered order by sourate_num nulls last, ayah nulls last, id
      limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- ---- Accueil : dossier à la une -------------------------------------------
create or replace function public.home_dossier_vedette(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select id, slug, h1, meta_description
    from public.dossiers
    where published
      and (dossiers.locale = p_locale or (p_locale='en' and dossiers.locale='fr'
           and not exists (select 1 from public.dossiers e where e.translation_group=dossiers.translation_group and e.locale='en')))
    order by vedette desc, created_at desc nulls last, id
    limit 1
  ) x;
$function$;

-- ---- Accueil : derniers ajouts --------------------------------------------
create or replace function public.home_recent(p_limit integer default 3, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.created_at desc), '[]'::json) from (
    select * from (
      select 'Dossier'::text as type, h1 as titre, '/dossiers/'||slug as href, created_at
      from public.dossiers d where published
        and (d.locale = p_locale or (p_locale='en' and d.locale='fr'
             and not exists (select 1 from public.dossiers e where e.translation_group=d.translation_group and e.locale='en')))
      union all
      select 'Récit'::text, titre, '/recits/'||slug, created_at
      from public.recits r where published and parent_recit_id is null
        and (r.locale = p_locale or (p_locale='en' and r.locale='fr'
             and not exists (select 1 from public.recits e where e.translation_group=r.translation_group and e.locale='en')))
    ) u
    order by created_at desc nulls last
    limit p_limit
  ) x;
$function$;

-- ---- PREUVE : FR non vide vs AR vide -------------------------------------
select 'fr' loc,
       json_array_length(public.savants_all('fr')) savants,
       json_array_length(public.get_attributs('fr')) attributs,
       json_array_length(public.home_recent(3,'fr')) recent,
       (public.search_versets_equivoques('','','',0,1,'','fr')->>'total') equivoques
union all select 'ar',
       json_array_length(public.savants_all('ar')),
       json_array_length(public.get_attributs('ar')),
       json_array_length(public.home_recent(3,'ar')),
       (public.search_versets_equivoques('','','',0,1,'','ar')->>'total');
