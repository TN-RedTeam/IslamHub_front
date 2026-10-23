-- ============================================================================
-- « Questions fréquentes » — sous-partie 3 : maillage RÉCIPROQUE dossier → questions
-- ============================================================================
-- questions_for_dossier(p_dossier_id, p_locale) : les questions publiées
--   rattachées à un dossier (via question_dossiers), pour afficher sur la page
--   dossier un bloc « Questions fréquentes sur ce thème » (maillage pilier →
--   grappe, cœur du SEO interne décrit au §3 du cahier des charges).
-- Réutilise la table de liaison existante question_dossiers — aucune nouvelle
-- infra. Mêmes conventions que questions_all : une ligne par translation_group
-- (repli FR pour 'en', strict 'ar'), publiee + RLS respectés (SECURITY INVOKER).
-- La forme RAPPORTÉE du titre est appliquée côté client (reportedQuestionTitle) ;
-- on renvoie la question brute, comme questions_all/get_question.
-- À appliquer après questions_02_rpc_public.sql. Non destructif.
-- ============================================================================

create or replace function public.questions_for_dossier(p_dossier_id bigint, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public','pg_temp'
as $function$
  with picked as (
    select q.id, q.slug, q.question, q.reponse_courte, q.ordre,
           row_number() over (
             partition by q.translation_group
             order by case q.locale when p_locale then 0 when 'fr' then 1 else 2 end
           ) as rn
    from public.questions q
    join public.question_dossiers qd on qd.question_id = q.id
    where qd.dossier_id = p_dossier_id
      and q.publiee and (q.locale = p_locale or (p_locale <> 'ar' and q.locale = 'fr'))
  )
  select coalesce(json_agg(json_build_object(
      'slug', p.slug,
      'question', p.question,
      'reponse_courte', p.reponse_courte
    ) order by p.ordre, p.question), '[]'::json)
  from picked p where p.rn = 1;
$function$;

-- ---- PREUVE : la RPC existe et compte ses liaisons -------------------------
select proname, pg_get_function_identity_arguments(oid) as args
from pg_proc where pronamespace = 'public'::regnamespace and proname = 'questions_for_dossier';
