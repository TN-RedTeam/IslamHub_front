-- ============================================================================
-- Phase 11j — normalize_ar robuste aux différences entre sources
-- ============================================================================
-- Le même texte arabe, copié depuis des sites différents, varie souvent par :
--   • la forme des lettres : ى↔ي, ة↔ه, ؤ/ئ, hamza-seats أإآٱ, kaf/ya persans ک/ی
--   • les harakat / diacritiques / signes coraniques
--   • le tatweel ـ et les guillemets « » ‹ › " ' ﴾﴿
--   • des CARACTÈRES INVISIBLES insérés au copier-coller : espace insécable,
--     zero-width (ZWJ/ZWNJ/ZWSP), marques de direction (LRM/RLM/isolates), BOM,
--     soft hyphen.
-- Avant, la recherche ratait dès qu'un seul de ces éléments différait
-- (ex. hadith id 12 : stocké « وفي », tapé « وفى » → aucun résultat).
--
-- normalize_ar neutralise désormais tout cela (normalisation arabe standard).
-- Fonction IMMUTABLE utilisée par 2 index trigramme → REINDEX obligatoire.
-- Appliqué via le MCP. Bénéfice collatéral : détection de doublons plus robuste.
-- ============================================================================
create or replace function public.normalize_ar(t text)
 returns text language sql immutable set search_path to 'public','pg_temp'
as $function$
  select btrim(regexp_replace(
    regexp_replace(
      translate(
        translate(
          regexp_replace(
            regexp_replace(coalesce(t,''),
              U&'[\200B\200C\200D\200E\200F\202A\202B\202C\202D\202E\2066\2067\2068\2069\FEFF\00AD]', '', 'g'),       -- invisibles (zero-width, bidi, soft hyphen)
            U&'[\064B-\065F\0670\0640\06D6-\06DC\06DF-\06E8\06EA-\06ED]', '', 'g'),                                     -- harakat/diacritiques + tatweel
          U&'\0623\0625\0622\0671', U&'\0627\0627\0627\0627'),                                                          -- أإآٱ → ا
        U&'\0649\0629\0624\0626\06A9\06CC', U&'\064A\0647\0648\064A\0643\064A'),                                        -- ى→ي ة→ه ؤ→و ئ→ي ک→ك ی→ي
      U&'[\00AB\00BB\0022\0027\2018\2019\FD3F\FD3E\2039\203A\00A0]', ' ', 'g'),                                         -- guillemets/crochets/nbsp → espace
    '\s+',' ','g'))
$function$;

reindex index public.hadiths_arabe_norm_trgm_idx;
reindex index public.paroles_arabe_norm_trgm_idx;
