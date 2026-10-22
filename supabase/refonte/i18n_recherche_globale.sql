-- ============================================================================
-- Recherche globale — modèle colonnes par langue (search_all / search_all_fuzzy)
-- ============================================================================
-- Les deux lisaient encore les lignes par langue (→ vide en AR, sortie FR).
-- Désormais : lignes canoniques (locale fr/NULL), la recherche couvre aussi les
-- colonnes _en/_ar, et le sujet/extrait renvoyés sont localisés (repli FR).
-- À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

create or replace function public.search_all(q text, p_limit integer default 8, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with query as (
    select websearch_to_tsquery('french', coalesce(nullif(btrim(q),''),'zzzznomatch')) as tsq,
           '%'||public.unaccent(lower(btrim(coalesce(q,''))))||'%' as pat,
           '%'||public.normalize_ar(coalesce(q,''))||'%' as arpat,
           nullif(btrim(coalesce(q,'')),'') is not null as active
  )
  select json_build_object(
    'hadiths', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select h.id, h.slug,
          case p_locale when 'en' then coalesce(h.sujet_en,h.sujet) when 'ar' then coalesce(h.sujet_ar,h.sujet) else h.sujet end as sujet,
          left(case p_locale when 'en' then coalesce(h.texte_en,h.texte_francais) else h.texte_francais end,140) as extrait
        from public.hadiths h, query
        where query.active and coalesce(h.locale,'fr')='fr'
          and (
          to_tsvector('french', coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.explication,'')||' '||coalesce(h.intro,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(h.sujet,'')||' '||coalesce(h.sujet_en,'')||' '||coalesce(h.texte_francais,'')||' '||coalesce(h.texte_en,'')||' '||coalesce(h.explication,'')||' '||coalesce(h.explication_en,'')||' '||coalesce(h.intro,'')||' '||coalesce(h.phonetique,''))) like query.pat
          or public.normalize_ar(coalesce(h.texte_arabe,'')||' '||coalesce(h.sujet_ar,'')||' '||coalesce(h.explication_ar,'')||' '||coalesce(h.intro_ar,'')) ilike query.arpat
          or exists (select 1 from public.hadith_segments s where s.hadith_id=h.id and (
               public.normalize_ar(coalesce(s.texte_arabe,'')) ilike query.arpat
               or public.unaccent(lower(coalesce(s.texte_francais,'')||' '||coalesce(s.intro,'')||' '||coalesce(s.explication,''))) like query.pat)))
        order by ts_rank(to_tsvector('french', coalesce(h.sujet,'')||' '||coalesce(h.texte_francais,'')), query.tsq) desc, h.id
        limit p_limit) x),
    'paroles', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select p.id, p.slug,
          case p_locale when 'en' then coalesce(p.sujet_en,p.sujet) when 'ar' then coalesce(p.sujet_ar,p.sujet) else p.sujet end as sujet,
          coalesce(sv.nom,p.savant) as savant,
          left(case p_locale when 'en' then coalesce(p.texte_en,p.texte_francais) else p.texte_francais end,140) as extrait
        from public.paroles p left join public.savants sv on sv.id=p.savant_id, query
        where query.active and coalesce(p.locale,'fr')='fr'
          and (
          to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p.explication,'')||' '||coalesce(sv.nom,p.savant,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(p.sujet,'')||' '||coalesce(p.sujet_en,'')||' '||coalesce(p.texte_francais,'')||' '||coalesce(p.texte_en,'')||' '||coalesce(p.explication,'')||' '||coalesce(p.explication_en,'')||' '||coalesce(sv.nom,p.savant,''))) like query.pat
          or public.normalize_ar(coalesce(p.texte_arabe,'')||' '||coalesce(p.sujet_ar,'')||' '||coalesce(p.explication_ar,'')) ilike query.arpat)
        order by ts_rank(to_tsvector('french', coalesce(p.sujet,'')||' '||coalesce(p.texte_francais,'')), query.tsq) desc, p.id
        limit p_limit) x),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id, i.texte_arabe, i.tag,
          case p_locale when 'en' then coalesce(i.sujet_en,i.sujet) when 'ar' then coalesce(i.sujet_ar,i.sujet) else i.sujet end as sujet,
          case p_locale when 'en' then coalesce(i.texte_en,i.texte_francais) else i.texte_francais end as texte_francais,
          case p_locale when 'en' then coalesce(i.phonetique_en,i.phonetique) else i.phonetique end as "phonétique",
          case p_locale when 'en' then coalesce(i.explication_en,i.explication) when 'ar' then coalesce(i.explication_ar,i.explication) else i.explication end as explication,
          case p_locale when 'en' then coalesce(i.commentaire_en,i.commentaire) when 'ar' then coalesce(i.commentaire_ar,i.commentaire) else i.commentaire end as commentaire,
          left(case p_locale when 'en' then coalesce(i.texte_en,i.texte_francais) else i.texte_francais end,140) as extrait
        from public.invocations i, query
        where query.active and coalesce(i.locale,'fr')='fr'
          and (
          to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.commentaire,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.sujet_en,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.texte_en,'')||' '||coalesce(i.explication,'')||' '||coalesce(i.commentaire,''))) like query.pat
          or public.normalize_ar(coalesce(i.texte_arabe,'')||' '||coalesce(i.sujet_ar,'')||' '||coalesce(i.explication_ar,'')||' '||coalesce(i.commentaire_ar,'')) ilike query.arpat)
        order by ts_rank(to_tsvector('french', coalesce(i.sujet,'')||' '||coalesce(i.texte_francais,'')), query.tsq) desc, i.id
        limit p_limit) x),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sourate,
          case p_locale when 'en' then coalesce(c.sujet_en,c.sujet) when 'ar' then coalesce(c.sujet_ar,c.sujet) else c.sujet end as sujet,
          left(case p_locale when 'en' then coalesce(c.texte_en,c.texte_francais) else c.texte_francais end,140) as extrait
        from public.coran c, query
        where query.active and coalesce(c.locale,'fr')='fr'
          and (
          to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.sourate,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.sujet_en,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.texte_en,'')||' '||coalesce(c.explication,'')||' '||coalesce(c.explication_en,''))) like query.pat
          or public.normalize_ar(coalesce(c.texte_arabe,'')||' '||coalesce(c.sujet_ar,'')||' '||coalesce(c.explication_ar,'')) ilike query.arpat)
        order by ts_rank(to_tsvector('french', coalesce(c.sujet,'')||' '||coalesce(c.texte_francais,'')), query.tsq) desc, c.id
        limit p_limit) x),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.ecole,
          case p_locale when 'en' then coalesce(f.sujet_en,f.sujet) when 'ar' then coalesce(f.sujet_ar,f.sujet) else f.sujet end as sujet,
          case p_locale when 'en' then coalesce(f.chapitre_en,f.chapitre) when 'ar' then coalesce(f.chapitre_ar,f.chapitre) else f.chapitre end as chapitre,
          left(case p_locale when 'en' then coalesce(f.texte_en,f.texte) else f.texte end,140) as extrait
        from public.fiqh f, query
        where query.active and coalesce(f.locale,'fr')='fr'
          and (
          to_tsvector('french', coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.tag,'')) @@ query.tsq
          or public.unaccent(lower(coalesce(f.sujet,'')||' '||coalesce(f.sujet_en,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.texte_en,'')||' '||coalesce(f.chapitre,'')||' '||coalesce(f.chapitre_en,'')||' '||coalesce(f.tag,''))) like query.pat
          or public.normalize_ar(coalesce(f.texte_arabe,'')||' '||coalesce(f.sujet_ar,'')||' '||coalesce(f.chapitre_ar,'')) ilike query.arpat)
        order by ts_rank(to_tsvector('french', coalesce(f.sujet,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.chapitre,'')), query.tsq) desc, f.id
        limit p_limit) x),
    'themes', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select t.slug,
          coalesce((select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale=p_locale), t.nom) as nom,
          t.famille
        from public.themes t, query
        where query.active and (
          public.unaccent(lower(t.nom)) like query.pat
          or public.unaccent(lower(coalesce((select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale='en'),''))) like query.pat
          or exists (select 1 from public.themes_i18n i where i.theme_slug=t.slug and public.normalize_ar(coalesce(i.nom,'')) ilike query.arpat))
        order by t.ordre limit p_limit) x)
  );
$function$;

create or replace function public.search_all_fuzzy(q text, p_limit integer default 8, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with p as (
    select nullif(btrim(coalesce(q,'')),'') as raw,
           public.normalize_ar(coalesce(q,'')) as arq,
           public.unaccent(lower(coalesce(q,''))) as frq
  )
  select json_build_object(
    'hadiths', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select h.id, h.slug,
          case p_locale when 'en' then coalesce(h.sujet_en,h.sujet) when 'ar' then coalesce(h.sujet_ar,h.sujet) else h.sujet end as sujet,
          left(case p_locale when 'en' then coalesce(h.texte_en,h.texte_francais) else h.texte_francais end,140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(h.texte_arabe,'')||' '||coalesce(h.sujet_ar,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(h.texte_francais,'')||' '||coalesce(h.texte_en,'')||' '||coalesce(h.sujet,'')||' '||coalesce(h.sujet_en,''))), (select frq from p))) as score
        from public.hadiths h, p where p.raw is not null and coalesce(h.locale,'fr')='fr'
        order by score desc, h.id limit p_limit) x where x.score >= 0.3),
    'paroles', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select pa.id, pa.slug,
          case p_locale when 'en' then coalesce(pa.sujet_en,pa.sujet) when 'ar' then coalesce(pa.sujet_ar,pa.sujet) else pa.sujet end as sujet,
          coalesce(sv.nom,pa.savant) as savant,
          left(case p_locale when 'en' then coalesce(pa.texte_en,pa.texte_francais) else pa.texte_francais end,140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(pa.texte_arabe,'')||' '||coalesce(pa.sujet_ar,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(pa.texte_francais,'')||' '||coalesce(pa.texte_en,'')||' '||coalesce(pa.sujet,'')||' '||coalesce(pa.sujet_en,'')||' '||coalesce(sv.nom,pa.savant,''))), (select frq from p))) as score
        from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, p where p.raw is not null and coalesce(pa.locale,'fr')='fr'
        order by score desc, pa.id limit p_limit) x where x.score >= 0.3),
    'invocations', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select i.id, i.type_id,
          case p_locale when 'en' then coalesce(i.sujet_en,i.sujet) when 'ar' then coalesce(i.sujet_ar,i.sujet) else i.sujet end as sujet,
          left(case p_locale when 'en' then coalesce(i.texte_en,i.texte_francais) else i.texte_francais end,140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(i.texte_arabe,'')||' '||coalesce(i.sujet_ar,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(i.sujet,'')||' '||coalesce(i.sujet_en,'')||' '||coalesce(i.texte_francais,'')||' '||coalesce(i.texte_en,''))), (select frq from p))) as score
        from public.invocations i, p where p.raw is not null and coalesce(i.locale,'fr')='fr'
        order by score desc, i.id limit p_limit) x where x.score >= 0.3),
    'versets', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select c.id, c.sourate,
          case p_locale when 'en' then coalesce(c.sujet_en,c.sujet) when 'ar' then coalesce(c.sujet_ar,c.sujet) else c.sujet end as sujet,
          left(case p_locale when 'en' then coalesce(c.texte_en,c.texte_francais) else c.texte_francais end,140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(c.texte_arabe,'')||' '||coalesce(c.sujet_ar,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(c.sujet,'')||' '||coalesce(c.sujet_en,'')||' '||coalesce(c.texte_francais,'')||' '||coalesce(c.texte_en,'')||' '||coalesce(c.sourate,''))), (select frq from p))) as score
        from public.coran c, p where p.raw is not null and coalesce(c.locale,'fr')='fr'
        order by score desc, c.id limit p_limit) x where x.score >= 0.3),
    'fiqh', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select f.id, f.ecole,
          case p_locale when 'en' then coalesce(f.sujet_en,f.sujet) when 'ar' then coalesce(f.sujet_ar,f.sujet) else f.sujet end as sujet,
          case p_locale when 'en' then coalesce(f.chapitre_en,f.chapitre) when 'ar' then coalesce(f.chapitre_ar,f.chapitre) else f.chapitre end as chapitre,
          left(case p_locale when 'en' then coalesce(f.texte_en,f.texte) else f.texte end,140) as extrait,
          greatest(similarity(public.normalize_ar(coalesce(f.texte_arabe,'')||' '||coalesce(f.sujet_ar,'')), (select arq from p)),
                   similarity(public.unaccent(lower(coalesce(f.sujet,'')||' '||coalesce(f.sujet_en,'')||' '||coalesce(f.texte,'')||' '||coalesce(f.texte_en,'')||' '||coalesce(f.chapitre,''))), (select frq from p))) as score
        from public.fiqh f, p where p.raw is not null and coalesce(f.locale,'fr')='fr'
        order by score desc, f.id limit p_limit) x where x.score >= 0.3),
    'themes', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from (
        select t.slug,
          coalesce((select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale=p_locale), t.nom) as nom,
          t.famille,
          similarity(public.unaccent(lower(t.nom)), (select frq from p)) as score
        from public.themes t, p where p.raw is not null
        order by score desc, t.ordre limit p_limit) x where x.score >= 0.3)
  );
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select json_typeof(public.search_all('allah', 3, 'ar')) as ok_ar,
       json_typeof(public.search_all('allah', 3, 'en')) as ok_en;
