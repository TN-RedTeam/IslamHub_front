-- ============================================================================
-- Refonte IslamHub — Phase 1 (rigueur des données hadiths)
-- Appliqué le 2026-09-07 sur le projet Supabase (branche refonte/architecture-v2).
-- Idempotent : réexécutable sans dommage.
--
-- Principe : AUCUNE colonne existante n'est supprimée (statut, statut_id, tag
-- restent la source + le rollback). On AJOUTE des colonnes et on migre.
-- ============================================================================

-- 0) Sauvegarde en base (en plus du backup externe)
create table if not exists public.hadiths_backup_phase1 as select * from public.hadiths;

-- 1.3) Sépare « authenticité » et « type de hadith » ------------------------
alter table public.hadiths add column if not exists degre_authenticite text;  -- Sahih / Hassan / Da'if / qawiyy
alter table public.hadiths add column if not exists type_hadith        text;  -- Qudsi / Marfu' / Mawquf
alter table public.hadiths add column if not exists juge_par           text;  -- muhaddith ayant authentifié (hors Bukhari/Muslim)

-- Migration depuis `statut` (valeurs réelles constatées) :
update public.hadiths set degre_authenticite = statut
  where statut in ('Sahih','Hassan','Da''if','qawiyy');
update public.hadiths set type_hadith = 'Qudsi'  where statut = 'Qoudoussy';
update public.hadiths set type_hadith = 'Mawquf' where statut = 'mawqouf';
-- NB : les 2 hadiths Qudsi/Mawquf n'ont pas d'authenticité renseignée à la
--     source → degre_authenticite reste NULL (à compléter à la relecture).

-- 1.2) Coquilles de tags (uniquement les tokens fautifs, tags = CSV) ---------
update public.hadiths set tag = replace(tag,'invcation','invocation')          where tag like '%invcation%';
update public.hadiths set tag = replace(tag,'prohète','prophète')              where tag like '%prohète%';
update public.hadiths set tag = replace(tag,'pêchés','péchés')                 where tag like '%pêchés%';
update public.hadiths set tag = replace(tag,'recitation','récitation')          where tag like '%recitation%';
update public.hadiths set tag = replace(tag,'obeissance','obéissance')          where tag like '%obeissance%';
update public.hadiths set tag = replace(tag,'interpretation','interprétation')  where tag like '%interpretation%';
-- (Vérifié : ces coquilles n'existent que dans `hadiths`, pas dans coran/dhikrs/douaas/paroles.)

-- Contrôle post-migration attendu :
--   129 lignes ; degré Sahih=118/Hassan=5/Da'if=1/qawiyy=1/null=4 ;
--   type Qudsi=1/Mawquf=1/null=127 ; 0 coquille restante.
