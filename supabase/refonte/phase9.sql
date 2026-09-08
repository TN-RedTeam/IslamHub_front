-- ============================================================================
-- Refonte IslamHub — Phase 9 : /savants en annuaire. Appliqué le 2026-09-08.
-- ALTER uniquement. `ecole` non ajoutée (déjà via ecole_id → ecoles).
-- ============================================================================

alter table public.savants add column if not exists nom_arabe   text;
alter table public.savants add column if not exists naissance   text;
alter table public.savants add column if not exists deces       text;
alter table public.savants add column if not exists resume      text;
alter table public.savants add column if not exists resume_auto boolean default false;
alter table public.savants add column if not exists domaines    text[];  -- Hadith, Fiqh, Aqida, Tafsir, Langue…

-- Résumés auto depuis la 1re phrase de la biographie (tronqués sur un mot à ~180).
-- Marqués resume_auto=true pour relecture. `biographie` n'est PAS modifiée.
with clean as (
  select id, btrim(regexp_replace(regexp_replace(biographie, '[#*_>\[\]`~]', '', 'g'), '\s+', ' ', 'g')) c
  from public.savants where biographie is not null and btrim(biographie) <> ''
), gen as (
  select id,
    case when char_length(btrim(split_part(c, '.', 1))) between 1 and 180
         then btrim(split_part(c, '.', 1))
         else btrim(regexp_replace(left(c, 180), '\s\S*$', ''))
    end as r
  from clean
)
update public.savants s set resume = gen.r, resume_auto = true
from gen where gen.id = s.id and (s.resume is null or btrim(s.resume) = '');

-- savants_all : annuaire (nom_arabe, dates, resume, domaines, école, nb_paroles).
create or replace function public.savants_all()
returns json language sql stable as $function$
  select coalesce(json_agg(row_to_json(x) order by x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, e.nom as ecole, e.slug as ecole_slug,
           s.naissance, s.deces, s.resume,
           coalesce(s.domaines, array[]::text[]) as domaines,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where s.biographie is not null and btrim(s.biographie) <> ''
  ) x;
$function$;

-- savant_by_slug : + nom_arabe / naissance / deces (paroles + hadiths_juges inchangés).
create or replace function public.savant_by_slug(savant_slug text)
returns json language sql stable as $function$
  with s as (select * from public.savants where slug = savant_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'savant', (select row_to_json(x) from (
        select s.id, s.nom, s.slug, s.nom_arabe, s.naissance, s.deces, s.biographie,
               e.nom as ecole, e.slug as ecole_slug
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

-- Relecture des résumés auto :
--   select nom, resume from public.savants where resume_auto = true order by nom;
