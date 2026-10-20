-- ============================================================================
-- Phase 15.5 — vague 5g : lecture locale-aware des THÈMES (themes_all, get_theme)
-- ============================================================================
-- Libellé du thème résolu par langue via themes_i18n, repli sur themes.nom (FR) :
-- un libellé a toujours une valeur (navigation).
-- Contenu filtré par « locale effective » :
--   • fr / en → 'fr' (l'anglais retombe sur le corpus FR tant qu'il est vide) ;
--   • ar      → 'ar' strict (corpus arabe propre ; vide pour l'instant).
-- Pour p_locale='fr', le résultat est IDENTIQUE à l'existant (aucune régression).
--
-- Les anciennes signatures sans p_locale sont DROPPÉES pour éviter une surcharge
-- ambiguë ; les nouvelles (p_locale défaut 'fr') restent appelables sans argument.
-- ============================================================================

drop function if exists public.themes_all();
drop function if exists public.get_theme(text);

-- ---- Listing des thèmes --------------------------------------------------
create or replace function public.themes_all(p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.famille, x.ordre, x.nom), '[]'::json) from (
    select t.slug,
      coalesce((select i.nom from public.themes_i18n i
                where i.theme_slug = t.slug and i.locale = p_locale), t.nom) as nom,
      t.famille, t.ordre,
      (select count(*) from public.coran_themes  ct join public.coran   c on c.id = ct.coran_id
         where ct.theme_slug = t.slug and c.locale = (case when p_locale='ar' then 'ar' else 'fr' end)) as n_coran,
      (select count(*) from public.hadith_themes ht join public.hadiths h on h.id = ht.hadith_id
         where ht.theme_slug = t.slug and h.locale = (case when p_locale='ar' then 'ar' else 'fr' end)) as n_hadith,
      (select count(*) from public.parole_themes pt join public.paroles p on p.id = pt.parole_id
         where pt.theme_slug = t.slug and p.locale = (case when p_locale='ar' then 'ar' else 'fr' end)) as n_parole
    from public.themes t) x;
$function$;

-- ---- Détail d'un thème ---------------------------------------------------
create or replace function public.get_theme(p_slug text, p_locale text default 'fr')
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with t as (
    select th.slug,
           coalesce((select i.nom from public.themes_i18n i
                     where i.theme_slug = th.slug and i.locale = p_locale), th.nom) as nom,
           th.famille
    from public.themes th where th.slug = p_slug)
  select case when not exists (select 1 from t) then null else json_build_object(
    'theme', (select row_to_json(t) from t),
    'coran', coalesce((select json_agg(row_to_json(x)) from (
        select c.id, c.sujet, c.texte_arabe, c.texte_francais, c.sourate
        from public.coran_themes ct join public.coran c on c.id = ct.coran_id
        where ct.theme_slug = p_slug and c.locale = (case when p_locale='ar' then 'ar' else 'fr' end)
        order by c.id) x), '[]'::json),
    'hadiths', coalesce((select json_agg(row_to_json(x)) from (
        select h.id, h.slug, h.sujet, h.texte_arabe, h.texte_francais, h.degre_authenticite, h.narrateur,
               (select n.generation from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_generation,
               (select n.role       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_role,
               (select n.sexe       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_sexe
        from public.hadith_themes ht join public.hadiths h on h.id = ht.hadith_id
        where ht.theme_slug = p_slug and h.locale = (case when p_locale='ar' then 'ar' else 'fr' end)
        order by h.id) x), '[]'::json),
    'paroles', coalesce((select json_agg(row_to_json(x)) from (
        select p.id, p.slug, p.sujet, p.texte_arabe, p.texte_francais,
               coalesce(sv.nom, p.savant) as savant, sv.slug as savant_slug, sv.generation, p.ecole
        from public.parole_themes pt join public.paroles p on p.id = pt.parole_id
        left join public.savants sv on sv.id = p.savant_id
        where pt.theme_slug = p_slug and p.locale = (case when p_locale='ar' then 'ar' else 'fr' end)
        order by p.id) x), '[]'::json),
    'fiqh', coalesce((select json_agg(row_to_json(x)) from (
        select distinct f.id, f.sujet, f.chapitre, f.ecole, f.texte_arabe, f.texte
        from public.fiqh f
        where f.locale = (case when p_locale='ar' then 'ar' else 'fr' end)
          and exists (
            select 1
            from unnest(string_to_array(coalesce(f.tag,''), ',')) raw(tok)
            join public.theme_tags tt
              on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
            where tt.theme_slug = p_slug and btrim(raw.tok) <> ''
          )
        order by f.id) x), '[]'::json)
  ) end;
$function$;

-- ---- PREUVE : non-régression FR + comportement AR (strict) ---------------
-- FR : doit renvoyer les mêmes thèmes/compte qu'avant ; AR : comptes à 0.
select 'fr_themes' as scope, json_array_length(public.themes_all('fr')) as nb
union all select 'ar_themes', json_array_length(public.themes_all('ar'));
