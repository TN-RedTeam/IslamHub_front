-- ============================================================================
-- Coran thématique × Équivoque
-- Permet de marquer un verset thématique (table `coran`) comme « équivoque »,
-- exactement comme pour les hadiths : une fiche liée est créée dans
-- `versets_equivoques` (type='verset', coran_id renseigné), où l'on saisit les
-- arguments ; un lien apparaît alors depuis la page « Versets par thème ».
--
-- À exécuter dans le SQL Editor de Supabase (idempotent).
-- ============================================================================

-- 1) Colonne de liaison coran -> versets_equivoques -----------------------------
alter table public.versets_equivoques
  add column if not exists coran_id bigint references public.coran(id) on delete set null;

create index if not exists idx_versets_equivoques_coran_id
  on public.versets_equivoques (coran_id);

-- 2) admin_save_coran : gère le drapeau is_equivoque ---------------------------
create or replace function public.admin_save_coran(p jsonb)
 returns bigint
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id bigint := nullif(p->>'id','')::bigint;
  v_has_eq_flag boolean := p ? 'is_equivoque';
  v_is_eq boolean := coalesce((p->>'is_equivoque')::boolean, false);
  v_eq_id bigint; v_eq_slug text; v_eq_theme text; v_sourate text;
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;

  if v_id is null then
    insert into public.coran (sujet, sourate, texte_arabe, texte_francais, phonetique, explication, tag)
    values (btrim(p->>'sujet'), nullif(btrim(p->>'sourate'),''), btrim(p->>'texte_arabe'),
            nullif(p->>'texte_francais',''), nullif(p->>'phonetique',''), nullif(p->>'explication',''),
            nullif(p->>'tag',''))
    returning id into v_id;
  else
    update public.coran set sujet=btrim(p->>'sujet'), sourate=nullif(btrim(p->>'sourate'),''),
      texte_arabe=btrim(p->>'texte_arabe'), texte_francais=nullif(p->>'texte_francais',''),
      phonetique=nullif(p->>'phonetique',''), explication=nullif(p->>'explication',''),
      tag=nullif(p->>'tag','')
    where id=v_id;
  end if;

  delete from public.coran_themes where coran_id=v_id;
  insert into public.coran_themes (coran_id, theme_slug)
  select v_id, tt.theme_slug from unnest(string_to_array(coalesce(p->>'tag',''),',')) raw(tok)
  join public.theme_tags tt on regexp_replace(lower(btrim(tt.tag_token)),'\s+',' ','g')=regexp_replace(lower(btrim(raw.tok)),'\s+',' ','g')
  where btrim(raw.tok)<>'' on conflict do nothing;

  -- Lien verset ↔ fiche équivoque (seulement si le formulaire envoie le drapeau).
  if v_has_eq_flag then
    select id into v_eq_id from public.versets_equivoques where coran_id = v_id;
    if v_is_eq then
      v_eq_theme := coalesce(nullif(btrim(p->>'sujet'),''), 'Verset équivoque');
      v_sourate  := coalesce(nullif(btrim(p->>'sourate'),''), '');
      if v_eq_id is null then
        v_eq_slug := lower(regexp_replace(regexp_replace(public.unaccent(v_eq_theme),'[^a-zA-Z0-9]+','-','g'),'(^-+|-+$)','','g'));
        if v_eq_slug = '' then v_eq_slug := 'verset-equivoque'; end if;
        if exists (select 1 from public.versets_equivoques where slug = v_eq_slug) then v_eq_slug := v_eq_slug||'-'||floor(random()*100000)::text; end if;
        insert into public.versets_equivoques (slug, theme, sourate, type, verset_arabe, verset_traduction, verset_phonetique, coran_id, published)
        values (v_eq_slug, v_eq_theme, v_sourate, 'verset', btrim(p->>'texte_arabe'),
                nullif(p->>'texte_francais',''), nullif(p->>'phonetique',''), v_id, false);
      else
        update public.versets_equivoques set theme=v_eq_theme, type='verset', sourate=v_sourate,
          verset_arabe=btrim(p->>'texte_arabe'), verset_traduction=nullif(p->>'texte_francais',''),
          verset_phonetique=nullif(p->>'phonetique','')
        where id=v_eq_id;
      end if;
    else
      -- Décoché : on ne supprime que si la fiche équivoque liée est vide (aucun argument saisi).
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

-- 3) admin_get_coran : renvoie aussi l'état équivoque ---------------------------
create or replace function public.admin_get_coran(p_id bigint)
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  select row_to_json(x) from (
    select c.id, c.sujet, c.sourate, c.texte_arabe, c.texte_francais, c.phonetique, c.explication, c.tag,
           (ve.id is not null) as is_equivoque,
           ve.id   as equivoque_id,
           ve.slug as equivoque_slug
    from public.coran c
    left join public.versets_equivoques ve on ve.coran_id = c.id
    where c.id = p_id
  ) x;
$function$;

-- 4) search_coran : joint la fiche équivoque publiée (slug/thème/sens juste) -----
create or replace function public.search_coran(q text default ''::text, tag_filter text default ''::text, page_num integer default 0, page_size integer default 20)
 returns json
 language sql
 stable
 set search_path to 'public', 'pg_temp'
as $function$
  with filtered as (
    select * from coran c
    where (q = '' or (
        c.texte_arabe ilike '%'||q||'%' or public.normalize_ar(c.texte_arabe) ilike '%'||public.normalize_ar(q)||'%' or
        c.texte_francais ilike '%'||q||'%' or
        c.sujet ilike '%'||q||'%' or c.sourate ilike '%'||q||'%' or
        c.explication ilike '%'||q||'%' or c.phonetique ilike '%'||q||'%' or c.tag ilike '%'||q||'%'))
      and (tag_filter = '' or btrim(c.sujet) ilike btrim(tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select f.id, f.sujet, f.sourate, f.texte_arabe, f.texte_francais, f.phonetique as "phonétique",
               f.explication, f.tag,
               (select json_build_object('slug', v.slug, 'theme', v.theme, 'sens_juste', v.sens_juste)
                  from public.versets_equivoques v
                  where v.coran_id = f.id and coalesce(v.published,false) = true limit 1) as equivoque
        from filtered f order by f.id limit page_size offset page_num*page_size) x), '[]'::json));
$function$;
