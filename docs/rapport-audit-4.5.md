# Phase 4.5 — Audit « admin créable → page publique »

> Vérification que chaque type créable en admin possède une **route publique
> atteignable**. Fait le 2026-09-17.

## Créable vs affiché

| Type (admin) | Route publique | État |
|---|---|---|
| Hadiths | `/hadiths`, `/hadiths/:id/:slug` | ✅ |
| Paroles de savants | `/savants/paroles`, `/paroles/:slug` | ✅ |
| Savants (fiches) | `/savants`, `/savants/:slug` | ✅ |
| Coran (thématique) | `/coran` | ✅ |
| Coran — exégèse (sourates) | `/coran/sourates`, `/coran/sourates/:slug` | ✅ |
| Invocations & Évocations | `/invocations` | ✅ |
| Versets/hadiths équivoques | `/croyance/versets-hadiths-equivoques[/:slug]` | ✅ (voir istawā) |
| Dossiers thématiques | `/dossiers/:slug` | ✅ |
| Récits | `/recits`, `/recits/:slug` | ✅ |
| Fiqh | `/ecoles/:ecole` (via `fiqh_by_ecole`) | ✅ (affiché dans la page école) |
| La femme musulmane | `/femmes` | ✅ |
| **Exposés** | — | ⚠️ voir ci-dessous |

## Cas particuliers

### istawā (verset équivoque) — OK, à publier
- L'entrée `versets_equivoques` slug `istiwa-sur-le-trone` (type *verset*) existe et
  la route est correctement câblée.
- Elle est **non publiée** (`published = false`) et contient du **contenu démo**
  (« Exemple de démonstration — à rédiger »). `get_verset_equivoque` filtre sur
  `published`, donc elle n'apparaît pas — **comportement correct**.
- **Action auteur** : rédiger le vrai contenu (le triptyque + les preuves, ou en
  blocs Phase 3), puis cocher *Publié*. Aucune correction de code nécessaire.

### Exposés — pas d'orphelin, mais pas de route générique
- Les 3 exposés existants (`piliers-de-la-foi`, `jugement-rationnel`,
  `comprendre-textes-equivoques`) sont **atteignables** via des pages Croyance
  **dédiées** (`PiliersDeLaFoi`, `JugementRationnel`, `ComprendreEquivoques`) qui
  chargent un slug fixe.
- **Limite** : un **nouvel** exposé créé en admin (autre slug) n'aurait **aucune
  page publique**.
- **Recommandation** : ajouter une route générique `/exposes/:slug` (page qui rend
  `titre` + verset d'en-tête + `contenu_md` + citations), et faire pointer les
  entrées de menu vers elle. À planifier — non bloquant tant qu'aucun nouvel
  exposé n'est créé.

## Conclusion
Aucun contenu créable ne reste **invisible par erreur**. Deux suites : publier
istawā quand il sera rédigé ; prévoir une route générique pour les futurs exposés.
