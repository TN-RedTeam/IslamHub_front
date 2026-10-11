-- ============================================================================
-- Phase 11k — Recherche approximative (repli automatique) : hadiths & paroles
-- ============================================================================
-- Quand la recherche exacte ne donne rien, le site tente une recherche par
-- SIMILARITÉ (trigramme) sur le texte arabe normalisé + traduction/sujet, et
-- affiche les contenus les plus proches (« résultats approchants »). Rattrape
-- les cas où une autre source utilise une formulation réellement différente
-- (mots en plus/en moins, synonymes) que la normalisation ne peut pas aligner.
-- Seuil de similarité : 0,30. Fonctions de lecture → appliquées via le MCP.
-- ============================================================================
create or replace function public.search_hadiths_fuzzy(q text default ''::text, p_limit integer default 20)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with scored as (
    select h.id,
      greatest(
        similarity(public.normalize_ar(coalesce(h.texte_arabe,'')), public.normalize_ar(q)),
        similarity(public.unaccent(lower(coalesce(h.texte_francais,'')||' '||coalesce(h.sujet,''))), public.unaccent(lower(q)))
      ) as score
    from public.hadiths h
    where btrim(coalesce(q,'')) <> ''
  ),
  filtered as (select id, score from scored where score >= 0.3 order by score desc, id limit p_limit)
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
      select h.id, h.sujet, h.intro, h.texte_arabe, h.texte_francais, h.phonetique as "phonétique",
             h.explication, h.tag, h.rapporteur, h.narrateur, h.statut,
             (select n.generation from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=h.id order by n.id limit 1) as narrateur_generation,
             (select n.role       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=h.id order by n.id limit 1) as narrateur_role,
             (select n.sexe       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=h.id order by n.id limit 1) as narrateur_sexe,
             public.recueils_for_hadith(h.id)      as recueils,
             public.recueils_json_for_hadith(h.id) as sources
      from filtered f join public.hadiths h on h.id=f.id order by f.score desc, f.id) d), '[]'::json));
$function$;

create or replace function public.search_paroles_fuzzy(q text default ''::text, p_limit integer default 20)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with scored as (
    select p.id,
      greatest(
        similarity(public.normalize_ar(coalesce(p.texte_arabe,'')), public.normalize_ar(q)),
        similarity(public.unaccent(lower(coalesce(p.texte_francais,'')||' '||coalesce(p.sujet,'')||' '||coalesce(p.savant,''))), public.unaccent(lower(q)))
      ) as score
    from public.paroles p
    where btrim(coalesce(q,'')) <> ''
  ),
  filtered as (select id, score from scored where score >= 0.3 order by score desc, id limit p_limit)
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
      select p.id, p.slug, p.sujet, p.savant, p.ecole, p.texte_arabe, p.texte_francais, p."phonétique", p.explication, p.tag, p.source_livre, p.page
      from filtered f join public.paroles p on p.id=f.id order by f.score desc, f.id) d), '[]'::json));
$function$;

-- ----------------------------------------------------------------------------
-- Loupe globale : repli approximatif sur les 6 catégories (même forme que search_all)
-- ----------------------------------------------------------------------------
create or replace function public.search_all_fuzzy(q text, p_limit integer default 8)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with p as (
    select nullif(btrim(coalesce(q,'')),'') as raw,
           public.normalize_ar(coalesce(q,'')) as arq,
           public.unaccent(lower(coalesce(q,''))) as frq
  )
  select json_build_object(
    'hadiths', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select h.id, h.slug, h.sujet, left(coalesce(h.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(h.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(h.texte_francais,'')||' '||coalesce(h.sujet,''))), (select frq from p))) as score
        from public.hadiths h, p where p.raw is not null
        order by score desc, h.id limit p_limit) x where x.score >= 0.3),
    'paroles', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select pa.id, pa.slug, pa.sujet, coalesce(sv.nom,pa.savant) as savant, left(coalesce(pa.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(pa.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(pa.texte_francais,'')||' '||coalesce(pa.sujet,'')||' '||coalesce(sv.nom,pa.savant,''))), (select frq from p))) as score
        from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, p where p.raw is not null
        order by score desc, pa.id limit p_limit) x where x.score >= 0.3),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id, i.sujet, left(coalesce(i.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(i.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.commentaire,''))), (select frq from p))) as score
        from public.invocations i, p where p.raw is not null
        order by score desc, i.id limit p_limit) x where x.score >= 0.3),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sujet, c.sourate, left(coalesce(c.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(c.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.sourate,''))), (select frq from p))) as score
        from public.coran c, p where p.raw is not null
        order by score desc, c.id limit p_limit) x where x.score >= 0.3),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.sujet, f.chapitre, f.ecole, left(coalesce(f.texte,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(f.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.tag,''))), (select frq from p))) as score
        from public.fiqh f, p where p.raw is not null
        order by score desc, f.id limit p_limit) x where x.score >= 0.3),
    'themes', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select t.slug, t.nom, t.famille, similarity(public.unaccent(lower(t.nom)), (select frq from p)) as score
        from public.themes t, p where p.raw is not null
        order by score desc, t.ordre limit p_limit) x where x.score >= 0.3)
  );
$function$;
