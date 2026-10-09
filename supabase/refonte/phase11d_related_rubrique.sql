-- ============================================================================
-- Phase 11d — « Sur le même thème » priorise la rubrique (préfixe du sujet)
-- ============================================================================
-- Problème : related_by_theme ne s'appuyait que sur les thèmes (déduits des
-- tags). Un hadith dont le seul thème est un méga-thème (ex. « peches-interdits »
-- = 71 hadiths) se voyait proposer des hadiths sans rapport, triés par id.
--
-- Correctif : on exploite la convention de titre « Rubrique: sous-sujet ».
-- La fonction propose d'abord les contenus de la MÊME RUBRIQUE (texte avant le
-- premier « : »), puis complète avec les contenus partageant un thème.
-- Fonctionne pour hadiths, paroles et versets (coran), qui suivent la même
-- convention. Aucune réorganisation des données : pure fonction de lecture.
--
-- LANGUAGE sql STABLE → appliqué via le MCP Supabase. Idempotent.
-- ============================================================================
create or replace function public.related_by_theme(p_kind text, p_id bigint, p_limit integer default 8)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with me as (
    select case
      when p_kind='hadith' then (select h.sujet from public.hadiths h where h.id=p_id)
      when p_kind='parole' then (select pa.sujet from public.paroles pa where pa.id=p_id)
      when p_kind in ('verset','coran') then (select c.sujet from public.coran c where c.id=p_id)
    end as sujet
  ),
  rub as (
    select nullif(btrim(split_part((select sujet from me), ':', 1)), '') as rubrique
  ),
  mine as (
    select ht.theme_slug from public.hadith_themes ht where p_kind='hadith' and ht.hadith_id=p_id
    union select pt.theme_slug from public.parole_themes pt where p_kind='parole' and pt.parole_id=p_id
    union select ct.theme_slug from public.coran_themes ct where p_kind in ('verset','coran') and ct.coran_id=p_id
  ),
  -- 1) même rubrique (préfixe avant ':') : priorité 0
  by_rub as (
    select 0 as prio, 'hadith'::text as kind, h.id, h.slug, h.sujet, null::text as savant, null::text as sourate
    from public.hadiths h, rub
    where rub.rubrique is not null and btrim(split_part(h.sujet, ':', 1)) = rub.rubrique
      and not (p_kind='hadith' and h.id=p_id)
    union all
    select 0, 'parole', pa.id, pa.slug, pa.sujet, coalesce(sv.nom, pa.savant), null
    from public.paroles pa left join public.savants sv on sv.id=pa.savant_id, rub
    where rub.rubrique is not null and btrim(split_part(pa.sujet, ':', 1)) = rub.rubrique
      and not (p_kind='parole' and pa.id=p_id)
    union all
    select 0, 'verset', c.id, null, c.sujet, null, c.sourate
    from public.coran c, rub
    where rub.rubrique is not null and btrim(split_part(c.sujet, ':', 1)) = rub.rubrique
      and not (p_kind in ('verset','coran') and c.id=p_id)
  ),
  -- 2) thèmes partagés : priorité 1 (complément)
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
    -- si un contenu est à la fois même-rubrique et même-thème, on garde la prio la plus basse (0)
    select distinct on (kind, id) prio, kind, id, slug, sujet, savant, sourate
    from combined order by kind, id, prio
  )
  select coalesce(json_agg(row_to_json(r)), '[]'::json)
  from (select kind, id, slug, sujet, savant, sourate from ranked order by prio, kind, id limit p_limit) r;
$function$;
