-- ============================================================
-- IslamHub — RLS + fonctions pour la table `paroles`
-- (après fusion de `savants` dans `paroles`, renommée au pluriel)
-- À EXÉCUTER dans Supabase → SQL Editor → Run. Idémpotent.
-- ============================================================

-- 1. RLS : lecture publique uniquement
alter table paroles enable row level security;
drop policy if exists "public read" on paroles;
create policy "public read" on paroles for select to anon, authenticated using (true);

-- 2. Supprimer les anciennes fonctions (qui pointaient sur `parole`)
drop function if exists search_parole(text, text, int, int);
drop function if exists tags_parole();
drop function if exists names_parole();

-- 3. Nouvelles fonctions sur `paroles`
--    (la colonne est "phonétique" AVEC accent dans cette table)
create or replace function search_paroles(q text default '', tag_filter text default '', page_num int default 0, page_size int default 20)
returns json language sql stable as $$
  with filtered as (
    select * from paroles p
    where (q = '' or (
        p.texte_arabe ilike '%'||q||'%' or p.texte_francais ilike '%'||q||'%' or
        p.sujet ilike '%'||q||'%' or p.savant ilike '%'||q||'%' or
        p.explication ilike '%'||q||'%' or p."phonétique" ilike '%'||q||'%' or p.tag ilike '%'||q||'%'))
      and (tag_filter = '' or exists (
        select 1 from unnest(string_to_array(p.tag, ',')) t where trim(t) ilike tag_filter)))
  select json_build_object(
    'total', (select count(*) from filtered),
    'data', coalesce((select json_agg(row_to_json(x)) from (
        select id, sujet, savant, texte_arabe, texte_francais, "phonétique", explication, tag
        from filtered order by id limit page_size offset page_num*page_size) x), '[]'::json));
$$;

create or replace function tags_paroles()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct trim(t) order by trim(t)), '{}')
  from paroles, unnest(string_to_array(tag, ',')) t
  where tag is not null and tag <> '' and trim(t) <> '';
$$;

create or replace function names_paroles()
returns text[] language sql stable as $$
  select coalesce(array_agg(distinct savant order by savant), '{}')
  from paroles where savant is not null and savant <> '';
$$;

-- 4. Autoriser l'exécution par le rôle anon
grant execute on all functions in schema public to anon, authenticated;
