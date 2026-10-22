-- ============================================================================
-- Lecture publique localisée par colonnes — hadiths
-- ============================================================================
-- get_hadith reçoit p_locale et sert sujet/intro/explication/commentaire en
-- EN/AR (repli FR), traduction & phonétique en EN (repli FR). search_hadiths
-- lit les lignes canoniques (locale fr/NULL) et localise la sortie.
-- Les segments/variantes (tables enfant) ne sont pas traduits dans cette passe.
-- À appliquer après i18n_colonnes_all_tables.sql.
-- ============================================================================

drop function if exists public.get_hadith(integer);
drop function if exists public.get_hadith(integer, text);
create function public.get_hadith(hadith_id integer, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select case when not exists (select 1 from public.hadiths where id = hadith_id) then null else
    (select row_to_json(x) from (
       select h.id, h.slug,
              case p_locale when 'en' then coalesce(h.sujet_en, h.sujet) when 'ar' then coalesce(h.sujet_ar, h.sujet) else h.sujet end as sujet,
              case p_locale when 'en' then coalesce(h.intro_en, h.intro) when 'ar' then coalesce(h.intro_ar, h.intro) else h.intro end as intro,
              h.texte_arabe,
              case p_locale when 'en' then coalesce(h.texte_en, h.texte_francais) else h.texte_francais end as texte_francais,
              case p_locale when 'en' then coalesce(h.phonetique_en, h.phonetique) else h.phonetique end as "phonétique",
              case p_locale when 'en' then coalesce(h.explication_en, h.explication) when 'ar' then coalesce(h.explication_ar, h.explication) else h.explication end as explication,
              h.degre_authenticite, h.type_hadith, h.juge_par,
              h.rapporteur, h.narrateur, h.tag,
              h.invocation_type,
              case p_locale when 'en' then coalesce(h.invocation_commentaire_en, h.invocation_commentaire) when 'ar' then coalesce(h.invocation_commentaire_ar, h.invocation_commentaire) else h.invocation_commentaire end as invocation_commentaire,
              h.invocation_moments,
              (select n.generation from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_generation,
              (select n.role       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_role,
              (select n.sexe       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_sexe,
              public.recueils_for_hadith(h.id)      as recueils,
              public.recueils_json_for_hadith(h.id) as sources,
              (select json_build_object('slug', v.slug, 'id', v.id, 'theme', v.theme, 'sens_juste', v.sens_juste)
                 from public.versets_equivoques v
                 where v.hadith_id = h.id and coalesce(v.published,false) = true limit 1) as equivoque,
              coalesce((
                select json_agg(json_build_object('ordre', s.ordre, 'intro', s.intro, 'texte_arabe', s.texte_arabe,
                                                   'phonetique', s.phonetique, 'texte_francais', s.texte_francais,
                                                   'explication', s.explication) order by s.ordre, s.id)
                from public.hadith_segments s where s.hadith_id = h.id and s.variant_id is null
              ), '[]'::json) as segments,
              coalesce((
                select json_agg(json_build_object('ordre', va.ordre, 'titre', va.titre, 'intro', va.intro,
                                                   'texte_arabe', va.texte_arabe, 'phonetique', va.phonetique,
                                                   'texte_francais', va.texte_francais, 'explication', va.explication,
                                                   'source', va.source,
                                                   'segments', coalesce((
                                                      select json_agg(json_build_object('ordre', s2.ordre, 'intro', s2.intro,
                                                              'texte_arabe', s2.texte_arabe, 'phonetique', s2.phonetique,
                                                              'texte_francais', s2.texte_francais, 'explication', s2.explication)
                                                              order by s2.ordre, s2.id)
                                                      from public.hadith_segments s2 where s2.variant_id = va.id
                                                   ), '[]'::json)
                                                  ) order by va.ordre, va.id)
                from public.hadith_variants va where va.hadith_id = h.id
              ), '[]'::json) as variants,
              coalesce((
                select json_agg(json_build_object('slug', th.slug, 'nom', th.nom) order by th.famille, th.ordre)
                from public.hadith_themes ht join public.themes th on th.slug = ht.theme_slug
                where ht.hadith_id = h.id
              ), '[]'::json) as themes
       from public.hadiths h where h.id = hadith_id) x) end;
$function$;

create or replace function public.search_hadiths(q text default '', tag_filter text default '', page_num integer default 0, page_size integer default 20, statut_filter text default '', rapporteur_filter text default '', narrateur_filter text default '', p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with filtered as (
    select * from public.hadiths h
    where coalesce(h.locale,'fr') = 'fr'
      and (q = '' or (
        h.search_fr @@ websearch_to_tsquery('french', unaccent(q))
        or public.normalize_ar(coalesce(h.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
        or h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%'
        or h.narrateur ilike '%'||q||'%' or h.phonetique ilike '%'||q||'%'
        or h.intro ilike '%'||q||'%' or h.tag ilike '%'||q||'%'
        or (q ~ '^[0-9]+$' and h.id = q::bigint)
        or exists (select 1 from public.hadith_segments s where s.hadith_id = h.id and (
             public.normalize_ar(coalesce(s.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
             or s.texte_francais ilike '%'||q||'%' or s.phonetique ilike '%'||q||'%'
             or s.intro ilike '%'||q||'%' or s.explication ilike '%'||q||'%'))
        or exists (select 1 from public.hadith_variants va where va.hadith_id = h.id and (
             public.normalize_ar(coalesce(va.texte_arabe,'')) ilike '%'||public.normalize_ar(q)||'%'
             or va.texte_francais ilike '%'||q||'%' or va.phonetique ilike '%'||q||'%'
             or va.intro ilike '%'||q||'%' or va.explication ilike '%'||q||'%' or va.source ilike '%'||q||'%'))
        ))
      and (tag_filter = '' or btrim(h.sujet) ilike btrim(tag_filter))
      and (statut_filter = '' or h.statut = statut_filter)
      and (rapporteur_filter = '' or exists (
            select 1 from public.hadith_rapporteurs jr join public.savants s on s.id=jr.savant_id
            where jr.hadith_id = h.id and s.nom = rapporteur_filter))
      and (narrateur_filter = '' or exists (
            select 1 from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id
            where jn.hadith_id = h.id and n.nom = narrateur_filter))
  )
  select json_build_object('total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
        select id,
               case p_locale when 'en' then coalesce(sujet_en, sujet) when 'ar' then coalesce(sujet_ar, sujet) else sujet end as sujet,
               case p_locale when 'en' then coalesce(intro_en, intro) when 'ar' then coalesce(intro_ar, intro) else intro end as intro,
               texte_arabe,
               case p_locale when 'en' then coalesce(texte_en, texte_francais) else texte_francais end as texte_francais,
               case p_locale when 'en' then coalesce(phonetique_en, phonetique) else phonetique end as "phonétique",
               case p_locale when 'en' then coalesce(explication_en, explication) when 'ar' then coalesce(explication_ar, explication) else explication end as explication,
               tag, rapporteur, narrateur, statut,
               (select n.generation from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_generation,
               (select n.role       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_role,
               (select n.sexe       from public.hadith_narrateurs jn join public.narrateurs n on n.id=jn.narrateur_id where jn.hadith_id=filtered.id order by n.id limit 1) as narrateur_sexe,
               public.recueils_for_hadith(filtered.id)      as recueils,
               public.recueils_json_for_hadith(filtered.id) as sources
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select pg_get_function_identity_arguments(oid) as get_hadith_args
from pg_proc where pronamespace='public'::regnamespace and proname='get_hadith';
