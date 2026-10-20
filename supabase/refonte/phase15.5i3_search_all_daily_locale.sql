-- ============================================================================
-- Phase 15.5 — vague 5i-3 : recherche globale + encarts du jour (locale-aware)
--   search_all, search_all_fuzzy, daily_hadith, daily_parole
-- ============================================================================
-- Même prédicat de repli (langue demandée ; repli FR pour 'en' à défaut
-- d'équivalent ; 'ar' strict) appliqué aux 5 tables de contenu de la recherche
-- (hadiths, paroles, invocations, coran, fiqh) et aux encarts du jour.
-- Le sous-bloc `themes` reste inchangé (taxonomie language-neutral, sans locale).
-- p_locale='fr' = comportement IDENTIQUE à l'existant. Anciennes signatures
-- droppées (anti-surcharge).
-- ============================================================================

drop function if exists public.search_all(text,integer);
drop function if exists public.search_all_fuzzy(text,integer);
drop function if exists public.daily_hadith(integer);
drop function if exists public.daily_parole(integer);

-- ---- Recherche globale (exacte) ------------------------------------------
create or replace function public.search_all(q text, p_limit integer default 8, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
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
        where query.active
          and (h.locale = p_locale or (p_locale='en' and h.locale='fr' and not exists (select 1 from public.hadiths e where e.translation_group=h.translation_group and e.locale='en')))
          and (
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
        where query.active
          and (p.locale = p_locale or (p_locale='en' and p.locale='fr' and not exists (select 1 from public.paroles e where e.translation_group=p.translation_group and e.locale='en')))
          and (
          to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p.explication,'')||' '||coalesce(sv.nom,p.savant,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p."phonétique",'')||' '||coalesce(sv.nom,p.savant,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')), query.tsq) desc, p.id
        limit p_limit) x),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id, i.sujet, i.texte_arabe, i.texte_francais, i.phonetique as "phonétique",
               i.explication, i.commentaire, i.tag, left(coalesce(i.texte_francais,''),140) as extrait
        from public.invocations i, query
        where query.active
          and (i.locale = p_locale or (p_locale='en' and i.locale='fr' and not exists (select 1 from public.invocations e where e.translation_group=i.translation_group and e.locale='en')))
          and (
          to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.commentaire,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.phonetique,''))) like query.pat
          or public.normalize_ar(coalesce(i.texte_arabe,'')) ilike query.arpat)
        order by ts_rank(to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')), query.tsq) desc, i.id
        limit p_limit) x),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sujet, c.sourate, left(coalesce(c.texte_francais,''),140) as extrait
        from public.coran c, query
        where query.active
          and (c.locale = p_locale or (p_locale='en' and c.locale='fr' and not exists (select 1 from public.coran e where e.translation_group=c.translation_group and e.locale='en')))
          and (
          to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.sourate,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.phonetique,''))) like query.pat)
        order by ts_rank(to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')), query.tsq) desc, c.id
        limit p_limit) x),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.sujet, f.chapitre, f.ecole, left(coalesce(f.texte,''),140) as extrait
        from public.fiqh f, query
        where query.active
          and (f.locale = p_locale or (p_locale='en' and f.locale='fr' and not exists (select 1 from public.fiqh e where e.translation_group=f.translation_group and e.locale='en')))
          and (
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

-- ---- Recherche globale (approximative) -----------------------------------
create or replace function public.search_all_fuzzy(q text, p_limit integer default 8, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
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
          and (h.locale = p_locale or (p_locale='en' and h.locale='fr' and not exists (select 1 from public.hadiths e where e.translation_group=h.translation_group and e.locale='en')))
        order by score desc, h.id limit p_limit) x where x.score >= 0.3),
    'paroles', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select pa.id, pa.slug, pa.sujet, coalesce(sv.nom,pa.savant) as savant, left(coalesce(pa.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(pa.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(pa.texte_francais,'')||' '||coalesce(pa.sujet,'')||' '||coalesce(sv.nom,pa.savant,''))), (select frq from p))) as score
        from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, p where p.raw is not null
          and (pa.locale = p_locale or (p_locale='en' and pa.locale='fr' and not exists (select 1 from public.paroles e where e.translation_group=pa.translation_group and e.locale='en')))
        order by score desc, pa.id limit p_limit) x where x.score >= 0.3),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id, i.sujet, left(coalesce(i.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(i.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.commentaire,''))), (select frq from p))) as score
        from public.invocations i, p where p.raw is not null
          and (i.locale = p_locale or (p_locale='en' and i.locale='fr' and not exists (select 1 from public.invocations e where e.translation_group=i.translation_group and e.locale='en')))
        order by score desc, i.id limit p_limit) x where x.score >= 0.3),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sujet, c.sourate, left(coalesce(c.texte_francais,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(c.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.sourate,''))), (select frq from p))) as score
        from public.coran c, p where p.raw is not null
          and (c.locale = p_locale or (p_locale='en' and c.locale='fr' and not exists (select 1 from public.coran e where e.translation_group=c.translation_group and e.locale='en')))
        order by score desc, c.id limit p_limit) x where x.score >= 0.3),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.sujet, f.chapitre, f.ecole, left(coalesce(f.texte,''),140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(f.texte_arabe,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.tag,''))), (select frq from p))) as score
        from public.fiqh f, p where p.raw is not null
          and (f.locale = p_locale or (p_locale='en' and f.locale='fr' and not exists (select 1 from public.fiqh e where e.translation_group=f.translation_group and e.locale='en')))
        order by score desc, f.id limit p_limit) x where x.score >= 0.3),
    'themes', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select t.slug, t.nom, t.famille, similarity(public.unaccent(lower(t.nom)), (select frq from p)) as score
        from public.themes t, p where p.raw is not null
        order by score desc, t.ordre limit p_limit) x where x.score >= 0.3)
  );
$function$;

-- ---- Encarts du jour (accueil) -------------------------------------------
create or replace function public.daily_hadith(day integer, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with pool as (
    select * from public.hadiths h
    where (h.locale = p_locale or (p_locale='en' and h.locale='fr' and not exists (select 1 from public.hadiths e where e.translation_group=h.translation_group and e.locale='en')))
  )
  select row_to_json(x) from (
    select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
           explication, tag, rapporteur, narrateur, statut
    from pool order by id
    offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

create or replace function public.daily_parole(day integer, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with pool as (
    select * from public.paroles p
    where (p.locale = p_locale or (p_locale='en' and p.locale='fr' and not exists (select 1 from public.paroles e where e.translation_group=p.translation_group and e.locale='en')))
  )
  select row_to_json(x) from (
    select p.id, p.slug, p.sujet, coalesce(sv.nom, p.savant) as savant, sv.slug as savant_slug,
           p.texte_arabe, p.texte_francais, p."phonétique" as "phonétique", p.ecole
    from pool p left join public.savants sv on sv.id = p.savant_id
    order by p.id
    offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

-- ---- PREUVE : FR non vide vs AR vide (recherche globale) ------------------
select 'fr' loc,
       json_array_length(public.search_all('e', 50, 'fr')->'hadiths') h,
       json_array_length(public.search_all('e', 50, 'fr')->'paroles') p
union all select 'ar',
       json_array_length(public.search_all('e', 50, 'ar')->'hadiths'),
       json_array_length(public.search_all('e', 50, 'ar')->'paroles');
