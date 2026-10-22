-- ============================================================================
-- Lecture publique localisée par colonnes — dossiers & recits
-- ============================================================================
-- get_dossier / get_recit reçoivent p_locale ; dossiers_all / recits_all
-- passent au modèle colonnes (lignes canoniques fr/NULL, sortie localisée).
-- Les preuves héritées de get_dossier restent en FR (le contenu composable
-- passe par get_blocs). À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

drop function if exists public.get_dossier(text);
drop function if exists public.get_dossier(text, text);
create function public.get_dossier(dossier_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with d as (select * from public.dossiers where slug = dossier_slug and published)
  select case when not exists (select 1 from d) then null else json_build_object(
    'dossier', (select row_to_json(x) from (
        select id, slug,
          case p_locale when 'en' then coalesce(h1_en, h1) when 'ar' then coalesce(h1_ar, h1) else h1 end as h1,
          case p_locale when 'en' then coalesce(meta_title_en, meta_title) when 'ar' then coalesce(meta_title_ar, meta_title) else meta_title end as meta_title,
          case p_locale when 'en' then coalesce(meta_description_en, meta_description) when 'ar' then coalesce(meta_description_ar, meta_description) else meta_description end as meta_description,
          case p_locale when 'en' then coalesce(croyance_texte_en, croyance_texte) when 'ar' then coalesce(croyance_texte_ar, croyance_texte) else croyance_texte end as croyance_texte,
          case p_locale when 'en' then coalesce(objection_texte_en, objection_texte) when 'ar' then coalesce(objection_texte_ar, objection_texte) else objection_texte end as objection_texte,
          case p_locale when 'en' then coalesce(reponse_texte_en, reponse_texte) when 'ar' then coalesce(reponse_texte_ar, reponse_texte) else reponse_texte end as reponse_texte
        from d) x),
    'preuves', coalesce((select json_agg(row_to_json(t) order by t.ordre, t.id) from (
        select dp.id, dp.type, dp.ordre,
          case dp.type
            when 'hadith' then (select row_to_json(hh) from (
                 select h.id, h.sujet, h.slug, h.texte_arabe, h.texte_francais,
                        h.phonetique as "phonétique", h.degre_authenticite, h.type_hadith, h.juge_par,
                        public.recueils_for_hadith(h.id) as recueils
                 from public.hadiths h where h.id = dp.ref_id) hh)
            when 'parole' then (select row_to_json(pp) from (
                 select p.id, p.sujet, p.slug, p.savant, p.ecole, p.texte_arabe, p.texte_francais, p.explication
                 from public.paroles p where p.id = dp.ref_id) pp)
            when 'verset' then (select row_to_json(cc) from (
                 select c.id, c.sujet, c.sourate, c.texte_arabe, c.texte_francais
                 from public.coran c where c.id = dp.ref_id) cc)
          end as ref
        from public.dossier_preuves dp where dp.dossier_id = (select id from d)) t), '[]'::json),
    'images', coalesce((select json_agg(row_to_json(i) order by i.ordre, i.id) from (
        select id, image_url, legende, alt, source_livre, ordre
        from public.dossier_images where dossier_id = (select id from d)) i), '[]'::json),
    'videos', coalesce((select json_agg(row_to_json(v) order by v.id) from (
        select m.id, m.youtube_id, m.titre, m.description, m.categorie, m.savant, m.duree_secondes
        from public.multimedia m where m.dossier_id = (select id from d)) v), '[]'::json),
    'lies', coalesce((select json_agg(row_to_json(l)) from (
        select dl.slug,
          case p_locale when 'en' then coalesce(dl.h1_en, dl.h1) when 'ar' then coalesce(dl.h1_ar, dl.h1) else dl.h1 end as h1
        from public.dossiers_lies x
          join public.dossiers dl on dl.id = x.dossier_lie_id
        where x.dossier_id = (select id from d) and dl.published) l), '[]'::json)
  ) end;
$function$;

create or replace function public.dossiers_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(json_build_object(
    'slug', slug,
    'h1', case p_locale when 'en' then coalesce(h1_en, h1) when 'ar' then coalesce(h1_ar, h1) else h1 end,
    'meta_description', case p_locale when 'en' then coalesce(meta_description_en, meta_description) when 'ar' then coalesce(meta_description_ar, meta_description) else meta_description end
  ) order by h1), '[]'::json)
  from public.dossiers where published and coalesce(locale,'fr') = 'fr';
$function$;

drop function if exists public.get_recit(text);
drop function if exists public.get_recit(text, text);
create function public.get_recit(p_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select r.slug, r.categorie,
      case p_locale when 'en' then coalesce(r.titre_en, r.titre) when 'ar' then coalesce(r.titre_ar, r.titre) else r.titre end as titre,
      case p_locale when 'en' then coalesce(r.contenu_md_en, r.contenu_md) when 'ar' then coalesce(r.contenu_md_ar, r.contenu_md) else r.contenu_md end as contenu_md,
      r.image_url,
      (select json_build_object('slug', pr.slug,
                'titre', case p_locale when 'en' then coalesce(pr.titre_en, pr.titre) when 'ar' then coalesce(pr.titre_ar, pr.titre) else pr.titre end)
         from public.recits pr where pr.id = r.parent_recit_id and pr.published) as parent,
      coalesce((select json_agg(json_build_object('slug', c.slug,
                 'titre', case p_locale when 'en' then coalesce(c.titre_en, c.titre) when 'ar' then coalesce(c.titre_ar, c.titre) else c.titre end) order by c.ordre, c.titre)
                from public.recits c where c.parent_recit_id = r.id and c.published), '[]'::json) as enfants
    from public.recits r where r.slug = p_slug and r.published limit 1
  ) x;
$function$;

create or replace function public.recits_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(r) order by r.categorie, r.ordre, r.titre), '[]'::json)
  from (
    select p.slug, p.categorie,
           case p_locale when 'en' then coalesce(p.titre_en, p.titre) when 'ar' then coalesce(p.titre_ar, p.titre) else p.titre end as titre,
           p.image_url, p.ordre,
           (select count(*) from public.recits c where c.parent_recit_id = p.id and c.published) as nb_enfants
    from public.recits p
    where p.parent_recit_id is null and p.published and coalesce(p.locale,'fr') = 'fr'
  ) r;
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as args, proname
from pg_proc where pronamespace='public'::regnamespace and proname in ('get_dossier','get_recit') order by proname;
