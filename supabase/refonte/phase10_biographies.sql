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

-- 3) Modèle de lecture ---------------------------------------------------------
-- personnes_published() : personnes publiées, catégorie calculée à la volée.
create or replace function public.personnes_published()
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.ordre, x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, s.sous_categorie, s.sexe,
           s.naissance, s.deces, s.resume, s.generation, s.role, s.ordre,
           s.est_savant, s.est_narrateur,
           coalesce(s.domaines, array[]::text[]) as domaines,
           e.nom as ecole, e.slug as ecole_slug,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles,
           case
             when s.role = 'calife_rachidoun' then 'calife'
             when s.role = 'epouse_prophete'  then 'femme'
             when coalesce(s.generation='sahabi' or s.domaines @> array['Compagnon']
                           or exists(select 1 from public.narrateurs n where n.savant_id=s.id), false) then 'compagnon'
             else 'savant'
           end as categorie
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where s.publiee = true
  ) x;
$function$;

-- admin_get_savant : expose publiee / sexe / sous_categorie / recit_slug.
-- admin_save_savant : persiste publiee + recalcule categorie/sous_categorie/sexe.
-- (définitions complètes appliquées ; voir l'historique si besoin de les rejouer)
