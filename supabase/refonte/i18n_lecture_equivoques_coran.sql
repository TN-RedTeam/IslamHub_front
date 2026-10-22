-- ============================================================================
-- Lecture publique localisée par colonnes — versets_equivoques & coran
-- ============================================================================
-- get_verset_equivoque(slug, p_locale) : theme/sens_juste/objection/reponse en
-- EN/AR, traduction & phonétique du verset en EN (repli FR). search_coran gagne
-- p_locale et localise sujet/explication (EN/AR) + traduction/phonétique (EN).
-- Les preuves héritées restent en FR. À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

drop function if exists public.get_verset_equivoque(text);
drop function if exists public.get_verset_equivoque(text, text);
create function public.get_verset_equivoque(p_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with v as (select * from versets_equivoques where slug = p_slug and published limit 1)
  select case when not exists (select 1 from v) then null else json_build_object(
    'verset', (select row_to_json(x) from (
        select id, slug, type, sourate, sourate_num, ayah, rapporteur, recueil, numero, verset_arabe,
          case p_locale when 'en' then coalesce(theme_en, theme) when 'ar' then coalesce(theme_ar, theme) else theme end as theme,
          case p_locale when 'en' then coalesce(verset_traduction_en, verset_traduction) else verset_traduction end as verset_traduction,
          case p_locale when 'en' then coalesce(verset_phonetique_en, verset_phonetique) else verset_phonetique end as verset_phonetique,
          case p_locale when 'en' then coalesce(sens_juste_en, sens_juste) when 'ar' then coalesce(sens_juste_ar, sens_juste) else sens_juste end as sens_juste,
          case p_locale when 'en' then coalesce(objection_en, objection) when 'ar' then coalesce(objection_ar, objection) else objection end as objection,
          case p_locale when 'en' then coalesce(reponse_en, reponse) when 'ar' then coalesce(reponse_ar, reponse) else reponse end as reponse
        from v) x),
    'preuves', (select coalesce(json_agg(row_to_json(p) order by p.ordre, p.id), '[]'::json) from (
        select pr.id, pr.type, pr.ordre, pr.contenu_libre,
          case when pr.type='hadith' then h.texte_arabe when pr.type='parole' then pa.texte_arabe end as texte_arabe,
          case when pr.type='hadith' then h.texte_francais when pr.type='parole' then pa.texte_francais end as texte_francais,
          case when pr.type='parole' then coalesce(sv.nom, pa.savant) end as savant,
          case when pr.type='parole' then sv.slug end as savant_slug,
          case when pr.type='parole' then sv.generation end as generation,
          case when pr.type='parole' then pa.ecole end as ecole,
          case when pr.type='parole' then pa.slug end as parole_slug,
          case when pr.type='hadith' then h.sujet when pr.type='parole' then pa.sujet end as sujet,
          case when pr.type='hadith' then h.degre_authenticite end as degre,
          case when pr.type='hadith' then h.slug end as hadith_slug
        from verset_preuves pr
        left join hadiths h  on pr.type='hadith' and h.id  = pr.ref_id
        left join paroles pa on pr.type='parole' and pa.id = pr.ref_id
        left join savants sv on pa.savant_id = sv.id
        where pr.verset_id = (select id from v)
      ) p),
    'images', (select coalesce(json_agg(row_to_json(i) order by i.ordre, i.id), '[]'::json) from (
        select id, image_url, legende, alt, source_livre, ordre
        from verset_images where verset_id = (select id from v)) i),
    'lies', (select coalesce(json_agg(row_to_json(l)), '[]'::json) from (
        select ve.slug,
          case p_locale when 'en' then coalesce(ve.theme_en, ve.theme) when 'ar' then coalesce(ve.theme_ar, ve.theme) else ve.theme end as theme,
          ve.sourate, ve.ayah
        from verset_lies vl join versets_equivoques ve on ve.id = vl.verset_lie_id
        where vl.verset_id = (select id from v) and ve.published
        order by ve.sourate_num nulls last, ve.ayah nulls last) l)
  ) end;
$function$;

create or replace function public.search_coran(q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from coran c
    where coalesce(c.locale,'fr') = 'fr'
      and (q = '' or (
        c.texte_arabe ilike '%'||q||'%' or public.normalize_ar(c.texte_arabe) ilike '%'||public.normalize_ar(q)||'%' or
        c.texte_francais ilike '%'||q||'%' or
        c.sujet ilike '%'||q||'%' or c.sourate ilike '%'||q||'%' or
        c.explication ilike '%'||q||'%' or c.phonetique ilike '%'||q||'%' or c.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(c.sujet) ilike btrim(tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select f.id, f.sourate, f.texte_arabe, f.tag,
               case p_locale when 'en' then coalesce(f.sujet_en, f.sujet) when 'ar' then coalesce(f.sujet_ar, f.sujet) else f.sujet end as sujet,
               case p_locale when 'en' then coalesce(f.texte_en, f.texte_francais) else f.texte_francais end as texte_francais,
               case p_locale when 'en' then coalesce(f.phonetique_en, f.phonetique) else f.phonetique end as "phonétique",
               case p_locale when 'en' then coalesce(f.explication_en, f.explication) when 'ar' then coalesce(f.explication_ar, f.explication) else f.explication end as explication,
               (select json_build_object('slug', v.slug, 'theme', v.theme, 'sens_juste', v.sens_juste)
                  from public.versets_equivoques v
                  where v.coran_id = f.id and coalesce(v.published,false) = true limit 1) as equivoque
        from filtered f order by f.id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as args, proname
from pg_proc where pronamespace='public'::regnamespace and proname in ('get_verset_equivoque','search_coran') order by proname;
