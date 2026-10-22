-- ============================================================================
-- Lecture publique localisée par colonnes — fiqh, savants, sourates
-- ============================================================================
-- fiqh_by_ecole : chapitre/sujet EN-AR, texte (traduction) EN. savant_by_slug /
-- savants_all / savants_mini : biographie & resume EN-AR. get_sourate /
-- sourates_all : nom EN-AR, introduction_md EN-AR. Lignes canoniques (fr/NULL).
-- Le Coran lui-même (table versets) n'est pas retraduit ici.
-- À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

create or replace function public.fiqh_by_ecole(ecole_param text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(chap order by ord, nom), '[]'::json)
  from (
    select chapitre as nom, min(ordre) as ord,
      json_build_object(
        'chapitre', max(case p_locale when 'en' then coalesce(chapitre_en, chapitre) when 'ar' then coalesce(chapitre_ar, chapitre) else chapitre end),
        'points', json_agg(json_build_object(
          'id', id,
          'sujet', case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end,
          'type', type,
          'texte', case p_locale when 'en' then coalesce(texte_en, texte) else texte end,
          'texte_arabe', texte_arabe, 'source', source, 'tag', tag
        ) order by ordre, id)
      ) as chap
    from public.fiqh
    where lower(ecole) = lower(ecole_param) and coalesce(locale,'fr') = 'fr'
    group by chapitre
  ) s;
$function$;

drop function if exists public.savant_by_slug(text);
drop function if exists public.savant_by_slug(text, text);
create function public.savant_by_slug(savant_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with s as (select * from public.savants where slug = savant_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'savant', (select row_to_json(x) from (
        select s.id, s.nom, s.slug, s.nom_arabe, s.naissance, s.deces,
               case p_locale when 'en' then coalesce(s.biographie_en, s.biographie) when 'ar' then coalesce(s.biographie_ar, s.biographie) else s.biographie end as biographie,
               s.generation, e.nom as ecole, e.slug as ecole_slug,
               s.est_savant, s.est_narrateur,
               (s.role is not null or s.generation='sahabi' or s.domaines @> array['Compagnon']
                  or exists (select 1 from public.narrateurs n where n.savant_id = s.id)) as is_compagnon,
               coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id = s.id and n.role is not null limit 1)) as role
        from s left join public.ecoles e on e.id = s.ecole_id) x),
    'paroles', coalesce((select json_agg(row_to_json(p) order by p.id) from (
        select p.id, p.sujet, p.slug, p.texte_arabe, p.texte_francais, p."phonétique", p.explication, p.ecole
        from public.paroles p where p.savant_id = (select id from s)) p), '[]'::json),
    'hadiths_juges', coalesce((select json_agg(row_to_json(h) order by h.id) from (
        select h.id, h.sujet, h.slug, h.degre_authenticite
        from public.hadiths h
        where h.juge_par is not null and h.juge_par ilike '%'||(select nom from s)||'%') h), '[]'::json)
  ) end;
$function$;

create or replace function public.savants_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.rang, x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, e.nom as ecole, e.slug as ecole_slug,
           s.naissance, s.deces,
           case p_locale when 'en' then coalesce(s.resume_en, s.resume) when 'ar' then coalesce(s.resume_ar, s.resume) else s.resume end as resume,
           s.generation, coalesce(s.domaines, array[]::text[]) as domaines,
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
    where (s.est_savant or s.est_narrateur) and coalesce(s.locale,'fr') = 'fr'
  ) x;
$function$;

create or replace function public.savants_mini(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.nom), '[]'::json) from (
    select s.nom, s.slug, e.nom as ecole,
           case p_locale when 'en' then coalesce(s.resume_en, s.resume) when 'ar' then coalesce(s.resume_ar, s.resume) else s.resume end as resume
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where coalesce(s.locale,'fr') = 'fr'
  ) x;
$function$;

drop function if exists public.get_sourate(text);
drop function if exists public.get_sourate(text, text);
create function public.get_sourate(sourate_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with s as (select * from public.sourates where slug = sourate_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'sourate', (select row_to_json(x) from (
        select numero,
          case p_locale when 'en' then coalesce(nom_en, nom) when 'ar' then coalesce(nom_ar, nom) else nom end as nom,
          nom_arabe, slug, revelation, nb_versets,
          case p_locale when 'en' then coalesce(introduction_md_en, introduction_md) when 'ar' then coalesce(introduction_md_ar, introduction_md) else introduction_md end as introduction_md,
          ordre_revelation from s) x),
    'versets', coalesce((select json_agg(row_to_json(v) order by v.numero) from (
        select vr.numero, vr.texte_arabe, vr.texte_francais, vr.phonetique,
               coalesce((select json_agg(row_to_json(e)) from (
                   select ex.texte, ex.source, ex.verset_fin from public.exegeses ex
                   where ex.verset_id = vr.id order by ex.ordre, ex.id) e), '[]'::json) as exegeses,
               (select row_to_json(eq) from (
                   select ve.theme, ve.slug, ve.sens_juste
                   from public.versets_equivoques ve
                   where ve.type = 'verset' and ve.published = true
                     and ve.sourate_num = (select numero from s) and ve.ayah = vr.numero
                   order by ve.id limit 1) eq) as equivoque
        from public.versets vr where vr.sourate_id = (select id from s)) v), '[]'::json)
  ) end;
$function$;

create or replace function public.sourates_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.numero), '[]'::json) from (
    select s.numero,
           case p_locale when 'en' then coalesce(s.nom_en, s.nom) when 'ar' then coalesce(s.nom_ar, s.nom) else s.nom end as nom,
           s.nom_arabe, s.slug, s.revelation, s.nb_versets,
           exists(select 1 from public.versets v where v.sourate_id = s.id) as a_du_contenu,
           exists(select 1 from public.exegeses e join public.versets v on v.id=e.verset_id where v.sourate_id = s.id) as a_exegese
    from public.sourates s
    where coalesce(s.locale,'fr') = 'fr'
  ) x;
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as args, proname
from pg_proc where pronamespace='public'::regnamespace and proname in ('savant_by_slug','get_sourate') order by proname;
