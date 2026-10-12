-- ============================================================================
-- Phase 11s — Doublons d'ouvrages (recueils) : audit, fusion, nettoyage
-- ============================================================================
-- Deux FK pointent vers recueils.id : hadith_sources.recueil_id et
-- recueils.commente_recueil_id (auto-référence). La fusion repointe les deux
-- puis supprime les doublons. Fusion = garder, par titre normalisé, le recueil
-- le plus utilisé (puis plus petit id).
-- ============================================================================

-- --------------------------------------------------------------------------
-- A) Lecture : groupes de doublons (déjà appliqué via le MCP).
-- --------------------------------------------------------------------------
create or replace function public.admin_recueils_doublons()
 returns json language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    with n as (
      select r.id, r.titre, r.savant_id, sv.nom as auteur,
        regexp_replace(lower(public.unaccent(coalesce(r.titre,''))),'\s+',' ','g') as k,
        (select count(*) from public.hadith_sources hs where hs.recueil_id=r.id) as usages
      from public.recueils r left join public.savants sv on sv.id=r.savant_id
    )
    select json_agg(row_to_json(g) order by g.cle) from (
      select k as cle, count(*) as n,
        json_agg(json_build_object('id',id,'titre',titre,'auteur',auteur,'usages',usages) order by usages desc, id) as items
      from n group by k having count(*) > 1
    ) g
  ), '[]'::json);
end $function$;

-- --------------------------------------------------------------------------
-- B) Fusion ciblée (utilisée par la page admin « Ouvrages »). À EXÉCUTER ICI.
-- --------------------------------------------------------------------------
create or replace function public.admin_recueil_merge(p_keep bigint, p_drop bigint[])
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare v_drop bigint[] := array(select x from unnest(p_drop) x where x <> p_keep);
        v_moved bigint; v_deleted bigint;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if p_keep is null or array_length(v_drop,1) is null then return json_build_object('moved',0,'deleted',0); end if;
  update public.hadith_sources hs set recueil_id = p_keep
    where hs.recueil_id = any(v_drop)
      and not exists (select 1 from public.hadith_sources h2 where h2.hadith_id=hs.hadith_id and h2.recueil_id=p_keep);
  get diagnostics v_moved = row_count;
  delete from public.hadith_sources where recueil_id = any(v_drop);
  update public.recueils set commente_recueil_id = p_keep where commente_recueil_id = any(v_drop);
  delete from public.recueils where id = any(v_drop);
  get diagnostics v_deleted = row_count;
  return json_build_object('moved', v_moved, 'deleted', v_deleted, 'keep', p_keep);
end $function$;

-- --------------------------------------------------------------------------
-- C) Nettoyage immédiat de TOUS les doublons actuels (générique, idempotent).
--    À lancer d'un bloc (une session).
-- --------------------------------------------------------------------------
begin;
create temp table _dup_map on commit drop as
  with grp as (
    select r.id,
      regexp_replace(lower(public.unaccent(coalesce(r.titre,''))),'\s+',' ','g') as k,
      (select count(*) from public.hadith_sources hs where hs.recueil_id=r.id) as usages
    from public.recueils r
  ),
  keepers as (select distinct on (k) k, id as keep_id from grp order by k, usages desc, id)
  select g.id as drop_id, ke.keep_id
  from grp g join keepers ke on ke.k=g.k
  where g.id <> ke.keep_id;

update public.hadith_sources hs set recueil_id = m.keep_id
  from _dup_map m
  where hs.recueil_id = m.drop_id
    and not exists (select 1 from public.hadith_sources h2 where h2.hadith_id=hs.hadith_id and h2.recueil_id=m.keep_id);
delete from public.hadith_sources hs using _dup_map m where hs.recueil_id = m.drop_id;
update public.recueils r set commente_recueil_id = m.keep_id from _dup_map m where r.commente_recueil_id = m.drop_id;
delete from public.recueils r using _dup_map m where r.id = m.drop_id;
commit;
