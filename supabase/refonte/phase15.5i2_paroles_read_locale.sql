-- ============================================================================
-- Phase 15.5 — vague 5i-2 : lecture locale-aware des PAROLES (listing+recherche)
--   search_paroles (surcharge 6 args, utilisée par le front), search_paroles_fuzzy
-- ============================================================================
-- Même prédicat de repli que 5i-1 (langue demandée ; repli FR pour 'en' à défaut
-- d'équivalent ; 'ar' strict). p_locale='fr' = comportement identique.
-- Fiche get_parole(slug) inchangée. Anciennes signatures droppées (dont la
-- surcharge 5 args, morte) pour éviter toute ambiguïté.
-- ============================================================================

drop function if exists public.search_paroles(text,text,integer,integer,text);
drop function if exists public.search_paroles(text,text,integer,integer,text,text);
drop function if exists public.search_paroles_fuzzy(text,integer);

-- ---- Recherche exacte + filtres + pagination -----------------------------
create or replace function public.search_paroles(
  q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20,
  savant_filter text default '', source_filter text default '', p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with filtered as (
    select * from public.paroles p
    where ( p.locale = p_locale
            or (p_locale = 'en' and p.locale = 'fr'
                and not exists (select 1 from public.paroles e
                                where e.translation_group = p.translation_group and e.locale = 'en')) )
      and (q = '' or (
        p.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(p.texte_arabe) ilike '%'||public.normalize_ar(q)||'%'
        or p.sujet ilike '%'||q||'%' or p.savant ilike '%'||q||'%'
        or p."phonétique" ilike '%'||q||'%' or p.tag ilike '%'||q||'%'
        or (q ~ '^[0-9]+$' and p.id = q::bigint)))
      and (tag_filter = ''
           or lower(public.unaccent(translate(btrim(p.sujet), '''’‘ʾʿ"`', '')))
            = lower(public.unaccent(translate(btrim(tag_filter), '''’‘ʾʿ"`', ''))))
      and (savant_filter = '' or p.savant = savant_filter)
      and (source_filter = '' or btrim(p.source_livre) = source_filter)
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, slug, sujet, savant, ecole, texte_arabe, texte_francais, "phonétique", explication, tag, source_livre, page
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- ---- Recherche approximative (similarité) --------------------------------
create or replace function public.search_paroles_fuzzy(q text default '', p_limit integer default 20, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with scored as (
    select p.id,
      greatest(
        similarity(public.normalize_ar(coalesce(p.texte_arabe,'')), public.normalize_ar(q)),
        similarity(public.unaccent(lower(coalesce(p.texte_francais,'')||' '||coalesce(p.sujet,'')||' '||coalesce(p.savant,''))), public.unaccent(lower(q)))
      ) as score
    from public.paroles p
    where btrim(coalesce(q,'')) <> ''
      and ( p.locale = p_locale
            or (p_locale = 'en' and p.locale = 'fr'
                and not exists (select 1 from public.paroles e
                                where e.translation_group = p.translation_group and e.locale = 'en')) )
  ),
  filtered as (select id, score from scored where score >= 0.3 order by score desc, id limit p_limit)
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
      select p.id, p.slug, p.sujet, p.savant, p.ecole, p.texte_arabe, p.texte_francais, p."phonétique", p.explication, p.tag, p.source_livre, p.page
      from filtered f join public.paroles p on p.id=f.id order by f.score desc, f.id) d), '[]'::json));
$function$;

-- ---- PREUVE : non-régression FR + AR strict ------------------------------
select 'fr' loc, (public.search_paroles('', '', 0, 1, '', '', 'fr')->>'total') total
union all select 'en', (public.search_paroles('', '', 0, 1, '', '', 'en')->>'total')
union all select 'ar', (public.search_paroles('', '', 0, 1, '', '', 'ar')->>'total');
