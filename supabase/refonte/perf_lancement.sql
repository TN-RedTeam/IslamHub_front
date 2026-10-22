-- ============================================================================
-- Performance — remédiation avant lancement (advisors Supabase)
-- ============================================================================
-- Sûr : n'altère aucune donnée. Les CREATE INDEX sont IF NOT EXISTS ;
-- les DROP ne visent que des index redondants/inutilisés et des sauvegardes.
-- Mesure « avant » : 24 FK sans index, 28 index inutilisés, 1 index dupliqué,
-- 9 policies SELECT permissives en double.
-- ============================================================================

-- 1) Index couvrants pour toutes les clés étrangères mono-colonne qui n'en ont
--    pas (accélère les jointures : hadith_narrateurs, paroles, savants, etc.).
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and c.connamespace = 'public'::regnamespace
      and array_length(c.conkey, 1) = 1
      and not exists (
        select 1 from pg_index i
        where i.indrelid = c.conrelid and (i.indkey::smallint[])[0] = c.conkey[1]
      )
  loop
    execute format(
      'create index if not exists %I on %s (%I)',
      'idx_' || replace(r.tbl::text, 'public.', '') || '_' || r.col, r.tbl, r.col
    );
  end loop;
end$$;

-- 2) Supprimer l'index DUPLIQUÉ sur paroles (garder la version unique).
drop index if exists public.paroles_slug_idx;

-- 3) Index INUTILISÉS (vestiges du modèle i18n « lignes par langue », abandonné
--    au profit des colonnes par langue). Sûr à supprimer ; recréables au besoin.
drop index if exists public.coran_tg_idx, public.invocations_tg_idx, public.dossiers_tg_idx,
  public.exposes_tg_idx, public.exposes_locale_idx, public.versets_equivoques_tg_idx,
  public.questions_tg_idx, public.femmes_tg_idx, public.fiqh_tg_idx, public.recits_tg_idx,
  public.noms_allah_tg_idx, public.noms_allah_locale_idx, public.attributs_tg_idx,
  public.recueils_tg_idx, public.recueils_locale_idx, public.recueils_commente_idx,
  public.narrateurs_tg_idx, public.narrateurs_locale_idx, public.attribut_citations_tg_idx,
  public.attribut_citations_locale_idx, public.contenu_blocs_tg_idx, public.contenu_blocs_locale_idx,
  public.exegeses_locale_idx, public.question_themes_theme_idx, public.multimedia_dossier_id_idx,
  public.paroles_search_fr_idx, public.paroles_arabe_norm_trgm_idx, public.idx_fiqh_ecole;

-- 4) Policies SELECT permissives EN DOUBLE (même rôle/action) → garder une seule.
--    Doublons exacts « Public read » / « public read » (casse différente).
drop policy if exists "public read" on public.dhikrs;
drop policy if exists "public read" on public.douaas;
drop policy if exists "public read" on public.multimedia;
-- NB : questions/question_dossiers/question_themes ont public_read + admin_write
--      (deux policies DISTINCTES, pas des doublons) → laissées telles quelles.

-- 5) Rappel : supprimer les tables de sauvegarde (voir securite_lancement.sql §1bis)
--    règle aussi « no_primary_key » (31) et « rls_disabled » sur ces tables.

-- ---- PREUVE (relancer les advisors après) : FK indexées, 0 doublon. ----
select count(*) as fk_sans_index
from pg_constraint c
where c.contype='f' and c.connamespace='public'::regnamespace
  and array_length(c.conkey,1)=1
  and not exists (select 1 from pg_index i where i.indrelid=c.conrelid and (i.indkey::smallint[])[0]=c.conkey[1]);
-- Attendu : 0.
