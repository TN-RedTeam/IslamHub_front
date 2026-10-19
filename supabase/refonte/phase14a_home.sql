-- ============================================================================
-- Phase 14 A — Accueil : dossier phare (vedette) + derniers ajouts
-- ============================================================================
-- A) dossiers.vedette (flag « mis en avant sur l'accueil ») + lectures publiques
--    home_dossier_vedette / home_recent — appliqués via MCP.
-- B) daily_parole (carrousel hero) — appliqué via MCP.
-- C) admin_set_home_vedette (SECURITY DEFINER) — >>> À EXÉCUTER À LA MAIN <<<.
-- Rien en dur : le dossier phare se règle via l'admin (flag vedette).
-- ============================================================================

alter table public.dossiers add column if not exists vedette boolean default false;

-- home_dossier_vedette() : le dossier marqué vedette, sinon le plus récent publié.
-- home_recent(p_limit)   : derniers dossiers + récits publiés (tables à created_at).
-- daily_parole(day)      : parole du jour pour le carrousel du hero.
-- (définitions appliquées via MCP ; voir l'historique.)

-- ----------------------------------------------------------------------------
-- C) Écriture admin : met un seul dossier en vedette.  >>> À EXÉCUTER <<<
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_home_vedette(p_id bigint)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  update public.dossiers set vedette = (id = p_id);
end $function$;
