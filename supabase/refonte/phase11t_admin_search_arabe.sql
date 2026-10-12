-- ============================================================================
-- Phase 11t — Recherche admin « Recherche & correction » : arabe tolérant à la
--             ponctuation
-- ============================================================================
-- Bug : certains hadiths (ex. id 142
--   « الدُّنيَا مَتَاعٌ ، وَخَيْرُ مَتَاعِ الدُّنيَا المرأَةُ الصَّالِحَةُ »)
-- étaient trouvés par la loupe du site mais PAS par l'admin.
--
-- Cause : la loupe (search_hadiths) a aussi un chemin FTS français
-- (search_fr @@ websearch_to_tsquery) qui tokenise et ignore la ponctuation ;
-- admin_search_occurrences n'a qu'un LIKE substring. normalize_ar NE replie PAS
-- la virgule arabe « ، » (U+060C) : la requête normalisée garde « ... متاع ، وخير ... »
-- alors que le texte stocké est « ... متاع وخير ... » → le substring échoue.
--
-- Fix : nouvelle fonction normalize_ar_search() = normalize_ar() + repli de la
-- ponctuation arabe/latine en espace. On NE touche PAS à normalize_ar (deux index
-- GIN trigram en dépendent : hadiths_arabe_norm_trgm_idx, paroles_arabe_norm_trgm_idx).
-- admin_search_occurrences utilise normalize_ar_search des deux côtés (motif + colonnes).
-- ============================================================================

-- --------------------------------------------------------------------------
-- A) Helper : normalisation arabe tolérante à la ponctuation.
-- --------------------------------------------------------------------------
create or replace function public.normalize_ar_search(t text)
 returns text language sql immutable set search_path to 'public','pg_temp'
as $function$
  -- normalize_ar + replie la ponctuation arabe/latine en espace (recherche tolérante)
  select btrim(regexp_replace(
    regexp_replace(public.normalize_ar(t),
      E'[،؛؟٪٫٬٭.,;:!?()\\[\\]{}/\\\\|_–—-]', ' ', 'g'),
    '\s+', ' ', 'g'));
$function$;

-- --------------------------------------------------------------------------
-- B) admin_search_occurrences : remplace normalize_ar par normalize_ar_search
--    pour TOUTES les comparaisons arabes (motif pat_ar + colonnes).
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_search_occurrences(q text, p_limit integer DEFAULT 120)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  pat text;      -- motif latin (insensible casse + accents)
  pat_ar text;   -- motif arabe (harakat/hamza + ponctuation normalisés)
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if nullif(btrim(coalesce(q,'')),'') is null then return '[]'::json; end if;
  pat := '%'||public.unaccent(lower(btrim(q)))||'%';
  pat_ar := '%'||public.normalize_ar_search(btrim(q))||'%';
  return (
    with hits as (
      select 'Hadith' as kind, h.id::text as ref, h.sujet as label,
             public.admin_snip(concat_ws(' | ', h.sujet, h.rapporteur, h.narrateur, h.texte_francais, h.explication, h.texte_arabe), q) as extrait,
             '/admin/hadiths/'||h.id as path
      from public.hadiths h
      where public.unaccent(lower(concat_ws(' ', h.sujet, h.rapporteur, h.narrateur, h.juge_par, h.texte_francais, h.explication, h.tag))) like pat
         or public.normalize_ar_search(h.texte_arabe) like pat_ar
      union all
      select 'Parole', p.id::text, p.sujet,
             public.admin_snip(concat_ws(' | ', p.sujet, p.savant, p.texte_francais, p.explication, p.source_livre, p.texte_arabe), q),
             '/admin/paroles/'||p.id
      from public.paroles p
      where public.unaccent(lower(concat_ws(' ', p.sujet, p.savant, p.texte_francais, p.explication, p.source_livre, p.tag))) like pat
         or public.normalize_ar_search(p.texte_arabe) like pat_ar
      union all
      select 'Coran', c.id::text, c.sujet,
             public.admin_snip(concat_ws(' | ', c.sujet, c.sourate, c.texte_francais, c.explication, c.texte_arabe), q),
             '/admin/coran/'||c.id
      from public.coran c
      where public.unaccent(lower(concat_ws(' ', c.sujet, c.sourate, c.texte_francais, c.explication, c.tag))) like pat
         or public.normalize_ar_search(c.texte_arabe) like pat_ar
      union all
      select 'Invocation', i.id::text, i.sujet,
             public.admin_snip(concat_ws(' | ', i.sujet, i.texte_francais, i.commentaire, i.explication, i.texte_arabe), q),
             '/admin/invocations/'||i.id
      from public.invocations i
      where public.unaccent(lower(concat_ws(' ', i.sujet, i.texte_francais, i.commentaire, i.explication, i.tag))) like pat
         or public.normalize_ar_search(i.texte_arabe) like pat_ar
      union all
      select 'Équivoque', v.id::text, v.theme,
             public.admin_snip(concat_ws(' | ', v.theme, v.rapporteur, v.recueil, v.verset_traduction, v.sens_juste, v.objection, v.reponse, v.verset_arabe), q),
             '/admin/equivoques/'||v.id
      from public.versets_equivoques v
      where public.unaccent(lower(concat_ws(' ', v.theme, v.sourate, v.rapporteur, v.recueil, v.verset_traduction, v.sens_juste, v.objection, v.reponse))) like pat
         or public.normalize_ar_search(v.verset_arabe) like pat_ar
      union all
      select 'Dossier', d.id::text, d.h1,
             public.admin_snip(concat_ws(' | ', d.h1, d.croyance_texte, d.objection_texte, d.reponse_texte), q),
             '/admin/dossiers/'||d.id
      from public.dossiers d
      where public.unaccent(lower(concat_ws(' ', d.h1, d.meta_title, d.meta_description, d.croyance_texte, d.objection_texte, d.reponse_texte))) like pat
         or public.normalize_ar_search(concat_ws(' ', d.croyance_texte, d.objection_texte, d.reponse_texte)) like pat_ar
      union all
      select 'Exposé', e.slug, e.titre,
             public.admin_snip(concat_ws(' | ', e.titre, e.contenu_md, e.verset_traduction, e.verset_arabe), q),
             '/admin/exposes/'||e.slug
      from public.exposes e
      where public.unaccent(lower(concat_ws(' ', e.titre, e.contenu_md, e.verset_traduction, e.verset_ref))) like pat
         or public.normalize_ar_search(concat_ws(' ', e.verset_arabe, e.contenu_md)) like pat_ar
      union all
      select 'Récit', r.id::text, r.titre,
             public.admin_snip(concat_ws(' | ', r.titre, r.contenu_md), q),
             '/admin/recits/'||r.id
      from public.recits r
      where public.unaccent(lower(concat_ws(' ', r.titre, r.contenu_md))) like pat
         or public.normalize_ar_search(r.contenu_md) like pat_ar
      union all
      select 'Fiqh', f.id::text, coalesce(nullif(f.sujet,''), f.chapitre),
             public.admin_snip(concat_ws(' | ', f.chapitre, f.sujet, f.texte, f.source, f.texte_arabe), q),
             '/admin/fiqh/'||f.id
      from public.fiqh f
      where public.unaccent(lower(concat_ws(' ', f.chapitre, f.sujet, f.texte, f.source, f.tag))) like pat
         or public.normalize_ar_search(concat_ws(' ', f.texte_arabe, f.texte)) like pat_ar
      union all
      select 'Femme', fm.id::text, fm.chapitre,
             public.admin_snip(concat_ws(' | ', fm.chapitre, fm.matn, fm.commentaire, fm.source, fm.texte_arabe), q),
             '/admin/femmes/'||fm.id
      from public.femmes fm
      where public.unaccent(lower(concat_ws(' ', fm.chapitre, fm.matn, fm.commentaire, fm.source))) like pat
         or public.normalize_ar_search(concat_ws(' ', fm.texte_arabe, fm.matn, fm.commentaire)) like pat_ar
      union all
      select 'Savant', s.id::text, s.nom,
             public.admin_snip(concat_ws(' | ', s.nom, s.resume, s.biographie, s.nom_arabe), q),
             '/admin/savants/'||s.id
      from public.savants s
      where public.unaccent(lower(concat_ws(' ', s.nom, s.nom_arabe, s.resume, s.biographie, s.naissance, s.deces))) like pat
         or public.normalize_ar_search(concat_ws(' ', s.nom_arabe, s.resume, s.biographie)) like pat_ar
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
             or public.normalize_ar_search(concat_ws(' ', b.texte_md, b.commentaire_md)) like pat_ar)
    )
    select coalesce(json_agg(row_to_json(x)), '[]'::json)
    from (select * from hits where path is not null order by kind, label limit p_limit) x
  );
end $function$;
