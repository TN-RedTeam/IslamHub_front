-- ============================================================================
-- Phase 15.5 — vague 2 : i18n sur « noms_allah » et « attributs » (ADD ONLY)
-- ============================================================================
-- NON DESTRUCTIF. Backup de chaque table AVANT (RLS activée sur le backup).
-- Aucune colonne existante n'est modifiée/supprimée. Tout l'existant devient
-- locale='fr' + translation_group propre.
--
-- IMPORTANT — arabe sacré PARTAGÉ, non re-stocké par langue :
--   • noms_allah.nom_arabe (+ translitteration) restent portés par la ligne
--     canonique du groupe ; une future entrée EN/AR ne traduit que sens_fr /
--     explication et laisse nom_arabe vide (lu sur la ligne canonique).
--   • attributs : nom/gloss/explication sont traduisibles.
-- Les tables ENFANT (attribut_citations, avec l'arabe sacré `arabe`) seront
-- traitées dans la vague « tables enfant / corps d'article ».
-- Modèle : ligne-par-langue + translation_group (cf. phase15.5_modele_contenu.md).
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

do $mig$
declare
  t    text;
  tbls text[] := array['noms_allah','attributs'];
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
select 'noms_allah' tbl,
       (select count(*) from public.noms_allah)                                 rows,
       (select count(*) from public.noms_allah_backup_phase15_5)                backup,
       (select count(distinct translation_group) from public.noms_allah)       groups,
       (select count(*) filter (where locale <> 'fr') from public.noms_allah)   non_fr
union all
select 'attributs',
       (select count(*) from public.attributs),
       (select count(*) from public.attributs_backup_phase15_5),
       (select count(distinct translation_group) from public.attributs),
       (select count(*) filter (where locale <> 'fr') from public.attributs);
