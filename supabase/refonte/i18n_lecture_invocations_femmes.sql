-- ============================================================================
-- Lecture publique localisée par colonnes — invocations & femmes
-- ============================================================================
-- daily_invocation / journee_invocations / search_invocations : lignes
-- canoniques + sujet/explication/commentaire EN-AR, traduction & phonétique EN.
-- (journee + search fusionnent invocations ET hadiths-invocation.)
-- femmes_all : chapitre/section/commentaire EN-AR, matn (traduction) EN.
-- À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

create or replace function public.daily_invocation(day integer, type_filter text default '1', p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with pool as (
    select * from public.invocations i
    where (type_filter = '' or i.type_id::text = type_filter)
      and coalesce(i.locale,'fr') = 'fr'
  )
  select row_to_json(x) from (
    select id, type_id, texte_arabe, tag,
      case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
      case p_locale when 'en' then coalesce(texte_en, texte_francais) else texte_francais end as texte_francais,
      case p_locale when 'en' then coalesce(phonetique_en, phonetique) else phonetique end as "phonétique",
      case p_locale when 'en' then coalesce(explication_en, explication) when 'ar' then coalesce(explication_ar, explication) else explication end as explication,
      case p_locale when 'en' then coalesce(commentaire_en, commentaire) when 'ar' then coalesce(commentaire_ar, commentaire) else commentaire end as commentaire
    from pool order by id offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

create or replace function public.journee_invocations(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.sujet), '[]'::json) from (
    select id, type_id, texte_arabe, tag, moments, 'invocation'::text as kind, null::text as slug, null::bigint as hadith_id,
      case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
      case p_locale when 'en' then coalesce(texte_en, texte_francais) else texte_francais end as texte_francais,
      case p_locale when 'en' then coalesce(phonetique_en, phonetique) else phonetique end as "phonétique",
      case p_locale when 'en' then coalesce(explication_en, explication) when 'ar' then coalesce(explication_ar, explication) else explication end as explication,
      case p_locale when 'en' then coalesce(commentaire_en, commentaire) when 'ar' then coalesce(commentaire_ar, commentaire) else commentaire end as commentaire
    from public.invocations
    where moments is not null and btrim(moments) <> '' and coalesce(locale,'fr') = 'fr'
    union all
    select id, invocation_type as type_id, texte_arabe, tag, invocation_moments as moments, 'hadith'::text as kind, slug, id as hadith_id,
      case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
      case p_locale when 'en' then coalesce(texte_en, texte_francais) else texte_francais end as texte_francais,
      case p_locale when 'en' then coalesce(phonetique_en, phonetique) else phonetique end as "phonétique",
      case p_locale when 'en' then coalesce(explication_en, explication) when 'ar' then coalesce(explication_ar, explication) else explication end as explication,
      case p_locale when 'en' then coalesce(invocation_commentaire_en, invocation_commentaire) when 'ar' then coalesce(invocation_commentaire_ar, invocation_commentaire) else invocation_commentaire end as commentaire
    from public.hadiths
    where invocation_type is not null and invocation_moments is not null and btrim(invocation_moments) <> '' and coalesce(locale,'fr') = 'fr'
  ) x;
$function$;

create or replace function public.search_invocations(q text default '', type_filter text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select d.id, d.type_id, d.texte_arabe, d.tag, 'invocation'::text as kind, null::text as slug, null::bigint as hadith_id,
      case p_locale when 'en' then coalesce(d.sujet_en, d.sujet) when 'ar' then coalesce(d.sujet_ar, d.sujet) else d.sujet end as sujet,
      case p_locale when 'en' then coalesce(d.texte_en, d.texte_francais) else d.texte_francais end as texte_francais,
      case p_locale when 'en' then coalesce(d.phonetique_en, d.phonetique) else d.phonetique end as phonetique,
      case p_locale when 'en' then coalesce(d.explication_en, d.explication) when 'ar' then coalesce(d.explication_ar, d.explication) else d.explication end as explication,
      case p_locale when 'en' then coalesce(d.commentaire_en, d.commentaire) when 'ar' then coalesce(d.commentaire_ar, d.commentaire) else d.commentaire end as commentaire
    from invocations d
    where coalesce(d.locale,'fr') = 'fr' and (type_filter = '' or d.type_id::text = type_filter)
      and (q = '' or (
          d.texte_arabe ilike '%'||q||'%' or public.normalize_ar(d.texte_arabe) ilike '%'||public.normalize_ar(q)||'%' or
          d.texte_francais ilike '%'||q||'%' or d.sujet ilike '%'||q||'%' or d.commentaire ilike '%'||q||'%' or
          d.explication ilike '%'||q||'%' or d.phonetique ilike '%'||q||'%' or d.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(d.sujet) ilike btrim(tag_filter))
    union all
    select h.id, h.invocation_type as type_id, h.texte_arabe, h.tag, 'hadith'::text as kind, h.slug, h.id as hadith_id,
      case p_locale when 'en' then coalesce(h.sujet_en, h.sujet) when 'ar' then coalesce(h.sujet_ar, h.sujet) else h.sujet end as sujet,
      case p_locale when 'en' then coalesce(h.texte_en, h.texte_francais) else h.texte_francais end as texte_francais,
      case p_locale when 'en' then coalesce(h.phonetique_en, h.phonetique) else h.phonetique end as phonetique,
      case p_locale when 'en' then coalesce(h.explication_en, h.explication) when 'ar' then coalesce(h.explication_ar, h.explication) else h.explication end as explication,
      case p_locale when 'en' then coalesce(h.invocation_commentaire_en, h.invocation_commentaire) when 'ar' then coalesce(h.invocation_commentaire_ar, h.invocation_commentaire) else h.invocation_commentaire end as commentaire
    from hadiths h
    where coalesce(h.locale,'fr') = 'fr' and h.invocation_type is not null
      and (type_filter = '' or h.invocation_type::text = type_filter)
      and (q = '' or (
          h.texte_arabe ilike '%'||q||'%' or public.normalize_ar(h.texte_arabe) ilike '%'||public.normalize_ar(q)||'%' or
          h.texte_francais ilike '%'||q||'%' or h.sujet ilike '%'||q||'%' or h.invocation_commentaire ilike '%'||q||'%' or
          h.explication ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%' or h.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(h.sujet) ilike btrim(tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, type_id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, commentaire, kind, slug, hadith_id
        from filtered order by sujet nulls last, id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;

create or replace function public.femmes_all(p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(chap order by cat_ord nulls last, ord, nom), '[]'::json)
  from (
    select chapitre as nom, min(ordre) as ord, min(cat_ordre) as cat_ord,
      json_build_object(
        'chapitre', max(case p_locale when 'en' then coalesce(chapitre_en, chapitre) when 'ar' then coalesce(chapitre_ar, chapitre) else chapitre end),
        'categorie', max(categorie), 'cat_ordre', min(cat_ordre),
        'segments', json_agg(json_build_object(
          'id', id,
          'matn', case p_locale when 'en' then coalesce(matn_en, matn) else matn end,
          'commentaire', case p_locale when 'en' then coalesce(commentaire_en, commentaire) when 'ar' then coalesce(commentaire_ar, commentaire) else commentaire end,
          'texte_arabe', texte_arabe, 'source', source,
          'section_titre', case p_locale when 'en' then coalesce(section_titre_en, section_titre) when 'ar' then coalesce(section_titre_ar, section_titre) else section_titre end,
          'section_ordre', section_ordre
        ) order by section_ordre nulls first, ordre, id)
      ) as chap
    from public.femmes
    where coalesce(locale,'fr') = 'fr'
    group by chapitre
  ) s;
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as args, proname
from pg_proc where pronamespace='public'::regnamespace and proname in ('search_invocations','femmes_all') order by proname;
