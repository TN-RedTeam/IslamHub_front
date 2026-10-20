-- ============================================================================
-- Modèle « colonnes par langue » — paroles : liste / recherche
-- ============================================================================
-- Réécrit search_paroles au modèle COLONNES : on ne lit plus les lignes
-- dupliquées par langue (abandonnées), seulement les lignes canoniques
-- (locale 'fr' ou NULL), et on renvoie les champs localisés par colonnes
-- (repli FR). La recherche texte continue de matcher le FR + l'arabe.
-- Signature inchangée. À appliquer après paroles_i18n_colonnes.sql.
-- ============================================================================

create or replace function public.search_paroles(
  q text default '', tag_filter text default '', page_num integer default 0,
  page_size integer default 20, savant_filter text default '', source_filter text default '',
  p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from public.paroles p
    where coalesce(p.locale, 'fr') = 'fr'
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
        select id, slug, savant, ecole, texte_arabe, tag, source_livre, page,
          case p_locale when 'en' then coalesce(sujet_en, sujet)
                        when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
          case p_locale when 'en' then coalesce(texte_en, texte_francais)
                        else texte_francais end as texte_francais,
          case p_locale when 'en' then coalesce(phonetique_en, "phonétique")
                        else "phonétique" end as "phonétique",
          case p_locale when 'en' then coalesce(explication_en, explication)
                        when 'ar' then coalesce(explication_ar, explication) else explication end as explication
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select json_array_length((public.search_paroles('', '', 0, 3, '', '', 'en')->'data')) as echantillon_en;
