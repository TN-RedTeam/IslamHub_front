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
