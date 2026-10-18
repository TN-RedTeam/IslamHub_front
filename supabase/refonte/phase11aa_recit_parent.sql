-- ============================================================================
-- Phase 11aa — Récit : exposer le récit parent (fil d'Ariane + flèche retour)
-- ============================================================================
-- Un récit enfant (épisode d'un prophète) ne renvoyait que vers « Tous les
-- récits ». On expose son parent (slug + titre) pour offrir un retour vers la
-- page du prophète. Fonction SQL STABLE → applicable via MCP.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_recit(p_slug text)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select row_to_json(x) from (
    select r.slug, r.categorie, r.titre, r.contenu_md, r.image_url,
      (select json_build_object('slug', pr.slug, 'titre', pr.titre)
         from public.recits pr where pr.id = r.parent_recit_id and pr.published) as parent,
      coalesce((select json_agg(json_build_object('slug', c.slug, 'titre', c.titre) order by c.ordre, c.titre)
                from public.recits c where c.parent_recit_id = r.id and c.published), '[]'::json) as enfants
    from public.recits r where r.slug = p_slug and r.published limit 1
  ) x;
$function$;
