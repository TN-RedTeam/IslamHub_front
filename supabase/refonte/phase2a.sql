-- ============================================================================
-- Refonte IslamHub — Phase 2a : modèle relationnel (structures + migrations
-- NON destructives). Appliqué le 2026-09-07 (branche refonte/architecture-v2).
--
-- Rien n'est supprimé : les colonnes texte (rapporteur, narrateur, tag, statut)
-- restent la SOURCE des migrations. Le nettoyage (Phase 2b) viendra après
-- rebranchement du frontend et validation.
--
-- Déjà présent avant cette phase (sessions précédentes, NON recréé ici) :
--   narrateurs + hadith_narrateurs, savants + ecoles, statuts,
--   hadith_rapporteurs (→ savants).
-- ============================================================================

create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- ---- Références précises : recueils + hadith_sources -----------------------
create table if not exists public.recueils (
  id  bigserial primary key,
  nom text unique not null
);
create table if not exists public.hadith_sources (
  hadith_id  bigint references public.hadiths(id) on delete cascade,
  recueil_id bigint references public.recueils(id),
  numero     text,   -- à compléter à la main (référence précise)
  chapitre   text,
  primary key (hadith_id, recueil_id)
);

insert into public.recueils (nom)
select distinct btrim(t)
from public.hadiths, unnest(string_to_array(coalesce(rapporteur,''),',')) t
where btrim(t) <> ''
on conflict (nom) do nothing;

insert into public.hadith_sources (hadith_id, recueil_id)
select h.id, r.id
from public.hadiths h
cross join lateral unnest(string_to_array(coalesce(h.rapporteur,''),',')) as t
join public.recueils r on r.nom = btrim(t)
where btrim(t) <> ''
on conflict (hadith_id, recueil_id) do nothing;

-- ---- Tags normalisés (fusion insensible à la casse via slug) ---------------
create table if not exists public.tags (
  id   bigserial primary key,
  nom  text unique not null,
  slug text unique not null
);
create table if not exists public.hadith_tags (
  hadith_id bigint references public.hadiths(id) on delete cascade,
  tag_id    bigint references public.tags(id),
  primary key (hadith_id, tag_id)
);

insert into public.tags (nom, slug)
select (array_agg(nom order by nom))[1], slug
from (
  select distinct btrim(t) nom,
    regexp_replace(regexp_replace(lower(unaccent(btrim(t))),'[^a-z0-9]+','-','g'),'(^-+|-+$)','','g') slug
  from public.hadiths, unnest(string_to_array(coalesce(tag,''),',')) t
  where btrim(t) <> ''
) s
group by slug
on conflict (nom) do nothing;

insert into public.hadith_tags (hadith_id, tag_id)
select distinct h.id, tg.id
from public.hadiths h
cross join lateral unnest(string_to_array(coalesce(h.tag,''),',')) as t
join public.tags tg on tg.slug =
  regexp_replace(regexp_replace(lower(unaccent(btrim(t))),'[^a-z0-9]+','-','g'),'(^-+|-+$)','','g')
where btrim(t) <> ''
on conflict (hadith_id, tag_id) do nothing;

-- ---- Slugs (URL par fiche) -------------------------------------------------
alter table public.hadiths add column if not exists slug text;
alter table public.paroles add column if not exists slug text;
alter table public.savants add column if not exists slug text;

update public.savants set slug =
  regexp_replace(regexp_replace(lower(unaccent(nom)),'[^a-z0-9]+','-','g'),'(^-+|-+$)','','g') where slug is null;
update public.hadiths set slug =
  regexp_replace(regexp_replace(lower(unaccent(sujet)),'[^a-z0-9]+','-','g'),'(^-+|-+$)','','g') where slug is null;
update public.paroles set slug =
  regexp_replace(regexp_replace(lower(unaccent(coalesce(sujet,savant,'parole'))),'[^a-z0-9]+','-','g'),'(^-+|-+$)','','g') || '-' || id
  where slug is null;

-- Slugs savants en collision (ex. Al-Hâkim / Al-Hakim = doublon à fusionner en
-- Phase 6) : on garde l'id min, on suffixe les autres par l'id.
update public.savants s set slug = s.slug || '-' || s.id
where s.slug in (select slug from public.savants group by slug having count(*)>1)
  and s.id <> (select min(id) from public.savants s2 where s2.slug = s.slug);

create unique index if not exists savants_slug_idx on public.savants(slug);
create unique index if not exists paroles_slug_idx on public.paroles(slug);
-- NB : pas d'index unique sur hadiths.slug (sujets répétés) — l'URL /hadiths/:id/:slug
--     est unique par l'id.

-- ---- Recherche plein-texte FR (hadiths + paroles) --------------------------
alter table public.hadiths add column if not exists search_fr tsvector;
alter table public.paroles add column if not exists search_fr tsvector;
create index if not exists hadiths_search_fr_idx  on public.hadiths using gin (search_fr);
create index if not exists paroles_search_fr_idx  on public.paroles using gin (search_fr);
create index if not exists hadiths_arabe_trgm_idx on public.hadiths using gin (texte_arabe gin_trgm_ops);

create or replace function public.set_search_fr() returns trigger language plpgsql as $fn$
begin
  new.search_fr := to_tsvector('french', unaccent(
    coalesce(new.sujet,'') || ' ' || coalesce(new.texte_francais,'') || ' ' || coalesce(new.explication,'')));
  return new;
end $fn$;
drop trigger if exists trg_hadiths_search_fr on public.hadiths;
create trigger trg_hadiths_search_fr before insert or update on public.hadiths
  for each row execute function public.set_search_fr();
drop trigger if exists trg_paroles_search_fr on public.paroles;
create trigger trg_paroles_search_fr before insert or update on public.paroles
  for each row execute function public.set_search_fr();
-- (les UPDATE de slug ci-dessus ont déjà rempli search_fr pour l'existant)

-- ---- Dossiers thématiques (nouveau cœur — vides) ---------------------------
create table if not exists public.dossiers (
  id bigserial primary key,
  slug text unique not null,
  h1 text not null,
  meta_title text, meta_description text,
  croyance_texte text, objection_texte text, reponse_texte text,
  published boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.dossier_preuves (
  id bigserial primary key,
  dossier_id bigint references public.dossiers(id) on delete cascade,
  type text not null check (type in ('hadith','parole','verset')),
  ref_id bigint not null,
  ordre int default 0
);
create table if not exists public.dossier_images (
  id bigserial primary key,
  dossier_id bigint references public.dossiers(id) on delete cascade,
  image_url text not null, legende text, alt text not null, source_livre text,
  ordre int default 0
);
create table if not exists public.dossiers_lies (
  dossier_id     bigint references public.dossiers(id) on delete cascade,
  dossier_lie_id bigint references public.dossiers(id) on delete cascade,
  primary key (dossier_id, dossier_lie_id)
);

-- ---- RLS : lecture publique (anon), écriture réservée (service_role) -------
do $rls$
declare t text;
begin
  foreach t in array array['recueils','hadith_sources','tags','hadith_tags',
                           'dossiers','dossier_preuves','dossier_images','dossiers_lies'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
end $rls$;

-- Contrôles constatés : recueils=20, hadith_sources=196, tags=87,
-- hadith_tags=196, slugs remplis (0 null, 0 dup après désambiguïsation),
-- search_fr rempli (hadiths 129 / paroles 42), FT « priere » → 16 résultats.

-- ============================================================================
-- SÉCURITÉ (à exécuter séparément, décision utilisateur) :
--   La table de backup hadiths_backup_phase1 a la RLS désactivée (exposée
--   via la clé anon). Correctif recommandé (bloque tout accès anon) :
--   alter table public.hadiths_backup_phase1 enable row level security;
-- ============================================================================
