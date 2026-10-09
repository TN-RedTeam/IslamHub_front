-- ============================================================================
-- Phase 11e — Champ « rubrique » (série) sur les hadiths
-- ============================================================================
-- Vrai champ de regroupement, remplaçant la convention implicite « Rubrique:
-- sous-sujet » du titre. Backfillé depuis les préfixes existants. Pilote
-- désormais « Sur le même thème » (related_by_theme) de façon robuste (plus de
-- dépendance au parsing du « : »), et alimente un sélecteur dans l'admin.
--
-- Fonctions de LECTURE + ALTER/UPDATE : appliquées via le MCP Supabase.
-- La fonction d'ÉCRITURE admin_save_hadith (SECURITY DEFINER) expire via le MCP
-- → à exécuter MANUELLEMENT (dernière section). Elle est la version de référence
-- (intro + arabe optionnel + segments + variantes + rubrique).
-- Idempotent.
-- ============================================================================

-- 1) Colonne + backfill  [déjà appliqué]
alter table public.hadiths add column if not exists rubrique text;

--   a. depuis le préfixe « Rubrique: sous-sujet »
update public.hadiths
  set rubrique = nullif(btrim(split_part(sujet, ':', 1)), '')
  where rubrique is null and position(':' in sujet) > 0;

--   b. têtes de série (sujet sans ':' égal à une rubrique déclarée ailleurs)
update public.hadiths h set rubrique = btrim(h.sujet)
where h.rubrique is null and position(':' in h.sujet) = 0
  and exists (select 1 from public.hadiths h2
              where position(':' in h2.sujet) > 0
                and btrim(split_part(h2.sujet, ':', 1)) = btrim(h.sujet));

-- 2) Liste des rubriques (sélecteur admin).  [déjà appliqué]
create or replace function public.rubriques_hadiths()
 returns setof text language sql stable set search_path to 'public','pg_temp'
as $function$
  select distinct btrim(rubrique) from public.hadiths
  where rubrique is not null and btrim(rubrique) <> '' order by 1;
$function$;

-- 3) related_by_theme : s'appuie sur la colonne rubrique (fallback préfixe).  [déjà appliqué]
create or replace function public.related_by_theme(p_kind text, p_id bigint, p_limit integer default 8)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with me as (
    select case
      when p_kind='hadith' then (select coalesce(nullif(btrim(h.rubrique),''), nullif(btrim(split_part(h.sujet,':',1)),'')) from public.hadiths h where h.id=p_id)
      when p_kind='parole' then (select nullif(btrim(split_part(pa.sujet,':',1)),'') from public.paroles pa where pa.id=p_id)
      when p_kind in ('verset','coran') then (select nullif(btrim(split_part(c.sujet,':',1)),'') from public.coran c where c.id=p_id)
    end as rubrique
  ),
  mine as (
    select ht.theme_slug from public.hadith_themes ht where p_kind='hadith' and ht.hadith_id=p_id
    union select pt.theme_slug from public.parole_themes pt where p_kind='parole' and pt.parole_id=p_id
    union select ct.theme_slug from public.coran_themes ct where p_kind in ('verset','coran') and ct.coran_id=p_id
  ),
  by_rub as (
    select 0 as prio, 'hadith'::text as kind, h.id, h.slug, h.sujet, null::text as savant, null::text as sourate
    from public.hadiths h, me
    where me.rubrique is not null
      and coalesce(nullif(btrim(h.rubrique),''), nullif(btrim(split_part(h.sujet,':',1)),'')) = me.rubrique
      and not (p_kind='hadith' and h.id=p_id)
    union all
    select 0, 'parole', pa.id, pa.slug, pa.sujet, coalesce(sv.nom, pa.savant), null
    from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, me
    where me.rubrique is not null and nullif(btrim(split_part(pa.sujet,':',1)),'') = me.rubrique
      and not (p_kind='parole' and pa.id=p_id)
    union all
    select 0, 'verset', c.id, null, c.sujet, null, c.sourate
    from public.coran c, me
    where me.rubrique is not null and nullif(btrim(split_part(c.sujet,':',1)),'') = me.rubrique
      and not (p_kind in ('verset','coran') and c.id=p_id)
  ),
  by_theme as (
    select 1 as prio, 'hadith'::text as kind, h.id, h.slug, h.sujet, null::text as savant, null::text as sourate
    from public.hadith_themes ht join public.hadiths h on h.id=ht.hadith_id
    where ht.theme_slug in (select theme_slug from mine) and not (p_kind='hadith' and h.id=p_id)
    union all
    select 1, 'parole', pa.id, pa.slug, pa.sujet, coalesce(sv.nom, pa.savant), null
    from public.parole_themes pt join public.paroles pa on pa.id=pt.parole_id
      left join public.savants sv on sv.id=pa.savant_id
    where pt.theme_slug in (select theme_slug from mine) and not (p_kind='parole' and pa.id=p_id)
    union all
    select 1, 'verset', c.id, null, c.sujet, null, c.sourate
    from public.coran_themes ct join public.coran c on c.id=ct.coran_id
    where ct.theme_slug in (select theme_slug from mine) and not (p_kind in ('verset','coran') and c.id=p_id)
  ),
  combined as (select * from by_rub union all select * from by_theme),
  ranked as (
    select distinct on (kind, id) prio, kind, id, slug, sujet, savant, sourate
    from combined order by kind, id, prio
  )
  select coalesce(json_agg(row_to_json(r)), '[]'::json)
  from (select kind, id, slug, sujet, savant, sourate from ranked order by prio, kind, id limit p_limit) r;
$function$;

-- 4) admin_get_hadith renvoie la rubrique.  [déjà appliqué]  (cf. définition en base)

-- ----------------------------------------------------------------------------
-- 5) ÉCRITURE — version de référence (persiste la rubrique).
-- ⚠️ À EXÉCUTER MANUELLEMENT (le MCP expire sur cette fonction SECURITY DEFINER).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_save_hadith(p jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
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

  if p ? 'segments' then
    delete from public.hadith_segments where hadith_id = v_id;
    insert into public.hadith_segments (hadith_id, ordre, intro, texte_arabe, phonetique, texte_francais, explication)
    select v_id, (e.ord)::int,
           nullif(btrim(e.val->>'intro'),''), nullif(btrim(e.val->>'texte_arabe'),''),
           nullif(btrim(e.val->>'phonetique'),''), nullif(btrim(e.val->>'texte_francais'),''),
           nullif(btrim(e.val->>'explication'),'')
    from jsonb_array_elements(coalesce(p->'segments','[]'::jsonb)) with ordinality as e(val, ord)
    where coalesce(btrim(e.val->>'texte_arabe'),'') <> '' or coalesce(btrim(e.val->>'texte_francais'),'') <> ''
          or coalesce(btrim(e.val->>'intro'),'') <> '' or coalesce(btrim(e.val->>'explication'),'') <> '';
  end if;

  if p ? 'variants' then
    delete from public.hadith_variants where hadith_id = v_id;
    insert into public.hadith_variants (hadith_id, ordre, intro, texte_arabe, phonetique, texte_francais, explication, source)
    select v_id, (e.ord)::int,
           nullif(btrim(e.val->>'intro'),''), nullif(btrim(e.val->>'texte_arabe'),''),
           nullif(btrim(e.val->>'phonetique'),''), nullif(btrim(e.val->>'texte_francais'),''),
           nullif(btrim(e.val->>'explication'),''), nullif(btrim(e.val->>'source'),'')
    from jsonb_array_elements(coalesce(p->'variants','[]'::jsonb)) with ordinality as e(val, ord)
    where coalesce(btrim(e.val->>'texte_arabe'),'') <> '' or coalesce(btrim(e.val->>'texte_francais'),'') <> ''
          or coalesce(btrim(e.val->>'intro'),'') <> '' or coalesce(btrim(e.val->>'explication'),'') <> ''
          or coalesce(btrim(e.val->>'source'),'') <> '';
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
