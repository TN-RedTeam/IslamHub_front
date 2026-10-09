# Audit des doublons de hadiths — 2026-10

Méthode : similarité trigramme (`pg_trgm`) sur le texte arabe normalisé
(`normalize_ar`). Seuil retenu : **0,60**. À réviser à la main (décision
éditoriale). Reco « garder » = la fiche la mieux sourcée / la plus complète.

Pour chaque paire : supprimer une fiche **ou** transformer l'une en *variante*
de l'autre (bouton « Variantes » du formulaire hadith).

## A. Quasi-certains (même texte — harakat, orthographe, répétition, fragment)

| sim | garder | supprimer | sujet | note |
|----|--------|-----------|-------|------|
| 1.00 | **24** (4 src) | 86 (1 src) | Le Châtiment de la tombe | 24 répète la formule 2× |
| 1.00 | **215** (2 src) | 126 (1 src) | Ange Jibril | — |
| 0.96 | **42** (1 src) | 64 (1 src) | (non-musulman rétribué ici-bas) | 64 = version non vocalisée |
| 0.92 | **214** (1 src) | 125 (1 src) | Création des Anges | 214 mieux vocalisé |
| 0.91 | **98** (1 src) | 407 (0 src) | Le Prophète Adam | آدم vs ءادم |
| 0.90 | **16** (5 src) | 76 (1 src) | L'Exemption de Allah | 76 ajoute « اللهم » |
| 0.88 | **38** (4 src) | 473 (0 src) | ablutions / prière | ذنوبه vs ذنبه |
| 0.85 | **28** (4 src) | 578 (0 src) | « بلغوا عني ولو ءاية » | 578 a une coquille (بلغو) |
| 0.79 | **63** (1 src) | 10 (0 src) | « كان الله ولم يكن شيء غيره » | — |
| 0.62 | **41** (1 src) | 51 (1 src) | La Meilleure des œuvres | 51 = fragment de 41 |

## B. Même hadith, formulation différente (→ supprimer OU créer une variante)

| sim | plus complet / mieux sourcé | autre | sujet | note |
|----|------------------------------|-------|-------|------|
| 0.80 | **587** (rubrique) | 247 | effrayer un musulman | « لعنته الملائكة » vs « فإن الملائكة تلعنه » |
| 0.80 | **87** ou **170** | — | l'eau, 1ʳᵉ créature | deux formulations, 1 src chacune |
| 0.75 | **11** (2 src) | 67 (1 src) | ne pas rester éternellement en enfer | 11 plus complet |
| 0.73 | **29** (4 src) | 512 (0 src) | le croyant insatiable de bien | 512 ajoute « يسمعه » |
| 0.71 | **131** (4 src) | 336 (4 src) | Al-Mahdiyy | les deux bien sourcés → fusionner les sources |
| 0.70 | **72** (1 src) | 93 (1 src) | œuvres après la mort | الإنسان vs ابن آدم |
| 0.69 | **109** (5 src) | 492 (1 src) | les 5 prières | 109 plus complet |
| 0.67 | **26** (4 src) | 129 (1 src) | apprendre la science | formulations différentes |
| 0.65 | **399** (0 src) plus complet | 396 (1 src) | Le Paradis | 399 = version longue de 396 |
| 0.61 | **203** (0 src) plus complet | 99 (1 src) | caractéristiques des prophètes | 203 inclut la phrase de 99 + suite |
| 0.61 | **565** (complet) | 551 (fragment) | insulter un musulman | 551 « سباب المسلم فسوق » ; 565 ajoute « وقتاله كفر » — possiblement voulus distincts |

## Rappels
- Le durcissement du hash (phase 11f) ne bloquera **que** la catégorie A.
- La catégorie B ne peut être détectée que par similarité (outil « Doublons
  potentiels » proposé en admin).
