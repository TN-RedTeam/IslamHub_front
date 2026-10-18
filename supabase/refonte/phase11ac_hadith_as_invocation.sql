-- ============================================================================
-- Phase 11ac — Un hadith peut AUSSI être une invocation / évocation
-- ============================================================================
-- Beaucoup d'invocations/évocations sont en réalité des hadiths (parfois avec
-- dialogue). On les saisit UNE fois comme hadith, puis on les marque comme
-- invocation (1) ou évocation (2) et on complète le « commentaire (mérite,
-- moment, nb de répétitions) » + les moments. Ils apparaissent alors dans la
-- rubrique Hadiths ET dans Invocations & Évocations. Depuis cette dernière, le
-- clic ouvre la PAGE hadith complète.
--
-- A) Schéma (3 colonnes sur hadiths) — appliqué via MCP.
-- B) Lectures get_hadith / admin_get_hadith (exposent les 3 champs) — via MCP.
-- C) Unions : search_invocations + journee_invocations incluent les hadiths
--    marqués (avec kind/slug/hadith_id pour router vers la page hadith) — via MCP.
-- D) Écriture admin admin_save_hadith (SECURITY DEFINER) — >>> À EXÉCUTER <<<.
-- ============================================================================

-- A) Schéma (déjà appliqué).
alter table public.hadiths add column if not exists invocation_type smallint;        -- null / 1 (invocation) / 2 (évocation)
alter table public.hadiths add column if not exists invocation_commentaire text;      -- mérite, moment, nb de répétitions…
alter table public.hadiths add column if not exists invocation_moments text;          -- CSV de clés `moments`

-- B/C) get_hadith, admin_get_hadith, search_invocations, journee_invocations :
--      voir l'historique (appliqués via MCP). Ils ajoutent les 3 champs côté
--      hadith et, pour les listes d'invocations, l'union des hadiths marqués
--      (avec kind='hadith', slug, hadith_id).

-- ----------------------------------------------------------------------------
-- D) Écriture admin — persiste invocation_type / commentaire / moments.
--    >>> À EXÉCUTER À LA MAIN (SECURITY DEFINER) <<<
-- ----------------------------------------------------------------------------
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
  v_var_map jsonb := '{}'::jsonb;
  -- invocation / évocation
  v_inv_type smallint := nullif(p->>'invocation_type','')::smallint;
  v_inv_cmt text := nullif(btrim(p->>'invocation_commentaire'),'');
  v_inv_mom text := nullif(btrim(p->>'invocation_moments'),'');
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if v_inv_type is null then v_inv_cmt := null; v_inv_mom := null; end if;

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
        degre_authenticite, type_hadith, juge_par, rapporteur, narrateur, statut, tag, slug,
        invocation_type, invocation_commentaire, invocation_moments)
    values (nullif(btrim(p->>'sujet'),''), nullif(btrim(p->>'rubrique'),''), nullif(btrim(p->>'intro'),''), nullif(btrim(p->>'texte_arabe'),''), nullif(p->>'texte_francais',''),
        nullif(p->>'phonetique',''), nullif(p->>'explication',''), nullif(p->>'degre_authenticite',''),
        nullif(p->>'type_hadith',''), nullif(p->>'juge_par',''),
        case when v_has_rapp then null else nullif(p->>'rapporteur','') end,
        case when v_has_narr then null else v_narr end,
        nullif(p->>'degre_authenticite',''), nullif(p->>'tag',''), v_slug,
        v_inv_type, v_inv_cmt, v_inv_mom)
    returning id into v_id;
  else
    update public.hadiths set
      sujet=nullif(btrim(p->>'sujet'),''), rubrique=nullif(btrim(p->>'rubrique'),''), intro=nullif(btrim(p->>'intro'),''), texte_arabe=nullif(btrim(p->>'texte_arabe'),''),
      texte_francais=nullif(p->>'texte_francais',''), phonetique=nullif(p->>'phonetique',''),
      explication=nullif(p->>'explication',''), degre_authenticite=nullif(p->>'degre_authenticite',''),
      type_hadith=nullif(p->>'type_hadith',''), juge_par=nullif(p->>'juge_par',''),
      rapporteur=case when v_has_rapp then rapporteur else nullif(p->>'rapporteur','') end,
      narrateur=case when v_has_narr then narrateur else v_narr end,
      statut=nullif(p->>'degre_authenticite',''), tag=nullif(p->>'tag',''),
      invocation_type=v_inv_type, invocation_commentaire=v_inv_cmt, invocation_moments=v_inv_mom
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

  if p ? 'variants' then
    delete from public.hadith_variants where hadith_id = v_id;
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
