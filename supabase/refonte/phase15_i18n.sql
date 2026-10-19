-- ============================================================================
-- Phase 15 — Fondations multilingue : locale + translation_group (ADD ONLY)
-- ============================================================================
-- NON DESTRUCTIF. Backup de chaque table AVANT. Aucune colonne existante n'est
-- modifiée/supprimée, aucun texte touché. Tout l'existant devient locale='fr',
-- chaque entrée reçoit son propre translation_group (= sa version FR).
-- Les tables sans flag de publication reçoivent publiee (défaut true = inchangé).
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

do $mig$
declare
  t text;
  all_tables text[] := array['dossiers','exposes','recits','savants','versets_equivoques',
                             'coran','hadiths','paroles','invocations','femmes','fiqh','sourates'];
  no_pub    text[] := array['coran','hadiths','paroles','invocations','femmes','fiqh','sourates'];
begin
  foreach t in array all_tables loop
    -- 1) backup
    execute format('drop table if exists public.%I', t||'_backup_phase15');
    execute format('create table public.%I as select * from public.%I', t||'_backup_phase15', t);
    -- 2) locale (défaut fr) + contrainte
    execute format('alter table public.%I add column if not exists locale text not null default ''fr''', t);
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_locale_chk');
    execute format('alter table public.%I add constraint %I check (locale in (''fr'',''en'',''ar''))', t, t||'_locale_chk');
    -- 3) translation_group (un UUID distinct par ligne existante)
    execute format('alter table public.%I add column if not exists translation_group uuid not null default gen_random_uuid()', t);
    -- 4) index locale-aware
    execute format('create index if not exists %I on public.%I (translation_group)', t||'_tg_idx', t);
    execute format('create index if not exists %I on public.%I (locale)', t||'_locale_idx', t);
  end loop;

  -- 5) publiee pour les tables qui n'ont pas de flag de publication
  foreach t in array no_pub loop
    execute format('alter table public.%I add column if not exists publiee boolean not null default true', t);
  end loop;
end $mig$;

-- 6) PREUVE : aucune ligne perdue, tout en FR, un groupe par entrée.
select 'dossiers'  tbl, (select count(*) from public.dossiers)  rows, (select count(*) from public.dossiers_backup_phase15)  backup, (select count(distinct translation_group) from public.dossiers)  groups, (select count(*) filter (where locale<>'fr') from public.dossiers)  non_fr
union all select 'hadiths', (select count(*) from public.hadiths), (select count(*) from public.hadiths_backup_phase15), (select count(distinct translation_group) from public.hadiths), (select count(*) filter (where locale<>'fr') from public.hadiths)
union all select 'paroles', (select count(*) from public.paroles), (select count(*) from public.paroles_backup_phase15), (select count(distinct translation_group) from public.paroles), (select count(*) filter (where locale<>'fr') from public.paroles)
union all select 'coran', (select count(*) from public.coran), (select count(*) from public.coran_backup_phase15), (select count(distinct translation_group) from public.coran), (select count(*) filter (where locale<>'fr') from public.coran)
union all select 'femmes', (select count(*) from public.femmes), (select count(*) from public.femmes_backup_phase15), (select count(distinct translation_group) from public.femmes), (select count(*) filter (where locale<>'fr') from public.femmes);
