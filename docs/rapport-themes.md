# Phase 15 — Rapport de validation du thématisage (étape 15.4)

> **Point d'étape obligatoire.** Le référentiel (`themes`), le dictionnaire
> (`theme_tags`) et les liaisons ont été créés et **peuplés uniquement pour les
> correspondances exactes** du mapping §15.2. Tout ce qui suit **n'a PAS été
> rattaché automatiquement** — tu tranches, puis je relance le peuplement (il est
> idempotent).

## Peuplement automatique réalisé (correspondances exactes)
- **Coran** : 19 liaisons · **Hadiths** : 120 liaisons · **Paroles** : 67 liaisons.
- Tables : `themes` (31), `theme_tags` (79 lignes de mapping), `coran_themes`,
  `hadith_themes`, `parole_themes` (RLS lecture publique). Backup des tags dans le
  schéma `backup`.

---

## a) Tags non mappés

### a.1 — Noms propres / titres → **à ignorer** (ne sont pas des thèmes)
| token | occ. |
|---|---|
| `salahou d-din al-'ayyoubiyy` | 1 |
| `al-ach’ari` | 1 |
| `ibnou ʿabbās` | 1 |

### a.2 — **Quasi-correspondances** (variante d'un token déjà mappé : apostrophe, diacritique, orthographe)
Ces tags **devraient** matcher mais ne le font pas (la normalisation conserve
accents/diacritiques et ne touche pas aux apostrophes). **Proposition** : ajouter
la variante à `theme_tags` (ou corriger le tag du contenu).

| token présent | variante déjà mappée | thème proposé |
|---|---|---|
| `ta’wil` (apostrophe courbe ’) | `ta'wil` (droite) | `tawil-equivoques` |
| `qour’an` | (absent du mapping) | `tawil-equivoques` ? |
| `qiyām` (macron) | `qiyam` | `priere` |
| `'istighfar` (apostrophe initiale) | `istighfar` | `dhikr-repentir` |
| `ḥirz` (ḥ) | `hirz` | `hirz` |
| `chatîment` (faute : î) | `châtiment` | `tombe` |
| `raisonnment` (faute : e manquant) | `raisonnement` | `jugement-rationnel` |

### a.3 — Autres tags non mappés → **tu décides** (ajouter au mapping, ou ignorer)
| token | occ. | piste (à valider) |
|---|---|---|
| `tombe` | 9 | thème `tombe` (le token `tombe` a été **omis** du seed §15.2 ; seuls supplice/châtiment/félicité y sont) — **fort candidat** |
| `parole` / `paroles` | 4 / 1 | `tawhid` (parole « lā ilāha illā Llāh ») ? ou générique à ignorer |
| `mariage` | 2 | `femme-couple-famille` ? |
| `obéissance` | 2 | `bon-comportement` ? |
| `paradis-enfer` | 1 | `jour-dernier` ? (composé) |
| `musulmans` | 1 | `jour-dernier` ? |
| `repentir` | 1 | `dhikr-repentir` ? |
| `coran` | 1 | `recitation-quran` ? |
| `exégèse` | 1 | (rubrique Coran plutôt qu'un thème ?) |
| `intention` | 1 | `bon-comportement` / `mort-oeuvres` ? |
| `jugement` | 1 | **attention** : ici (hadith 156 « Nul ne sait l'heure du jour dernier ») = `jour-dernier`, **pas** `jugement-rationnel` |
| `visite` | 2 | composant du composé `visite-tombe-prophete` (voir c) |

---

## b) Contenus sans aucun thème (20)
À relire — soit ajouter un thème via le mapping, soit rattacher à la main.

| src | id | sujet | tag |
|---|---|---|---|
| coran | 15 | Visite de la Tombe du Prophète | visite, tombe, prophète |
| hadith | 40 | Le Repentir | repentir |
| hadith | 50 | La Meilleure parole | parole |
| hadith | 65 | Hadith Qoudoussy | *(vide)* |
| hadith | 73 | La visite des tombes | tombe |
| hadith | 82 | évoquer le prophète en son absence | prophète |
| hadith | 83 | al-istighāthah et al-istiʿānah | *(vide)* |
| hadith | 85 | Entrée en Islam | *(vide)* |
| hadith | 99 | Les caractéristiques des Prophètes | prophètes |
| hadith | 104 | Visiter la tombe du Prophète | visite, tombe, prophète |
| hadith | 135 | La demande de pardon ('istighfar) | 'istighfar |
| hadith | 136 | La demande de pardon ('istighfar) | *(vide)* |
| hadith | 154 | Le Discours du Contrat de Mariage | mariage |
| hadith | 155 | Le Mariage | mariage |
| hadith | 156 | Nul ne sait l'heure du jour dernier hormis Allah | jugement |
| parole | 44 | La Récitation du Qour'ān en faveur du mort | *(vide)* |
| parole | 53 | La Croyance enseignée par Ibnou ^Açakir | *(vide)* |
| parole | 55 | Traité de croyance - Salahou d-Din Al-'Ayyoubiyy | Salahou d-Din Al-'Ayyoubiyy |
| parole | 56 | Le Tawassoul est permis et pratiqué par les compagnons | *(vide)* |
| parole | 57 | L'Imâm de Ahlou s-Sounnah Abou l-Haçan Al-Ach'ari | Al-Ach'ari |

> La plupart se résolvent en traitant a.2/a.3 et c) ci-dessous. Restent des
> contenus **sans tag** (hadith 65, 83, 85, 136 ; parole 44, 53, 56) → il faudra
> leur ajouter un tag, ou les thémer à la main.

---

## c) Cas composés / ambigus — **rapport seulement, aucune insertion**

### `prophète` (singulier) — vise souvent le Prophète Muḥammad ﷺ
- hadith 82 — « évoquer le prophète en son absence »
→ à rattacher à `prophetes` (les Prophètes en général) **ou** à la famille *Le Prophète ﷺ* ? À toi.

### `prophètes` (pluriel) → thème `prophetes` (candidat, à confirmer)
- hadith 44 — Les caractéristiques des Prophètes
- hadith 45 — La Parole des Prophètes
- hadith 99 — Les caractéristiques des Prophètes
- parole 34 — La meilleure des femmes est Maryam…

### `salat-ala-nabi` (invocation en faveur du Prophète) — candidats (invocation + prophète)
- hadith 100, 101, 113, 114
→ confirmer le rattachement à `salat-ala-nabi`.

### `visite-tombe-prophete` — candidats (visite + tombe + prophète)
- coran 15 — Visite de la Tombe du Prophète
- hadith 104 — Visiter la tombe du Prophète
- hadith 73 — « La visite des tombes » (tag `tombe` seul — visite des tombes en général, **pas** forcément celle du Prophète)

### `main` — volontairement non mappé (attribut *yad* vs geste/serment)
- hadith 91 — « Serrer la main à une femme ’ajnabiyyah » → plutôt `peches-interdits` / `femme-couple-famille`
- hadith 92 — « Les Péchés des mains » → plutôt `peches-interdits`
→ ici **aucun** ne vise l'attribut *yad* ; à confirmer.

### `arafah` / `nuzul` — liés à `tanzih` (à confirmer avant mapping)
- hadith 62 — « Hadith de an-nouzoul au jour de ʿArafah » (le token présent est `arafah`)
→ ajouter `arafah` (+ `nuzul` si voulu) → `tanzih` ?

---

## Ce que j'attends de toi (puis je relance, le peuplement est idempotent)
1. **a.2** : j'ajoute les 7 variantes à `theme_tags` (mêmes thèmes) ? (recommandé)
2. **a.3** : lesquels ajouter — en particulier **`tombe` → `tombe`** (fort), `mariage` → `femme-couple-famille`, `paradis-enfer`/`musulmans` → `jour-dernier`, `repentir` → `dhikr-repentir` ?
3. **c** : je rattache les candidats confirmés (`prophètes`→`prophetes`, `salat-ala-nabi`, `visite-tombe-prophete`, `arafah`→`tanzih`) ? Et `main` : au cas par cas ?
4. Les **sans-tag** (hadith 65/83/85/136 ; parole 44/53/56) : tu leur mets un tag, ou je les laisse hors thèmes pour l'instant ?

> Je ne câble **pas** l'UI (15.5+) tant que tu n'as pas tranché.

---

## ✅ Décisions appliquées (validées par l'auteur)
- **Variantes (a.2)** : 7 ajoutées à `theme_tags` (ta’wil, qour’an→tawil-equivoques ; qiyām→priere ; 'istighfar, repentir→dhikr-repentir ; ḥirz→hirz ; chatîment, tombe→tombe ; raisonnment→jugement-rationnel).
- **Nouveaux tags (a.3)** : `tombe`→tombe, `mariage`→femme-couple-famille, `paradis-enfer`/`musulmans`→jour-dernier, `repentir`→dhikr-repentir.
- **Cas ambigus (c)** : `prophètes`→prophetes ; `arafah`→tanzih ; `main`→peches-interdits (hadith 91, 92) ; **salat-ala-nabi** (hadith 100, 101, 113, 114) ; **visite-tombe-prophete** (coran 15, hadith 104) — rattachés directement.

**Liaisons après application** : Coran **24** · Hadiths **138** · Paroles **71**.

### Restent sans thème (12) — à traiter plus tard (tag à ajouter ou theming manuel)
| src | id | sujet | raison |
|---|---|---|---|
| hadith | 50 | La Meilleure parole | tag `parole` (non tranché) |
| hadith | 65 | Hadith Qoudoussy | sans tag |
| hadith | 82 | évoquer le prophète en son absence | tag `prophète` (sing., non tranché) |
| hadith | 83 | al-istighāthah et al-istiʿānah | sans tag |
| hadith | 85 | Entrée en Islam | sans tag |
| hadith | 136 | La demande de pardon ('istighfar) | sans tag |
| hadith | 156 | Nul ne sait l'heure du jour dernier | tag `jugement` = jour-dernier ? (à confirmer) |
| parole | 44 | La Récitation du Qour'ān en faveur du mort | sans tag |
| parole | 53 | La Croyance enseignée par Ibnou ^Açakir | sans tag |
| parole | 55 | Traité de croyance - Salahou d-Din… | tag = nom propre |
| parole | 56 | Le Tawassoul est permis… | sans tag |
| parole | 57 | L'Imâm … Al-Ach'ari | tag = nom propre |
