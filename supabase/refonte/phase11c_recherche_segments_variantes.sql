-- ============================================================================
-- Phase 11c — La recherche couvre aussi les passages (dialogue) et variantes
-- ============================================================================
-- Problème : un hadith dont le texte arabe n'est PAS sur le hadith principal
-- mais dans un passage de dialogue (ou une variante) n'était pas retrouvé en
-- recherche — `search_hadiths` et `search_all` n'inspectaient que les champs du
-- hadith principal (texte_arabe / search_fr). Cas réel : hadith id 549 (texte
-- arabe uniquement dans le passage 2).
--
-- Correctif : les deux fonctions de recherche inspectent désormais aussi les
-- tables hadith_segments et hadith_variants (arabe via normalize_ar, + français,
-- phonétique, intro, explication, et source pour les variantes).
--
-- Fonctions de LECTURE (LANGUAGE sql STABLE) → appliquées via le MCP Supabase.
-- Idempotent.
-- ============================================================================

-- 1) Recherche de la rubrique Hadiths (page /hadiths + liste admin).
create or replace function public.search_hadiths(q text default ''::text, tag_filter text default ''::text, page_num integer default 0, page_size integer default 20, statut_filter text default ''::text, rapporteur_filter text default ''::text, narrateur_filter text default ''::text)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from public.hadiths h
    where (q = '' or (
        h.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
        or h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%'
        or h.narrateur ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%'
        or h.intro ilike '%'||q||'%'
        or h.tag ilike '%'||q||'%'
        or (q ~ '^[0-9]+$' and h.id = q::bigint)
        or exists (select 1 from public.hadith_segments s where s.hadith_id = h.id and (
             public.normalize_ar(coalesce(s.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
             or s.texte_francais ilike '%'||q||'%' or s.phonetique ilike '%'||q||'%'
             or s.intro ilike '%'||q||'%' or s.explication ilike '%'||q||'%'))
        or exists (select 1 from public.hadith_variants va where va.hadith_id = h.id and (
             public.normalize_ar(coalesce(va.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
             or va.texte_francais ilike '%'||q||'%' or va.phonetique ilike '%'||q||'%'
             or va.intro ilike '%'||q||'%' or va.explication ilike '%'||q||'%' or va.source ilike '%'||q||'%'))
        ))
      and (tag_filter = '' or btrim(h.sujet) ilike btrim(tag_filter))
      and (statut_filter = '' or h.statut = statut_filter)
      and (rapporteur_filter = '' or exists (
            select 1 from public.hadith_rapporteurs jr join public.savants s on s.id=jr.savant_id
            where jr.hadith_id = h.id and s.nom = rapporteur_filter))
      and (narrateur_filter = '' or exists (
            select 1 from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id
            where jn.hadith_id = h.id and n.nom = narrateur_filter))
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
        select id, sujet, intro, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, rapporteur, narrateur, statut,
               (select n.generation from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_generation,
               (select n.role       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_role,
               (select n.sexe       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_sexe,
               public.recueils_for_hadith(filtered.id)      as recueils,
               public.recueils_json_for_hadith(filtered.id) as sources
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$function$;

-- 2) Recherche globale (la loupe → page /recherche). Branche « hadiths ».
CREATE OR REPLACE FUNCTION public.search_all(q text, p_limit integer DEFAULT 8)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public','pg_temp'
AS $function$
  with query as (
    select websearch_to_tsquery('french', coalesce(nullif(btrim(q),''),'zzzznomatch')) as tsq,
           '%'||public.unaccent(lower(btrim(coalesce(q,''))))||'%' as pat,
           '%'||public.normalize_ar(coalesce(q,''))||'%' as arpat,
           nullif(btrim(coalesce(q,'')),'') is not null as active
  )
  select json_build_object(
    'hadiths', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select h.id, h.slug, h.sujet, left(coalesce(h.texte_francais,''),140) as extrait
        from public.hadiths h, query
        where query.active and (
          to_tsvector('french', coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.explication,'')||' '||coalesce(h.intro,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.phonetique,'')||' '||coalesce(h.intro,''))) like query.pat
          or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike query.arpat
          or exists (select 1 from public.hadith_segments s where s.hadith_id=h.id and (
               public.normalize_ar(coalesce(s.texte_arabe,'')) ilike query.arpat
               or public.unaccent(lower(coalesce(s.texte_francais,'')||' '||coalesce(s.intro,'')||' '||coalesce(s.phonetique,'')||' '||coalesce(s.explication,''))) like query.pat))
          or exists (select 1 from public.hadith_variants va where va.hadith_id=h.id and (
               public.normalize_ar(coalesce(va.texte_arabe,'')) ilike query.arpat
               or public.unaccent(lower(coalesce(va.texte_francais,'')||' '||coalesce(va.intro,'')||' '||coalesce(va.phonetique,'')||' '||coalesce(va.explication,'')||' '||coalesce(va.source,''))) like query.pat)))
        order by ts_rank(to_tsvector('french', coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')), query.tsq) desc, h.id
        limit p_limit) x),
    'paroles', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select p.id, p.slug, p.sujet, coalesce(sv.nom,p.savant) as savant, left(coalesce(p.texte_francais,''),140) as extrait
        from public.paroles p left join public.savants sv on sv.id=p.savant_id, query
        where query.active and (
          to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p.explication,'')||' '||coalesce(sv.nom,p.savant,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p."phonétique",'')||' '||coalesce(sv.nom,p.savant,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')), query.tsq) desc, p.id
        limit p_limit) x),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id, i.sujet, left(coalesce(i.texte_francais,''),140) as extrait
        from public.invocations i, query
        where query.active and (
          to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.commentaire,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.phonetique,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')), query.tsq) desc, i.id
        limit p_limit) x),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sujet, c.sourate, left(coalesce(c.texte_francais,''),140) as extrait
        from public.coran c, query
        where query.active and (
          to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.sourate,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.phonetique,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')), query.tsq) desc, c.id
        limit p_limit) x),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.sujet, f.chapitre, f.ecole, left(coalesce(f.texte,''),140) as extrait
        from public.fiqh f, query
        where query.active and (
          to_tsvector('french', coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.tag,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.tag,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')), query.tsq) desc, f.id
        limit p_limit) x),
    'themes', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select t.slug, t.nom, t.famille
        from public.themes t, query
        where query.active and public.unaccent(lower(t.nom)) like query.pat
        order by t.ordre limit p_limit) x)
  );
$function$;
