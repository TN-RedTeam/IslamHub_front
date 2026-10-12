-- ============================================================================
-- Phase 11t — Recherche admin « Recherche & correction » : arabe robuste
-- ============================================================================
-- Symptômes : des hadiths trouvés par la loupe du site mais PAS par l'admin.
--
-- La loupe (search_hadiths) a un chemin FTS français (websearch_to_tsquery) qui
-- tokenise la requête et ignore la ponctuation + l'ordre. admin_search_occurrences
-- n'avait qu'un LIKE « sous-chaîne entière » sur l'arabe → il échouait dès que la
-- requête collée différait du texte stocké, par exemple :
--   • ponctuation : virgule arabe « ، » (U+060C) absente du texte stocké
--     (ex. hadith 142 « الدنيا متاع ، وخير متاع... »).
--   • graphie / mots : wāw collé vs détaché (« وأجر » vs « و أجر »), ou un mot
--     intercalé en plus/en moins (ex. hadith 70 « ...بها من بعده » vs « ...بها بعده »).
--
-- Fix en deux temps, SANS toucher à normalize_ar (deux index GIN trigram en
-- dépendent : hadiths_arabe_norm_trgm_idx, paroles_arabe_norm_trgm_idx) :
--   1) normalize_ar_search() = normalize_ar() + repli de la ponctuation arabe/latine.
--   2) ar_match(haystack, q) = CHAQUE mot (replié) de q doit être présent comme
--      sous-chaîne dans haystack (replié). Tolère ordre, ponctuation, wāw collé/
--      détaché et mots connecteurs intercalés, tout en gardant la précision (il
--      faut que TOUS les mots — y compris les rares — soient présents).
-- admin_search_occurrences utilise ar_match() pour toutes les colonnes arabes.
-- ============================================================================

-- --------------------------------------------------------------------------
-- A) Normalisation arabe tolérante à la ponctuation.
-- --------------------------------------------------------------------------
create or replace function public.normalize_ar_search(t text)
 returns text language sql immutable set search_path to 'public','pg_temp'
as $function$
  select btrim(regexp_replace(
    regexp_replace(public.normalize_ar(t),
      E'[،؛؟٪٫٬٭.,;:!?()\\[\\]{}/\\\\|_–—-]', ' ', 'g'),
    '\s+', ' ', 'g'));
$function$;

-- --------------------------------------------------------------------------
-- B) Correspondance par mots (AND de sous-chaînes).
-- --------------------------------------------------------------------------
create or replace function public.ar_match(haystack text, q text)
 returns boolean language sql immutable set search_path to 'public','pg_temp'
as $function$
  -- vrai si CHAQUE mot (replié) de q est présent comme sous-chaîne dans haystack (replié)
  select coalesce((
    select bool_and(h.fh like '%'||tok||'%')
    from (select public.normalize_ar_search(coalesce(haystack,'')) as fh) h
    cross join unnest(regexp_split_to_array(public.normalize_ar_search(coalesce(q,'')), '\s+')) as tok
    where tok <> ''
  ), false);
$function$;

-- --------------------------------------------------------------------------
-- C) admin_search_occurrences : ar_match() pour toutes les colonnes arabes.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_search_occurrences(q text, p_limit integer DEFAULT 120)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  pat text;      -- motif latin (insensible casse + accents)
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if nullif(btrim(coalesce(q,'')),'') is null then return '[]'::json; end if;
  pat := '%'||public.unaccent(lower(btrim(q)))||'%';
  return (
    with hits as (
      select 'Hadith' as kind, h.id::text as ref, h.sujet as label,
             public.admin_snip(concat_ws(' | ', h.sujet, h.rapporteur, h.narrateur, h.texte_francais, h.explication, h.texte_arabe), q) as extrait,
             '/admin/hadiths/'||h.id as path
      from public.hadiths h
      where public.unaccent(lower(concat_ws(' ', h.sujet, h.rapporteur, h.narrateur, h.juge_par, h.texte_francais, h.explication, h.tag))) like pat
         or public.ar_match(h.texte_arabe, q)
      union all
      select 'Parole', p.id::text, p.sujet,
             public.admin_snip(concat_ws(' | ', p.sujet, p.savant, p.texte_francais, p.explication, p.source_livre, p.texte_arabe), q),
             '/admin/paroles/'||p.id
      from public.paroles p
      where public.unaccent(lower(concat_ws(' ', p.sujet, p.savant, p.texte_francais, p.explication, p.source_livre, p.tag))) like pat
         or public.ar_match(p.texte_arabe, q)
      union all
      select 'Coran', c.id::text, c.sujet,
             public.admin_snip(concat_ws(' | ', c.sujet, c.sourate, c.texte_francais, c.explication, c.texte_arabe), q),
             '/admin/coran/'||c.id
      from public.coran c
      where public.unaccent(lower(concat_ws(' ', c.sujet, c.sourate, c.texte_francais, c.explication, c.tag))) like pat
         or public.ar_match(c.texte_arabe, q)
      union all
      select 'Invocation', i.id::text, i.sujet,
             public.admin_snip(concat_ws(' | ', i.sujet, i.texte_francais, i.commentaire, i.explication, i.texte_arabe), q),
             '/admin/invocations/'||i.id
      from public.invocations i
      where public.unaccent(lower(concat_ws(' ', i.sujet, i.texte_francais, i.commentaire, i.explication, i.tag))) like pat
         or public.ar_match(i.texte_arabe, q)
      union all
      select 'Équivoque', v.id::text, v.theme,
             public.admin_snip(concat_ws(' | ', v.theme, v.rapporteur, v.recueil, v.verset_traduction, v.sens_juste, v.objection, v.reponse, v.verset_arabe), q),
             '/admin/equivoques/'||v.id
      from public.versets_equivoques v
      where public.unaccent(lower(concat_ws(' ', v.theme, v.sourate, v.rapporteur, v.recueil, v.verset_traduction, v.sens_juste, v.objection, v.reponse))) like pat
         or public.ar_match(v.verset_arabe, q)
      union all
      select 'Dossier', d.id::text, d.h1,
             public.admin_snip(concat_ws(' | ', d.h1, d.croyance_texte, d.objection_texte, d.reponse_texte), q),
             '/admin/dossiers/'||d.id
      from public.dossiers d
      where public.unaccent(lower(concat_ws(' ', d.h1, d.meta_title, d.meta_description, d.croyance_texte, d.objection_texte, d.reponse_texte))) like pat
         or public.ar_match(concat_ws(' ', d.croyance_texte, d.objection_texte, d.reponse_texte), q)
      union all
      select 'Exposé', e.slug, e.titre,
             public.admin_snip(concat_ws(' | ', e.titre, e.contenu_md, e.verset_traduction, e.verset_arabe), q),
             '/admin/exposes/'||e.slug
      from public.exposes e
      where public.unaccent(lower(concat_ws(' ', e.titre, e.contenu_md, e.verset_traduction, e.verset_ref))) like pat
         or public.ar_match(concat_ws(' ', e.verset_arabe, e.contenu_md), q)
      union all
      select 'Récit', r.id::text, r.titre,
             public.admin_snip(concat_ws(' | ', r.titre, r.contenu_md), q),
             '/admin/recits/'||r.id
      from public.recits r
      where public.unaccent(lower(concat_ws(' ', r.titre, r.contenu_md))) like pat
         or public.ar_match(r.contenu_md, q)
      union all
      select 'Fiqh', f.id::text, coalesce(nullif(f.sujet,''), f.chapitre),
             public.admin_snip(concat_ws(' | ', f.chapitre, f.sujet, f.texte, f.source, f.texte_arabe), q),
             '/admin/fiqh/'||f.id
      from public.fiqh f
      where public.unaccent(lower(concat_ws(' ', f.chapitre, f.sujet, f.texte, f.source, f.tag))) like pat
         or public.ar_match(concat_ws(' ', f.texte_arabe, f.texte), q)
      union all
      select 'Femme', fm.id::text, fm.chapitre,
             public.admin_snip(concat_ws(' | ', fm.chapitre, fm.matn, fm.commentaire, fm.source, fm.texte_arabe), q),
             '/admin/femmes/'||fm.id
      from public.femmes fm
      where public.unaccent(lower(concat_ws(' ', fm.chapitre, fm.matn, fm.commentaire, fm.source))) like pat
         or public.ar_match(concat_ws(' ', fm.texte_arabe, fm.matn, fm.commentaire), q)
      union all
      select 'Savant', s.id::text, s.nom,
             public.admin_snip(concat_ws(' | ', s.nom, s.resume, s.biographie, s.nom_arabe), q),
             '/admin/savants/'||s.id
      from public.savants s
      where public.unaccent(lower(concat_ws(' ', s.nom, s.nom_arabe, s.resume, s.biographie, s.naissance, s.deces))) like pat
         or public.ar_match(concat_ws(' ', s.nom_arabe, s.resume, s.biographie), q)
      union all
      select 'Bloc d''article', b.parent_id,
             'Bloc '||b.type||' — '||b.parent_type,
             public.admin_snip(concat_ws(' | ', b.texte_md, b.commentaire_md), q),
             case b.parent_type
               when 'equivoque' then '/admin/equivoques/'||b.parent_id
               when 'expose' then '/admin/exposes/'||b.parent_id
               when 'recit' then '/admin/recits/'||b.parent_id
               when 'dossier' then '/admin/dossiers/'||b.parent_id end
      from public.contenu_blocs b
      where b.type in ('texte','commentaire')
        and b.parent_type in ('equivoque','expose','recit','dossier')
        and (public.unaccent(lower(concat_ws(' ', b.texte_md, b.commentaire_md))) like pat
             or public.ar_match(concat_ws(' ', b.texte_md, b.commentaire_md), q))
    )
    select coalesce(json_agg(row_to_json(x)), '[]'::json)
    from (select * from hits where path is not null order by kind, label limit p_limit) x
  );
end $function$;
