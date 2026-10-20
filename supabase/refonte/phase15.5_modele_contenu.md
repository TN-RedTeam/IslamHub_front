# Phase 15.5 — Modèle de données du contenu · POINT D'ÉTAPE (avant migration)

> **Statut : proposition à valider. Aucune migration n'a été appliquée à ce stade.**
> Base inspectée : projet Supabase `islamHub_back` (`kxzfwtwbghuvnlueusvp`), Postgres 17.

---

## 1. État des lieux du schéma

### 1.1 Ce que le socle 15.1 a déjà fait (`phase15_i18n.sql`, appliqué)

Sur **12 tables de contenu de 1er niveau**, en **ADD only**, avec **backup** préalable
(`<table>_backup_phase15`) :

- `locale text not null default 'fr'` + `check (locale in ('fr','en','ar'))`
- `translation_group uuid not null default gen_random_uuid()` (un groupe par ligne existante)
- index sur `locale` et `translation_group`
- `publiee boolean not null default true` pour les tables qui n'avaient pas de flag

| Table | locale/tg | flag de publication |
|---|---|---|
| coran | ✓ | `publiee` |
| hadiths | ✓ | `publiee` |
| paroles | ✓ | `publiee` |
| invocations | ✓ | `publiee` |
| savants | ✓ | `publiee` |
| sourates | ✓ | `publiee` |
| femmes | ✓ | `publiee` |
| fiqh | ✓ | `publiee` |
| dossiers | ✓ | `published` |
| exposes | ✓ | `published` |
| recits | ✓ | `published` |
| versets_equivoques | ✓ | `published` |

### 1.2 Colonnes « arabe sacré » déjà présentes (à NE PAS re-stocker par langue)

Partagées par le groupe, affichées quelle que soit la langue d'interface :
`coran.texte_arabe` (+`arabe_hash`), `hadiths.texte_arabe` (+`arabe_hash`),
`paroles.texte_arabe` (+`arabe_hash`), `invocations.texte_arabe`,
`femmes.texte_arabe`, `fiqh.texte_arabe`, `exposes.verset_arabe`,
`versets_equivoques.verset_arabe`, `savants.nom_arabe`, `sourates.nom_arabe`,
`recueils.titre_arabe`, `noms_allah.nom_arabe`, `attribut_citations.arabe`,
`contenu_blocs.libre_arabe`, table dédiée `versets` / `hadith_arabe`.

### 1.3 Tables traduisibles NON encore couvertes (le vrai sujet de 15.5)

| Table | lignes | contenu traduisible | arabe sacré (partagé) |
|---|---|---|---|
| `exegeses` | 993 | `texte` (tafsir), `source` | — (lié à `versets`) |
| `contenu_blocs` | 67 | `texte_md`, `commentaire_md`, `libre_traduction`, `libre_ref` | `libre_arabe` |
| `noms_allah` | 99 | `sens_fr`, `explication`, `translitteration` | `nom_arabe` |
| `attributs` | 13 | `nom`, `gloss`, `explication` | — |
| `attribut_citations` | 20 | `signification`, `phonetique`, `ref` | `arabe` |
| `themes` | 32 | `nom` (libellé) | — |
| `tags` | 98 | `nom` (libellé) | — |
| `narrateurs` | 47 | `role`, `generation` | `nom` (translit.) |
| `recueils` | 37 | `titre` | `titre_arabe` |
| `mutashabih_exemples` | 0 | (vide) | `mot_arabe` |

**Sacré pur / partagé, non traduisible par cette mécanique** : `versets` (1003,
texte coranique + numérotation), `hadith_arabe`, `noms_allah.nom_arabe`.

**Legacy, hors périmètre** : `dhikrs` (4), `douaas` (51) — fusionnés dans
`invocations` (76) ; le site public lit `invocations`. À ne pas interner.

### 1.4 ⚠️ Problème de sécurité détecté (introduit par les backups 15.1)

Les 13 tables de sauvegarde ont **RLS désactivé** → **lisibles ET modifiables
avec la clé anon** : `*_backup_phase15` (12) + `femmes_backup_phase14`.
À corriger (voir §5). Aussi présents : `hadiths_backup_phase1`,
`savants_backup_phase10`, `_bkp_p7_brackets`, `admin_replace_backups` (à auditer).

### 1.5 Incohérences mineures à acter (non bloquantes)

- Flag de publication hétérogène : `publiee` (8 tables) vs `published` (4) vs
  `actif` (moments). On garde tel quel (pas de renommage destructif) ; la couche
  requêtes gère les deux noms.
- Pas encore de contrainte `unique (translation_group, locale)` → rien n'empêche
  deux FR dans un même groupe (voir §3).

---

## 2. Modèle retenu (recommandation)

**Ligne-par-langue + `translation_group`** (déjà engagé par 15.1), **confirmé**,
plutôt que des colonnes JSONB `*_i18n` :

- l'**arabe indépendant** (AR = son propre corpus, parfois sans équivalent FR) se
  modélise mal en JSONB mais naturellement en lignes distinctes ;
- `publiee` **par ligne** = publication par langue « gratuite » ;
- pas de réécriture du code existant (tout l'existant = `locale='fr'`).

### 2.1 Principe clé à formaliser : **ligne canonique + surcouche de traduction**

Une entrée EN/AR **ne duplique pas** l'arabe sacré ni les relations (sources,
tags, images, numérotation). La ligne **FR = canonique** porte ces données
partagées ; les lignes EN/AR ne portent que le **texte traduisible** et laissent
les colonnes sacrées/relationnelles vides. À l'affichage, on résout par
`translation_group` : **données partagées lues sur la ligne canonique du groupe,
texte traduisible lu sur la ligne de la langue demandée.**

- **FR ↔ EN** : l'entrée EN reprend le `translation_group` de son entrée FR.
- **AR** : son propre `translation_group` (indépendant), **ou** rejoint un groupe
  existant quand un équivalent FR existe — le `translation_group` **est** le lien
  (optionnel par nature), pas besoin de FK supplémentaire.

### 2.2 Cas particuliers (décisions demandées — voir §6)

- **Tables enfant / corps d'article** (`contenu_blocs`, `exegeses`,
  `attribut_citations`) : rattachées à la ligne **canonique**. Leur texte
  traduisible (`texte_md`, `commentaire_md`, `libre_traduction`, exégèse `texte`,
  `signification`…) devra être localisé plus tard. **Décision à prendre** :
  (A) ajouter `locale`+`translation_group` sur `contenu_blocs`/`exegeses` (blocs
  traduits = nouvelles lignes liées au bloc FR), ou (B) attacher les blocs au
  parent par langue. **Reco : (A)** — cohérent avec le reste, l'arabe sacré du
  bloc (`libre_arabe`) reste sur le bloc canonique.
- **Libellés de taxonomie** (`themes.nom`, `tags.nom`) : courts, nombreux.
  **Décision** : lignes-par-langue comme le reste (cohérent) **vs** petite table
  `*_i18n(ref_id, locale, nom)`. **Reco : lignes-par-langue** pour l'uniformité.
- **`noms_allah`, `attributs`** : l'arabe (`nom_arabe`) reste partagé ; seuls
  `sens_fr`/`explication`/`gloss` se traduisent → `locale`+`translation_group`.

---

## 3. Plan de migration NON DESTRUCTIF proposé (à appliquer APRÈS validation)

Même patron que 15.1 : **backup d'abord, ADD only, aucune colonne touchée.**

1. **Étendre l'i18n aux tables traduisibles non couvertes** retenues en §2.2
   (a minima `contenu_blocs`, `exegeses`, `noms_allah`, `attributs`,
   `attribut_citations`, `themes`, `tags`, `narrateurs`, `recueils`) :
   `locale` (+check), `translation_group` (défaut = gen_random_uuid()),
   index, et `publiee` si pas de flag.
2. **Intégrité** (optionnel mais recommandé) : `unique (translation_group, locale)`
   sur chaque table internée (un groupe ⇒ au plus une ligne par langue). À vérifier
   qu'aucune donnée actuelle ne la viole (tout est FR distinct → OK).
3. **Requêtes locale-aware** : une **vue** ou des helpers applicatifs par type qui
   renvoient, pour une `locale` demandée, la ligne canonique FR + surcouche de la
   langue. Pas de DDL destructif ; peut se faire côté app d'abord.
4. **RLS** : policies de lecture publique inchangées sur le fond, mais vérifier
   qu'elles filtrent bien le flag de publication ; le **filtre par langue** se fait
   côté requêtes (§4). Activer RLS sur les tables de backup (§5).

> Chaque étape = 1 migration SQL idempotente + bloc de **preuve** (counts avant/après,
> « aucune ligne perdue, tout en FR »), comme `phase15_i18n.sql`.

---

## 4. Stratégie de fallback & requêtes locale-aware

- **EN manquant → repli FR** : si aucune ligne `locale='en' & publiee` dans le
  groupe, servir la ligne FR (ne jamais afficher une page vide pendant la
  traduction progressive).
- **AR → PAS de repli FR pour le CONTENU** : l'arabe est son propre corpus ; on
  n'affiche que les entrées `locale='ar' & publiee`. (L'**interface**, elle, retombe
  sur FR tant qu'`ar.json` n'est pas rempli — ça, c'est 15.2, déjà en place.)
- **`publiee` respecté par langue** : une entrée peut être publiée en FR et pas
  encore en EN.
- **Arabe sacré** : toujours lu sur la ligne canonique du groupe, affiché quelle
  que soit la langue (jamais re-stocké, jamais traduit).

---

## 5. Correctif sécurité à intégrer (RLS backups)

Les tables de sauvegarde sont exposées en lecture/écriture via la clé anon.
Reco : activer RLS **sans** policy (donc lecture/écriture bloquées pour anon ;
l'admin via service role garde l'accès), ou mieux, **supprimer les backups**
une fois la non-régression confirmée. SQL d'activation (à valider) :

```sql
alter table public.dossiers_backup_phase15 enable row level security;
-- … idem pour les 12 autres backups + femmes_backup_phase14
```

(Ne pas auto-appliquer : à décider avec toi — activer RLS sans policy bloque tout
accès, ce qui est l'effet voulu pour des backups.)

---

## 6. Décisions demandées avant de coder la migration

1. **Tables à interner maintenant** : la liste §1.3 complète, ou un sous-ensemble
   (p.ex. repousser `exegeses`/`contenu_blocs` plus tard) ?
2. **`contenu_blocs` / `exegeses`** : option (A) `locale`+`translation_group` sur
   la table enfant [reco], ou (B) rattachement au parent par langue ?
3. **Taxonomie (`themes`, `tags`)** : lignes-par-langue [reco] ou table `*_i18n` ?
4. **Contrainte `unique (translation_group, locale)`** : on l'ajoute [reco] ?
5. **Fallback** : confirmes-tu EN→FR, AR sans repli de contenu, `publiee` par langue ?
6. **Backups RLS** : activer RLS sans policy [reco], supprimer les backups, ou laisser ?

> Dès validation (et ajustements), je prépare les migrations SQL idempotentes
> (backup + ADD only + preuve) et la couche de requêtes locale-aware — un commit
> par incrément, comme pour 15.3/15.4.
