-- ============================================================================
-- Colonnes par langue — Coran (versets/exégèses) & tables enfant (lecture)
-- ============================================================================
-- Colonnes _en/_ar (prose ; l'arabe reste unique) + réécriture des RPC de
-- lecture pour servir les enfants localisés :
--   versets  : texte_francais→EN, phonetique→EN         (via get_sourate)
--   exegeses : texte→EN/AR                               (via get_sourate)
--   hadith_segments / hadith_variants : intro/explication(+titre) EN/AR,
--     traduction & phonétique EN                         (via get_hadith)
--   parole_segments : idem                               (via get_parole)
-- La SAISIE admin de ces traductions (éditeurs en ligne) est une étape à part.
-- À appliquer APRÈS i18n_colonnes_all_tables.sql + les lectures hadiths/dossiers.
-- ============================================================================

-- 1) COLONNES ---------------------------------------------------------------
alter table public.versets
  add column if not exists texte_en text, add column if not exists phonetique_en text;
alter table public.exegeses
  add column if not exists texte_en text, add column if not exists texte_ar text;
alter table public.hadith_segments
  add column if not exists intro_en text, add column if not exists intro_ar text,
  add column if not exists phonetique_en text, add column if not exists texte_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text;
alter table public.hadith_variants
  add column if not exists titre_en text, add column if not exists titre_ar text,
  add column if not exists intro_en text, add column if not exists intro_ar text,
  add column if not exists phonetique_en text, add column if not exists texte_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text;
alter table public.parole_segments
  add column if not exists intro_en text, add column if not exists intro_ar text,
  add column if not exists phonetique_en text, add column if not exists texte_en text,
  add column if not exists explication_en text, add column if not exists explication_ar text;

-- 2) get_sourate : sourate + versets + exégèses localisés --------------------
drop function if exists public.get_sourate(text);
drop function if exists public.get_sourate(text, text);
create function public.get_sourate(sourate_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with s as (select * from public.sourates where slug = sourate_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'sourate', (select row_to_json(x) from (
        select numero,
          case p_locale when 'en' then coalesce(nom_en, nom) when 'ar' then coalesce(nom_ar, nom) else nom end as nom,
          nom_arabe, slug, revelation, nb_versets,
          case p_locale when 'en' then coalesce(introduction_md_en, introduction_md) when 'ar' then coalesce(introduction_md_ar, introduction_md) else introduction_md end as introduction_md,
          ordre_revelation from s) x),
    'versets', coalesce((select json_agg(row_to_json(v) order by v.numero) from (
        select vr.numero, vr.texte_arabe,
               case p_locale when 'en' then coalesce(vr.texte_en, vr.texte_francais) else vr.texte_francais end as texte_francais,
               case p_locale when 'en' then coalesce(vr.phonetique_en, vr.phonetique) else vr.phonetique end as phonetique,
               coalesce((select json_agg(row_to_json(e)) from (
                   select case p_locale when 'en' then coalesce(ex.texte_en, ex.texte) when 'ar' then coalesce(ex.texte_ar, ex.texte) else ex.texte end as texte,
                          ex.source, ex.verset_fin from public.exegeses ex
                   where ex.verset_id = vr.id order by ex.ordre, ex.id) e), '[]'::json) as exegeses,
               (select row_to_json(eq) from (
                   select ve.theme, ve.slug, ve.sens_juste
                   from public.versets_equivoques ve
                   where ve.type = 'verset' and ve.published = true
                     and ve.sourate_num = (select numero from s) and ve.ayah = vr.numero
                   order by ve.id limit 1) eq) as equivoque
        from public.versets vr where vr.sourate_id = (select id from s)) v), '[]'::json)
  ) end;
$function$;

-- 3) get_hadith : segments + variantes localisés (+ top-level déjà localisé) -
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
              h.degre_authenticite, h.type_hadith, h.juge_par, h.rapporteur, h.narrateur, h.tag,
              h.invocation_type,
              case p_locale when 'en' then coalesce(h.invocation_commentaire_en, h.invocation_commentaire) when 'ar' then coalesce(h.invocation_commentaire_ar, h.invocation_commentaire) else h.invocation_commentaire end as invocation_commentaire,
              h.invocation_moments,
              (select n.generation from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_generation,
              (select n.role       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_role,
              (select n.sexe       from public.narrateurs n where n.nom = h.narrateur limit 1) as narrateur_sexe,
              public.recueils_for_hadith(h.id)      as recueils,
              public.recueils_json_for_hadith(h.id) as sources,
              (select json_build_object('slug', v.slug, 'id', v.id, 'theme', v.theme, 'sens_juste', v.sens_juste)
                 from public.versets_equivoques v where v.hadith_id = h.id and coalesce(v.published,false) = true limit 1) as equivoque,
              coalesce((
                select json_agg(json_build_object('ordre', s.ordre,
                         'intro', case p_locale when 'en' then coalesce(s.intro_en,s.intro) when 'ar' then coalesce(s.intro_ar,s.intro) else s.intro end,
                         'texte_arabe', s.texte_arabe,
                         'phonetique', case p_locale when 'en' then coalesce(s.phonetique_en,s.phonetique) else s.phonetique end,
                         'texte_francais', case p_locale when 'en' then coalesce(s.texte_en,s.texte_francais) else s.texte_francais end,
                         'explication', case p_locale when 'en' then coalesce(s.explication_en,s.explication) when 'ar' then coalesce(s.explication_ar,s.explication) else s.explication end) order by s.ordre, s.id)
                from public.hadith_segments s where s.hadith_id = h.id and s.variant_id is null
              ), '[]'::json) as segments,
              coalesce((
                select json_agg(json_build_object('ordre', va.ordre,
                         'titre', case p_locale when 'en' then coalesce(va.titre_en,va.titre) when 'ar' then coalesce(va.titre_ar,va.titre) else va.titre end,
                         'intro', case p_locale when 'en' then coalesce(va.intro_en,va.intro) when 'ar' then coalesce(va.intro_ar,va.intro) else va.intro end,
                         'texte_arabe', va.texte_arabe,
                         'phonetique', case p_locale when 'en' then coalesce(va.phonetique_en,va.phonetique) else va.phonetique end,
                         'texte_francais', case p_locale when 'en' then coalesce(va.texte_en,va.texte_francais) else va.texte_francais end,
                         'explication', case p_locale when 'en' then coalesce(va.explication_en,va.explication) when 'ar' then coalesce(va.explication_ar,va.explication) else va.explication end,
                         'source', va.source,
                         'segments', coalesce((
                            select json_agg(json_build_object('ordre', s2.ordre,
                                    'intro', case p_locale when 'en' then coalesce(s2.intro_en,s2.intro) when 'ar' then coalesce(s2.intro_ar,s2.intro) else s2.intro end,
                                    'texte_arabe', s2.texte_arabe,
                                    'phonetique', case p_locale when 'en' then coalesce(s2.phonetique_en,s2.phonetique) else s2.phonetique end,
                                    'texte_francais', case p_locale when 'en' then coalesce(s2.texte_en,s2.texte_francais) else s2.texte_francais end,
                                    'explication', case p_locale when 'en' then coalesce(s2.explication_en,s2.explication) when 'ar' then coalesce(s2.explication_ar,s2.explication) else s2.explication end) order by s2.ordre, s2.id)
                            from public.hadith_segments s2 where s2.variant_id = va.id
                         ), '[]'::json)
                        ) order by va.ordre, va.id)
                from public.hadith_variants va where va.hadith_id = h.id
              ), '[]'::json) as variants,
              coalesce((select json_agg(json_build_object('slug', th.slug, 'nom', th.nom) order by th.famille, th.ordre)
                from public.hadith_themes ht join public.themes th on th.slug = ht.theme_slug
                where ht.hadith_id = h.id), '[]'::json) as themes
       from public.hadiths h where h.id = hadith_id) x) end;
$function$;

-- 4) get_parole : segments localisés (+ top-level déjà localisé) -------------
drop function if exists public.get_parole(text);
drop function if exists public.get_parole(text, text);
create function public.get_parole(p_slug text, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select p.id, p.slug,
           case p_locale when 'en' then coalesce(p.sujet_en, p.sujet) when 'ar' then coalesce(p.sujet_ar, p.sujet) else p.sujet end as sujet,
           p.rubrique,
           case p_locale when 'en' then coalesce(p.intro_en, p.intro) when 'ar' then coalesce(p.intro_ar, p.intro) else p.intro end as intro,
           p.texte_arabe,
           case p_locale when 'en' then coalesce(p.texte_en, p.texte_francais) else p.texte_francais end as texte_francais,
           case p_locale when 'en' then coalesce(p.phonetique_en, p."phonétique") else p."phonétique" end as phonetique,
           case p_locale when 'en' then coalesce(p.explication_en, p.explication) when 'ar' then coalesce(p.explication_ar, p.explication) else p.explication end as explication,
           p.source_livre, p.page, p.ecole,
           coalesce(sv.nom, p.savant) as savant, sv.slug as savant_slug, sv.generation,
           p.commente_livre,
           (select json_build_object('nom', rs.nom, 'slug', rs.slug) from public.savants rs where rs.id = p.rapporteur_savant_id) as rapporteur,
           case
             when p.commente_parole_id is not null then (select json_build_object('type','parole','sujet', cp.sujet, 'slug', cp.slug) from public.paroles cp where cp.id = p.commente_parole_id)
             when p.commente_hadith_id is not null then (select json_build_object('type','hadith','sujet', coalesce(nullif(btrim(h.sujet),''), left(h.texte_arabe,60)), 'id', h.id, 'slug', h.slug) from public.hadiths h where h.id = p.commente_hadith_id)
             when p.commente_verset_id is not null then (select json_build_object('type','verset','sujet', coalesce(nullif(btrim(c.sujet),''), left(c.texte_arabe,60)), 'sourate', c.sourate) from public.coran c where c.id = p.commente_verset_id)
             else null
           end as commente,
           coalesce((select json_agg(json_build_object('ordre', s.ordre,
                      'intro', case p_locale when 'en' then coalesce(s.intro_en,s.intro) when 'ar' then coalesce(s.intro_ar,s.intro) else s.intro end,
                      'texte_arabe', s.texte_arabe,
                      'phonetique', case p_locale when 'en' then coalesce(s.phonetique_en,s.phonetique) else s.phonetique end,
                      'texte_francais', case p_locale when 'en' then coalesce(s.texte_en,s.texte_francais) else s.texte_francais end,
                      'explication', case p_locale when 'en' then coalesce(s.explication_en,s.explication) when 'ar' then coalesce(s.explication_ar,s.explication) else s.explication end) order by s.ordre, s.id)
             from public.parole_segments s where s.parole_id = p.id), '[]'::json) as segments,
           coalesce((select json_agg(row_to_json(im) order by im.ordre, im.id)
             from (select pi.id, pi.image_url, pi.legende, pi.alt, pi.source_livre, pi.source_livre_ar, pi.ordre
                   from public.parole_images pi where pi.parole_id = p.id) im), '[]'::json) as images,
           coalesce((select json_agg(json_build_object('slug', th.slug, 'nom', th.nom) order by th.famille, th.ordre)
             from public.parole_themes pt join public.themes th on th.slug = pt.theme_slug
             where pt.parole_id = p.id), '[]'::json) as themes
    from public.paroles p
    left join public.savants sv on sv.id = p.savant_id
    where p.slug = p_slug limit 1
  ) x;
$function$;

-- ---- PREUVE ----------------------------------------------------------------
select 'versets' t, array_length(array_agg(column_name),1) n
from information_schema.columns where table_schema='public' and table_name='versets' and column_name in ('texte_en','phonetique_en')
union all select 'exegeses', array_length(array_agg(column_name),1)
from information_schema.columns where table_schema='public' and table_name='exegeses' and column_name in ('texte_en','texte_ar');
