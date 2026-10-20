-- ============================================================================
-- Phase 15.7 — vague f : traduction ADMIN de la taxonomie (thèmes & tags)
-- ============================================================================
-- Les libellés localisés vivent dans themes_i18n(theme_slug, locale, nom) et
-- tags_i18n(tag_id, locale, nom) ; le FR reste la base (themes.nom / tags.nom).
-- Ces RPC alimentent un écran admin unique pour saisir les libellés EN / AR.
--   admin_taxonomy_i18n()                         : listing { themes, tags }
--   admin_set_taxonomy_label(kind,key,locale,nom) : upsert (nom vide = efface)
-- SECURITY DEFINER + is_admin(). delete+insert → pas de dépendance à un nom de
-- contrainte ON CONFLICT. Le FR ne se gère pas ici (éditeurs thèmes/tags).
-- ============================================================================

create or replace function public.admin_taxonomy_i18n()
 returns json language plpgsql security definer set search_path to 'public'
as $function$
declare v json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  select json_build_object(
    'themes', coalesce((select json_agg(json_build_object(
        'slug', t.slug, 'fr', t.nom, 'famille', t.famille,
        'en', (select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale='en'),
        'ar', (select i.nom from public.themes_i18n i where i.theme_slug=t.slug and i.locale='ar')
      ) order by t.ordre, t.nom) from public.themes t), '[]'::json),
    'tags', coalesce((select json_agg(json_build_object(
        'id', g.id, 'fr', g.nom,
        'en', (select i.nom from public.tags_i18n i where i.tag_id=g.id and i.locale='en'),
        'ar', (select i.nom from public.tags_i18n i where i.tag_id=g.id and i.locale='ar')
      ) order by g.nom) from public.tags g), '[]'::json)
  ) into v;
  return v;
end $function$;

create or replace function public.admin_set_taxonomy_label(p_kind text, p_key text, p_locale text, p_nom text)
 returns void language plpgsql security definer set search_path to 'public'
as $function$
declare v text := nullif(btrim(p_nom), '');
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if p_locale not in ('en','ar') then raise exception 'Langue cible invalide : %', p_locale; end if;

  if p_kind = 'theme' then
    delete from public.themes_i18n where theme_slug = p_key and locale = p_locale;
    if v is not null then
      insert into public.themes_i18n (theme_slug, locale, nom) values (p_key, p_locale, v);
    end if;
  elsif p_kind = 'tag' then
    delete from public.tags_i18n where tag_id = p_key::bigint and locale = p_locale;
    if v is not null then
      insert into public.tags_i18n (tag_id, locale, nom) values (p_key::bigint, p_locale, v);
    end if;
  else
    raise exception 'Type de taxonomie inconnu : %', p_kind;
  end if;
end $function$;

grant execute on function public.admin_taxonomy_i18n()                          to authenticated;
grant execute on function public.admin_set_taxonomy_label(text,text,text,text)  to authenticated;

-- ---- PREUVE : les RPC existent + compteurs actuels de libellés -------------
select
  (select count(*) from public.themes)                                as themes_fr,
  (select count(*) from public.themes_i18n where locale='en')         as themes_en,
  (select count(*) from public.themes_i18n where locale='ar')         as themes_ar,
  (select count(*) from public.tags)                                  as tags_fr,
  (select count(*) from public.tags_i18n where locale='en')           as tags_en,
  (select count(*) from public.tags_i18n where locale='ar')           as tags_ar;
