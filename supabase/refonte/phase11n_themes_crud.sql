-- ============================================================================
-- Phase 11n — Créer / modifier / supprimer un thème depuis l'admin
-- ============================================================================
-- Table themes(id, slug, nom, famille, ordre). Le slug est l'identifiant
-- stable (référencé par theme_tags / hadith_themes / parole_themes /
-- coran_themes) → il est généré à la création et NON modifiable ensuite.
--
-- Écritures (SECURITY DEFINER) : expirent via le MCP → À EXÉCUTER MANUELLEMENT.
-- Idempotent.
-- ============================================================================

-- Créer (slug absent → généré depuis le nom) ou modifier (slug présent) un thème.
create or replace function public.admin_theme_save(p jsonb)
 returns text language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_slug text := nullif(btrim(p->>'slug'),'');
  v_nom  text := nullif(btrim(p->>'nom'),'');
  v_fam  text := nullif(btrim(p->>'famille'),'');
  v_ordre int := nullif(p->>'ordre','')::int;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if v_nom is null then raise exception 'Le nom du thème est requis.'; end if;
  if v_fam is null then v_fam := 'croyance'; end if;
  if v_slug is null then
    v_slug := lower(regexp_replace(regexp_replace(public.unaccent(v_nom),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_slug = '' then v_slug := 'theme'; end if;
    if exists (select 1 from public.themes where slug=v_slug) then v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    if v_ordre is null then select coalesce(max(ordre),0)+1 into v_ordre from public.themes where famille=v_fam; end if;
    insert into public.themes (slug, nom, famille, ordre) values (v_slug, v_nom, v_fam, coalesce(v_ordre,0));
  else
    if not exists (select 1 from public.themes where slug=v_slug) then raise exception 'Thème introuvable.'; end if;
    update public.themes set nom=v_nom, famille=v_fam, ordre=coalesce(v_ordre, ordre) where slug=v_slug;
  end if;
  return v_slug;
end $function$;

-- Supprimer un thème + toutes ses correspondances et liens de contenu.
create or replace function public.admin_theme_delete(p_slug text)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  delete from public.theme_tags    where theme_slug = p_slug;
  delete from public.hadith_themes where theme_slug = p_slug;
  delete from public.parole_themes where theme_slug = p_slug;
  delete from public.coran_themes  where theme_slug = p_slug;
  delete from public.themes        where slug       = p_slug;
end $function$;
