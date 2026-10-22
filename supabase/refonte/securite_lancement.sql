-- ============================================================================
-- Sécurité — remédiation avant lancement (advisors Supabase)
-- ============================================================================
-- Contexte vérifié :
--   • Toutes les tables de contenu LIVE ont RLS activé + écriture = is_admin().
--   • Toutes les fonctions admin_* SECURITY DEFINER vérifient is_admin().
--   • Reste : tables de SAUVEGARDE de migration (RLS off) + 1 fonction à durcir.
-- Sûr : ne touche AUCUNE table live ni aucune policy existante.
-- ============================================================================

-- 1) Verrouiller les 13 tables de sauvegarde exposées (RLS désactivé → ERROR).
--    RLS activé SANS policy = aucun accès (ni lecture ni écriture) par anon.
--    Aucune perte de données. (Voir §1bis pour les supprimer carrément.)
alter table if exists public.coran_backup_phase15               enable row level security;
alter table if exists public.dossiers_backup_phase15            enable row level security;
alter table if exists public.exposes_backup_phase15             enable row level security;
alter table if exists public.femmes_backup_phase14              enable row level security;
alter table if exists public.femmes_backup_phase15              enable row level security;
alter table if exists public.fiqh_backup_phase15                enable row level security;
alter table if exists public.hadiths_backup_phase15            enable row level security;
alter table if exists public.invocations_backup_phase15         enable row level security;
alter table if exists public.paroles_backup_phase15            enable row level security;
alter table if exists public.recits_backup_phase15             enable row level security;
alter table if exists public.savants_backup_phase15            enable row level security;
alter table if exists public.sourates_backup_phase15          enable row level security;
alter table if exists public.versets_equivoques_backup_phase15 enable row level security;

-- 1bis) RECOMMANDÉ à terme : supprimer ces sauvegardes de migration (les données
--       vivantes sont dans les tables normales). Décommente après avoir vérifié
--       que tu n'en as plus besoin — opération IRRÉVERSIBLE.
-- drop table if exists public.coran_backup_phase15, public.dossiers_backup_phase15,
--   public.exposes_backup_phase15, public.femmes_backup_phase14, public.femmes_backup_phase15,
--   public.fiqh_backup_phase15, public.hadiths_backup_phase15, public.invocations_backup_phase15,
--   public.paroles_backup_phase15, public.recits_backup_phase15, public.savants_backup_phase15,
--   public.sourates_backup_phase15, public.versets_equivoques_backup_phase15,
--   public.hadiths_backup_phase1, public.savants_backup_phase10, public._bkp_p7_brackets,
--   public.attribut_citations_backup_phase15_5, public.attributs_backup_phase15_5,
--   public.contenu_blocs_backup_phase15_5, public.exegeses_backup_phase15_5,
--   public.narrateurs_backup_phase15_5, public.noms_allah_backup_phase15_5,
--   public.recueils_backup_phase15_5, public.tags_backup_phase15_5, public.themes_backup_phase15_5
--   cascade;

-- 2) Durcir le search_path de la seule fonction concernée (anti-hijack).
alter function if exists public.admin_rewrite_tags() set search_path = public, pg_temp;
-- NB : si admin_rewrite_tags a une signature avec paramètres, adapter la parenthèse.

-- 3) PREUVE : plus aucune table publique sans RLS.
select n.nspname, c.relname
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
order by c.relname;
-- Attendu : 0 ligne.

-- ----------------------------------------------------------------------------
-- 4) À FAIRE DANS LE DASHBOARD (pas en SQL) :
--    Auth → Providers/Policies → activer « Leaked password protection ».
--    (Dashboard > Authentication > Policies / Password security.)
-- ----------------------------------------------------------------------------
