-- ============================================================================
-- Phase 11h — Détail des références d'une entrée (avant suppression)
-- ============================================================================
-- Complète admin_entry_dependencies (qui ne donne que des compteurs) : renvoie
-- la LISTE des contenus qui citent un hadith/parole/verset comme preuve, avec
-- leur titre et un lien d'édition admin. Affiché dans la boîte de suppression.
-- SECURITY DEFINER (bypass RLS sur les tables de liaison). Lecture seule.
-- ============================================================================
create or replace function public.admin_entry_references(p_kind text, p_id text)
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare ct text; bid bigint;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  ct := case p_kind when 'hadith' then 'hadith' when 'parole' then 'parole' when 'coran' then 'verset' when 'verset' then 'verset' end;
  if ct is null then return '[]'::json; end if;
  bid := nullif(p_id,'')::bigint;
  return (
    select coalesce(json_agg(row_to_json(x) order by x.categorie, x.titre), '[]'::json) from (
      select 'Article composé'::text as categorie,
        case cb.parent_type
          when 'dossier' then coalesce((select d.h1 from dossiers d where d.id = cb.parent_id::bigint), 'Dossier #'||cb.parent_id)
          when 'equivoque' then coalesce((select v.theme from versets_equivoques v where v.id = cb.parent_id::bigint), 'Équivoque #'||cb.parent_id)
          when 'expose' then coalesce((select e.titre from exposes e where e.slug = cb.parent_id), cb.parent_id)
          else cb.parent_type||' #'||cb.parent_id end as titre,
        case cb.parent_type
          when 'dossier' then '/admin/dossiers/'||cb.parent_id
          when 'equivoque' then '/admin/equivoques/'||cb.parent_id
          when 'expose' then '/admin/exposes/'||cb.parent_id
          else null end as path
      from contenu_blocs cb where cb.citation_type=ct and cb.citation_id=bid
      union all
      select 'Dossier (preuve)', coalesce(d.h1,'Dossier #'||dp.dossier_id), '/admin/dossiers/'||dp.dossier_id
      from dossier_preuves dp left join dossiers d on d.id=dp.dossier_id where dp.type=ct and dp.ref_id=bid
      union all
      select 'Exposé (citation)', coalesce(e.titre, ec.expose_slug), '/admin/exposes/'||ec.expose_slug
      from expose_citations ec left join exposes e on e.slug=ec.expose_slug where ec.type=ct and ec.ref_id=bid
      union all
      select 'Équivoque (preuve)', coalesce(v.theme,'Équivoque #'||vp.verset_id), '/admin/equivoques/'||vp.verset_id
      from verset_preuves vp left join versets_equivoques v on v.id=vp.verset_id where vp.type=ct and vp.ref_id=bid
      union all
      select 'Attribut (citation)', coalesce(a.nom,'Attribut #'||ac.attribut_id), null
      from attribut_citations ac left join attributs a on a.id=ac.attribut_id
      where (ct='hadith' and ac.hadith_id=bid) or (ct='parole' and ac.parole_id=bid)
    ) x
  );
end $function$;
