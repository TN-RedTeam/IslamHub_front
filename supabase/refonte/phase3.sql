-- ============================================================================
-- Refonte IslamHub — Phase 3 (recherche & performance) — volet BASE.
-- Appliqué le 2026-09-07 (branche refonte/architecture-v2).
--
-- Les fonctions search_* gardent EXACTEMENT la même sortie (front non impacté),
-- mais le matching devient : plein-texte FR (search_fr, index GIN, insensible
-- aux accents) + arabe normalisé (insensible aux harakat, index trigram) +
-- couverture tags/rapporteur/narrateur/phonétique. Pagination inchangée.
-- ============================================================================

-- Normalisation arabe réutilisable et IMMUTABLE (indexable).
create or replace function public.normalize_ar(t text) returns text
language sql immutable as $fn$
  select regexp_replace(
    translate(
      translate(coalesce(t,''), U&'\0623\0625\0622\0671', U&'\0627\0627\0627\0627'),
      U&'\064B\064C\064D\064E\064F\0650\0651\0652\0670\0640\00AB\00BB\0022\0027\2018\2019\FD3F\FD3E', ''),
    '\s+',' ','g')
$fn$;

create index if not exists hadiths_arabe_norm_trgm_idx
  on public.hadiths using gin (public.normalize_ar(texte_arabe) gin_trgm_ops);
create index if not exists paroles_arabe_norm_trgm_idx
  on public.paroles using gin (public.normalize_ar(texte_arabe) gin_trgm_ops);

create or replace function public.search_hadiths(q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20)
returns json language sql stable as $function$
  with filtered as (
    select * from public.hadiths h
    where (q = '' or (
        h.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(h.texte_arabe) ilike '%'||public.normalize_ar(q)||'%'
        or h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%'
        or h.narrateur ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%'
        or h.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(h.sujet) ilike btrim(tag_filter))
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
        select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, rapporteur, narrateur, statut
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$function$;

create or replace function public.search_paroles(q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20)
returns json language sql stable as $function$
  with filtered as (
    select * from public.paroles p
    where (q = '' or (
        p.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(p.texte_arabe) ilike '%'||public.normalize_ar(q)||'%'
        or p.sujet ilike '%'||q||'%' or p.savant ilike '%'||q||'%'
        or p."phonétique" ilike '%'||q||'%' or p.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(p.sujet) ilike btrim(tag_filter))
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, savant, ecole, texte_arabe, texte_francais, "phonétique", explication, tag
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- Contrôles : 'priere'=='prière'=16 ; 'science'=14 ; filtre sujet 'Les Anges'=3.
--
-- RESTE À FAIRE (volet FRONT, Phase 3b) : rebrancher Hadiths.tsx (pageSize 1000)
-- et Paroles.tsx (200) sur la pagination serveur .range()/RPC paginée, en
-- passant les filtres par rubrique (statut/rapporteur/narrateur) côté serveur.
