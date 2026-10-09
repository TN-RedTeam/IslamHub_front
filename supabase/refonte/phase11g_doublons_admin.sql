-- ============================================================================
-- Phase 11g — Outil admin « Doublons potentiels » (hadiths, paroles, invocations)
-- ============================================================================
-- Détection par similarité trigramme (pg_trgm) sur le texte arabe normalisé.
-- Contrairement au hash (qui ne voit que les textes quasi identiques), ceci
-- surface aussi les contenus REFORMULÉS (même sens, mots différents) à réviser.
-- Sortie unifiée : a_meta/b_meta = rubrique (hadith) | savant (parole) | type
-- (invocation). Réservé à l'administrateur. Lecture → appliqué via le MCP.
-- ============================================================================

-- Hadiths : meta = rubrique
create or replace function public.hadith_doublons_potentiels(p_min double precision default 0.6, p_limit integer default 100)
 returns json language plpgsql stable set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (select id, public.normalize_ar(texte_arabe) k from public.hadiths where texte_arabe is not null and length(btrim(texte_arabe)) > 12),
    pairs as (select a.id a_id, b.id b_id, similarity(a.k, b.k) sim from base a join base b on a.id < b.id and similarity(a.k, b.k) >= p_min)
    select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
      select p.a_id, p.b_id, round(p.sim::numeric, 2) as sim,
             ha.sujet as a_sujet, hb.sujet as b_sujet, ha.rubrique as a_meta, hb.rubrique as b_meta,
             ha.texte_arabe as a_arabe, hb.texte_arabe as b_arabe,
             left(coalesce(ha.texte_francais,''),220) as a_trad, left(coalesce(hb.texte_francais,''),220) as b_trad,
             (select count(*) from public.hadith_sources s where s.hadith_id=ha.id) as a_src,
             (select count(*) from public.hadith_sources s where s.hadith_id=hb.id) as b_src
      from pairs p join public.hadiths ha on ha.id=p.a_id join public.hadiths hb on hb.id=p.b_id
      order by p.sim desc, p.a_id limit p_limit
    ) r
  );
end;
$function$;

-- Paroles : meta = savant ; src = présence d'une source_livre
create or replace function public.parole_doublons_potentiels(p_min double precision default 0.6, p_limit integer default 100)
 returns json language plpgsql stable set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (select id, public.normalize_ar(texte_arabe) k from public.paroles where texte_arabe is not null and length(btrim(texte_arabe)) > 12),
    pairs as (select a.id a_id, b.id b_id, similarity(a.k, b.k) sim from base a join base b on a.id < b.id and similarity(a.k, b.k) >= p_min)
    select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
      select p.a_id, p.b_id, round(p.sim::numeric, 2) as sim,
             pa.sujet as a_sujet, pb.sujet as b_sujet, pa.savant as a_meta, pb.savant as b_meta,
             pa.texte_arabe as a_arabe, pb.texte_arabe as b_arabe,
             left(coalesce(pa.texte_francais,''),220) as a_trad, left(coalesce(pb.texte_francais,''),220) as b_trad,
             (case when coalesce(btrim(pa.source_livre),'')<>'' then 1 else 0 end) as a_src,
             (case when coalesce(btrim(pb.source_livre),'')<>'' then 1 else 0 end) as b_src
      from pairs p join public.paroles pa on pa.id=p.a_id join public.paroles pb on pb.id=p.b_id
      order by p.sim desc, p.a_id limit p_limit
    ) r
  );
end;
$function$;

-- Invocations / Évocations : meta = type (1=Invocation, 2=Évocation)
create or replace function public.invocation_doublons_potentiels(p_min double precision default 0.6, p_limit integer default 100)
 returns json language plpgsql stable set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (select id, public.normalize_ar(texte_arabe) k from public.invocations where texte_arabe is not null and length(btrim(texte_arabe)) > 12),
    pairs as (select a.id a_id, b.id b_id, similarity(a.k, b.k) sim from base a join base b on a.id < b.id and similarity(a.k, b.k) >= p_min)
    select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
      select p.a_id, p.b_id, round(p.sim::numeric, 2) as sim,
             ia.sujet as a_sujet, ib.sujet as b_sujet,
             case ia.type_id when 2 then 'Évocation' else 'Invocation' end as a_meta,
             case ib.type_id when 2 then 'Évocation' else 'Invocation' end as b_meta,
             ia.texte_arabe as a_arabe, ib.texte_arabe as b_arabe,
             left(coalesce(ia.texte_francais,''),220) as a_trad, left(coalesce(ib.texte_francais,''),220) as b_trad,
             0 as a_src, 0 as b_src
      from pairs p join public.invocations ia on ia.id=p.a_id join public.invocations ib on ib.id=p.b_id
      order by p.sim desc, p.a_id limit p_limit
    ) r
  );
end;
$function$;
