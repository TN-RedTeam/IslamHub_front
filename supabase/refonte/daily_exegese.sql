-- ============================================================================
-- « Exégèse du jour » (accueil) — remplace le « verset du jour »
-- ============================================================================
-- Le verset du jour venait de la table `coran` (rubrique thématique sans page) :
-- cliquer dessus renvoyait vers /coran/sourates sans y trouver le verset.
-- On le remplace par une EXÉGÈSE du jour, tirée des sourates PUBLIÉES (qui, elles,
-- ont une page d'exégèse) → le lien /coran/sourates/<slug> est toujours valide.
--
-- daily_exegese(day, p_locale) : un verset + son exégèse, choisi de façon
-- DÉTERMINISTE par le jour (même pattern que daily_coran/daily_hadith).
-- SECURITY INVOKER (défaut) → la RLS « publié uniquement » s'applique.
-- ============================================================================

create or replace function public.daily_exegese(day integer, p_locale text default 'fr')
 returns json language sql stable set search_path to 'public', 'pg_temp'
as $function$
  with pool as (
    select e.id as exeg_id, v.numero, v.texte_arabe, v.texte_francais,
           e.texte as exegese, s.nom as sourate, s.slug
    from public.exegeses e
    join public.versets v on v.id = e.verset_id
    join public.sourates s on s.id = v.sourate_id
    where s.publiee and s.locale = p_locale and e.locale = p_locale
  )
  select row_to_json(x) from (
    select numero, texte_arabe, texte_francais, exegese, sourate, slug
    from pool
    order by exeg_id
    offset (day % greatest((select count(*) from pool), 1)) limit 1
  ) x;
$function$;

-- ---- PREUVE : l'exégèse du jour (jour 42) renvoie bien un verset + une sourate --
select public.daily_exegese(42, 'fr') as exegese_du_jour;
