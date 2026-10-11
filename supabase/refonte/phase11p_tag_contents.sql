-- ============================================================================
-- Phase 11p — Aperçu des contenus d'un tag (page « Thèmes & mapping »)
-- ============================================================================
-- Dans « Tags sans thème », permet de déplier un tag pour voir les hadiths /
-- paroles / versets / invocations qui le portent, avant de choisir le thème
-- (ex. savoir si « al-ach'ari » parle de l'imam ou de ses suiveurs).
-- Lecture admin → appliqué via le MCP.
-- ============================================================================
create or replace function public.admin_tag_contents(p_tag text, p_limit integer default 40)
 returns json language plpgsql stable security definer set search_path to 'public'
as $function$
declare v_tag text := lower(btrim(coalesce(p_tag,'')));
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if v_tag = '' then return '[]'::json; end if;
  return coalesce((select json_agg(row_to_json(x)) from (
    select 'hadith'::text as kind, h.id, h.sujet,
           left(coalesce(nullif(btrim(h.texte_francais),''), h.texte_arabe, ''),160) as extrait,
           '/admin/hadiths/'||h.id as path
    from public.hadiths h
    where exists (select 1 from unnest(string_to_array(lower(coalesce(h.tag,'')),',')) t(tok) where btrim(t.tok)=v_tag)
    union all
    select 'parole', pa.id, pa.sujet,
           left(coalesce(nullif(btrim(pa.texte_francais),''), pa.texte_arabe, ''),160),
           '/admin/paroles/'||pa.id
    from public.paroles pa
    where exists (select 1 from unnest(string_to_array(lower(coalesce(pa.tag,'')),',')) t(tok) where btrim(t.tok)=v_tag)
    union all
    select 'verset', c.id, c.sujet,
           left(coalesce(nullif(btrim(c.texte_francais),''), c.texte_arabe, ''),160),
           '/admin/coran/'||c.id
    from public.coran c
    where exists (select 1 from unnest(string_to_array(lower(coalesce(c.tag,'')),',')) t(tok) where btrim(t.tok)=v_tag)
    union all
    select 'invocation', i.id, i.sujet,
           left(coalesce(nullif(btrim(i.texte_francais),''), i.texte_arabe, ''),160),
           '/admin/invocations/'||i.id
    from public.invocations i
    where exists (select 1 from unnest(string_to_array(lower(coalesce(i.tag,'')),',')) t(tok) where btrim(t.tok)=v_tag)
    limit p_limit
  ) x), '[]'::json);
end $function$;
