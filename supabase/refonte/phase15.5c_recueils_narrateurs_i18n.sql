-- ============================================================================
-- Phase 15.5 — vague 3 : i18n sur « recueils » et « narrateurs » (ADD ONLY)
-- ============================================================================
-- NON DESTRUCTIF. Backup de chaque table AVANT (RLS activée sur le backup).
-- Aucune colonne existante n'est modifiée/supprimée. Tout l'existant devient
-- locale='fr' + translation_group propre.
--
-- IMPORTANT — arabe sacré PARTAGÉ, non re-stocké par langue :
--   • recueils.titre_arabe reste porté par la ligne canonique ; une future
--     entrée EN/AR ne traduit que `titre` et laisse titre_arabe vide.
--   • narrateurs : `role`/`generation` traduisibles ; `nom` (translittéré) reste
--     partagé (porté par la ligne canonique).
-- Les FK existantes (savant_id, commente_recueil_id) pointent la ligne
-- canonique ; les traductions sont des surcouches de texte, pas de nouvelles
-- relations. Modèle : ligne-par-langue + translation_group.
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

do $mig$
declare
  t    text;
  tbls text[] := array['recueils','narrateurs'];
begin
  foreach t in array tbls loop
    -- 1) backup (RLS activée d'emblée : backup non exposé anon)
    execute format('drop table if exists public.%I', t||'_backup_phase15_5');
    execute format('create table public.%I as select * from public.%I', t||'_backup_phase15_5', t);
    execute format('alter table public.%I enable row level security', t||'_backup_phase15_5');

    -- 2) locale (défaut fr) + contrainte
    execute format('alter table public.%I add column if not exists locale text not null default ''fr''', t);
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_locale_chk');
    execute format('alter table public.%I add constraint %I check (locale in (''fr'',''en'',''ar''))', t, t||'_locale_chk');

    -- 3) translation_group (UUID distinct par ligne existante — défaut volatil)
    execute format('alter table public.%I add column if not exists translation_group uuid not null default gen_random_uuid()', t);

    -- 4) publiee (défaut true = inchangé)
    execute format('alter table public.%I add column if not exists publiee boolean not null default true', t);

    -- 5) index locale-aware
    execute format('create index if not exists %I on public.%I (translation_group)', t||'_tg_idx', t);
    execute format('create index if not exists %I on public.%I (locale)', t||'_locale_idx', t);

    -- 6) intégrité : un groupe => au plus une ligne par langue
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_tg_locale_uq');
    execute format('alter table public.%I add constraint %I unique (translation_group, locale)', t, t||'_tg_locale_uq');
  end loop;
end $mig$;

-- 7) PREUVE : aucune ligne perdue, tout en FR, un groupe distinct par entrée.
select 'recueils' tbl,
       (select count(*) from public.recueils)                                   rows,
       (select count(*) from public.recueils_backup_phase15_5)                  backup,
       (select count(distinct translation_group) from public.recueils)         groups,
       (select count(*) filter (where locale <> 'fr') from public.recueils)     non_fr
union all
select 'narrateurs',
       (select count(*) from public.narrateurs),
       (select count(*) from public.narrateurs_backup_phase15_5),
       (select count(distinct translation_group) from public.narrateurs),
       (select count(*) filter (where locale <> 'fr') from public.narrateurs);
