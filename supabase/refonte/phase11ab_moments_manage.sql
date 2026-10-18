-- ============================================================================
-- Phase 11ab — Moments de la journée : réordonner + renommer (admin)
-- ============================================================================
-- Complète phase11z (table + add/delete) avec la réorganisation de l'ordre et
-- le renommage. SECURITY DEFINER → à exécuter à la main si MCP timeout.
-- ============================================================================

-- Réordonne : ordre = position dans le tableau d'ids fourni.
CREATE OR REPLACE FUNCTION public.admin_reorder_moments(p_ids bigint[])
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  update public.moments m set ordre = x.pos
  from (select unnest(p_ids) as id, generate_subscripts(p_ids, 1) as pos) x
  where m.id = x.id;
end $function$;

-- Renomme un moment (la clé/CSV ne changent pas).
CREATE OR REPLACE FUNCTION public.admin_rename_moment(p_id bigint, p_label text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  update public.moments set label = nullif(btrim(p_label), '')
  where id = p_id and nullif(btrim(p_label), '') is not null;
end $function$;
