-- ============================================================================
-- Phase 13.4 (A) — Multimédia : vidéos rattachées à un dossier
-- ============================================================================
-- « Multimédia » sort du menu. Les vidéos ne sont pas supprimées : rattachées à
-- un dossier, elles apparaissent en bloc « Pour approfondir » tout en bas de
-- l'article (jamais en tête).
--
-- A) multimedia.dossier_id (FK dossiers, on delete set null) — appliqué via MCP.
-- B) get_dossier renvoie `videos` ; admin_get_dossier renvoie `video_ids` — via MCP.
-- C) admin_set_dossier_videos (SECURITY DEFINER) — >>> À EXÉCUTER À LA MAIN <<<.
-- ============================================================================

alter table public.multimedia add column if not exists dossier_id bigint references public.dossiers(id) on delete set null;
create index if not exists multimedia_dossier_id_idx on public.multimedia(dossier_id);

-- ----------------------------------------------------------------------------
-- C) Écriture admin : (re)définit l'ensemble des vidéos d'un dossier.
--    >>> À EXÉCUTER À LA MAIN (SECURITY DEFINER) <<<
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_dossier_videos(p_dossier_id bigint, p_video_ids jsonb)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if p_dossier_id is null then raise exception 'Dossier manquant.'; end if;
  -- on repart de zéro pour ce dossier
  update public.multimedia set dossier_id = null where dossier_id = p_dossier_id;
  -- puis on rattache la sélection
  update public.multimedia set dossier_id = p_dossier_id
  where id in (select (jsonb_array_elements_text(coalesce(p_video_ids, '[]'::jsonb)))::smallint);
end $function$;
