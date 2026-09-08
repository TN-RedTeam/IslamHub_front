# IslamHub — Guide de la base de données

Comment sont organisées les tables Supabase et comment les remplir.
Projet Supabase : `kxzfwtwbghuvnlueusvp`. Tout se fait dans **Supabase → SQL Editor**.

> ⚠️ **Arabe** : quand une insertion contient de l'arabe, **colle le texte arabe
> toi-même** dans le SQL Editor. (Les fichiers `.sql` livrés par l'assistant
> laissent des `⟨…⟩` à compléter — l'arabe n'est jamais retapé par le modèle,
> pour éviter toute corruption des diacritiques.)

---

## 1. Vue d'ensemble

**Tables de contenu** (ce qui s'affiche sur le site) :
`hadiths`, `coran`, `dhikrs`, `douaas`, `paroles`, `fiqh`, `femmes`, `multimedia`.

**Tables « annexes » normalisées** (référentiels réutilisés) :
`savants`, `ecoles`, `statuts`, `narrateurs`, `recueils`, `tags`.

**Tables de liaison** (relient un hadith à plusieurs annexes — plusieurs valeurs) :
`hadith_rapporteurs`, `hadith_narrateurs`, `hadith_sources`, `hadith_tags`.

**Dossiers thématiques** (croyance / preuves / réponse) :
`dossiers`, `dossier_preuves`, `dossier_images`, `dossiers_lies`.

**Coran / exégèse** : `sourates`, `versets`, `exegeses`.

> Tables héritées, **non utilisées** : `tag` (singulier, vide — remplacée par
> `tags`) et `hadith_arabe` (vide). Ne pas s'en servir.

---

## 2. Conventions transversales (à connaître)

- **`arabe_hash`** (hadiths, coran, dhikrs, douaas, paroles) : colonne **générée
  automatiquement** depuis `texte_arabe` (normalisée : sans harakat, sans
  guillemets…). Un **index unique** empêche d'insérer deux fois le même texte
  arabe. Ne l'écris jamais toi-même. En cas de doublon, l'INSERT échoue → c'est
  voulu. `on conflict (arabe_hash) do nothing` permet d'ignorer les doublons.
- **`slug`** (hadiths, paroles, savants, dossiers, sourates, ecoles) : identifiant
  d'URL, ex. `/savants/al-bayhaqi`. Généré depuis le nom/sujet.
- **`search_fr`** (hadiths, paroles) : recherche plein-texte française, **remplie
  automatiquement** par un trigger. Ne pas la toucher.
- **`sujet`** : grand thème répété (sert au menu déroulant « Filtrer par sujet »).
- **`tag`** : mots-clés en **texte CSV** (« foi, tombe, science »). Cherchés en
  texte libre. (Pour les hadiths, il existe *en plus* la version normalisée
  `tags` + `hadith_tags`, voir §4.)
- **RLS** : toutes les tables sont en **lecture publique** ; l'écriture passe par
  le SQL Editor (rôle admin). Le site ne fait que lire.

---

## 3. Tables de contenu

| Table | Colonnes principales |
|---|---|
| `hadiths` | sujet, texte_arabe, texte_francais, phonetique, explication, tag, **rapporteur**, **narrateur**, **statut** *(colonnes texte historiques)*, **degre_authenticite** (Sahih/Hassan/Da'if…), **type_hadith** (Qudsi/Marfu'/Mawquf), **juge_par**, slug, statut_id |
| `coran` | sujet, sourate, texte_arabe, texte_francais, phonetique, explication, tag |
| `dhikrs` | sujet, texte_arabe, texte_francais, phonetique, explication, commentaire, tag |
| `douaas` | sujet, texte_arabe, texte_francais, phonetique, explication, commentaire, tag |
| `paroles` | sujet, texte_arabe, texte_francais, **phonétique** *(avec accent !)*, explication, tag, **savant_id** → savants, **ecole** |
| `fiqh` | ecole, chapitre, sujet, type, texte (Markdown), texte_arabe, source, ordre, tag |
| `femmes` | chapitre, ordre, matn, commentaire, texte_arabe, source |
| `multimedia` | youtube_id, titre, description, categorie, savant, duree_secondes |

> Sur `hadiths`, les colonnes **texte** `rapporteur`/`narrateur`/`statut` sont
> l'historique ; les versions **normalisées** (liaisons + `degre_authenticite`/
> `type_hadith`) sont la cible. Les deux coexistent pour l'instant.

---

## 4. Tables annexes + liaisons

**Référentiels** : `savants(id, nom, nom_arabe, naissance, deces, resume, domaines[], biographie, ecole_id, slug)`,
`ecoles(id, nom, slug)`, `statuts(id, nom)`, `narrateurs(id, nom)`, `recueils(id, nom)`,
`tags(id, nom, slug)`.

**Liaisons hadith → plusieurs valeurs** :
- `hadith_rapporteurs(hadith_id, savant_id)` — qui rapporte (relié aux `savants`).
- `hadith_narrateurs(hadith_id, narrateur_id)` — le(s) narrateur(s) (Compagnons).
- `hadith_sources(hadith_id, recueil_id, numero, chapitre)` — recueil + réf précise.
- `hadith_tags(hadith_id, tag_id)` — tags normalisés.

### Recette : ajouter un hadith avec plusieurs rapporteurs / narrateurs / tags
```sql
-- 1) le hadith (colle l'arabe toi-même)
insert into public.hadiths (sujet, texte_arabe, texte_francais, phonetique,
       explication, degre_authenticite, type_hadith)
values ('⟨sujet⟩', '⟨arabe⟩', '⟨traduction⟩', '⟨phonétique⟩', '⟨explication⟩',
        'Sahih', null)
returning id;   -- note l'id renvoyé → :HID

-- 2) rapporteurs (crée le recueil/savant s'il manque, puis relie)
insert into public.recueils (nom) values ('At-Tirmidhi') on conflict (nom) do nothing;
insert into public.hadith_sources (hadith_id, recueil_id, numero)
select :HID, r.id, '2517' from public.recueils r where r.nom = 'At-Tirmidhi';

-- 3) narrateur
insert into public.narrateurs (nom) values ('Abou Hourayrah') on conflict (nom) do nothing;
insert into public.hadith_narrateurs (hadith_id, narrateur_id)
select :HID, n.id from public.narrateurs n where n.nom = 'Abou Hourayrah';

-- 4) tags normalisés
insert into public.tags (nom, slug) values ('science','science') on conflict (nom) do nothing;
insert into public.hadith_tags (hadith_id, tag_id)
select :HID, t.id from public.tags t where t.slug = 'science';
```

### Recette : ajouter une parole reliée à un savant
```sql
-- le savant existe-t-il ? sinon crée-le
insert into public.savants (nom, slug) values ('Al-Bayhaqi','al-bayhaqi')
  on conflict (nom) do nothing;

insert into public.paroles (sujet, savant_id, savant, texte_arabe, texte_francais, "phonétique", explication, tag)
select '⟨sujet⟩', s.id, s.nom, '⟨arabe⟩', '⟨traduction⟩', '⟨phonétique⟩', '⟨explication⟩', 'croyance, attributs'
from public.savants s where s.slug = 'al-bayhaqi';
```
> ⚠️ Dans `paroles`, la colonne s'appelle **`"phonétique"`** (avec accent, entre
> guillemets en SQL). Ailleurs c'est `phonetique` (sans accent).

### Enrichir une fiche savant (annuaire)
```sql
update public.savants set
  nom_arabe = '⟨nom en arabe⟩',
  naissance = '384 H', deces = '458 H',
  domaines  = array['Hadith','Aqida']     -- Hadith, Fiqh, Aqida, Tafsir, Langue
where slug = 'al-bayhaqi';
```

---

## 5. Dossiers thématiques

`dossiers(slug, h1, meta_title, meta_description, croyance_texte, objection_texte,
reponse_texte, published)` — mets `published = true` pour l'afficher.
Les preuves relient un dossier à des hadiths / paroles / versets existants :
`dossier_preuves(dossier_id, type, ref_id, ordre)` où `type ∈ ('hadith','parole','verset')`
et `ref_id` = l'id de l'élément.

```sql
-- lier le hadith d'id 10 comme 1re preuve du dossier istiwa
insert into public.dossier_preuves (dossier_id, type, ref_id, ordre)
select d.id, 'hadith', 10, 1 from public.dossiers d where d.slug = 'le-sens-de-l-istiwa';

-- dossiers liés (voir aussi)
insert into public.dossiers_lies (dossier_id, dossier_lie_id)
select a.id, b.id from public.dossiers a, public.dossiers b
where a.slug = 'le-sens-de-l-istiwa' and b.slug = '⟨autre-dossier⟩';
```

---

## 6. Coran / exégèse

`sourates(numero, nom, nom_arabe, slug, revelation, nb_versets)` →
`versets(sourate_id, numero, texte_arabe, texte_francais, phonetique)` →
`exegeses(verset_id, texte, source, ordre)`.
Voir le template prêt à remplir : `supabase/refonte/phase8.sql`.

---

## 7. Les fonctions (RPC) utilisées par le site

- Recherche paginée : `search_hadiths`, `search_coran`, `search_dhikrs`,
  `search_douaas`, `search_paroles`, `search_multimedia`
  (args `q`, `tag_filter` = filtre **sujet**, `page_num`, `page_size`,
  + pour hadiths : `statut_filter`/`rapporteur_filter`/`narrateur_filter`,
  pour paroles : `savant_filter`).
- Listes de menus : `sujets_*` (sujets), `tags_*` (tags), `names_paroles`,
  `hadith_rubriques` (statuts/rapporteurs/narrateurs).
- Fiches : `get_hadith(id)`, `savant_by_slug(slug)`, `savants_all()`,
  `savants_mini()`, `get_dossier(slug)`, `get_sourate(slug)`, `sourates_all()`.
- Divers : `fiqh_by_ecole`, `femmes_all`, `site_stats`, `daily_*`.

Après avoir ajouté du contenu, **rien à faire** côté fonctions : elles lisent
directement les tables.

---

## 8. Ajouter des images de pages de livres (Storage)

Les images ne vont **pas** en base : seule leur **URL** est stockée
(`dossier_images.image_url`). Elles vivent dans le bucket Storage **`references`**
(déjà créé, public en lecture).

1. **Optimiser** (WebP ~1200px, léger) :
   ```bash
   npm i -D sharp            # déjà installé
   node scripts/optimize-images.mjs public/img   # → build/references-webp/*.webp
   ```
2. **Uploader** : Supabase → **Storage** → bucket **references** → glisser-déposer
   les `.webp`.
3. **Récupérer l'URL** : elle a la forme
   `https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨fichier⟩.webp`
4. **Lier au dossier** :
   ```sql
   insert into public.dossier_images (dossier_id, image_url, alt, legende, source_livre, ordre)
   select d.id,
     'https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨fichier⟩.webp',
     '⟨texte alternatif (accessibilité + SEO)⟩', '⟨légende⟩', '⟨livre, page⟩', 1
   from public.dossiers d where d.slug = 'le-sens-de-l-istiwa';
   ```
   Un template tout prêt pour les 2 pages Al-Baghdadiyy :
   `supabase/refonte/phase7_lier_images.sql`.

> Toujours **doubler l'image d'une transcription texte** (arabe + traduction) sur
> la page et remplir `alt` : une image n'est ni indexée par Google ni accessible.

---

## 9. Sauvegarde

Avant toute grosse modification : voir la section « backup » — un `pg_dump`
(ou l'export Supabase) capture tout (schéma + données + fonctions).
