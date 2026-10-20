-- ============================================================================
-- Phase 15.5 — vague 5e : CORRECTIF taxonomie (themes / tags)
-- ============================================================================
-- Le modèle ligne-par-langue de la vague 1 ne convient PAS pour themes/tags :
--   • themes.slug est référencé par 4 FK (coran_themes, hadith_themes,
--     parole_themes, theme_tags) → slug partagé, pas de 2e ligne possible ;
--   • tags est référencé par id (hadith_tags.tag_id).
-- Un thème / un tag est une TAXONOMIE partagée entre langues ; seul son
-- LIBELLÉ se traduit. On revient donc à une taxonomie language-neutral +
-- une table de libellés traduits (EN/AR). Le FR reste dans themes.nom/tags.nom.
--
-- NON DESTRUCTIF : on ne retire que les colonnes i18n ajoutées par la vague 1
-- (toutes à 'fr' / uuid / true), aucune donnée métier touchée. Backups de la
-- vague 1 (themes_backup_phase15_5, tags_backup_phase15_5) conservés.
-- ============================================================================

-- 1) Retirer les colonnes i18n erronées de la vague 1
do $correctif$
declare t text;
begin
  foreach t in array array['themes','tags'] loop
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_tg_locale_uq');
    execute format('alter table public.%I drop constraint if exists %I', t, t||'_locale_chk');
    execute format('drop index if exists public.%I', t||'_tg_idx');
    execute format('drop index if exists public.%I', t||'_locale_idx');
    execute format('alter table public.%I drop column if exists translation_group', t);
    execute format('alter table public.%I drop column if exists locale', t);
    execute format('alter table public.%I drop column if exists publiee', t);
  end loop;
end $correctif$;

-- 2) Table de libellés traduits des thèmes (EN/AR ; FR = themes.nom)
create table if not exists public.themes_i18n (
  theme_slug text not null references public.themes(slug) on delete cascade,
  locale     text not null check (locale in ('en','ar')),
  nom        text not null,
  primary key (theme_slug, locale)
);
alter table public.themes_i18n enable row level security;
drop policy if exists "public read" on public.themes_i18n;
create policy "public read" on public.themes_i18n for select to public using (true);

-- 3) Table de libellés traduits des tags (EN/AR ; FR = tags.nom)
create table if not exists public.tags_i18n (
  tag_id bigint not null references public.tags(id) on delete cascade,
  locale text not null check (locale in ('en','ar')),
  nom    text not null,
  primary key (tag_id, locale)
);
alter table public.tags_i18n enable row level security;
drop policy if exists "public read" on public.tags_i18n;
create policy "public read" on public.tags_i18n for select to public using (true);

-- 4) PREUVE : colonnes i18n retirées (0), tables de libellés créées (vides = FR seul).
select 'themes_i18n_cols_restants' as check,
       (select count(*) from information_schema.columns
        where table_schema='public' and table_name='themes'
          and column_name in ('locale','translation_group','publiee')) as valeur
union all select 'tags_i18n_cols_restants',
       (select count(*) from information_schema.columns
        where table_schema='public' and table_name='tags'
          and column_name in ('locale','translation_group','publiee'))
union all select 'themes_i18n_rows', (select count(*) from public.themes_i18n)
union all select 'tags_i18n_rows',   (select count(*) from public.tags_i18n);
