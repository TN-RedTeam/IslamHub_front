-- ============================================================================
-- Modèle « colonnes par langue » — exposés (clé = slug)
-- ============================================================================
-- Colonnes _en/_ar + lecture publique localisée (get_expose / exposes_all) +
-- RPC i18n admin keyées par slug (exposes n'a pas d'id). Citations d'exposé
-- (expose_citations) non traduites dans cette passe.
-- ============================================================================

alter table public.exposes
  add column if not exists titre_en text, add column if not exists titre_ar text,
  add column if not exists contenu_md_en text, add column if not exists contenu_md_ar text,
  add column if not exists verset_traduction_en text,
  add column if not exists verset_phonetique_en text;

create or replace function public.get_expose(p_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select slug,
      case p_locale when 'en' then coalesce(titre_en, titre) when 'ar' then coalesce(titre_ar, titre) else titre end as titre,
      case p_locale when 'en' then coalesce(contenu_md_en, contenu_md) when 'ar' then coalesce(contenu_md_ar, contenu_md) else contenu_md end as contenu_md,
      verset_arabe,
      case p_locale when 'en' then coalesce(verset_traduction_en, verset_traduction) else verset_traduction end as verset_traduction,
      case p_locale when 'en' then coalesce(verset_phonetique_en, verset_phonetique) else verset_phonetique end as verset_phonetique,
      verset_ref
    from public.exposes where slug = p_slug and published
  ) x;
$function$;

create or replace function public.exposes_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(json_build_object(
    'slug', slug,
    'titre', case p_locale when 'en' then coalesce(titre_en, titre) when 'ar' then coalesce(titre_ar, titre) else titre end
  ) order by titre), '[]'::json)
  from public.exposes where published;
$function$;

-- Admin i18n keyé par slug (whitelist inline)
create or replace function public.admin_expose_i18n_get(p_slug text)
 returns json language plpgsql security definer set search_path to 'public' as $function$
declare v json;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  select json_build_object('titre_en',titre_en,'titre_ar',titre_ar,'contenu_md_en',contenu_md_en,
    'contenu_md_ar',contenu_md_ar,'verset_traduction_en',verset_traduction_en,'verset_phonetique_en',verset_phonetique_en)
  into v from public.exposes where slug = p_slug;
  return v;
end $function$;

create or replace function public.admin_expose_i18n_set(p_slug text, p jsonb)
 returns void language plpgsql security definer set search_path to 'public' as $function$
declare r record; v_allowed text[] := array['titre_en','titre_ar','contenu_md_en','contenu_md_ar','verset_traduction_en','verset_phonetique_en'];
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  for r in select key, value from jsonb_each_text(p) loop
    if r.key = any(v_allowed) then
      execute format('update public.exposes set %I = $1 where slug = $2', r.key) using nullif(btrim(r.value),''), p_slug;
    end if;
  end loop;
end $function$;

grant execute on function public.get_expose(text,text)                to anon, authenticated;
grant execute on function public.exposes_all(text)                    to anon, authenticated;
grant execute on function public.admin_expose_i18n_get(text)          to authenticated;
grant execute on function public.admin_expose_i18n_set(text,jsonb)    to authenticated;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as args, proname
from pg_proc where pronamespace='public'::regnamespace and proname in ('get_expose','exposes_all') order by proname;
