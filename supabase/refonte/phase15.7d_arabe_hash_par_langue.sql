-- ============================================================================
-- Phase 15.7 — vague d : unicité de l'arabe PAR LANGUE (débloque la traduction)
-- ============================================================================
-- CONTEXTE. Les tables coran / hadiths / paroles ont une colonne GÉNÉRÉE
-- `arabe_hash` = md5(arabe normalisé), avec un index UNIQUE anti-doublon posé
-- sur l'arabe. Cet index était GLOBAL (toutes langues confondues).
--
-- PROBLÈME. Le modèle multilingue conserve VOLONTAIREMENT le même texte arabe
-- en FR/EN/AR d'un même translation_group. La copie de traduction régénère donc
-- le même hash → violation de `uniq_<table>_arabe_hash` :
--   « duplicate key value violates unique constraint "uniq_hadiths_arabe_hash" »
--
-- CORRECTIF. On remplace UNIQUE(arabe_hash) par UNIQUE(arabe_hash, locale).
--   • anti-doublon CONSERVÉ : deux entrées à l'arabe identique DANS une même
--     langue restent interdites (le doublon que la contrainte visait) ;
--   • le même arabe peut exister en fr / en / ar (langues différentes) ;
--   • arabe_hash NULL (pas d'arabe) : plusieurs NULL restent autorisés.
--
-- NON DESTRUCTIF. Le nouvel index est plus permissif que l'ancien : aucune
-- ligne existante ne peut le violer (l'ancien index global l'empêchait déjà).
--
-- NB. dhikrs / douaas ont aussi un `uniq_*_arabe_hash` mais PAS de colonne
-- `locale` et ne passent pas par le circuit de traduction → laissés tels quels.
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array['coran','hadiths','paroles'] loop
    execute format('drop index if exists public.uniq_%s_arabe_hash', t);
    execute format(
      'create unique index if not exists uniq_%1$s_arabe_hash_locale on public.%1$s (arabe_hash, locale)',
      t);
  end loop;
end $$;

-- ---- PREUVE : les index sont désormais (arabe_hash, locale) ----------------
select i.indrelid::regclass::text as table_name, c.relname as index_name,
       pg_get_indexdef(i.indexrelid) as index_def
from pg_index i
join pg_class c on c.oid = i.indexrelid
where c.relname in (
  'uniq_coran_arabe_hash_locale','uniq_hadiths_arabe_hash_locale','uniq_paroles_arabe_hash_locale'
)
order by table_name;
