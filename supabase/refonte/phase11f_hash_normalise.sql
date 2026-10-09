-- ============================================================================
-- Phase 11f — Durcir l'anti-doublon des hadiths (bloquer les quasi-doublons)
-- ============================================================================
-- Avant : le hash d'unicité (arabe_hash) ne neutralisait que les espaces →
-- deux hadiths au même texte mais vocalisation/hamza/guillemets/espaces
-- différents passaient tous les deux.
--
-- Après : le hash est calculé sur une forme normalisée AGRESSIVE :
--   normalize_ar (harakat, hamza-seats أإآٱ→ا, tatweel, guillemets)
--   + repli ة→ه, ى→ي, ؤ→و, ئ→ي
--   + suppression de tous les espaces et de la ponctuation.
-- => deux hadiths au même squelette consonantique sont considérés identiques.
--
-- ⚠️ ORDRE OBLIGATOIRE
--   1. D'ABORD supprimer les doublons existants (une fiche par paire) via
--      l'admin. Au 2026-10, l'audit a trouvé exactement 3 paires :
--        (10 ↔ 63), (42 ↔ 64), (126 ↔ 215).
--   2. ENSUITE exécuter ce script. Le recalcul (étape 2 ci-dessous) ÉCHOUE
--      volontairement si un doublon subsiste (unique_violation) — c'est un
--      garde-fou, pas un bug : retire le doublon signalé puis relance.
--
-- Réversible : pour revenir à l'ancien comportement, remettre dans
-- set_arabe_hash() : md5(trim(regexp_replace(NEW.texte_arabe,'\s+',' ','g'))).
-- ============================================================================

-- 1) Nouveau calcul du hash (harakat/hamza/lettres variantes/espaces neutralisés)
create or replace function public.set_arabe_hash()
 returns trigger language plpgsql set search_path to 'public','pg_temp'
as $function$
begin
  if NEW.texte_arabe is null or btrim(NEW.texte_arabe) = '' then
    NEW.arabe_hash := null;
  else
    NEW.arabe_hash := md5(regexp_replace(
      translate(public.normalize_ar(NEW.texte_arabe),
                U&'\0629\0649\0624\0626', U&'\0647\064A\0648\064A'),
      '[[:space:][:punct:]]', '', 'g'));
  end if;
  return NEW;
end;
$function$;

-- 2) Recalcul des hash existants (déclenche le trigger). Échoue si un doublon
--    subsiste → résoudre puis relancer.
update public.hadiths set texte_arabe = texte_arabe where texte_arabe is not null;
