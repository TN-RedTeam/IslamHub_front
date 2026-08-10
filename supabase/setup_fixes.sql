-- ============================================================
-- IslamHub — Corrections : stats home + anti-doublons (arabe_hash)
-- À EXÉCUTER dans Supabase → SQL Editor → Run. Idémpotent.
-- ============================================================

-- ---------- 1. Stats de la home (avec alias de clés) ----------
-- On expose plusieurs noms de clés pour que la home affiche les bons chiffres
-- quel que soit le nom utilisé (savants OU paroles, videos OU multimedia, etc.)
create or replace function site_stats()
returns json language sql stable as $$
  select json_build_object(
    'hadiths',    (select count(*) from hadiths),
    'dhikrs',     (select count(*) from dhikrs),
    'douaas',     (select count(*) from douaas),
    'coran',      (select count(*) from coran),
    'versets',    (select count(*) from coran),
    'paroles',    (select count(*) from paroles),
    'savants',    (select count(*) from paroles),
    'multimedia', (select count(*) from multimedia),
    'videos',     (select count(*) from multimedia)
  );
$$;
grant execute on all functions in schema public to anon, authenticated;

-- ---------- 2. Anti-doublons : hash généré + index unique ----------
-- arabe_hash devient une COLONNE GÉNÉRÉE : Postgres calcule le hash
-- automatiquement pour TOUTES les lignes (existantes ET futures). Donc :
--   • aucune re-saisie nécessaire (les 54 lignes sans hash sont remplies d'un coup)
--   • rien à remplir à la main lors des prochains ajouts
--   • l'index unique bloque tout doublon (même texte_arabe) à l'insertion
-- (tables multimedia et tag exclues, comme demandé)

-- HADITHS
delete from hadiths a using hadiths b where a.id > b.id and a.texte_arabe = b.texte_arabe;
alter table hadiths drop column if exists arabe_hash;
alter table hadiths add column arabe_hash text generated always as (md5(texte_arabe)) stored;
create unique index if not exists uniq_hadiths_arabe_hash on hadiths (arabe_hash);

-- DHIKRS
delete from dhikrs a using dhikrs b where a.id > b.id and a.texte_arabe = b.texte_arabe;
alter table dhikrs drop column if exists arabe_hash;
alter table dhikrs add column arabe_hash text generated always as (md5(texte_arabe)) stored;
create unique index if not exists uniq_dhikrs_arabe_hash on dhikrs (arabe_hash);

-- DOUAAS
delete from douaas a using douaas b where a.id > b.id and a.texte_arabe = b.texte_arabe;
alter table douaas drop column if exists arabe_hash;
alter table douaas add column arabe_hash text generated always as (md5(texte_arabe)) stored;
create unique index if not exists uniq_douaas_arabe_hash on douaas (arabe_hash);

-- CORAN
delete from coran a using coran b where a.id > b.id and a.texte_arabe = b.texte_arabe;
alter table coran drop column if exists arabe_hash;
alter table coran add column arabe_hash text generated always as (md5(texte_arabe)) stored;
create unique index if not exists uniq_coran_arabe_hash on coran (arabe_hash);

-- PAROLES
delete from paroles a using paroles b where a.id > b.id and a.texte_arabe = b.texte_arabe;
alter table paroles drop column if exists arabe_hash;
alter table paroles add column arabe_hash text generated always as (md5(texte_arabe)) stored;
create unique index if not exists uniq_paroles_arabe_hash on paroles (arabe_hash);
