# Phase 5 — Récits hiérarchisés : proposition de rattachement (à valider)

> Le modèle est en place (colonne `recits.parent_recit_id` ajoutée, non
> destructif). **Aucun rattachement n'est appliqué** : tu tranches d'abord.

## Constat

Dans « Histoires des Prophètes », il y a surtout des **épisodes**, et **peu (voire
pas) de récits-bio parents**. Exemple : Abraham a deux épisodes mais aucune bio.
Il faut donc décider, prophète par prophète, comment structurer.

## Récits actuels (catégorie `prophetes`)

| id | titre | nature probable |
|---|---|---|
| 5 | Histoire du Prophète Noūḥ (Noé) | **bio** (parent naturel) |
| 4 | Histoire des Prophètes Zakariyyā et Yaḥyā | **bio** (2 prophètes) |
| 7 | Soulaymān dans la vallée des fourmis | épisode (Salomon) |
| 8 | Younous et la baleine | épisode (Jonas) |
| 9 | Tentative de brûler Abraham | épisode (Abraham) |
| 13 | Le sacrifice ordonné à Ibrahim | épisode (Abraham) |
| 10 | Miracle de la table de Jésus (ʿĪsā) | épisode (Jésus) |
| 11 | Bâton de Moïse (Mūsā) | épisode (Moïse) |
| 14 | La bataille de ʾUḥud | épisode (**Muḥammad ﷺ**, pas un prophète antérieur) |

## Options (à choisir)

**Option A — créer une bio parent par prophète** *(recommandé pour la lisibilité)*
On crée des récits-bio parents (Abraham, Moïse, Jésus, Salomon, Jonas, Muḥammad ﷺ)
— même courts, composés en blocs (Phase 3) — et on rattache les épisodes :
- **Abraham** (nouveau parent) ← 9, 13
- **Moïse** (nouveau parent) ← 11
- **Jésus** (nouveau parent) ← 10
- **Salomon** (nouveau parent) ← 7
- **Jonas** (nouveau parent) ← 8
- **Muḥammad ﷺ** (nouveau parent, ou rubrique dédiée) ← 14
- **Noé** (id 5, déjà bio) ← (ses épisodes éventuels)
- **Zakariyyā/Yaḥyā** (id 4, déjà bio) ← (à préciser)

**Option B — promouvoir un épisode en parent**
Pour Abraham, faire de l'un des deux épisodes le parent et lui rattacher l'autre.
Moins clair, mais zéro création.

**Option C — laisser à plat** (statu quo) : pas de hiérarchie.

## Ce que j'attends de toi
1. Option **A**, **B** ou **C** ?
2. Si A : je crée les bios parents (vides/à compléter) et j'applique les
   rattachements ci-dessus — **confirme la liste** (surtout le cas ʾUḥud/Muḥammad ﷺ,
   qui n'est pas un prophète antérieur : rubrique à part ?).
3. Une fois validé, j'ajoute côté admin le **sélecteur de récit parent** + le
   réordonnancement des épisodes, et côté public la section **« Ses récits »** sur
   la page du prophète (+ « N récits » sur la carte). Aucune suppression.

> Rappel : la migration ne supprime rien. Tant que tu n'as pas tranché, tous les
> récits restent autonomes et visibles comme aujourd'hui.
