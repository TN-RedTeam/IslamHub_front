-- ============================================================================
-- recueils = OUVRAGES (livres) reliés à leur AUTEUR (savants), + commentaires
-- (sharḥ / ḥāshiya) via auto-référence. Migration appliquée en prod par étapes.
-- Backup préalable : schéma `backup` (non exposé à l'API).
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 1 — Backup + schéma cible (ALTER ADD, non destructif)
-- ─────────────────────────────────────────────────────────────────────────

-- Backup avant migration (schéma non exposé).
create schema if not exists backup;
create table if not exists backup.recueils_20260911       as table public.recueils;
create table if not exists backup.hadith_sources_20260911 as table public.hadith_sources;

-- Nouvelles colonnes.
alter table public.recueils
  add column if not exists slug                text,
  add column if not exists titre_arabe         text,
  add column if not exists type                text not null default 'recueil',
  add column if not exists commente_recueil_id bigint references public.recueils(id) on delete set null;

-- type ∈ { recueil (original) | sharh (commentaire) | hashiya (glose) }.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recueils_type_check') then
    alter table public.recueils
      add constraint recueils_type_check check (type in ('recueil','sharh','hashiya'));
  end if;
end $$;

create index if not exists recueils_savant_id_idx on public.recueils(savant_id);
create index if not exists recueils_commente_idx  on public.recueils(commente_recueil_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 2 — Titres manquants + slugs uniques
-- ─────────────────────────────────────────────────────────────────────────

-- Titres PROVISOIRES pour les auteurs à plusieurs ouvrages (œuvre principale la
-- plus probable comme source de hadith). À vérifier / éclater en une ligne/livre.
update public.recueils set titre = 'As-Sounan al-Koubra'  where id = 3  and titre is null; -- Al-Bayhaqi
update public.recueils set titre = 'Al-Mou''jam al-Kabir'  where id = 12 and titre is null; -- At-Tabarani
update public.recueils set titre = 'Al-Maqasid al-Hasana'  where id = 4  and titre is null; -- As-Sakhawi
update public.recueils set titre = 'Al-Jami'' as-Saghir'   where id = 8  and titre is null; -- As-Souyouti
update public.recueils set titre = 'Al-Mawdou''at'         where id = 10 and titre is null; -- Ibn al-Jawzi
update public.recueils set titre = 'Az-Zawajir'            where id = 2  and titre is null; -- Ibn Hajar al-Haytami
update public.recueils set titre = 'Tafsir al-Qourtoubi'   where id = 1  and titre is null; -- Al-Qourtoubi
-- id 13 (Aboû l-Qâçim al-Ansâriyy) : ouvrage incertain → titre NULL (à compléter).

-- Slug unique depuis le titre (repli sur nom tant que le titre est vide).
update public.recueils
set slug = lower(regexp_replace(
             regexp_replace(public.unaccent(coalesce(nullif(btrim(titre),''), nom)),
               '[^a-zA-Z0-9]+', '-', 'g'),
             '(^-+|-+$)', '', 'g'))
where slug is null;

create unique index if not exists recueils_slug_unique on public.recueils(slug);

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 3 — Commentaires (sharḥ / ḥāshiya) par auto-référence
-- ─────────────────────────────────────────────────────────────────────────

-- `nom` devient redondant (déduit de savant_id -> savants.nom) et destiné à
-- disparaître : on lève le NOT NULL dès maintenant pour permettre d'insérer de
-- nouveaux ouvrages/commentaires sans le renseigner. (DROP COLUMN plus tard.)
alter table public.recueils alter column nom drop not null;

-- Un commentaire = un ouvrage à part entière : savant_id = le commentateur,
-- type = 'sharh' (ou 'hashiya'), commente_recueil_id = l'ouvrage commenté.
-- L'auteur de l'original se déduit : commente_recueil_id -> recueils -> savant_id.
-- Exemple (commentaire d'As-Souyoutiyy sur le Sahih al-Bukhari) :
--
-- insert into public.recueils (slug, titre, savant_id, type, commente_recueil_id)
-- select 'at-tawshih', 'At-Tawshīḥ', s.id, 'sharh', r.id
-- from public.savants s, public.recueils r
-- where s.slug = 'imam-as-souyoutiyy' and r.titre = 'Sahih al-Bukhari';

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 4 — Affichage : libellé de source (fonction) + RPC
-- ─────────────────────────────────────────────────────────────────────────

-- Libellé = titre (+ titre_arabe) ; pour un sharḥ/ḥāshiya :
-- « {titre} — commentaire de {ouvrage commenté} (par {auteur du commentaire}) » ;
-- + « (n° …) » si le numéro du hadith est fourni.
create or replace function public.recueil_label(p_recueil_id bigint, p_numero text default null)
returns text language sql stable as $function$
  select coalesce(nullif(btrim(r.titre), ''), r.nom)
      || coalesce(' — ' || nullif(btrim(r.titre_arabe), ''), '')
      || case
           when r.type in ('sharh','hashiya') and base.id is not null then
             ' — ' || (case r.type when 'hashiya' then 'glose de ' else 'commentaire de ' end)
             || coalesce(nullif(btrim(base.titre), ''), base.nom)
             || coalesce(' (par ' || cs.nom || ')', '')
           else '' end
      || coalesce(' (n° ' || nullif(btrim(p_numero), '') || ')', '')
  from public.recueils r
  left join public.recueils base on base.id = r.commente_recueil_id
  left join public.savants  cs   on cs.id = r.savant_id and r.type in ('sharh','hashiya')
  where r.id = p_recueil_id;
$function$;
grant execute on function public.recueil_label(bigint, text) to anon, authenticated;

-- get_hadith / get_dossier : la source est agrégée via recueil_label().
--   (select string_agg(public.recueil_label(hs.recueil_id, hs.numero), ', ')
--      from public.hadith_sources hs where hs.hadith_id = h.id) as recueils

-- ─────────────────────────────────────────────────────────────────────────
-- ÉTAPE 5 — Retrait du doublon `nom` (après feu vert)
-- ─────────────────────────────────────────────────────────────────────────

-- (a) Aucun titre ne doit rester NULL : repli provisoire sur nom.
--     (id 13 Aboû l-Qâçim al-Ansârî : placeholder = nom d'auteur, à remplacer
--      par le vrai titre d'ouvrage.)
update public.recueils set titre = nom where titre is null or btrim(titre) = '';

-- (b) recueil_label n'utilise plus nom (titre devient obligatoire).
create or replace function public.recueil_label(p_recueil_id bigint, p_numero text default null)
returns text language sql stable as $function$
  select r.titre
      || coalesce(' — ' || nullif(btrim(r.titre_arabe), ''), '')
      || case
           when r.type in ('sharh','hashiya') and base.id is not null then
             ' — ' || (case r.type when 'hashiya' then 'glose de ' else 'commentaire de ' end)
             || base.titre
             || coalesce(' (par ' || cs.nom || ')', '')
           else '' end
      || coalesce(' (n° ' || nullif(btrim(p_numero), '') || ')', '')
  from public.recueils r
  left join public.recueils base on base.id = r.commente_recueil_id
  left join public.savants  cs   on cs.id = r.savant_id and r.type in ('sharh','hashiya')
  where r.id = p_recueil_id;
$function$;

-- (c) Suppression de nom + (d) titre requis.
alter table public.recueils drop column nom;
alter table public.recueils alter column titre set not null;

-- ─────────────────────────────────────────────────────────────────────────
-- SUIVI — search_hadiths expose aussi la source (recueils) pour la carte/modale
-- ─────────────────────────────────────────────────────────────────────────
-- Ajout dans le SELECT des lignes renvoyées :
--   (select string_agg(public.recueil_label(hs.recueil_id, hs.numero), ', ')
--      from public.hadith_sources hs where hs.hadith_id = filtered.id) as recueils
