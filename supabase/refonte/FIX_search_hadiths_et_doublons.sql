-- ============================================================================
-- CORRECTIF — search_hadiths (modèle colonnes) + suppression des surcharges en double
-- ============================================================================
-- Constat en base :
--   • search_hadiths vivait encore en version « lignes par langue » → vide en AR,
--     sortie non localisée en EN. (Le fichier i18n_lecture_hadiths.sql n'avait pas
--     pris ; son get_hadith a été remplacé depuis, donc on ne le retouche PAS ici.)
--   • search_coran et search_invocations existaient en DOUBLE (ancienne surcharge
--     sans p_locale + nouvelle avec) car le paramètre avait été ajouté sans retirer
--     l'ancienne. On supprime l'ancienne surcharge.
-- Sûr : ne modifie ni get_hadith ni les autres lectures.
-- ============================================================================

-- 1) search_hadiths : version COLONNES (même signature → remplace l'ancienne)
create or replace function public.search_hadiths(q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20, statut_filter text default '', rapporteur_filter text default '', narrateur_filter text default '', p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from public.hadiths h
    where coalesce(h.locale,'fr') = 'fr'
      and (q = '' or (
        h.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
        or h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%'
        or h.narrateur ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%'
        or h.intro ilike '%'||q||'%' or h.tag ilike '%'||q||'%'
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
        select id,
               case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
               case p_locale when 'en' then coalesce(intro_en, intro) when 'ar' then coalesce(intro_ar, intro) else intro end as intro,
               texte_arabe,
               case p_locale when 'en' then coalesce(texte_en, texte_francais) else texte_francais end as texte_francais,
               case p_locale when 'en' then coalesce(phonetique_en, phonetique) else phonetique end as "phonétique",
               case p_locale when 'en' then coalesce(explication_en, explication) when 'ar' then coalesce(explication_ar, explication) else explication end as explication,
               tag, rapporteur, narrateur, statut,
               (select n.generation from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_generation,
               (select n.role       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_role,
               (select n.sexe       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_sexe,
               public.recueils_for_hadith(filtered.id)      as recueils,
               public.recueils_json_for_hadith(filtered.id) as sources
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$function$;

-- 2) Supprimer les ANCIENNES surcharges (sans p_locale) restées en double
drop function if exists public.search_coran(text, text, integer, integer);
drop function if exists public.search_invocations(text, text, text, integer, integer);

-- ---- PREUVE : AR ne doit plus être vide, EN doit être localisé --------------
select json_array_length(public.search_hadiths('', '', 0, 100, '', '', '', 'ar')->'data') as n_ar,
       (public.search_hadiths('', '', 0, 100, '', '', '', 'en')->'data'->0->>'sujet')       as premier_sujet_en;
-- Plus qu'UNE version de chacune :
select proname, count(*) as surcharges
from pg_proc where pronamespace='public'::regnamespace and proname in ('search_coran','search_invocations','search_hadiths')
group by proname order by proname;
