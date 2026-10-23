# Fiche Google Play — Ahl-Sunnah (FR)

> À copier/coller dans la console Google Play Console lors de la création de la fiche.
> Les visuels sont dans ce dossier : `play-icon-512.png` (icône 512×512),
> `play-feature-1024x500.png` (bannière). Les captures d'écran sont à prendre
> depuis l'app une fois buildée (2 à 8 images, téléphone).

## Identité

- **Nom de l'application** : Ahl-Sunnah
- **applicationId** : `com.karim.islamhub` (déjà configuré, ne pas changer après publication)
- **Catégorie** : Livres et références
- **Tags** : islam, croyance, aqida, coran, hadith, sunna, savants
- **E-mail de contact** : karimromdhane7@gmail.com
- **Politique de confidentialité (URL)** : https://VOTRE-DOMAINE/confidentialite
  (héberger `privacy-policy-fr.md` ou ajouter une page `/confidentialite` au site — voir note en bas)

## Description courte (max 80 caractères)

Réponses claires et sourcées (Coran, Sunna, savants) aux questions de croyance.

## Description complète (max 4000 caractères)

Ahl-Sunnah rassemble des réponses claires, apaisées et **sourcées** aux
questions de croyance que l'on se pose vraiment : « Où est Allah ? », le sens
de l'istiwāʾ, les attributs divins, les textes équivoques, l'au-delà…

Chaque réponse s'appuie sur les textes — le Coran, la Sunna authentique et la
parole des grands savants — sans polémique et sans viser personne. L'objectif
est de comprendre et de s'apaiser, pas d'affronter.

Ce que vous trouverez :
• Des **questions fréquentes** avec une réponse courte puis un développement
  complet et sourcé, sur une seule page.
• Des **dossiers thématiques** approfondis (tawhīd, attributs, textes
  équivoques…).
• Des **hadiths** avec leur texte arabe, la traduction, la phonétique et le
  degré d'authenticité quand il est vérifié.
• Les **paroles des savants** et des fiches biographiques.
• Le **Coran** par thèmes et une approche de l'exégèse.
• Une **recherche** rapide et une lecture confortable, en mode clair ou sombre.

Lecture hors-ligne, interface rapide, aucune publicité. Application gratuite.

> Remarque : le contenu est présenté à des fins pédagogiques, dans le respect
> des sources citées.

## Formulaire « Sécurité des données » (Data safety)

- **Données collectées** : aucune donnée personnelle n'est collectée côté
  visiteur. Pas de compte requis pour lire.
- **Données partagées** : aucune.
- **Favoris** : stockés uniquement sur l'appareil (stockage local), jamais
  envoyés à un serveur.
- **Requêtes réseau** : lecture seule du contenu depuis le backend (Supabase).
- **Publicité / traceurs** : aucun SDK publicitaire, aucun traceur.
- **Chiffrement en transit** : oui (HTTPS).
- **Classification du contenu** : tout public.

## Note — URL de politique de confidentialité

Google **exige** une URL publique de politique de confidentialité. Deux options :
1. Ajouter une page `/confidentialite` au site (je peux la câbler : route +
   contenu de `privacy-policy-fr.md`), puis utiliser `https://VOTRE-DOMAINE/confidentialite`.
2. Héberger `privacy-policy-fr.md` tel quel (ex. page GitHub) et pointer son URL.
