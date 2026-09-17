# Taxonomie des thèmes + mapping des tags (à valider)

> **Principe :** on ne thème pas les contenus un par un. On mappe **les tokens de tags** (≈ 40) vers des **thèmes canoniques** ; chaque verset/hadith/parole hérite de ses thèmes **via ses tags** (relation plusieurs-à-plusieurs). Tu valides cette liste + ce mapping, Claude Code l'applique, tu relis les cas limites.
>
> Chaque thème a un `slug`. Un contenu peut porter **plusieurs** thèmes. Les tokens génériques (`croyance`, `foi`) donnent le thème général ; les tokens précis (`exemption`, `attributs`…) donnent en plus le thème précis.

## Famille : Croyance (Aqida)

| Thème | Tags rattachés |
|---|---|
| La foi et la croyance | foi, croyance, bonne croyance, conditions de la foi |
| L'unicité (tawḥīd) | shahada, tawhid, unicité, parole (lā ilāha illā Llāh) |
| Les Attributs d'Allah | attributs, volonté |
| L'exemption d'Allah (tanzīh) | exemption, tanzih, istawa, arafah/nuzul |
| Le taʼwīl & les textes équivoques | ta'wil, interprétation, sens figuré, qour'an |
| Le jugement rationnel | raisonnement |
| La méditation sur la création | création, méditation, eau |
| La prédestination (qadar) | destinée |
| Les Anges | anges, jibril |
| Les Prophètes | prophètes, adam |
| Le Jour dernier & l'au-delà | fin des temps, signes, pont, paradis, enfer, musulmans-paradis |
| La tombe : châtiment & félicité | tombe, châtiment, supplice, félicité |
| La mécréance & l'apostasie | mécréance, apostasie |
| Mise en garde & sectes | mise en garde, sectes |
| La bonne innovation (bidʿa ḥasana) | innovation |

## Famille : Le Prophète ﷺ

| Thème | Tags rattachés |
|---|---|
| L'invocation en faveur du Prophète (ṣalāt ʿala n-nabī) | invocation + prophète |
| Le tawassoul & le tabarruk | tawassoul, tabarrouk/tabarouk |
| Visiter la tombe du Prophète | visite + tombe + prophète |
| Le Mawlid | mawlid |
| Voir le Prophète en rêve | rêve |

## Famille : Adoration & spiritualité

| Thème | Tags rattachés |
|---|---|
| Les invocations (duʿā') | invocation, invocations, demande |
| Les évocations (dhikr) & le repentir | istighfar, adoration, dhikr |
| La prière | prière, qiyām, nuit |
| Purification & ablutions | purification, ablutions, siwak |
| La récitation du Qur'an | récitation |
| Le ḥirz (protection par le Qur'an) | hirz, ḥijāb (amulette avec versets) |

## Famille : Comportement & vie

| Thème | Tags rattachés |
|---|---|
| Le bon comportement | comportement, douceur, modestie, miséricorde, bien, remercier, insouciance |
| La science & l'apprentissage | science, apprentissage, apprendre, avis, assemblée |
| La femme, le couple & la famille | couple, femmes, ’ajnabiyyah |
| Les péchés & les interdits | péchés, magie, hasard, jeux, main |
| La mort & les œuvres | mort, actes, aumône, oeuvres |
| Pratiques & jugements divers | voeu (nadhr), douff |

## Comment Claude Code s'en sert
1. Il crée la table `themes` (slug, nom, famille) à partir de cette liste.
2. Il parcourt les tags de chaque contenu, applique le mapping token→thème, et remplit les tables de liaison (`verset_themes`, `hadith_themes`, `parole_themes`).
3. Il te fournit un **rapport** : les tags non mappés (ex. « Salahou d-Din », « Al-Ach'ari », noms propres — à ignorer ou traiter à part) + les contenus sans aucun thème → tu relis ces cas.
4. **Ne rien fusionner hors de ce mapping sans ton accord.**

> Note : les tags qui sont des **noms propres/titres d'ouvrages** (Salahou d-Din Al-'Ayyoubiyy, Al-Ach'ari, Ibnou ^Açakir…) ne sont pas des thèmes — Claude Code les ignore pour le theming (ils restent éventuellement en métadonnée de la parole).
