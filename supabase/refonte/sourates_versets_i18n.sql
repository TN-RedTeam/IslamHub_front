-- ============================================================================
-- Coran — SAISIE des traductions versets/exégèses (colonnes par langue)
-- ============================================================================
-- admin_get_sourate renvoie texte_en/phonetique_en (versets) et texte_en/
-- texte_ar (exégèses) ; admin_save_sourate les réinsère. Le texte arabe du
-- verset reste unique. À appliquer après i18n_coran_enfants_lecture.sql.
-- ============================================================================

create or replace function public.admin_get_sourate(p_id bigint)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select s.id, s.numero, s.nom, s.nom_arabe, s.slug, s.revelation, s.nb_versets,
      s.introduction_md, s.ordre_revelation,
      coalesce((select json_agg(json_build_object(
                  'numero', vr.numero, 'texte_arabe', vr.texte_arabe,
                  'texte_francais', vr.texte_francais, 'texte_en', vr.texte_en,
                  'phonetique', vr.phonetique, 'phonetique_en', vr.phonetique_en,
                  'exegeses', coalesce((select json_agg(json_build_object('texte', ex.texte, 'texte_en', ex.texte_en, 'texte_ar', ex.texte_ar,
                                       'source', ex.source, 'ordre', ex.ordre, 'verset_fin', ex.verset_fin)
                                       order by ex.ordre, ex.id)
                                       from public.exegeses ex where ex.verset_id = vr.id), '[]'::json))
                order by vr.numero)
                from public.versets vr where vr.sourate_id = s.id), '[]'::json) as versets
    from public.sourates s where s.id = p_id
  ) x;
$function$;

create or replace function public.admin_save_sourate(p jsonb)
 returns bigint language plpgsql security definer set search_path to 'public','pg_temp'
as $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_slug text; v_num int := nullif(p->>'numero','')::int;
  vj jsonb; ej jsonb; v_verset_id bigint; v_ord int;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if v_num is null then raise exception 'Le numéro de sourate est obligatoire.'; end if;

  if v_id is null then
    v_slug := lower(regexp_replace(regexp_replace(public.unaccent(coalesce(nullif(btrim(p->>'slug'),''), p->>'nom','sourate')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_slug='' then v_slug:='sourate'; end if;
    if exists (select 1 from public.sourates where slug=v_slug) then v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    insert into public.sourates (numero, nom, nom_arabe, slug, revelation, nb_versets, introduction_md, ordre_revelation)
    values (v_num, btrim(p->>'nom'), nullif(btrim(p->>'nom_arabe'),''), v_slug,
            nullif(btrim(p->>'revelation'),''), nullif(p->>'nb_versets','')::int,
            nullif(btrim(p->>'introduction_md'),''), nullif(p->>'ordre_revelation','')::int)
    returning id into v_id;
  else
    if nullif(btrim(p->>'slug'),'') is not null then
      v_slug := lower(regexp_replace(regexp_replace(public.unaccent(btrim(p->>'slug')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
      if v_slug<>'' and exists (select 1 from public.sourates where slug=v_slug and id<>v_id) then
        v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    end if;
    update public.sourates set numero=v_num, nom=btrim(p->>'nom'), nom_arabe=nullif(btrim(p->>'nom_arabe'),''),
      revelation=nullif(btrim(p->>'revelation'),''), nb_versets=nullif(p->>'nb_versets','')::int,
      introduction_md=nullif(btrim(p->>'introduction_md'),''), ordre_revelation=nullif(p->>'ordre_revelation','')::int,
      slug=coalesce(nullif(v_slug,''), slug)
    where id=v_id;
  end if;

  delete from public.versets where sourate_id=v_id;
  for vj in select * from jsonb_array_elements(coalesce(p->'versets','[]'::jsonb)) loop
    if nullif(vj->>'numero','') is not null then
      insert into public.versets (sourate_id, numero, texte_arabe, texte_francais, texte_en, phonetique, phonetique_en)
      values (v_id, (vj->>'numero')::int, nullif(vj->>'texte_arabe',''),
              nullif(vj->>'texte_francais',''), nullif(vj->>'texte_en',''),
              nullif(vj->>'phonetique',''), nullif(vj->>'phonetique_en',''))
      returning id into v_verset_id;
      v_ord := 0;
      for ej in select * from jsonb_array_elements(coalesce(vj->'exegeses','[]'::jsonb)) loop
        if nullif(btrim(ej->>'texte'),'') is not null then
          insert into public.exegeses (verset_id, texte, texte_en, texte_ar, source, ordre, verset_fin)
          values (v_verset_id, btrim(ej->>'texte'), nullif(btrim(ej->>'texte_en'),''), nullif(btrim(ej->>'texte_ar'),''),
                  nullif(btrim(ej->>'source'),''), coalesce(nullif(ej->>'ordre','')::int, v_ord), nullif(ej->>'verset_fin','')::int);
          v_ord := v_ord + 1;
        end if;
      end loop;
    end if;
  end loop;

  return v_id;
end $function$;

-- ---- PREUVE ----------------------------------------------------------------
select count(*) as cols from information_schema.columns
where table_schema='public' and ((table_name='versets' and column_name in ('texte_en','phonetique_en'))
   or (table_name='exegeses' and column_name in ('texte_en','texte_ar')));
