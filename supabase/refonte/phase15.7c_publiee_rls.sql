-- ============================================================================
-- Phase 15.7 — vague c : durcir `publiee` au niveau RLS (brouillons cachés)
-- ============================================================================
-- Les RPC de lecture sont SECURITY INVOKER → elles tournent sous l'identité de
-- l'appelant, donc la RLS s'applique. En durcissant la policy de lecture des
-- tables de contenu (`using(<flag de publication>)`), TOUS les reads cachent
-- d'un coup les brouillons (publiee/published = false), SANS toucher une seule
-- RPC. Et le repli locale-aware reste correct : le sous-select « existe-t-il un
-- équivalent EN publié ? » tourne lui aussi sous RLS et ne voit que le publié,
-- donc un brouillon EN ne masque pas le repli FR.
--
-- L'admin garde l'accès complet : `or public.is_admin()` dans la policy, et les
-- lectures d'édition passent de toute façon par des RPC admin SECURITY DEFINER.
--
-- NON DESTRUCTIF : on ne touche qu'aux policies SELECT (les policies d'écriture
-- admin sont intactes). Tout le contenu actuel est publiee=true → rien ne
-- disparaît ; seuls les futurs brouillons (dont les traductions 15.7) sont cachés.
-- ============================================================================

do $pub$
declare
  r record;
  tbls text[] := array['hadiths','paroles','coran','invocations','savants','sourates','femmes','fiqh',
                       'dossiers','exposes','recits','versets_equivoques'];
  pubs text[] := array['publiee','publiee','publiee','publiee','publiee','publiee','publiee','publiee',
                       'published','published','published','published'];
  i int; t text; pub text;
begin
  for i in 1..array_length(tbls,1) loop
    t := tbls[i]; pub := pubs[i];
    -- retirer toutes les policies de LECTURE existantes (toutes en using(true))
    for r in select policyname from pg_policies
             where schemaname='public' and tablename=t and cmd='SELECT' loop
      execute format('drop policy if exists %I on public.%I', r.policyname, t);
    end loop;
    -- policy de lecture durcie : public → seulement publié ; admin → tout
    execute format(
      'create policy %I on public.%I for select to public using (%I or public.is_admin())',
      t||'_public_read', t, pub);
  end loop;
end $pub$;

-- ---- PREUVE : une seule policy SELECT durcie par table ---------------------
select tablename, policyname, qual
from pg_policies
where schemaname='public'
  and tablename in ('hadiths','paroles','coran','invocations','savants','sourates','femmes','fiqh',
                    'dossiers','exposes','recits','versets_equivoques')
  and cmd='SELECT'
order by tablename;
