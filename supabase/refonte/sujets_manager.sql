-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  Gestionnaire de sujets (admin) — vue d'ensemble, fusion, vocab        ║
-- ║  `sujet` = UNE valeur par fiche. À exécuter dans Supabase → SQL Editor.║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- Vue d'ensemble : chaque sujet distinct + compteurs par rubrique.
create or replace function public.admin_sujets_overview()
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    with s as (
      select btrim(sujet) suj, 'hadiths' rub from public.hadiths where coalesce(btrim(sujet),'')<>''
      union all select btrim(sujet),'paroles' from public.paroles where coalesce(btrim(sujet),'')<>''
      union all select btrim(sujet),'coran' from public.coran where coalesce(btrim(sujet),'')<>''
      union all select btrim(sujet),'invocations' from public.invocations where coalesce(btrim(sujet),'')<>''
      union all select btrim(sujet),'fiqh' from public.fiqh where coalesce(btrim(sujet),'')<>''
    )
    select json_agg(json_build_object(
      'sujet', suj, 'total', total, 'hadiths', h, 'paroles', p, 'coran', c, 'invocations', i, 'fiqh', f)
      order by lower(public.unaccent(suj)))
    from (
      select suj, count(*) total,
        count(*) filter (where rub='hadiths') h, count(*) filter (where rub='paroles') p,
        count(*) filter (where rub='coran') c, count(*) filter (where rub='invocations') i,
        count(*) filter (where rub='fiqh') f
      from s group by suj
    ) x
  ), '[]'::json);
end $$;

-- Fusion / renommage / suppression d'un sujet (valeur unique).
-- p_target vide = vider le sujet (null). Renommer = merge([ancien], nouveau).
create or replace function public.admin_merge_sujets(p_sources text[], p_target text)
returns integer language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare n int := 0; v int; tbl text;
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  foreach tbl in array array['hadiths','paroles','coran','invocations','fiqh'] loop
    execute format(
      'update public.%I set sujet = $2
         where btrim(sujet) = any (select btrim(s) from unnest($1) s)', tbl)
      using p_sources, nullif(btrim(p_target),'');
    get diagnostics v = row_count; n := n + v;
  end loop;
  return n;
end $$;

-- Vocabulaire plat pour l'autocomplétion du champ « sujet ».
create or replace function public.admin_sujets_vocabulary()
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(suj order by lower(public.unaccent(suj)))
    from (
      select distinct btrim(suj) suj from (
        select sujet suj from public.hadiths
        union all select sujet from public.paroles
        union all select sujet from public.coran
        union all select sujet from public.invocations
        union all select sujet from public.fiqh
      ) u where nullif(btrim(suj),'') is not null
    ) d
  ), '[]'::json);
end $$;

-- Contenus portant un sujet donné (drill-down depuis le gestionnaire).
create or replace function public.admin_sujet_contents(p_sujet text)
returns json language plpgsql security definer set search_path to 'public','pg_temp' as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return coalesce((
    select json_agg(row_to_json(x) order by x.rubrique, x.titre) from (
      select 'hadiths' rubrique, id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') titre from public.hadiths where btrim(sujet)=btrim(p_sujet)
      union all select 'paroles', id, coalesce(nullif(btrim(sujet),''),'(sans sujet)') from public.paroles where btrim(sujet)=btrim(p_sujet)
      union all select 'coran', id, coalesce(nullif(btrim(sujet),''),'(verset)') from public.coran where btrim(sujet)=btrim(p_sujet)
      union all select 'invocations', id, coalesce(nullif(btrim(sujet),''),'(invocation)') from public.invocations where btrim(sujet)=btrim(p_sujet)
      union all select 'fiqh', id, coalesce(nullif(btrim(sujet),''),'(fiqh)') from public.fiqh where btrim(sujet)=btrim(p_sujet)
    ) x
  ), '[]'::json);
end $$;
