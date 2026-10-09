-- ============================================================================
-- Phase 11g — Outil admin « Doublons potentiels » (hadiths)
-- ============================================================================
-- Détection par similarité trigramme (pg_trgm) sur le texte arabe normalisé.
-- Contrairement au hash (qui ne voit que les textes quasi identiques), ceci
-- surface aussi les hadiths REFORMULÉS (même sens, mots différents) à réviser.
-- Réservé à l'administrateur. Fonction de lecture → appliquée via le MCP.
-- ============================================================================
create or replace function public.hadith_doublons_potentiels(p_min double precision default 0.6, p_limit integer default 100)
 returns json language plpgsql stable set search_path to 'public','pg_temp'
as $function$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur.'; end if;
  return (
    with base as (
      select id, public.normalize_ar(texte_arabe) k from public.hadiths
      where texte_arabe is not null and length(btrim(texte_arabe)) > 12
    ),
    pairs as (
      select a.id a_id, b.id b_id, similarity(a.k, b.k) sim
      from base a join base b on a.id < b.id and similarity(a.k, b.k) >= p_min
    )
    select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
      select p.a_id, p.b_id, round(p.sim::numeric, 2) as sim,
             ha.sujet as a_sujet, hb.sujet as b_sujet,
             ha.rubrique as a_rubrique, hb.rubrique as b_rubrique,
             ha.texte_arabe as a_arabe, hb.texte_arabe as b_arabe,
             left(coalesce(ha.texte_francais,''),220) as a_trad,
             left(coalesce(hb.texte_francais,''),220) as b_trad,
             (select count(*) from public.hadith_sources s where s.hadith_id=ha.id) as a_src,
             (select count(*) from public.hadith_sources s where s.hadith_id=hb.id) as b_src
      from pairs p
      join public.hadiths ha on ha.id = p.a_id
      join public.hadiths hb on hb.id = p.b_id
      order by p.sim desc, p.a_id
      limit p_limit
    ) r
  );
end;
$function$;
