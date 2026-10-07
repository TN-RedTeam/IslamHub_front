-- ============================================================================
-- Phase 10 — Hub « Biographies »
-- Unification NON DESTRUCTIVE : on étend la table `savants` (qui contient déjà
-- toutes les personnes) en concept « personne ». Aucun DROP, aucune FK recâblée.
-- Backup : public.savants_backup_phase10 (snapshot pré-migration).
--
-- À exécuter dans le SQL Editor de Supabase (idempotent).
-- ============================================================================

-- 1) Colonnes « personne » (toutes nullable / défaut : rien de cassant) --------
alter table public.savants add column if not exists categorie text;       -- prophete | calife | compagnon | savant
alter table public.savants add column if not exists sous_categorie text;   -- mere_croyants | femme_vertueuse | null
alter table public.savants add column if not exists sexe text;             -- 'f' | 'm' | null
alter table public.savants add column if not exists publiee boolean not null default false;
alter table public.savants add column if not exists ordre int not null default 0;
alter table public.savants add column if not exists recit_slug text;        -- lien bio -> récit (prophètes/vertueux)

-- 2) Backfill (DML) ------------------------------------------------------------
-- Catégorie (ordre de mérite) dérivée du rôle / génération / statut compagnon.
update public.savants s set categorie = case
    when s.role = 'calife_rachidoun' then 'calife'
    when s.role = 'epouse_prophete'  then 'femme'
    when coalesce(s.generation='sahabi' or s.domaines @> array['Compagnon']
                  or exists(select 1 from public.narrateurs n where n.savant_id=s.id), false) then 'compagnon'
    else 'savant'
  end;

-- Sous-catégorie + sexe pour les femmes identifiables (épouses du Prophète).
update public.savants set sous_categorie = 'mere_croyants', sexe = 'f' where role = 'epouse_prophete';

-- Publiée = a une biographie OU des paroles (sinon masquée, l'admin publiera).
update public.savants s set publiee = (
  coalesce(btrim(s.biographie),'') <> ''
  or exists(select 1 from public.paroles p where p.savant_id = s.id)
);
