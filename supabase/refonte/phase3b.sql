-- ============================================================================
-- Refonte IslamHub — Phase 3b : filtres par rubrique CÔTÉ SERVEUR.
-- Appliqué le 2026-09-07 (branche refonte/architecture-v2).
--
-- Le front (Hadiths.tsx, Paroles.tsx) passe en pagination serveur (.range via
-- RPC paginée, scroll infini) et ne charge plus tout. Ces RPC reçoivent donc
-- les filtres qui étaient auparavant appliqués en JS.
-- ============================================================================

-- Hadiths : + statut_filter / rapporteur_filter / narrateur_filter (défauts '').
drop function if exists public.search_hadiths(text, text, integer, integer);
create function public.search_hadiths(
  q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20,
  statut_filter text default '', rapporteur_filter text default '', narrateur_filter text default ''
) returns json language sql stable as $function$
  with filtered as (
    select * from public.hadiths h
    where (q = '' or (
        h.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(h.texte_arabe) ilike '%'||public.normalize_ar(q)||'%'
        or h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%'
        or h.narrateur ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%'
        or h.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(h.sujet) ilike btrim(tag_filter))
      and (statut_filter = '' or h.statut = statut_filter)
      and (rapporteur_filter = '' or h.rapporteur = rapporteur_filter)
      and (narrateur_filter = '' or h.narrateur = narrateur_filter)
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
        select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, rapporteur, narrateur, statut
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$function$;

-- Paroles : + savant_filter (défaut '').
drop function if exists public.search_paroles(text, text, integer, integer);
create function public.search_paroles(
  q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20,
  savant_filter text default ''
) returns json language sql stable as $function$
  with filtered as (
    select * from public.paroles p
    where (q = '' or (
        p.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(p.texte_arabe) ilike '%'||public.normalize_ar(q)||'%'
        or p.sujet ilike '%'||q||'%' or p.savant ilike '%'||q||'%'
        or p."phonétique" ilike '%'||q||'%' or p.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(p.sujet) ilike btrim(tag_filter))
      and (savant_filter = '' or p.savant = savant_filter)
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, savant, ecole, texte_arabe, texte_francais, "phonétique", explication, tag
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- Valeurs distinctes des rubriques (menus) sans charger les hadiths.
create or replace function public.hadith_rubriques() returns json language sql stable as $function$
  select json_build_object(
    'statuts',     (select coalesce(json_agg(v order by v), '[]'::json) from (select distinct statut     v from public.hadiths where statut     is not null and btrim(statut)    <>'') s),
    'rapporteurs', (select coalesce(json_agg(v order by v), '[]'::json) from (select distinct rapporteur v from public.hadiths where rapporteur is not null and btrim(rapporteur)<>'') s),
    'narrateurs',  (select coalesce(json_agg(v order by v), '[]'::json) from (select distinct narrateur  v from public.hadiths where narrateur  is not null and btrim(narrateur) <>'') s)
  );
$function$;
grant execute on function public.hadith_rubriques() to anon, authenticated;
