-- ============================================================
-- IslamHub — Configuration Supabase pour accès direct (Path B)
-- À EXÉCUTER UNE FOIS dans Supabase → SQL Editor → Run.
-- Idémpotent : peut être relancé sans risque.
-- ============================================================

-- ---------- 1. Row Level Security : LECTURE PUBLIQUE UNIQUEMENT ----------
-- On active RLS puis on autorise seulement le SELECT (anon/authenticated).
-- Aucune policy d'écriture => insert/update/delete IMPOSSIBLES depuis le front.
-- Seuls le dashboard Supabase et la service_key peuvent écrire.

alter table hadiths     enable row level security;
alter table dhikrs      enable row level security;
alter table douaas      enable row level security;
alter table coran       enable row level security;
alter table parole      enable row level security;
alter table multimedia  enable row level security;

drop policy if exists "public read" on hadiths;
create policy "public read" on hadiths    for select to anon, authenticated using (true);
drop policy if exists "public read" on dhikrs;
create policy "public read" on dhikrs     for select to anon, authenticated using (true);
drop policy if exists "public read" on douaas;
create policy "public read" on douaas     for select to anon, authenticated using (true);
drop policy if exists "public read" on coran;
create policy "public read" on coran      for select to anon, authenticated using (true);
drop policy if exists "public read" on parole;
create policy "public read" on parole     for select to anon, authenticated using (true);
drop policy if exists "public read" on multimedia;
create policy "public read" on multimedia for select to anon, authenticated using (true);

-- ---------- 2. Fonctions de recherche (RPC) ----------
-- Chaque fonction renvoie un JSON { total, data }.
-- La sortie est UNIFORMISÉE : la colonne est "phonetique" (sans accent) dans
-- la plupart des tables mais "phonétique" (avec accent) dans parole. On aliase
-- pour que le front reçoive TOUJOURS "phonétique".

-- ===== HADITHS =====
create or replace function search_hadiths(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from hadiths h
    where (q = '' or (
        h.texte_arabe ilike '%'||q||'%' or h.texte_francais ilike '%'||q||'%' or
        h.sujet ilike '%'||q||'%' or h.rapporteur ilike '%'||q||'%' or
        h.narrateur ilike '%'||q||'%' or h.explication ilike '%'||q||'%' or
        h.phonetique ilike '%'||q||'%' or h.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(h.tag, ',')) t where trim(t) ilike tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(d)) from (
        select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, rapporteur, narrateur, statut
        from filtered order by id limit page_size offset page_num*page_size) d), '[]'::json));
$$;

create or replace function tags_hadiths()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from hadiths, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

-- ===== DHIKRS =====
create or replace function search_dhikrs(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from dhikrs d
    where (q = '' or (
        d.texte_arabe ilike '%'||q||'%' or d.texte_francais ilike '%'||q||'%' or
        d.sujet ilike '%'||q||'%' or d.commentaire ilike '%'||q||'%' or
        d.explication ilike '%'||q||'%' or d.phonetique ilike '%'||q||'%' or d.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(d.tag, ',')) t where trim(t) ilike tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, commentaire
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function tags_dhikrs()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from dhikrs, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

-- ===== DOUAAS =====
create or replace function search_douaas(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from douaas d
    where (q = '' or (
        d.texte_arabe ilike '%'||q||'%' or d.texte_francais ilike '%'||q||'%' or
        d.sujet ilike '%'||q||'%' or d.commentaire ilike '%'||q||'%' or
        d.explication ilike '%'||q||'%' or d.phonetique ilike '%'||q||'%' or d.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(d.tag, ',')) t where trim(t) ilike tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag, commentaire
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function tags_douaas()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from douaas, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

-- ===== CORAN =====
create or replace function search_coran(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from coran c
    where (q = '' or (
        c.texte_arabe ilike '%'||q||'%' or c.texte_francais ilike '%'||q||'%' or
        c.sujet ilike '%'||q||'%' or c.sourate ilike '%'||q||'%' or
        c.explication ilike '%'||q||'%' or c.phonetique ilike '%'||q||'%' or c.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(c.tag, ',')) t where trim(t) ilike tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, sourate, texte_arabe, texte_francais, phonetique as "phonétique",
               explication, tag
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function tags_coran()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from coran, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

-- ===== PAROLE (route /savants) =====
-- NB : la colonne s'appelle bien "phonétique" AVEC accent dans cette table.
create or replace function search_parole(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from parole p
    where (q = '' or (
        p.texte_arabe ilike '%'||q||'%' or p.texte_francais ilike '%'||q||'%' or
        p.sujet ilike '%'||q||'%' or p.savant ilike '%'||q||'%' or
        p.explication ilike '%'||q||'%' or p."phonétique" ilike '%'||q||'%' or p.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(p.tag, ',')) t where trim(t) ilike tag_filter))
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, savant, texte_arabe, texte_francais, "phonétique",
               explication, tag
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function tags_parole()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from parole, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

create or replace function names_parole()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct savant order by savant), '{}')
  from parole where savant is not null and savant <> '';
$$;

-- ===== MULTIMEDIA =====
create or replace function search_multimedia(q text default '', categorie_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from multimedia m
    where (q = '' or (m.titre ilike '%'||q||'%' or m.description ilike '%'||q||'%' or m.savant ilike '%'||q||'%'))
      and (categorie_filter = '' or m.categorie = categorie_filter)
  )
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, youtube_id, titre, description, categorie, savant, duree_secondes, created_at
        from filtered order by created_at desc limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function categories_multimedia()
returns json language sql stable as $$
  select coalesce(json_agg(json_build_object('categorie', categorie, 'count', c) order by c desc, categorie), '[]'::json)
  from (select categorie, count(*)::int c from multimedia
        where categorie is not null and categorie <> '' group by categorie) s;
$$;

-- ---------- 3. Exposer les fonctions au rôle anon (PostgREST) ----------
-- Par défaut PUBLIC peut exécuter, mais on est explicite :
grant execute on all functions in schema public to anon, authenticated;
