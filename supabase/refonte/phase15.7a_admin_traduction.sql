-- ============================================================================
-- Phase 15.7 — vague a : circuit admin de TRADUCTION (RPC, démo sur « parole »)
-- ============================================================================
-- Deux RPC, gardées par is_admin() comme toutes les écritures admin :
--   • admin_add_translation(kind, source_id, locale) : crée la ligne de la
--     langue cible à partir de la source FR — même translation_group (EN relié,
--     et AR relié ici pour rendre l'indicateur de statut parlant), arabe COPIÉ
--     (décision validée), publiee=false (brouillon), slug suffixé. Renvoie l'id.
--     La prose se réécrit ensuite via le formulaire admin existant (admin_save_*
--     en UPDATE préserve locale/translation_group).
--   • admin_translation_status(kind, source_id) : {fr,en,ar} présents dans le
--     groupe + l'id de chaque version (pour l'indicateur FR ✓ · EN — · AR —).
--
-- Démo sur « parole » (texte_arabe sacré conservé + texte_francais = prose à
-- traduire en EN / commentaire en AR). Structure extensible (case par kind).
-- Aucune donnée chargée : on vérifie le circuit avec 1-2 entrées de test.
-- ============================================================================

create or replace function public.admin_add_translation(p_kind text, p_source_id bigint, p_locale text)
 returns bigint
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_tg uuid; v_src_slug text; v_new_slug text; v_new_id bigint;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if p_locale not in ('en','ar') then raise exception 'Langue cible invalide : %', p_locale; end if;

  if p_kind = 'parole' then
    select translation_group, slug into v_tg, v_src_slug from public.paroles where id = p_source_id;
    if v_tg is null then raise exception 'Parole source introuvable (id %).', p_source_id; end if;
    if exists (select 1 from public.paroles where translation_group = v_tg and locale = p_locale) then
      raise exception 'Une version % existe déjà pour ce groupe.', p_locale;
    end if;
    v_new_slug := coalesce(nullif(v_src_slug,''),'parole')||'-'||p_locale;
    if exists (select 1 from public.paroles where slug = v_new_slug) then
      v_new_slug := v_new_slug||'-'||floor(random()*100000)::text;
    end if;
    insert into public.paroles (
      sujet, savant, texte_arabe, texte_francais, "phonétique", explication, tag, savant_id, ecole,
      slug, source_livre, page, rapporteur_savant_id, commente_parole_id, commente_livre, rubrique, intro,
      commente_type, commente_hadith_id, commente_verset_id, locale, translation_group, publiee)
    select
      sujet, savant, texte_arabe, texte_francais, "phonétique", explication, tag, savant_id, ecole,
      v_new_slug, source_livre, page, rapporteur_savant_id, commente_parole_id, commente_livre, rubrique, intro,
      commente_type, commente_hadith_id, commente_verset_id, p_locale, v_tg, false
    from public.paroles where id = p_source_id
    returning id into v_new_id;
    return v_new_id;
  end if;

  raise exception 'Type non pris en charge : %', p_kind;
end $function$;

create or replace function public.admin_translation_status(p_kind text, p_source_id bigint)
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_tg uuid;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;

  if p_kind = 'parole' then
    select translation_group into v_tg from public.paroles where id = p_source_id;
    if v_tg is null then raise exception 'Parole source introuvable (id %).', p_source_id; end if;
    return (
      select json_build_object(
        'translation_group', v_tg,
        'fr', json_build_object('exists', bool_or(locale='fr'),
                                'id', max(id) filter (where locale='fr'),
                                'publiee', bool_or(locale='fr' and publiee)),
        'en', json_build_object('exists', bool_or(locale='en'),
                                'id', max(id) filter (where locale='en'),
                                'publiee', bool_or(locale='en' and publiee)),
        'ar', json_build_object('exists', bool_or(locale='ar'),
                                'id', max(id) filter (where locale='ar'),
                                'publiee', bool_or(locale='ar' and publiee))
      )
      from public.paroles where translation_group = v_tg
    );
  end if;

  raise exception 'Type non pris en charge : %', p_kind;
end $function$;

grant execute on function public.admin_add_translation(text,bigint,text)   to authenticated;
grant execute on function public.admin_translation_status(text,bigint)      to authenticated;

-- ---- PREUVE : les RPC existent (exécution réelle = via session admin) -----
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace='public'::regnamespace
  and proname in ('admin_add_translation','admin_translation_status')
order by proname;
