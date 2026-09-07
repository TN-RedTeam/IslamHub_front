-- ============================================================================
-- Refonte IslamHub — Phase 6 : savants (fiche par slug + fusion doublon).
-- Appliqué le 2026-09-07 (branche refonte/architecture-v2).
-- ============================================================================

-- Fusion du doublon Al-Hâkim (id 21) / Al-Hakim (id 48).
update public.hadith_rapporteurs hr set savant_id = 21
  where hr.savant_id = 48
    and not exists (select 1 from public.hadith_rapporteurs h2
                    where h2.hadith_id = hr.hadith_id and h2.savant_id = 21);
delete from public.hadith_rapporteurs where savant_id = 48;
delete from public.savants where id = 48;

-- savants_all : expose le slug (liens vers /savants/:slug).
create or replace function public.savants_all()
returns json language sql stable as $function$
  select coalesce(json_agg(row_to_json(x)), '[]'::json) from (
    select s.id, s.nom, s.slug, e.nom as ecole, e.slug as ecole_slug, s.biographie,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where s.biographie is not null and btrim(s.biographie) <> ''
    order by s.nom
  ) x;
$function$;

-- Fiche savant par slug : savant + ses paroles + hadiths qu'il a authentifiés.
create or replace function public.savant_by_slug(savant_slug text)
returns json language sql stable as $function$
  with s as (select * from public.savants where slug = savant_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'savant', (select row_to_json(x) from (
        select s.id, s.nom, s.slug, s.biographie, e.nom as ecole, e.slug as ecole_slug
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
grant execute on function public.savant_by_slug(text) to anon, authenticated;

-- RESTE À FAIRE (Phase 6, hors SQL) :
--  • Migration des 22 extraits de savants (src/_legacy/repliques/
--    ExtraitsDesLivresDesSavants/*) vers savants/paroles. Ces fichiers
--    contiennent de l'ARABE : la migration doit se faire par un SCRIPT qui lit
--    les fichiers et génère les INSERT (l'arabe reste dans les fichiers, ne
--    transite jamais par le modèle → pas de corruption). À exécuter par la suite.
--  • Enrichissement schéma savants (nom_arabe, naissance, deces, image_url).
