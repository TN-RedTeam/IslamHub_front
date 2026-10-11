-- ============================================================================
-- Phase 11j — normalize_ar : replier les variantes de lettres arabes
-- ============================================================================
-- Problème : la recherche arabe ratait dès que la forme d'une lettre différait
-- entre la saisie et le texte stocké (ى↔ي, ة↔ه, ؤ/ئ). Ex. hadith id 12 :
-- stocké « …وفي قلبه… » (ي), tapé « …وفى قلبه… » (ى) → aucun résultat.
--
-- Correctif : normalize_ar replie désormais ces variantes (normalisation arabe
-- standard), en plus des harakat/hamza/tatweel/guillemets déjà gérés :
--   ى(0649)→ي(064A), ة(0629)→ه(0647), ؤ(0624)→و(0648), ئ(0626)→ي(064A),
--   ک(06A9 kaf persan)→ك(0643), ی(06CC ya persan)→ي(064A).
--
-- normalize_ar est IMMUTABLE et sert à 2 index trigramme → REINDEX obligatoire
-- après modification (sinon résultats incohérents). Appliqué via le MCP.
-- Bénéfice collatéral : la détection de doublons (qui utilise normalize_ar)
-- devient plus robuste à ces mêmes variantes.
-- ============================================================================
create or replace function public.normalize_ar(t text)
 returns text language sql immutable set search_path to 'public','pg_temp'
as $function$
  select btrim(regexp_replace(
    translate(
      translate(
        translate(coalesce(t,''), U&'\0623\0625\0622\0671', U&'\0627\0627\0627\0627'),
        U&'\064B\064C\064D\064E\064F\0650\0651\0652\0670\0640\00AB\00BB\0022\0027\2018\2019\FD3F\FD3E\2039\203A', ''),
      U&'\0649\0629\0624\0626\06A9\06CC', U&'\064A\0647\0648\064A\0643\064A'),
    '\s+',' ','g'))
$function$;

reindex index public.hadiths_arabe_norm_trgm_idx;
reindex index public.paroles_arabe_norm_trgm_idx;
