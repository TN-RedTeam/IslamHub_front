-- ============================================================================
-- Phase 11u — Dialogues rattachables à une variante + titre de variante
-- ============================================================================
-- Besoin : une khoutba enchaîne plusieurs narrations (Mouslim, Aboû Dâwoûd ×2,
-- Ahmad, Al-Ḥâkim), certaines suivies d'un dialogue. Le modèle ne permettait
-- d'attacher un dialogue (hadith_segments) qu'au matn principal, et rendait
-- « tous les dialogues puis toutes les variantes » à plat.
--
-- Solution (choix utilisateur : tout sur UNE page hadith) :
--   • hadith_segments.variant_id (nullable) : NULL = dialogue du matn principal ;
--     = X = dialogue de la variante X (rendu juste sous elle).
--   • hadith_variants.titre (nullable) : titre libre du bloc (« Autre version »,
--     « Autre hadith — rapporté par Ahmad »…).
--   • Les versets du Coran intercalés restent dans les champs explication/intro.
--
-- Astuce de persistance : les variantes sont supprimées/réinsérées à chaque save
-- (nouveaux id). Le front ne peut donc pas envoyer un variant_id brut ; il envoie
-- un 'variant_index' (position 1-based dans le tableau variants). admin_save_hadith
-- insère les variantes d'abord, construit la correspondance position→id, puis
-- insère les dialogues en résolvant variant_index.
-- ============================================================================

-- A) Schéma (déjà appliqué via MCP).
alter table public.hadith_segments
  add column if not exists variant_id bigint references public.hadith_variants(id) on delete cascade;
create index if not exists hadith_segments_variant_id_idx on public.hadith_segments(variant_id);
alter table public.hadith_variants
  add column if not exists titre text;

-- B) Lecture publique : variantes avec titre + dialogues imbriqués (déjà appliqué).
CREATE OR REPLACE FUNCTION public.get_hadith(hadith_id integer)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select case when not exists (select 1 from public.hadiths where id = hadith_id) then null else
    (select row_to_json(x) from (
       select h.id, h.sujet, h.slug, h.intro, h.texte_arabe, h.texte_francais, h.phonetique as "phonétique",
              h.explication, h.degre_authenticite, h.type_hadith, h.juge_par,
              h.rapporteur, h.narrateur, h.tag,
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

-- C) Lecture admin : variantes avec id + titre, dialogues avec variant_id (déjà appliqué).
CREATE OR REPLACE FUNCTION public.admin_get_hadith(p_id bigint)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public', 'pg_temp'
AS $function$
  select row_to_json(x) from (
    select h.id, h.sujet, h.rubrique, h.intro, h.texte_arabe, h.texte_francais, h.phonetique, h.explication,
           h.degre_authenticite, h.type_hadith, h.juge_par, h.rapporteur, h.narrateur, h.tag,
           coalesce((select json_agg(hr.savant_id order by hr.savant_id) from public.hadith_rapporteurs hr where hr.hadith_id=h.id), '[]'::json) as rapporteur_ids,
           coalesce((select json_agg(hn.narrateur_id order by hn.narrateur_id) from public.hadith_narrateurs hn where hn.hadith_id=h.id), '[]'::json) as narrateur_ids,
           exists (select 1 from public.versets_equivoques v where v.hadith_id=h.id) as is_equivoque,
           (select v.id from public.versets_equivoques v where v.hadith_id=h.id limit 1) as equivoque_id,
           (select v.slug from public.versets_equivoques v where v.hadith_id=h.id limit 1) as equivoque_slug,
           coalesce((select json_agg(json_build_object('ordre', s.ordre, 'variant_id', s.variant_id, 'intro', s.intro,
                                                        'texte_arabe', s.texte_arabe, 'phonetique', s.phonetique,
                                                        'texte_francais', s.texte_francais, 'explication', s.explication)
                                      order by s.ordre, s.id)
                     from public.hadith_segments s where s.hadith_id = h.id), '[]'::json) as segments,
           coalesce((select json_agg(json_build_object('id', va.id, 'ordre', va.ordre, 'titre', va.titre, 'intro', va.intro,
                                                        'texte_arabe', va.texte_arabe, 'phonetique', va.phonetique,
                                                        'texte_francais', va.texte_francais, 'explication', va.explication,
                                                        'source', va.source)
                                      order by va.ordre, va.id)
                     from public.hadith_variants va where va.hadith_id = h.id), '[]'::json) as variants,
           coalesce((select json_agg(json_build_object('recueil_id', hs.recueil_id, 'numero', hs.numero, 'chapitre', hs.chapitre) order by hs.recueil_id)
                     from public.hadith_sources hs where hs.hadith_id = h.id), '[]'::json) as sources
    from public.hadiths h where h.id = p_id
  ) x;
$function$;

-- D) Écriture admin : variantes (avec titre) d'abord, puis dialogues rattachés
--    via variant_index.  >>> C'EST CETTE FONCTION QU'IL RESTE À EXÉCUTER <<<
CREATE OR REPLACE FUNCTION public.admin_save_hadith(p jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_narr text := nullif(btrim(p->>'narrateur'),'');
  v_slug text; s jsonb; v_recueil_id bigint; v_rslug text;
  v_has_rapp boolean := p ? 'rapporteur_ids';
  v_has_narr boolean := (p ? 'narrateur_ids') or ((p->'new_narrateur') is not null);
  v_rapp_ids bigint[] := case when p ? 'rapporteur_ids'
    then array(select (jsonb_array_elements_text(p->'rapporteur_ids'))::bigint) else '{}'::bigint[] end;
  v_narr_ids bigint[] := case when p ? 'narrateur_ids'
    then array(select (jsonb_array_elements_text(p->'narrateur_ids'))::bigint) else '{}'::bigint[] end;
  v_new_narr_id bigint;
  v_has_eq_flag boolean := p ? 'is_equivoque';
  v_is_eq boolean := coalesce((p->>'is_equivoque')::boolean, false);
  v_eq_id bigint; v_eq_slug text; v_eq_theme text; v_eq_rapp text;
  v_var_map jsonb := '{}'::jsonb;   -- position (ordre) de la variante -> nouvel id
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;

  if (p->'new_narrateur') is not null and nullif(btrim(p->'new_narrateur'->>'nom'),'') is not null then
    insert into public.narrateurs (nom, generation, sexe, role)
    values (btrim(p->'new_narrateur'->>'nom'), nullif(p->'new_narrateur'->>'generation',''),
            nullif(p->'new_narrateur'->>'sexe',''), nullif(p->'new_narrateur'->>'role',''))
    on conflict (nom) do update set
      generation = coalesce(nullif(excluded.generation,''), public.narrateurs.generation),
      sexe = coalesce(nullif(excluded.sexe,''), public.narrateurs.sexe),
      role = coalesce(nullif(excluded.role,''), public.narrateurs.role)
    returning id into v_new_narr_id;
    v_narr_ids := v_narr_ids || v_new_narr_id;
  end if;

  if v_id is null then
    v_slug := lower(regexp_replace(regexp_replace(public.unaccent(coalesce(p->>'sujet','')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_slug = '' then v_slug := 'hadith'; end if;
    insert into public.hadiths (sujet, rubrique, intro, texte_arabe, texte_francais, phonetique, explication,
        degre_authenticite, type_hadith, juge_par, rapporteur, narrateur, statut, tag, slug)
    values (nullif(btrim(p->>'sujet'),''), nullif(btrim(p->>'rubrique'),''), nullif(btrim(p->>'intro'),''), nullif(btrim(p->>'texte_arabe'),''), nullif(p->>'texte_francais',''),
        nullif(p->>'phonetique',''), nullif(p->>'explication',''), nullif(p->>'degre_authenticite',''),
        nullif(p->>'type_hadith',''), nullif(p->>'juge_par',''),
        case when v_has_rapp then null else nullif(p->>'rapporteur','') end,
        case when v_has_narr then null else v_narr end,
        nullif(p->>'degre_authenticite',''), nullif(p->>'tag',''), v_slug)
    returning id into v_id;
  else
    update public.hadiths set
      sujet=nullif(btrim(p->>'sujet'),''), rubrique=nullif(btrim(p->>'rubrique'),''), intro=nullif(btrim(p->>'intro'),''), texte_arabe=nullif(btrim(p->>'texte_arabe'),''),
      texte_francais=nullif(p->>'texte_francais',''), phonetique=nullif(p->>'phonetique',''),
      explication=nullif(p->>'explication',''), degre_authenticite=nullif(p->>'degre_authenticite',''),
      type_hadith=nullif(p->>'type_hadith',''), juge_par=nullif(p->>'juge_par',''),
      rapporteur=case when v_has_rapp then rapporteur else nullif(p->>'rapporteur','') end,
      narrateur=case when v_has_narr then narrateur else v_narr end,
      statut=nullif(p->>'degre_authenticite',''), tag=nullif(p->>'tag','')
    where id=v_id;
  end if;

  if v_has_rapp then
    delete from public.hadith_rapporteurs where hadith_id=v_id;
    insert into public.hadith_rapporteurs (hadith_id, savant_id)
    select v_id, x from unnest(v_rapp_ids) x
    where exists (select 1 from public.savants sv where sv.id=x) on conflict do nothing;
  end if;

  if v_has_narr then
    delete from public.hadith_narrateurs where hadith_id=v_id;
    insert into public.hadith_narrateurs (hadith_id, narrateur_id)
    select v_id, x from unnest(v_narr_ids) x
    where exists (select 1 from public.narrateurs n where n.id=x) on conflict do nothing;
  end if;

  delete from public.hadith_sources where hadith_id = v_id;
  for s in select * from jsonb_array_elements(coalesce(p->'sources','[]'::jsonb)) loop
    v_recueil_id := nullif(s->>'recueil_id','')::bigint;
    if v_recueil_id is null and (s->'new_recueil') is not null and nullif(btrim(s->'new_recueil'->>'titre'),'') is not null then
      v_rslug := lower(regexp_replace(regexp_replace(public.unaccent(s->'new_recueil'->>'titre'),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
      if v_rslug = '' or exists (select 1 from public.recueils where slug = v_rslug) then
        v_rslug := coalesce(nullif(v_rslug,''),'ouvrage') || '-' || floor(random()*100000)::text;
      end if;
      insert into public.recueils (titre, savant_id, slug)
      values (btrim(s->'new_recueil'->>'titre'), nullif(s->'new_recueil'->>'savant_id','')::bigint, v_rslug)
      returning id into v_recueil_id;
    end if;
    if v_recueil_id is not null then
      insert into public.hadith_sources (hadith_id, recueil_id, numero, chapitre)
      values (v_id, v_recueil_id, nullif(s->>'numero',''), nullif(s->>'chapitre',''))
      on conflict do nothing;
    end if;
  end loop;

  delete from public.hadith_themes where hadith_id = v_id;
  insert into public.hadith_themes (hadith_id, theme_slug)
  select v_id, tt.theme_slug
  from unnest(string_to_array(coalesce(p->>'tag',''), ',')) raw(tok)
  join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g') = regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
  where btrim(raw.tok) <> '' on conflict do nothing;

  -- Variantes AVANT les dialogues (pour pouvoir rattacher un dialogue à une variante).
  if p ? 'variants' then
    delete from public.hadith_variants where hadith_id = v_id;  -- cascade: supprime leurs dialogues
    insert into public.hadith_variants (hadith_id, ordre, titre, intro, texte_arabe, phonetique, texte_francais, explication, source)
    select v_id, (e.ord)::int, nullif(btrim(e.val->>'titre'),''),
           nullif(btrim(e.val->>'intro'),''), nullif(btrim(e.val->>'texte_arabe'),''),
           nullif(btrim(e.val->>'phonetique'),''), nullif(btrim(e.val->>'texte_francais'),''),
           nullif(btrim(e.val->>'explication'),''), nullif(btrim(e.val->>'source'),'')
    from jsonb_array_elements(coalesce(p->'variants','[]'::jsonb)) with ordinality as e(val, ord)
    where coalesce(btrim(e.val->>'texte_arabe'),'') <> '' or coalesce(btrim(e.val->>'texte_francais'),'') <> ''
          or coalesce(btrim(e.val->>'intro'),'') <> '' or coalesce(btrim(e.val->>'explication'),'') <> ''
          or coalesce(btrim(e.val->>'source'),'') <> '' or coalesce(btrim(e.val->>'titre'),'') <> '';
    v_var_map := (select coalesce(jsonb_object_agg(ordre::text, id), '{}'::jsonb)
                  from public.hadith_variants where hadith_id = v_id);
  end if;

  if p ? 'segments' then
    delete from public.hadith_segments where hadith_id = v_id;
    insert into public.hadith_segments (hadith_id, variant_id, ordre, intro, texte_arabe, phonetique, texte_francais, explication)
    select v_id,
           (v_var_map ->> (e.val->>'variant_index'))::bigint,
           (e.ord)::int,
           nullif(btrim(e.val->>'intro'),''), nullif(btrim(e.val->>'texte_arabe'),''),
           nullif(btrim(e.val->>'phonetique'),''), nullif(btrim(e.val->>'texte_francais'),''),
           nullif(btrim(e.val->>'explication'),'')
    from jsonb_array_elements(coalesce(p->'segments','[]'::jsonb)) with ordinality as e(val, ord)
    where coalesce(btrim(e.val->>'texte_arabe'),'') <> '' or coalesce(btrim(e.val->>'texte_francais'),'') <> ''
          or coalesce(btrim(e.val->>'intro'),'') <> '' or coalesce(btrim(e.val->>'explication'),'') <> '';
  end if;

  if v_has_eq_flag then
    select id into v_eq_id from public.versets_equivoques where hadith_id = v_id;
    if v_is_eq then
      v_eq_theme := coalesce(nullif(btrim(p->>'sujet'),''), 'Hadith équivoque');
      v_eq_rapp := (select rapporteur from public.hadiths where id = v_id);
      if v_eq_id is null then
        v_eq_slug := lower(regexp_replace(regexp_replace(public.unaccent(v_eq_theme),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
        if v_eq_slug = '' then v_eq_slug := 'hadith-equivoque'; end if;
        if exists (select 1 from public.versets_equivoques where slug = v_eq_slug) then v_eq_slug := v_eq_slug||'-'||floor(random()*100000)::text; end if;
        insert into public.versets_equivoques (slug, theme, sourate, type, verset_arabe, verset_traduction, verset_phonetique, rapporteur, recueil, hadith_id, published)
        values (v_eq_slug, v_eq_theme, '', 'hadith', coalesce(nullif(btrim(p->>'texte_arabe'),''),''), nullif(p->>'texte_francais',''), nullif(p->>'phonetique',''),
                v_eq_rapp, public.recueils_for_hadith(v_id), v_id, false);
      else
        update public.versets_equivoques set theme=v_eq_theme, type='hadith',
          verset_arabe=coalesce(nullif(btrim(p->>'texte_arabe'),''),''), verset_traduction=nullif(p->>'texte_francais',''),
          verset_phonetique=nullif(p->>'phonetique',''), rapporteur=v_eq_rapp,
          recueil=public.recueils_for_hadith(v_id)
        where id=v_eq_id;
      end if;
    else
      if v_eq_id is not null
         and not exists (select 1 from public.versets_equivoques v where v.id=v_eq_id
                          and (coalesce(btrim(v.sens_juste),'')<>'' or coalesce(btrim(v.objection),'')<>'' or coalesce(btrim(v.reponse),'')<>''))
         and not exists (select 1 from public.contenu_blocs b where b.parent_type='equivoque' and b.parent_id=v_eq_id::text) then
        delete from public.versets_equivoques where id=v_eq_id;
      end if;
    end if;
  end if;

  return v_id;
end $function$;
