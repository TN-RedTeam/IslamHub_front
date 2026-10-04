-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Gestionnaire de tags (admin) — vue d'ensemble, fusion, ajout, vocab   ║
-- ║  À exécuter dans Supabase → SQL Editor (Run).                          ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- Helper : réécrit une liste CSV de tags (remplace des variantes par une cible,
-- ou les retire si cible vide), en dédupliquant et en préservant l'ordre.
create or replace function public.admin_rewrite_tags(csv text, p_sources text[], p_target text)
returns text language sql immutable as $$
  select nullif(string_agg(tok, ', ' order by o), '')
  from (
    select tok, min(ord) o
    from (
      select case when btrim(t) = any (select btrim(s) from unnest(p_sources) s)
                  then nullif(btrim(p_target),'')
                  else btrim(t) end as tok,
             ordinality as ord
      from unnest(string_to_array(csv, ',')) with ordinality as u(t, ordinality)
      where btrim(t) <> ''
    ) m
    where tok is not null
    group by tok
  ) d;
$$;

-- Fusion / renommage / suppression d'un tag partout (colonnes libres + vocabulaire).
-- p_target vide = suppression. Renommer = merge([ancien], nouveau).
create or replace function public.admin_merge_tags(p_sources text[], p_target text)
returns integer language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare n int := 0; v int; tbl text;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  foreach tbl in array array['hadiths','paroles','coran','invocations','fiqh'] loop
    execute format(
      'update public.%I set tag = public.admin_rewrite_tags(tag, $1, $2)
         where tag is not null and exists (
           select 1 from unnest(string_to_array(tag,'','')) t
           where btrim(t) = any (select btrim(s) from unnest($1) s))', tbl)
      using p_sources, p_target;
    get diagnostics v = row_count; n := n + v;
  end loop;
  delete from public.tags where btrim(nom) = any (select btrim(s) from unnest(p_sources) s);
  if nullif(btrim(p_target),'') is not null
     and not exists (select 1 from public.tags where lower(btrim(nom)) = lower(btrim(p_target))) then
    insert into public.tags (nom, slug)
    values (btrim(p_target), trim(both '-' from lower(regexp_replace(public.unaccent(btrim(p_target)),'[^a-zA-Z0-9]+','-','g'))));
  end if;
  return n;
end $$;

-- Ajouter un tag au vocabulaire (sans le rattacher encore).
create or replace function public.admin_add_tag(p_nom text)
returns void language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  if nullif(btrim(p_nom),'') is null then return; end if;
  if not exists (select 1 from public.tags where lower(btrim(nom)) = lower(btrim(p_nom))) then
    insert into public.tags (nom, slug)
    values (btrim(p_nom), trim(both '-' from lower(regexp_replace(public.unaccent(btrim(p_nom)),'[^a-zA-Z0-9]+','-','g'))));
  end if;
end $$;

-- Vue d'ensemble : chaque tag + compteurs par rubrique + présence au vocabulaire.
create or replace function public.admin_tags_overview()
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    with used as (
      select btrim(t) tok, 'hadiths' rub from public.hadiths, unnest(string_to_array(tag,',')) t where coalesce(tag,'')<>''
      union all select btrim(t),'paroles' from public.paroles, unnest(string_to_array(tag,',')) t where coalesce(tag,'')<>''
      union all select btrim(t),'coran' from public.coran, unnest(string_to_array(tag,',')) t where coalesce(tag,'')<>''
      union all select btrim(t),'invocations' from public.invocations, unnest(string_to_array(tag,',')) t where coalesce(tag,'')<>''
      union all select btrim(t),'fiqh' from public.fiqh, unnest(string_to_array(tag,',')) t where coalesce(tag,'')<>''
    ),
    agg as (
      select tok, count(*) total,
        count(*) filter (where rub='hadiths') h, count(*) filter (where rub='paroles') p,
        count(*) filter (where rub='coran') c, count(*) filter (where rub='invocations') i,
        count(*) filter (where rub='fiqh') f
      from used where tok<>'' group by tok
    ),
    vocab as (select btrim(nom) tok from public.tags where nullif(btrim(nom),'') is not null)
    select json_agg(json_build_object(
      'tag', tok, 'total', coalesce(total,0), 'hadiths', coalesce(h,0), 'paroles', coalesce(p,0),
      'coran', coalesce(c,0), 'invocations', coalesce(i,0), 'fiqh', coalesce(f,0), 'in_vocab', inv)
      order by lower(public.unaccent(tok)))
    from (
      select coalesce(a.tok, v.tok) tok, a.total, a.h, a.p, a.c, a.i, a.f, (v.tok is not null) inv
      from agg a full outer join vocab v on lower(btrim(a.tok)) = lower(btrim(v.tok))
    ) z
  ), '[]'::json);
end $$;

-- Vocabulaire plat pour l'autocomplétion des formulaires.
create or replace function public.admin_tags_vocabulary()
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(tok order by lower(public.unaccent(tok)))
    from (
      select distinct btrim(t) tok from (
        select unnest(string_to_array(tag,',')) t from public.hadiths where coalesce(tag,'')<>''
        union all select unnest(string_to_array(tag,',')) from public.paroles where coalesce(tag,'')<>''
        union all select unnest(string_to_array(tag,',')) from public.coran where coalesce(tag,'')<>''
        union all select unnest(string_to_array(tag,',')) from public.invocations where coalesce(tag,'')<>''
        union all select unnest(string_to_array(tag,',')) from public.fiqh where coalesce(tag,'')<>''
        union all select nom from public.tags
      ) u(t) where nullif(btrim(t),'') is not null
    ) d
  ), '[]'::json);
end $$;

-- Contenus rattachés à un tag (drill-down depuis le gestionnaire).
create or replace function public.admin_tag_contents(p_tag text)
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(row_to_json(x) order by x.rubrique, x.titre) from (
      select 'hadiths' rubrique, id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') titre from public.hadiths
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'paroles', id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') from public.paroles
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'coran', id, coalesce(nullif(btrim(sujet),''),'(verset)') from public.coran
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'invocations', id, coalesce(nullif(btrim(sujet),''),'(invocation)') from public.invocations
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
      union all select 'fiqh', id, coalesce(nullif(btrim(sujet),''),'(fiqh)') from public.fiqh
        where exists (select 1 from unnest(string_to_array(tag,',')) t where btrim(t)=btrim(p_tag))
    ) x
  ), '[]'::json);
end $$;
