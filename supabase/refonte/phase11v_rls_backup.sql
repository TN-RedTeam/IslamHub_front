-- ============================================================================
-- Phase 11v — Sécurité : activer RLS sur une table de sauvegarde exposée
-- ============================================================================
-- Advisor Supabase (critique) : public.savants_backup_phase10 est exposée via
-- PostgREST sans RLS → lisible avec la clé anon. Les autres sauvegardes
-- (hadiths_backup_phase1, admin_replace_backups) avaient déjà RLS activée.
--
-- RLS activée sans policy = aucun accès via l'API publique (anon/authenticated),
-- données conservées, fonctions SECURITY DEFINER inchangées (elles bypassent RLS).
-- ============================================================================
alter table public.savants_backup_phase10 enable row level security;

-- (Optionnel, plus tard) si ces sauvegardes ne servent plus :
-- drop table if exists public.savants_backup_phase10;
-- drop table if exists public.hadiths_backup_phase1;
