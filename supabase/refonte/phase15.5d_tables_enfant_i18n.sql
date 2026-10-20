-- ============================================================================
-- Phase 15.5 — vague 4 : i18n sur les tables ENFANT / corps (ADD ONLY)
--   attribut_citations, contenu_blocs, exegeses — OPTION A (validée).
-- ============================================================================
-- NON DESTRUCTIF. Backup de chaque table AVANT (RLS activée sur le backup).
-- Aucune colonne existante n'est modifiée/supprimée. Tout l'existant devient
-- locale='fr' + translation_group propre.
--
-- OPTION A : la traduction d'un élément enfant = une NOUVELLE ligne, même
-- translation_group, locale='en'/'ar', portant uniquement le TEXTE traduisible :
--   • contenu_blocs      → texte_md, commentaire_md, libre_traduction, libre_ref
--   • exegeses           → texte (tafsir), source
--   • attribut_citations → signification, phonetique, ref
-- L'ARABE SACRÉ reste sur la ligne canonique (NON re-stocké par langue) :
--   contenu_blocs.libre_arabe, attribut_citations.arabe.
--
-- PAS de colonne `publiee` sur ces tables : la publication est portée par le
-- PARENT (dossier/expose/attribut/verset) ; un enfant hérite de sa visibilité.
--
-- Rattachement au parent (parent_id / attribut_id / verset_id) : la convention
-- exacte (enfant rattaché au parent canonique vs au parent de la langue) est
-- un choix du CIRCUIT ADMIN (Phase 15.7) ; le schéma ci-dessous supporte les
-- deux. Ici on ne fait qu'ajouter le mécanisme, le contenu reste 100 % FR.
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

do $mig$
declare
  t    text;
  tbls text[] := array['attribut_citations','contenu_blocs','exegeses'];
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

    -- 4) index locale-aware
    execute format('create index if not exists %I on public.%I (translation_group)', t||'_tg_idx', t);
    execute format('create index if not exists %I on public.%I (locale)', t||'_locale_idx', t);

    -- 5) intégrité : un groupe => au plus une ligne par langue
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_tg_locale_uq');
    execute format('alter table public.%I add constraint %I unique (translation_group, locale)', t, t||'_tg_locale_uq');
  end loop;
end $mig$;

-- 6) PREUVE : aucune ligne perdue, tout en FR, un groupe distinct par entrée.
select 'attribut_citations' tbl,
       (select count(*) from public.attribut_citations)                              rows,
       (select count(*) from public.attribut_citations_backup_phase15_5)             backup,
       (select count(distinct translation_group) from public.attribut_citations)     groups,
       (select count(*) filter (where locale <> 'fr') from public.attribut_citations) non_fr
union all
select 'contenu_blocs',
       (select count(*) from public.contenu_blocs),
       (select count(*) from public.contenu_blocs_backup_phase15_5),
       (select count(distinct translation_group) from public.contenu_blocs),
       (select count(*) filter (where locale <> 'fr') from public.contenu_blocs)
union all
select 'exegeses',
       (select count(*) from public.exegeses),
       (select count(*) from public.exegeses_backup_phase15_5),
       (select count(distinct translation_group) from public.exegeses),
       (select count(*) filter (where locale <> 'fr') from public.exegeses);
