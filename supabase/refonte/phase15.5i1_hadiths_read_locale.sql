-- ============================================================================
-- Phase 15.5 — vague 5i-1 : lecture locale-aware des HADITHS (listing+recherche)
--   search_hadiths, search_hadiths_fuzzy
-- ============================================================================
-- Prédicat de repli (composable, future-proof, sans fenêtre ni casse de
-- pagination) injecté dans le WHERE :
--   • on prend la ligne de la langue demandée ;
--   • pour 'en' : à défaut d'équivalent EN dans le groupe, on prend la ligne FR
--     (repli) ;
--   • pour 'ar' : strict (ni 'en' ni repli FR) → corpus arabe propre.
-- Pour p_locale='fr' le résultat est IDENTIQUE à l'existant (tout le contenu
-- étant FR aujourd'hui), donc aucune régression. Quand des lignes EN seront
-- ajoutées, elles apparaîtront automatiquement (pas de refonte).
--
-- La FICHE get_hadith(id) reste inchangée (résolue par id → bonne ligne).
-- Anciennes signatures droppées (anti-surcharge ambiguë).
-- ============================================================================

drop function if exists public.search_hadiths(text,text,integer,integer,text,text,text);
drop function if exists public.search_hadiths_fuzzy(text,integer);

-- ---- Recherche exacte + filtres + pagination -----------------------------
create or replace function public.search_hadiths(
  q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20,
  statut_filter text default '', rapporteur_filter text default '', narrateur_filter text default '',
  p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with filtered as (
    select * from public.hadiths h
    where ( h.locale = p_locale
            or (p_locale = 'en' and h.locale = 'fr'
                and not exists (select 1 from public.hadiths e
                                where e.translation_group = h.translation_group and e.locale = 'en')) )
      and (q = '' or (
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

-- ---- Recherche approximative (similarité) --------------------------------
create or replace function public.search_hadiths_fuzzy(q text default '', p_limit integer default 20, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with scored as (
    select h.id,
      greatest(
        similarity(public.normalize_ar(coalesce(h.texte_arabe,'')), public.normalize_ar(q)),
        similarity(public.unaccent(lower(coalesce(h.texte_francais,'')||' '||coalesce(h.sujet,''))), public.unaccent(lower(q)))
      ) as score
    from public.hadiths h
    where btrim(coalesce(q,'')) <> ''
      and ( h.locale = p_locale
            or (p_locale = 'en' and h.locale = 'fr'
                and not exists (select 1 from public.hadiths e
                                where e.translation_group = h.translation_group and e.locale = 'en')) )
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

-- ---- PREUVE : non-régression FR + AR strict ------------------------------
-- total FR = total actuel (tous hadiths) ; AR = 0 ; EN = FR (repli).
select 'fr' loc, (public.search_hadiths('', '', 0, 1, '', '', '', 'fr')->>'total') total
union all select 'en', (public.search_hadiths('', '', 0, 1, '', '', '', 'en')->>'total')
union all select 'ar', (public.search_hadiths('', '', 0, 1, '', '', '', 'ar')->>'total');
