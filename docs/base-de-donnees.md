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
`dossiers`, `dossier_preuves`, `dossier_images`, `dossiers_lies`. *(§5)*

**Versets équivoques** (mutashābih : objection / réponse) :
`versets_equivoques`, `verset_preuves`, `verset_images`, `verset_lies`. *(§5 bis)*

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

**Référentiels** : `savants(id, nom, nom_arabe, naissance, deces, resume, domaines[], biographie, ecole_id, slug, generation, generation_a_verifier, resume_auto)`,
`ecoles(id, nom, slug)`, `statuts(id, nom)`, `narrateurs(id, nom, generation)`,
`recueils(id, nom, titre, savant_id)`, `tags(id, nom, slug)`.
*(Voir §10 pour le détail des colonnes techniques.)*

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

## 5. Dossiers thématiques (1 parent + 3 tables enfant)

Un **dossier** est une page argumentée : *la croyance* → *l'objection* → *la
réponse*, avec des **preuves**, des **scans de livres** et des **dossiers liés**.

### 5.1 Le principe : une table parent, trois tables enfant

Une seule ligne dans **`dossiers`** = une page. Tout le reste **pend à cette
ligne** grâce à une colonne `dossier_id` (clé étrangère → `dossiers.id`). C'est
ça, le lien entre les tables : chaque enfant dit « j'appartiens au dossier n° X ».

```
                       dossiers  (1 ligne = 1 page)
                          │  id
        ┌─────────────────┼──────────────────┬─────────────────────┐
        │ dossier_id      │ dossier_id       │ dossier_id          │ dossier_id
   dossier_preuves   dossier_images    dossiers_lies          (aucune autre)
   (0..N preuves)    (0..N scans)      (0..N « voir aussi »)
```

- **`dossiers`** — le contenu rédigé de la page (une ligne).
- **`dossier_preuves`** — les preuves : elles ne **recopient rien**, elles
  **pointent** vers un hadith / une parole / un verset **déjà en base**.
- **`dossier_images`** — les scans de pages de livres (juste l'URL + un `alt`).
- **`dossiers_lies`** — les renvois vers d'autres dossiers (« Voir aussi »).

> Les 3 enfants sont **facultatifs** : un dossier peut n'avoir aucune preuve,
> aucune image, aucun lié. La page s'affiche quand même.

### 5.2 Colonnes de `dossiers` — que mettre dans chacune

| Colonne | Rôle | Comment la choisir |
|---|---|---|
| `slug` | identifiant d'URL (`/dossiers/le-sens-de-l-istiwa`) | minuscules, tirets, **sans accent**, stable dans le temps, unique |
| `h1` | le grand titre affiché en haut | phrase lisible, ex. `Le sens de l'istiwāʾ` |
| `meta_title` | balise `<title>` (onglet + Google) | ~60 caractères ; si vide → `h1` est utilisé |
| `meta_description` | description SEO + aperçu de partage | 150–160 caractères qui résument la page ; optionnel |
| `croyance_texte` | l'exposé de **la croyance correcte** (Markdown) | le cœur du dossier |
| `objection_texte` | **l'objection / le doute** que l'on veut lever (Markdown) | optionnel (laisse vide s'il n'y a pas d'objection) |
| `reponse_texte` | **la réponse** qui lève l'objection (Markdown) | optionnel |
| `published` | brouillon (`false`) ou en ligne (`true`) | reste à `false` tant que ce n'est pas prêt |
| `created_at` | date de création | **auto**, ne pas y toucher |

### 5.3 Colonnes de `dossier_preuves` — la mécanique « type + ref_id »

Une preuve **référence** un contenu existant. Deux colonnes suffisent :

| `type` | `ref_id` pointe vers… | Exemple |
|---|---|---|
| `'hadith'` | `hadiths.id` | un hadith déjà saisi |
| `'parole'` | `paroles.id` | une parole de savant déjà saisie (avec son scan sur `/paroles/:slug`) |
| `'verset'` | **`coran.id`** | un verset de la table de contenu `coran` |

- `dossier_id` : à quel dossier appartient la preuve.
- `ordre` : ordre d'affichage (0, 1, 2… ; les plus petits en premier).

> ⚠️ Ici `type='verset'` = une ligne de la table **`coran`** (pas de la table
> `versets_equivoques`). **On ne retape jamais** le texte : on met juste l'`id`.
> C'est le même mécanisme que `attribut_citations` et `verset_preuves`.

### 5.4 Colonnes de `dossier_images` — et surtout : bien choisir `alt`

| Colonne | Rôle | Comment la choisir |
|---|---|---|
| `dossier_id` | à quel dossier appartient le scan | — |
| `image_url` | l'URL publique du fichier `.webp` dans le bucket `references` | copiée depuis Storage (voir §8) |
| `alt` **(obligatoire)** | texte alternatif : ce que **décrit** l'image | voir la règle ci-dessous |
| `legende` | légende courte affichée **sous** l'image | ex. `Al-Asmāʾ wa ṣ-Ṣifāt, p. 88` |
| `source_livre` | référence précise (livre + page) | ex. `Al-Asmāʾ wa ṣ-Ṣifāt d'Al-Bayhaqī, p. 88` |
| `ordre` | ordre d'affichage | 0, 1, 2… |

**Règle pour `alt`** (accessibilité pour les non-voyants **et** référencement
Google) : décris **le contenu** de l'image, pas le fichier.

- ✅ « Scan de la page 88 du livre *Al-Asmāʾ wa ṣ-Ṣifāt* de l'imam Al-Bayhaqī :
  le passage où il explique que l'istiwāʾ ne signifie pas être assis. »
- ❌ « image », « scan.webp », « photo du livre » (ne décrit rien).

Concret, une phrase, sans « image de… » au début (le lecteur d'écran l'annonce
déjà). Vise **ce qu'un lecteur y verrait** s'il pouvait lire la page.

> Toujours **doubler un scan d'une transcription texte** (arabe + traduction) via
> une preuve `dossier_preuves` : une image n'est ni indexée ni sélectionnable.

### 5.5 Colonnes de `dossiers_lies` — les renvois « Voir aussi »

Table de **liaison** pure (pas d'`id` propre) : deux colonnes.

| Colonne | Rôle |
|---|---|
| `dossier_id` | le dossier **d'où part** le lien (la page qu'on regarde) |
| `dossier_lie_id` | le dossier **vers lequel** on renvoie |

> ⚠️ Le lien est **à sens unique**. Pour qu'un renvoi apparaisse sur **les deux**
> dossiers, insère **les deux sens** (A→B *et* B→A).

### 5.6 Exemple complet : un dossier de A à Z

```sql
-- (1) LE DOSSIER (le parent). Colle l'arabe éventuel toi-même.
insert into public.dossiers
  (slug, h1, meta_title, meta_description,
   croyance_texte, objection_texte, reponse_texte, published)
values
  ('le-sens-de-l-istiwa',
   'Le sens de l''istiwāʾ',
   'Le sens de l''istiwāʾ — la croyance de Ahlou s-Sounnah',
   'Ce que signifie réellement l''istiwāʾ dans le Coran, sans attribuer à Allāh un lieu ni une position.',
   '⟨exposé de la croyance, en Markdown⟩',
   '⟨l''objection à lever, en Markdown⟩',
   '⟨la réponse, en Markdown⟩',
   false)                 -- brouillon : on publiera après relecture
returning id;             -- note l'id → :DID

-- (2) LES PREUVES : on pointe des contenus existants (rien n'est recopié).
insert into public.dossier_preuves (dossier_id, type, ref_id, ordre) values
  (:DID, 'verset', 123, 0),   -- ref_id = coran.id    (123 = un id de la table `coran`)
  (:DID, 'hadith', 10,  1),   -- ref_id = hadiths.id  (10  = un id de la table `hadiths`)
  (:DID, 'parole', 42,  2);   -- ref_id = paroles.id  (42  = un id de la table `paroles`)
-- (ou, sans connaître l'id du dossier, via le slug :)
insert into public.dossier_preuves (dossier_id, type, ref_id, ordre)
select d.id, 'hadith', 10, 1 from public.dossiers d where d.slug = 'le-sens-de-l-istiwa';

-- (3) UN SCAN DE LIVRE (l'image vit dans Storage, ici on stocke l'URL + l'alt).
insert into public.dossier_images (dossier_id, image_url, alt, legende, source_livre, ordre)
select d.id,
  'https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/bayhaqi-p88.webp',
  'Scan de la page 88 du livre Al-Asmāʾ wa ṣ-Ṣifāt de l''imam Al-Bayhaqī : le passage où il explique que l''istiwāʾ ne signifie pas être assis.',
  'Al-Asmāʾ wa ṣ-Ṣifāt, p. 88',
  'Al-Asmāʾ wa ṣ-Ṣifāt d''Al-Bayhaqī, p. 88',
  0
from public.dossiers d where d.slug = 'le-sens-de-l-istiwa';

-- (4) UN DOSSIER LIÉ (« Voir aussi »). Les deux sens pour un renvoi réciproque.
insert into public.dossiers_lies (dossier_id, dossier_lie_id)
select a.id, b.id from public.dossiers a, public.dossiers b
where a.slug = 'le-sens-de-l-istiwa' and b.slug = 'allah-existe-sans-endroit';
insert into public.dossiers_lies (dossier_id, dossier_lie_id)
select b.id, a.id from public.dossiers a, public.dossiers b
where a.slug = 'le-sens-de-l-istiwa' and b.slug = 'allah-existe-sans-endroit';

-- (5) QUAND C'EST PRÊT : publier.
update public.dossiers set published = true where slug = 'le-sens-de-l-istiwa';
```

---

## 5 bis. Versets équivoques (mutashābih) — même logique, une nuance

Rubrique **Croyance → Versets équivoques** : un verset dont le sens littéral
prête à confusion, expliqué (objection → réponse). Structure **identique** aux
dossiers (1 parent + tables enfant reliées par `verset_id`), avec **une seule
différence** sur les preuves.

```
             versets_equivoques  (1 ligne = 1 fiche de verset)
                       │  id
     ┌─────────────────┼──────────────────┬────────────────────┐
     │ verset_id       │ verset_id        │ verset_id
 verset_preuves   verset_images     verset_lies
 (0..N preuves)   (0..N scans)      (0..N versets liés)
```

### 5bis.1 `versets_equivoques` — le verset est écrit **en clair** ici

Contrairement aux preuves, **le verset équivoque lui-même n'est pas une
référence** : son texte est stocké directement dans la table.

| Colonne | Rôle | Comment la choisir |
|---|---|---|
| `slug` | id d'URL (`/croyance/versets-equivoques/⟨slug⟩`) | minuscules-tirets, sans accent, unique |
| `theme` | regroupement (ex. « Le visage », « La main ») | sert à classer les fiches |
| `sourate` | nom de la sourate (texte) | ex. `Al-Fajr` |
| `sourate_num` | n° de sourate (1–114) | pour l'ordre ; optionnel |
| `ayah` | n° du verset | optionnel |
| `verset_arabe` | le texte arabe du verset **(en clair)** | colle-le toi-même |
| `verset_traduction` | traduction française | — |
| `verset_phonetique` | translittération | optionnel |
| `sens_juste` | le sens correct, en une phrase | le résumé de la réponse |
| `objection` | le doute / la mauvaise compréhension (Markdown) | optionnel |
| `reponse` | la réfutation détaillée (Markdown) | optionnel |
| `published` | brouillon / en ligne | `false` par défaut |

### 5bis.2 `verset_preuves` — **la** nuance à retenir

| `type` | Où est le texte de la preuve | Colonne utilisée |
|---|---|---|
| `'hadith'` | référence → `hadiths.id` | `ref_id` |
| `'parole'` | référence → `paroles.id` | `ref_id` |
| `'coran'` | **tapé en clair** (pas de référence) | **`contenu_libre`** |

C'est la seule différence avec `dossier_preuves` : pour appuyer par **un autre
verset du Coran**, on écrit le passage directement dans `contenu_libre`
(`ref_id` reste vide). Pour un hadith ou une parole, on référence par `ref_id`
comme partout ailleurs. `verset_id` et `ordre` complètent la ligne.

### 5bis.3 `verset_images` et `verset_lies` — à quoi elles servent

- **`verset_images`** — mêmes colonnes que `dossier_images`
  (`verset_id, image_url, alt, legende, source_livre, ordre`), pour joindre un
  **scan de livre**. ⚠️ Il ne s'agit **pas** de mettre une image du verset du
  Coran (tu n'en mettras pas) : c'est prévu pour scanner **la page d'un savant
  qui explique** le verset. **Si tu n'en mets aucune, la table reste vide et la
  fiche s'affiche très bien sans** — c'est un ajout facultatif.
- **`verset_lies`** — table de liaison (`verset_id`, `verset_lie_id`) : relie
  une fiche à d'autres **versets équivoques** proches (« Versets liés »). À sens
  unique, comme `dossiers_lies` (insère les deux sens pour un renvoi réciproque).

### 5bis.4 Exemple complet

```sql
-- (1) LA FICHE DU VERSET (colle l'arabe toi-même).
insert into public.versets_equivoques
  (slug, theme, sourate, sourate_num, ayah,
   verset_arabe, verset_traduction, verset_phonetique,
   sens_juste, objection, reponse, published)
values
  ('la-main-sourate-38-75', 'La main (yad)', 'Sad', 38, 75,
   '⟨verset arabe⟩', '⟨traduction⟩', '⟨phonétique⟩',
   '« yad » désigne ici l''attribut/la faveur, non un membre.',
   '⟨l''objection, en Markdown⟩', '⟨la réponse, en Markdown⟩',
   false)
returning id;             -- → :VID

-- (2) LES PREUVES : un verset d'appui tapé en clair + une parole référencée.
insert into public.verset_preuves (verset_id, type, contenu_libre, ordre)
values (:VID, 'coran', '⟨un autre passage coranique + sa traduction⟩', 0);
insert into public.verset_preuves (verset_id, type, ref_id, ordre)
values (:VID, 'parole', 42, 1);          -- ref_id = paroles.id (42 = une parole existante)

-- (3) (facultatif) un scan de la page d'un savant qui explique — PAS le verset.
insert into public.verset_images (verset_id, image_url, alt, legende, source_livre, ordre)
select v.id,
  'https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨fichier⟩.webp',
  '⟨ce que montre la page : quel savant, quel livre, quelle explication⟩',
  '⟨légende courte⟩', '⟨livre, page⟩', 0
from public.versets_equivoques v where v.slug = 'la-main-sourate-38-75';

-- (4) un verset lié (« Voir aussi »), réciproque.
insert into public.verset_lies (verset_id, verset_lie_id)
select a.id, b.id from public.versets_equivoques a, public.versets_equivoques b
where a.slug = 'la-main-sourate-38-75' and b.slug = '⟨autre-verset⟩';

-- (5) publier.
update public.versets_equivoques set published = true where slug = 'la-main-sourate-38-75';
```

> **À retenir** — une preuve se **référence** (`type + ref_id`), un texte propre
> à la fiche se **saisit** (le verset équivoque dans `versets_equivoques`, un
> verset d'appui dans `verset_preuves.contenu_libre`). Une **parole** se crée
> **une seule fois** dans `paroles` (avec son scan) puis se pointe partout.

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

### Scans d'une **parole** (`parole_images`) — 0..N par parole

Une parole peut avoir **plusieurs** scans. Il n'y a **pas** de colonne image sur
`paroles` : les scans passent **uniquement** par la table enfant `parole_images`
(0..N par parole). Ils ne vivent **que** sur la parole (`/paroles/:slug`) — sur
la page d'un attribut on ne montre qu'un extrait court **sans** scan, avec un
lien vers la parole.

`parole_images(parole_id, image_url, alt, legende, source_livre, ordre)` — mêmes
colonnes et **même règle pour `alt`** que `dossier_images` (voir §5.4).

```sql
-- Rattacher 3 pages scannées à une parole (via son slug).
insert into public.parole_images (parole_id, image_url, alt, legende, source_livre, ordre)
select p.id, v.image_url, v.alt, v.legende, v.source_livre, v.ordre
from public.paroles p,
  (values
    ('https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨livre-p12⟩.webp',
     '⟨ce que montre la page 12 : savant, livre, passage cité⟩', '⟨légende⟩', '⟨livre, p. 12⟩', 0),
    ('https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨livre-p13⟩.webp',
     '⟨ce que montre la page 13⟩', '⟨légende⟩', '⟨livre, p. 13⟩', 1),
    ('https://kxzfwtwbghuvnlueusvp.supabase.co/storage/v1/object/public/references/⟨livre-p14⟩.webp',
     '⟨ce que montre la page 14⟩', '⟨légende⟩', '⟨livre, p. 14⟩', 2)
  ) as v(image_url, alt, legende, source_livre, ordre)
where p.slug = '⟨slug-de-la-parole⟩';
```

La page `/paroles/:slug` affiche alors les 3 scans, chacun agrandissable en
lightbox (fermable Échap). `ordre` fixe l'ordre d'affichage.

---

## 9. Sauvegarde

Avant toute grosse modification : voir la section « backup » — un `pg_dump`
(ou l'export Supabase) capture tout (schéma + données + fonctions).

---

## 10. Colonnes & tables particulières (à quoi elles servent)

### Booléens / colonnes techniques

- **`savants.generation`** *(texte)* — génération du savant. Valeurs autorisées
  (contrainte CHECK) : `sahabi` (Compagnon), `salaf` (générique), `tabii`,
  `tabi_tabii`, `khalaf`. Pilote le **badge** affiché sur la fiche, l'annuaire
  et les paroles. Toute autre valeur est **refusée** à l'écriture (c'est la
  cause du message d'erreur si on tape autre chose).
- **`savants.generation_a_verifier`** *(booléen)* — `true` quand la `generation`
  a été **amorcée automatiquement** (déduite des dates de décès) et reste **à
  vérifier**. Mets-le à `false` quand tu confirmes la valeur à la main.
- **`savants.resume_auto`** *(booléen, défaut `false`)* — indique que le champ
  `resume` (la phrase courte de la carte d'annuaire) a été **généré
  automatiquement** (dérivé de la biographie) et non écrit à la main. Sert
  seulement à repérer les résumés à relire ; **n'influence pas l'affichage**.
- **`noms_allah.a_relire`** *(booléen, défaut `true`)* — marque que la ligne
  (nom arabe + translittération) vient d'une **liste amorcée** et doit être
  **relue/validée**. Passe-le à `false` une fois vérifié. (Le `sens_fr` et
  l'`explication`, eux, sont à saisir par l'auteur.)
- **`dossiers.published`** *(booléen)* — un dossier n'apparaît sur le site que
  si `published = true`. Permet de préparer un dossier **en brouillon**.
- **`dossiers.meta_description`** *(texte)* — la **description SEO** de la page
  du dossier (balise `<meta name="description">` + aperçu de partage). Optionnel :
  si vide, aucune meta n'est posée.
- **`fiqh.type`** *(texte)* — catégorie/nature d'un point de fiqh (ex.
  « jugement », « preuve », « avis »…). **Champ libre, actuellement vide partout**,
  prévu pour classer les points dans un chapitre. Tu peux l'ignorer pour l'instant.
- **`paroles.search_fr`** *(tsvector)* — **index de recherche plein-texte
  français**, rempli **automatiquement** par un trigger. Utilisé par la fonction
  `search_paroles`. **Ne jamais l'écrire à la main.** (idem `hadiths.search_fr`)

### Tables : `recueils`, `tags`, `tag`

- **`recueils`** *(utile)* — un **ouvrage** (un livre = une ligne), relié à son
  **auteur**. Colonnes :
  - **`titre`** — l'**identité du livre** (ex. « Sahih al-Bukhari »). **C'est lui
    qui s'affiche** comme source sur la fiche hadith.
  - **`titre_arabe`** *(optionnel)* — le titre en arabe.
  - **`savant_id`** *(FK → `savants`)* — l'**auteur** de l'ouvrage. Le nom de
    l'auteur vient du join, il n'est **pas** stocké dans `recueils`.
  - **`slug`** *(unique)* — id d'URL (future page d'ouvrage).
  - **`type`** — `'recueil'` (original) · `'sharh'` (commentaire) · `'hashiya'`
    (glose). Défaut `'recueil'`.
  - **`commente_recueil_id`** *(FK → `recueils.id`, nullable)* — pour un
    `sharh`/`hashiya` : l'**ouvrage commenté**. L'auteur de l'original se déduit
    par `commente_recueil_id → recueils → savant_id`.

  > L'ancienne colonne `nom` (nom d'auteur) a été **supprimée** : le nom de
  > l'auteur vient du join `savant_id → savants.nom`, il n'est plus stocké ici.

  Un même auteur peut avoir **plusieurs livres = plusieurs lignes**. Certains
  `titre` sont **provisoires** (auteurs à plusieurs ouvrages : Al-Bayhaqî,
  At-Tabarânî, Ibn Hajar, As-Sakhâwî, Ibn al-Jawzî, As-Souyoutî, Al-Qourtoubî) ;
  **Aboû l-Qâçim al-Ansârî** porte encore un **titre placeholder** (= son nom) à
  remplacer par le vrai ouvrage. Reliée aux hadiths via
  `hadith_sources(hadith_id, recueil_id, numero, chapitre)` — un hadith pointe
  vers un ouvrage + son `numero`.

  ```sql
  -- Corriger / renseigner le titre d'un ouvrage
  update public.recueils set titre = 'Al-Asma'' wa s-Sifat', slug = 'al-asma-wa-s-sifat'
  where slug = 'as-sounan-al-koubra';   -- (ou l'ouvrage voulu)

  -- Ajouter un SECOND livre d'un auteur (nouvelle ligne, même savant_id)
  insert into public.recueils (slug, titre, savant_id)
  select 'shou-ab-al-iman', 'Shou''ab al-Iman', s.id
  from public.savants s where s.slug = 'al-bayhaqi';

  -- Un COMMENTAIRE (sharḥ) = un ouvrage à part entière qui en commente un autre
  insert into public.recueils (slug, titre, savant_id, type, commente_recueil_id)
  select 'at-tawshih', 'At-Tawshīḥ', s.id, 'sharh', r.id
  from public.savants s, public.recueils r
  where s.slug = 'imam-as-souyoutiyy' and r.titre = 'Sahih al-Bukhari';
  -- Affichage : « At-Tawshīḥ — commentaire de Sahih al-Bukhari (par Imam As-Souyoutiyy) »

  -- Relier un hadith à un ouvrage précis + son numéro
  insert into public.hadith_sources (hadith_id, recueil_id, numero)
  select :HID, r.id, '2517' from public.recueils r where r.slug = 'sahih-al-bukhari';
  ```

  > Le libellé de source est construit par la fonction `recueil_label(recueil_id,
  > numero)` (titre + éventuel titre arabe + clause de commentaire + n°), utilisée
  > par `get_hadith` et `get_dossier`. Le `numero` de `hadith_sources` est encore
  > vide partout : renseigne-le pour afficher « … (n° 2517) ».
- **`tags`** *(pluriel — 87 lignes — utile)* — le **référentiel normalisé des
  mots-clés** (`id, nom, slug`), relié aux hadiths par `hadith_tags`. C'est la
  version « propre » et réutilisable des tags (une ligne par tag, avec slug).
- **`tag`** *(singulier — 34 lignes — INUTILE / hérité)* — table **redondante et
  non utilisée** : aucune liaison ne pointe vers elle et le code ne l'interroge
  jamais. À ne pas confondre avec (a) la **colonne** texte `tag` (CSV) des tables
  de contenu, ni (b) la table `tags` ci-dessus (qui, elle, sert). Elle peut être
  supprimée sans risque (`drop table public.tag;`) — laissée en place elle est
  simplement inerte.
