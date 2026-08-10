-- ============================================================
-- IslamHub — Fonctions pour la page d'accueil (Home)
-- À EXÉCUTER dans Supabase → SQL Editor → Run. Idémpotent.
-- ============================================================

-- Compteurs du site (sans transférer de données)
create or replace function site_stats()
returns json language sql stable as $$
  select json_build_object(
    'hadiths',    (select count(*) from hadiths),
    'dhikrs',     (select count(*) from dhikrs),
    'douaas',     (select count(*) from douaas),
    'coran',      (select count(*) from coran),
    'paroles',    (select count(*) from paroles),
    'multimedia', (select count(*) from multimedia)
  );
$$;

-- Item "du jour" : sélection déterministe par jour de l'année (rotation cyclique).
-- Renvoie UNE ligne en JSON (ou null si table vide). phonetique -> "phonétique".

create or replace function daily_hadith(day int)
returns json language sql stable as $$
  select row_to_json(x) from (
    select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
           explication, tag, rapporteur, narrateur, statut
    from hadiths order by id
    offset (day % greatest((select count(*) from hadiths), 1)) limit 1
  ) x;
$$;

create or replace function daily_douaa(day int)
returns json language sql stable as $$
  select row_to_json(x) from (
    select id, sujet, texte_arabe, texte_francais, phonetique as "phonétique",
           explication, tag, commentaire
    from douaas order by id
    offset (day % greatest((select count(*) from douaas), 1)) limit 1
  ) x;
$$;

create or replace function daily_coran(day int)
returns json language sql stable as $$
  select row_to_json(x) from (
    select id, sujet, sourate, texte_arabe, texte_francais, phonetique as "phonétique",
           explication, tag
    from coran order by id
    offset (day % greatest((select count(*) from coran), 1)) limit 1
  ) x;
$$;

-- Autoriser l'exécution par le rôle anon
grant execute on all functions in schema public to anon, authenticated;
