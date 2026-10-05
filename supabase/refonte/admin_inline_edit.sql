-- ============================================================================
-- Édition inline dans l'admin (Sujets, Tags & mots-clés, Hadiths)
--   • admin_sujet_contents / admin_tag_contents : renvoient désormais tout le
--     contenu (sujet, tag, texte arabe, texte français) pour un aperçu direct.
--   • admin_update_sujet_tag : met à jour sujet + tag d'une fiche (toutes
--     rubriques) sans ouvrir le formulaire, et resynchronise les thèmes.
--
-- À exécuter dans le SQL Editor de Supabase (idempotent).
-- ============================================================================

-- 1) Contenus enrichis d'un sujet -------------------------------------------
create or replace function public.admin_sujet_contents(p_sujet text)
 returns json language plpgsql security definer set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(row_to_json(x) order by x.rubrique, x.titre) from (
      select 'hadiths' rubrique, id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') titre,
             sujet, tag, texte_arabe, texte_francais from public.hadiths where btrim(sujet)=btrim(p_sujet)
      union all select 'paroles', id, coalesce(nullif(btrim(sujet),''),'(sans sujet)'),
             sujet, tag, texte_arabe, texte_francais from public.paroles where btrim(sujet)=btrim(p_sujet)
      union all select 'coran', id, coalesce(nullif(btrim(sujet),''),'(verset)'),
             sujet, tag, texte_arabe, texte_francais from public.coran where btrim(sujet)=btrim(p_sujet)
      union all select 'invocations', id, coalesce(nullif(btrim(sujet),''),'(invocation)'),
             sujet, tag, texte_arabe, texte_francais from public.invocations where btrim(sujet)=btrim(p_sujet)
      union all select 'fiqh', id, coalesce(nullif(btrim(sujet),''),'(fiqh)'),
             sujet, tag, texte_arabe, texte as texte_francais from public.fiqh where btrim(sujet)=btrim(p_sujet)
    ) x
  ), '[]'::json);
end $function$;

-- 2) Contenus enrichis d'un tag ---------------------------------------------
create or replace function public.admin_tag_contents(p_tag text)
 returns json language plpgsql security definer set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(row_to_json(x) order by x.rubrique, x.titre) from (
      select 'hadiths' rubrique, id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') titre,
             sujet, tag, texte_arabe, texte_francais from public.hadiths
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'paroles', id, coalesce(nullif(btrim(sujet),''),'(sans sujet)'),
             sujet, tag, texte_arabe, texte_francais from public.paroles
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'coran', id, coalesce(nullif(btrim(sujet),''),'(verset)'),
             sujet, tag, texte_arabe, texte_francais from public.coran
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'invocations', id, coalesce(nullif(btrim(sujet),''),'(invocation)'),
             sujet, tag, texte_arabe, texte_francais from public.invocations
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'fiqh', id, coalesce(nullif(btrim(sujet),''),'(fiqh)'),
             sujet, tag, texte_arabe, texte as texte_francais from public.fiqh
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
    ) x
  ), '[]'::json);
end $function$;

-- 3) Mise à jour inline du sujet + tag (toutes rubriques) -------------------
create or replace function public.admin_update_sujet_tag(p_rubrique text, p_id bigint, p_sujet text, p_tag text)
 returns void language plpgsql security definer set search_path to 'public','pg_temp'
as $function$
declare
  v_sujet text := btrim(coalesce(p_sujet,''));          -- jamais NULL (colonnes NOT NULL)
  v_tag   text := nullif(btrim(coalesce(p_tag,'')),'');
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;

  if p_rubrique = 'hadiths' then
    update public.hadiths set sujet = v_sujet, tag = v_tag where id = p_id;
    delete from public.hadith_themes where hadith_id = p_id;
    insert into public.hadith_themes (hadith_id, theme_slug)
      select p_id, tt.theme_slug from unnest(string_to_array(coalesce(v_tag,''),',')) raw(tok)
      join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
      where btrim(raw.tok) <> '' on conflict do nothing;

  elsif p_rubrique = 'paroles' then
    update public.paroles set sujet = nullif(v_sujet,''), tag = v_tag where id = p_id;
    delete from public.parole_themes where parole_id = p_id;
    insert into public.parole_themes (parole_id, theme_slug)
      select p_id, tt.theme_slug from unnest(string_to_array(coalesce(v_tag,''),',')) raw(tok)
      join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
      where btrim(raw.tok) <> '' on conflict do nothing;

  elsif p_rubrique = 'coran' then
    update public.coran set sujet = v_sujet, tag = v_tag where id = p_id;
    delete from public.coran_themes where coran_id = p_id;
    insert into public.coran_themes (coran_id, theme_slug)
      select p_id, tt.theme_slug from unnest(string_to_array(coalesce(v_tag,''),',')) raw(tok)
      join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
      where btrim(raw.tok) <> '' on conflict do nothing;

  elsif p_rubrique = 'invocations' then
    update public.invocations set sujet = v_sujet, tag = v_tag where id = p_id;

  elsif p_rubrique = 'fiqh' then
    update public.fiqh set sujet = nullif(v_sujet,''), tag = v_tag where id = p_id;

  else
    raise exception 'Rubrique inconnue: %', p_rubrique;
  end if;
end $function$;
