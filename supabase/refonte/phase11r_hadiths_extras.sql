-- ============================================================================
-- Phase 11r — Admin : filtrer les hadiths ayant dialogue et/ou variantes
-- ============================================================================
-- Dans la liste admin des hadiths, un filtre « Tous / Avec dialogue / Avec
-- variante / Les deux » + badges de comptage. Lecture admin → appliqué via MCP.
-- ============================================================================
create or replace function public.admin_hadiths_extras(p_mode text default 'any', p_q text default '', p_limit integer default 300)
 returns json language plpgsql stable security definer set search_path to 'public'
as $function$
declare v_q text := btrim(coalesce(p_q,''));
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (
      select h.id, h.sujet, h.statut, h.tag, h.texte_arabe, h.texte_francais,
        (select count(*) from public.hadith_segments s where s.hadith_id=h.id) as n_seg,
        (select count(*) from public.hadith_variants v where v.hadith_id=h.id) as n_var
      from public.hadiths h
      where (v_q = '' or h.sujet ilike '%'||v_q||'%'
             or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike '%'||public.normalize_ar(v_q)||'%'
             or (v_q ~ '^[0-9]+$' and h.id = v_q::bigint))
    ),
    flt as (
      select * from base where case p_mode
        when 'dialogue' then n_seg > 0
        when 'variante' then n_var > 0
        when 'both'     then n_seg > 0 and n_var > 0
        else (n_seg > 0 or n_var > 0) end
    )
    select json_build_object('total', (select count(*) from flt),
      'data', coalesce((select json_agg(row_to_json(x)) from (select * from flt order by id limit p_limit) x), '[]'::json))
  );
end $function$;
