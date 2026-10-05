-- ============================================================================
-- Fiqh dans la recherche globale et dans les thèmes
-- Le fiqh (table `fiqh`) n'apparaissait ni dans search_all (loupe du site) ni
-- dans get_theme (pages /themes/:slug). On l'ajoute :
--   • search_all  -> clé 'fiqh' (id, sujet, chapitre, ecole, extrait)
--   • get_theme   -> clé 'fiqh' (points rattachés via les tags -> theme_tags)
-- Le front affiche chaque point avec l'icône de son école et un lien profond
-- vers la page de l'école ouvrant le point : /ecoles/<route>?sujet=<id>.
--
-- À exécuter dans le SQL Editor de Supabase (idempotent, CREATE OR REPLACE).
-- ============================================================================

-- 1) search_all : ajoute la clé 'fiqh' --------------------------------------
create or replace function public.search_all(q text, p_limit integer default 8)
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with query as (
    select websearch_to_tsquery('french', coalesce(nullif(btrim(q),''),'zzzznomatch')) as tsq,
           '%'||public.unaccent(lower(btrim(coalesce(q,''))))||'%' as pat,
           nullif(btrim(coalesce(q,'')),'') is not null as active
  )
  select json_build_object(
    'hadiths', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select h.id, h.slug, h.sujet, left(coalesce(h.texte_francais,''),140) as extrait
        from public.hadiths h, query
        where query.active and (
          to_tsvector('french', coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.explication,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.phonetique,''))) like query.pat)
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

-- 2) get_theme : ajoute la clé 'fiqh' ---------------------------------------
-- Les points de fiqh sont rattachés au thème via leurs tags (texte libre,
-- séparés par des virgules) mis en correspondance avec theme_tags.tag_token,
-- exactement comme pour coran/hadith/parole_themes.
create or replace function public.get_theme(p_slug text)
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with t as (select slug, nom, famille from public.themes where slug = p_slug)
  select case when not exists (select 1 from t) then null else json_build_object(
    'theme', (select row_to_json(t) from t),
    'coran', coalesce((select json_agg(row_to_json(x)) from (
        select c.id, c.sujet, c.texte_arabe, c.texte_francais, c.sourate
        from public.coran_themes ct join public.coran c on c.id = ct.coran_id
        where ct.theme_slug = p_slug order by c.id) x), '[]'::json),
    'hadiths', coalesce((select json_agg(row_to_json(x)) from (
        select h.id, h.slug, h.sujet, h.texte_arabe, h.texte_francais, h.degre_authenticite, h.narrateur,
               (select n.generation from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_generation,
               (select n.role       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_role,
               (select n.sexe       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_sexe
        from public.hadith_themes ht join public.hadiths h on h.id = ht.hadith_id
        where ht.theme_slug = p_slug order by h.id) x), '[]'::json),
    'paroles', coalesce((select json_agg(row_to_json(x)) from (
        select p.id, p.slug, p.sujet, p.texte_arabe, p.texte_francais,
               coalesce(sv.nom, p.savant) as savant, sv.slug as savant_slug, sv.generation, p.ecole
        from public.parole_themes pt join public.paroles p on p.id = pt.parole_id
        left join public.savants sv on sv.id = p.savant_id
        where pt.theme_slug = p_slug order by p.id) x), '[]'::json),
    'fiqh', coalesce((select json_agg(row_to_json(x)) from (
        select distinct f.id, f.sujet, f.chapitre, f.ecole, f.texte_arabe, f.texte
        from public.fiqh f
        where exists (
          select 1
          from unnest(string_to_array(coalesce(f.tag,''), ',')) raw(tok)
          join public.theme_tags tt
            on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
          where tt.theme_slug = p_slug and btrim(raw.tok) <> ''
        )
        order by f.id) x), '[]'::json)
  ) end;
$function$;
