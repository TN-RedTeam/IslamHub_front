-- ============================================================================
-- Phase 11m — Admin « Thèmes & mapping » (correspondances tag → thème)
-- ============================================================================
-- Un thème est déduit d'un tag via la table theme_tags (tag_token → theme_slug).
-- Cette page admin permet de gérer ces correspondances sans SQL, et recalcule
-- rétroactivement les liens contenu↔thème (hadiths, paroles, versets) existants.
--
-- Lecture admin_themes_mapping : appliquée via le MCP.
-- Écritures (SECURITY DEFINER) : expirent via le MCP → À EXÉCUTER MANUELLEMENT.
-- ============================================================================

-- 1) Lecture : thèmes + leurs tags + tags utilisés sans thème.  [déjà appliqué]
create or replace function public.admin_themes_mapping()
 returns json language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return json_build_object(
    'themes', coalesce((select json_agg(row_to_json(t)) from (
        select th.slug, th.nom, th.famille, th.ordre,
          coalesce((select json_agg(tt.tag_token order by tt.tag_token) from public.theme_tags tt where tt.theme_slug=th.slug),'[]'::json) as tags
        from public.themes th order by th.famille nulls last, th.ordre nulls last, th.nom) t), '[]'::json),
    'unmapped', coalesce((select json_agg(u.tok order by u.tok) from (
        select distinct lower(btrim(x.tok)) tok from (
          select unnest(string_to_array(coalesce(tag,''),',')) tok from public.hadiths
          union all select unnest(string_to_array(coalesce(tag,''),',')) tok from public.paroles
          union all select unnest(string_to_array(coalesce(tag,''),',')) tok from public.coran
        ) x where btrim(x.tok)<>''
          and not exists (select 1 from public.theme_tags tt where lower(btrim(tt.tag_token))=lower(btrim(x.tok)))
      ) u), '[]'::json)
  );
end $function$;

-- ----------------------------------------------------------------------------
-- 2) ÉCRITURES — ⚠️ À EXÉCUTER MANUELLEMENT (le MCP expire sur ces SECURITY DEFINER).
-- ----------------------------------------------------------------------------

-- Ajoute une correspondance tag→thème + rattache les contenus existants.
create or replace function public.admin_theme_tag_add(p_tag text, p_theme text)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
declare v_tag text := lower(btrim(coalesce(p_tag,'')));
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if v_tag='' or coalesce(btrim(p_theme),'')='' then return; end if;
  if not exists (select 1 from public.themes where slug=p_theme) then raise exception 'Thème inconnu.'; end if;
  insert into public.theme_tags (tag_token, theme_slug)
  select v_tag, p_theme where not exists (select 1 from public.theme_tags where lower(btrim(tag_token))=v_tag and theme_slug=p_theme);
  insert into public.hadith_themes (hadith_id, theme_slug)
  select h.id, p_theme from public.hadiths h
  where exists (select 1 from unnest(string_to_array(coalesce(h.tag,''),',')) t(tok) where lower(btrim(t.tok))=v_tag) on conflict do nothing;
  insert into public.parole_themes (parole_id, theme_slug)
  select pa.id, p_theme from public.paroles pa
  where exists (select 1 from unnest(string_to_array(coalesce(pa.tag,''),',')) t(tok) where lower(btrim(t.tok))=v_tag) on conflict do nothing;
  insert into public.coran_themes (coran_id, theme_slug)
  select c.id, p_theme from public.coran c
  where exists (select 1 from unnest(string_to_array(coalesce(c.tag,''),',')) t(tok) where lower(btrim(t.tok))=v_tag) on conflict do nothing;
end $function$;

-- Retire une correspondance + nettoie les liens que plus aucun tag mappé ne justifie.
create or replace function public.admin_theme_tag_remove(p_tag text, p_theme text)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
declare v_tag text := lower(btrim(coalesce(p_tag,'')));
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  delete from public.theme_tags where lower(btrim(tag_token))=v_tag and theme_slug=p_theme;
  delete from public.hadith_themes ht where ht.theme_slug=p_theme and not exists (
    select 1 from public.hadiths h join unnest(string_to_array(coalesce(h.tag,''),',')) t(tok) on true
    join public.theme_tags tt on lower(btrim(tt.tag_token))=lower(btrim(t.tok)) and tt.theme_slug=p_theme where h.id=ht.hadith_id);
  delete from public.parole_themes pt where pt.theme_slug=p_theme and not exists (
    select 1 from public.paroles pa join unnest(string_to_array(coalesce(pa.tag,''),',')) t(tok) on true
    join public.theme_tags tt on lower(btrim(tt.tag_token))=lower(btrim(t.tok)) and tt.theme_slug=p_theme where pa.id=pt.parole_id);
  delete from public.coran_themes ct where ct.theme_slug=p_theme and not exists (
    select 1 from public.coran c join unnest(string_to_array(coalesce(c.tag,''),',')) t(tok) on true
    join public.theme_tags tt on lower(btrim(tt.tag_token))=lower(btrim(t.tok)) and tt.theme_slug=p_theme where c.id=ct.coran_id);
end $function$;
