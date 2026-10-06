-- ============================================================================
-- Profil savant / narrateur + séparation des rubriques
--   • savants.est_savant / savants.est_narrateur : classification (un même
--     personnage peut être les deux — ex. Ali, Abou Bakr, Omar, Aïcha).
--   • savants_all / savant_by_slug exposent ces drapeaux ; la vue d'ensemble
--     n'exige plus de biographie (elle « viendra après »).
--   • admin_get_savant / admin_save_savant lisent et écrivent les drapeaux.
--
-- Colonnes + backfill déjà appliqués (ALTER + UPDATE). À exécuter dans le SQL
-- Editor de Supabase (idempotent).
-- ============================================================================

alter table public.savants add column if not exists est_savant boolean not null default false;
alter table public.savants add column if not exists est_narrateur boolean not null default false;

-- 1) Répertoire (page Savants + page Compagnons, split côté front via is_compagnon)
create or replace function public.savants_all()
 returns json language sql stable set search_path to 'public', 'pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.rang, x.nom), '[]'::json) from (
    select s.id, s.nom, s.nom_arabe, s.slug, e.nom as ecole, e.slug as ecole_slug,
           s.naissance, s.deces, s.resume, s.generation,
           coalesce(s.domaines, array[]::text[]) as domaines,
           (select count(*) from public.paroles p where p.savant_id = s.id) as nb_paroles,
           s.est_savant, s.est_narrateur,
           (s.role is not null or s.generation = 'sahabi' or s.domaines @> array['Compagnon']
              or exists (select 1 from public.narrateurs n where n.savant_id = s.id)) as is_compagnon,
           coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id = s.id and n.role is not null limit 1)) as role,
           case
             when coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id=s.id and n.role is not null limit 1)) = 'calife_rachidoun' then 0
             when coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id=s.id and n.role is not null limit 1)) = 'epouse_prophete' then 1
             when (s.role is not null or s.generation='sahabi' or s.domaines @> array['Compagnon']
                   or exists (select 1 from public.narrateurs n where n.savant_id=s.id)) then 2
             else 3
           end as rang
    from public.savants s
    left join public.ecoles e on e.id = s.ecole_id
    where s.est_savant or s.est_narrateur
  ) x;
$function$;

-- 2) Fiche d'un savant : expose aussi est_savant / est_narrateur
create or replace function public.savant_by_slug(savant_slug text)
 returns json language sql stable set search_path to 'public', 'pg_temp'
as $function$
  with s as (select * from public.savants where slug = savant_slug)
  select case when not exists (select 1 from s) then null else json_build_object(
    'savant', (select row_to_json(x) from (
        select s.id, s.nom, s.slug, s.nom_arabe, s.naissance, s.deces, s.biographie, s.generation,
               e.nom as ecole, e.slug as ecole_slug,
               s.est_savant, s.est_narrateur,
               (s.role is not null or s.generation='sahabi' or s.domaines @> array['Compagnon']
                  or exists (select 1 from public.narrateurs n where n.savant_id = s.id)) as is_compagnon,
               coalesce(s.role, (select n.role from public.narrateurs n where n.savant_id = s.id and n.role is not null limit 1)) as role
        from s left join public.ecoles e on e.id = s.ecole_id) x),
    'paroles', coalesce((select json_agg(row_to_json(p) order by p.id) from (
        select p.id, p.sujet, p.slug, p.texte_arabe, p.texte_francais, p."phonétique", p.explication, p.ecole
        from public.paroles p where p.savant_id = (select id from s)) p), '[]'::json),
    'hadiths_juges', coalesce((select json_agg(row_to_json(h) order by h.id) from (
        select h.id, h.sujet, h.slug, h.degre_authenticite
        from public.hadiths h
        where h.juge_par is not null and h.juge_par ilike '%'||(select nom from s)||'%') h), '[]'::json)
  ) end;
$function$;

-- 3) Admin : lecture de la fiche (ajoute les drapeaux)
create or replace function public.admin_get_savant(p_id bigint)
 returns json language sql stable set search_path to 'public', 'pg_temp'
as $function$
  select row_to_json(x) from (
    select id, nom, nom_arabe, slug, ecole_id, generation, naissance, deces,
           resume, biographie, domaines, role, est_savant, est_narrateur
    from public.savants where id = p_id
  ) x;
$function$;

-- 4) Admin : écriture (persiste les drapeaux ; défaut rétro-compatible)
create or replace function public.admin_save_savant(p jsonb)
 returns bigint language plpgsql security definer set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_slug text;
  v_gen text := nullif(btrim(p->>'generation'),'');
  v_role text := nullif(btrim(p->>'role'),'');
  v_est_savant boolean := coalesce((p->>'est_savant')::boolean, false);
  v_est_narr boolean := coalesce((p->>'est_narrateur')::boolean, false);
  v_domaines text[] := case when jsonb_typeof(p->'domaines')='array'
                        then array(select btrim(x) from jsonb_array_elements_text(p->'domaines') x where btrim(x)<>'')
                        else null end;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if v_gen is not null and v_gen not in ('sahabi','salaf','tabii','tabi_tabii','khalaf') then
    raise exception 'Génération invalide.'; end if;
  if v_role is not null and v_role not in ('calife_rachidoun','epouse_prophete') then
    raise exception 'Rôle invalide.'; end if;

  if v_id is null then
    v_slug := lower(regexp_replace(regexp_replace(public.unaccent(coalesce(nullif(btrim(p->>'slug'),''), p->>'nom','savant')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
    if v_slug='' then v_slug:='savant'; end if;
    if exists (select 1 from public.savants where slug=v_slug) then v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    insert into public.savants (nom, nom_arabe, slug, ecole_id, generation, generation_a_verifier,
                                naissance, deces, resume, resume_auto, biographie, domaines, role,
                                est_savant, est_narrateur)
    values (btrim(p->>'nom'), nullif(btrim(p->>'nom_arabe'),''), v_slug, nullif(p->>'ecole_id','')::bigint,
            v_gen, false, nullif(btrim(p->>'naissance'),''), nullif(btrim(p->>'deces'),''),
            nullif(p->>'resume',''), false, nullif(p->>'biographie',''), v_domaines, v_role,
            v_est_savant, v_est_narr)
    returning id into v_id;
  else
    if nullif(btrim(p->>'slug'),'') is not null then
      v_slug := lower(regexp_replace(regexp_replace(public.unaccent(btrim(p->>'slug')),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
      if v_slug<>'' and exists (select 1 from public.savants where slug=v_slug and id<>v_id) then
        v_slug := v_slug||'-'||floor(random()*100000)::text; end if;
    end if;
    update public.savants set nom=btrim(p->>'nom'), nom_arabe=nullif(btrim(p->>'nom_arabe'),''),
      slug=coalesce(nullif(v_slug,''), slug), ecole_id=nullif(p->>'ecole_id','')::bigint,
      generation=v_gen, generation_a_verifier=false,
      naissance=nullif(btrim(p->>'naissance'),''), deces=nullif(btrim(p->>'deces'),''),
      resume=nullif(p->>'resume',''), resume_auto=false, biographie=nullif(p->>'biographie',''),
      domaines=v_domaines, role=v_role, est_savant=v_est_savant, est_narrateur=v_est_narr
    where id=v_id;
  end if;
  return v_id;
end $function$;
