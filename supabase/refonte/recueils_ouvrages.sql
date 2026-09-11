-- ============================================================================
-- recueils = OUVRAGES (livres) reliés à leur AUTEUR (savants), + commentaires
-- (sharḥ / ḥāshiya) via auto-référence. Migration appliquée en prod par étapes.
-- Backup préalable : schéma `backup` (non exposé à l'API).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 1 — Backup + schéma cible (ALTER ADD, non destructif)
-- ─────────────────────────────────────────────────────────────────────────

-- Backup avant migration (schéma non exposé).
create schema if not exists backup;
create table if not exists backup.recueils_20260911       as table public.recueils;
create table if not exists backup.hadith_sources_20260911 as table public.hadith_sources;

-- Nouvelles colonnes.
alter table public.recueils
  add column if not exists slug                text,
  add column if not exists titre_arabe         text,
  add column if not exists type                text not null default 'recueil',
  add column if not exists commente_recueil_id bigint references public.recueils(id) on delete set null;

-- type ∈ { recueil (original) | sharh (commentaire) | hashiya (glose) }.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recueils_type_check') then
    alter table public.recueils
      add constraint recueils_type_check check (type in ('recueil','sharh','hashiya'));
  end if;
end $$;

create index if not exists recueils_savant_id_idx on public.recueils(savant_id);
create index if not exists recueils_commente_idx  on public.recueils(commente_recueil_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 2 — Titres manquants + slugs uniques
-- ─────────────────────────────────────────────────────────────────────────

-- Titres PROVISOIRES pour les auteurs à plusieurs ouvrages (œuvre principale la
-- plus probable comme source de hadith). À vérifier / éclater en une ligne/livre.
update public.recueils set titre = 'As-Sounan al-Koubra'  where id = 3  and titre is null; -- Al-Bayhaqi
update public.recueils set titre = 'Al-Mou''jam al-Kabir'  where id = 12 and titre is null; -- At-Tabarani
update public.recueils set titre = 'Al-Maqasid al-Hasana'  where id = 4  and titre is null; -- As-Sakhawi
update public.recueils set titre = 'Al-Jami'' as-Saghir'   where id = 8  and titre is null; -- As-Souyouti
update public.recueils set titre = 'Al-Mawdou''at'         where id = 10 and titre is null; -- Ibn al-Jawzi
update public.recueils set titre = 'Az-Zawajir'            where id = 2  and titre is null; -- Ibn Hajar al-Haytami
update public.recueils set titre = 'Tafsir al-Qourtoubi'   where id = 1  and titre is null; -- Al-Qourtoubi
-- id 13 (Aboû l-Qâçim al-Ansâriyy) : ouvrage incertain → titre NULL (à compléter).

-- Slug unique depuis le titre (repli sur nom tant que le titre est vide).
update public.recueils
set slug = lower(regexp_replace(
             regexp_replace(public.unaccent(coalesce(nullif(btrim(titre),''), nom)),
               '[^a-zA-Z0-9]+', '-', 'g'),
             '(^-+|-+$)', '', 'g'))
where slug is null;

create unique index if not exists recueils_slug_unique on public.recueils(slug);
