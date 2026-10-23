-- ============================================================================
-- Durcissement « ceinture + bretelles » — EXECUTE des fonctions admin_*
-- ============================================================================
-- Par défaut PostgreSQL accorde EXECUTE à PUBLIC (donc anon + authenticated) sur
-- toute fonction. Les fonctions admin_* sont déjà verrouillées À L'INTÉRIEUR par
-- is_admin() (elles lèvent une exception sinon) — c'est le vrai verrou. Ce script
-- ajoute une défense en profondeur : les visiteurs DÉCONNECTÉS (rôle anon) ne
-- peuvent même plus APPELER ces fonctions (refus au niveau permission, avant
-- d'entrer dans le corps).
--
-- IMPORTANT : on CONSERVE EXECUTE pour `authenticated`. L'administrateur se
-- connecte via Supabase Auth → il a le rôle `authenticated` ; le lui retirer
-- casserait tout le back-office. Le lint Supabase « Signed-In Users Can Execute
-- SECURITY DEFINER » restera donc affiché pour ces fonctions : c'est ATTENDU et
-- sans risque, puisque is_admin() filtre tout appelant non-admin.
--
-- Ne touche QUE les fonctions public.admin_*  →  les RPC publiques (questions_all,
-- get_question, get_blocs, search_all, …) gardent leur accès anonyme intact.
-- Idempotent, non destructif. Couvre automatiquement les futures fonctions admin_*
-- si on le relance.
-- ============================================================================

do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure::text as sig
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname like 'admin\_%'
  loop
    -- retire l'accès hérité de PUBLIC et tout accès direct d'anon…
    execute format('revoke execute on function %s from public;', r.sig);
    execute format('revoke execute on function %s from anon;', r.sig);
    -- …puis ré-accorde explicitement à l'administrateur connecté.
    execute format('grant execute on function %s to authenticated;', r.sig);
  end loop;
end $$;

-- ---- PREUVE : anon ne doit plus avoir EXECUTE sur aucune admin_* ------------
-- (doit renvoyer 0 ligne)
select p.proname,
       has_function_privilege('anon',          p.oid, 'execute') as anon_peut,
       has_function_privilege('authenticated',  p.oid, 'execute') as admin_peut
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname like 'admin\_%'
  and has_function_privilege('anon', p.oid, 'execute')   -- ne liste que les restants
order by p.proname;
