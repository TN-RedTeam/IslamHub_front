-- ============================================================================
-- Audit FAQ (Règle B) — détecter toute page Question « coquille »
-- ============================================================================
-- Règle B : chaque page Question se suffit à elle-même (réponse courte +/-
-- développement sourcé sur la MÊME page). Une page publiée sans réponse courte
-- ET sans bloc = coquille (ne ferait que renvoyer ailleurs) → à compléter.
-- Lecture seule. À relancer après avoir ajouté/publié des questions.
-- Au 2026-10-23 : 2 publiées, 0 coquille.
-- ============================================================================

-- Compteurs
select
  count(*) filter (where publiee) as publiees,
  count(*) filter (where publiee and coalesce(btrim(reponse_courte), '') = '') as sans_reponse_courte,
  count(*) filter (where publiee and not exists (
      select 1 from public.contenu_blocs b
      where b.parent_type = 'question' and b.parent_id = q.id::text)) as sans_blocs,
  count(*) filter (where publiee and coalesce(btrim(reponse_courte), '') = ''
      and not exists (select 1 from public.contenu_blocs b
                      where b.parent_type = 'question' and b.parent_id = q.id::text)) as coquilles
from public.questions q;

-- Liste détaillée des coquilles éventuelles (doit être vide)
select q.slug, q.question
from public.questions q
where q.publiee
  and coalesce(btrim(q.reponse_courte), '') = ''
  and not exists (select 1 from public.contenu_blocs b
                  where b.parent_type = 'question' and b.parent_id = q.id::text)
order by q.slug;
