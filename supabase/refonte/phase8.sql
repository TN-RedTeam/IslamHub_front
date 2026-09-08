-- ============================================================================
-- Refonte IslamHub — Phase 8 : Coran / exégèse. Appliqué le 2026-09-07.
-- Structure sourates / versets / exégèses + RPC. Métadonnées de 5 sourates
-- clés semées (noms translittérés). Le CONTENU (arabe des versets + tafsir)
-- s'ajoute avec le TEMPLATE plus bas — l'arabe vient de TES sources, pas du modèle.
-- ============================================================================

create table if not exists public.sourates (
  id bigserial primary key, numero int unique not null, nom text not null,
  nom_arabe text, slug text unique not null, revelation text, nb_versets int
);
create table if not exists public.versets (
  id bigserial primary key, sourate_id bigint references public.sourates(id) on delete cascade,
  numero int not null, texte_arabe text, texte_francais text, phonetique text,
  unique (sourate_id, numero)
);
create table if not exists public.exegeses (
  id bigserial primary key, verset_id bigint references public.versets(id) on delete cascade,
  texte text not null, source text, ordre int default 0
);
-- + index, RLS lecture publique, RPC sourates_all() et get_sourate(slug)
--   (voir migration phase8_coran_exegese).

-- Sourates semées : al-fatiha, al-ikhlas, al-falaq, an-nas, al-baqara.

-- ============================================================================
-- TEMPLATE — à remplir puis exécuter dans Supabase → SQL Editor.
-- Exemple : ajouter les versets de la sourate Al-Fātiḥah + une exégèse.
-- Remplace les ⟨…⟩ par le texte réel (colle l'arabe depuis ta source).
-- ============================================================================
/*
-- (optionnel) nom arabe de la sourate :
update public.sourates set nom_arabe = '⟨nom arabe⟩' where slug = 'al-fatiha';

-- Versets (répète le bloc pour chaque verset) :
insert into public.versets (sourate_id, numero, texte_arabe, texte_francais, phonetique)
select s.id, 1, '⟨arabe du verset 1⟩', '⟨traduction française⟩', '⟨phonétique⟩'
from public.sourates s where s.slug = 'al-fatiha'
on conflict (sourate_id, numero) do update
  set texte_arabe = excluded.texte_arabe,
      texte_francais = excluded.texte_francais,
      phonetique = excluded.phonetique;

-- Exégèse d'un verset (Markdown autorisé dans `texte`) :
insert into public.exegeses (verset_id, texte, source, ordre)
select v.id, $ex$⟨texte de l'exégèse (markdown ok)⟩$ex$, '⟨source, ex. Tafsir At-Tabari⟩', 0
from public.versets v
  join public.sourates s on s.id = v.sourate_id
where s.slug = 'al-fatiha' and v.numero = 1;
*/
