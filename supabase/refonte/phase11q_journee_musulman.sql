-- ============================================================================
-- Phase 11q — « La journée du musulman » (invocations par moment de la journée)
-- ============================================================================
-- Ajoute une classification « moments » (CSV de clés : reveil, ablutions,
-- matin, coucher…) sur les invocations. Une page publique chronologique affiche
-- les invocations/évocations rattachées, du réveil au coucher. Le vocabulaire
-- (clés + libellés + ordre) vit côté front (src/data/moments.ts).
-- Tout appliqué via le MCP (y compris l'écriture).
-- ============================================================================

-- Colonne
alter table public.invocations add column if not exists moments text;

-- Lecture admin (renvoie moments)
create or replace function public.admin_get_invocation(p_id bigint)
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select row_to_json(x) from (
    select id, type_id, sujet, texte_arabe, texte_francais, phonetique, explication, commentaire, tag, moments
    from public.invocations where id = p_id
  ) x;
$function$;

-- Lecture publique : invocations ayant au moins un moment
create or replace function public.journee_invocations()
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  select coalesce(json_agg(row_to_json(x) order by x.sujet), '[]'::json) from (
    select id, type_id, sujet, texte_arabe, texte_francais, phonetique, explication, commentaire, tag, moments
    from public.invocations
    where moments is not null and btrim(moments) <> ''
  ) x;
$function$;

-- Écriture (persiste moments)
CREATE OR REPLACE FUNCTION public.admin_save_invocation(p jsonb)
 RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $function$
declare v_id bigint := nullif(p->>'id','')::bigint;
        v_type smallint := coalesce(nullif(p->>'type_id','')::smallint, 1::smallint);
begin
  if not public.is_admin() then raise exception 'Écriture réservée à l''administrateur.'; end if;
  if v_type not in (1,2) then raise exception 'Type invalide (1=invocation, 2=évocation).'; end if;
  if v_id is null then
    insert into public.invocations (type_id, sujet, texte_arabe, texte_francais, phonetique, explication, commentaire, tag, moments)
    values (v_type, btrim(p->>'sujet'), btrim(p->>'texte_arabe'), nullif(p->>'texte_francais',''),
            nullif(p->>'phonetique',''), nullif(p->>'explication',''), nullif(p->>'commentaire',''), nullif(p->>'tag',''), nullif(btrim(p->>'moments'),''))
    returning id into v_id;
  else
    update public.invocations set type_id=v_type, sujet=btrim(p->>'sujet'), texte_arabe=btrim(p->>'texte_arabe'),
      texte_francais=nullif(p->>'texte_francais',''), phonetique=nullif(p->>'phonetique',''),
      explication=nullif(p->>'explication',''), commentaire=nullif(p->>'commentaire',''), tag=nullif(p->>'tag',''),
      moments=nullif(btrim(p->>'moments'),'')
    where id=v_id;
  end if;
  return v_id;
end $function$;
