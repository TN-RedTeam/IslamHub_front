# Build Android → Google Play — Ahl-Sunnah

Marche à suivre sur **ta machine** (Android Studio requis — ne peut pas se faire
dans l'environnement cloud). Le projet Capacitor Android est déjà en place.

## 0. Pré-requis (une fois)
- Node installé, dépôt cloné, `npm install`.
- [Android Studio](https://developer.android.com/studio) installé.
- Compte **Google Play Console** (25 $, une fois) : https://play.google.com/console

## 1. Construire le web + synchroniser Android
```bash
npm run build:android      # = vite build && npx cap sync android
npx cap open android       # ouvre le projet dans Android Studio
```
Les icônes et le splash au logo Ahl-Sunnah sont déjà dans
`android/app/src/main/res/` (régénérés). Le fond d'icône et le splash sont au
teal de charte `#0b1e22`.

## 2. Créer la clé de signature (une fois — À CONSERVER PRÉCIEUSEMENT)
Dans Android Studio : **Build → Generate Signed Bundle / APK → Android App
Bundle → Create new…**. Garde le fichier `.jks` et les mots de passe en lieu
sûr : la **même clé** servira à TOUTES les mises à jour futures. Si tu la perds,
tu ne pourras plus mettre l'app à jour.

(Alternative recommandée : activer **Play App Signing** — Google gère la clé de
distribution, tu ne gardes qu'une clé d'upload.)

## 3. Générer l'AAB signé
**Build → Generate Signed Bundle → Android App Bundle**, sélectionne ta clé,
variante **release**. Le fichier `app-release.aab` est produit sous
`android/app/release/`.

## 4. Vérifier le numéro de version
Dans `android/app/build.gradle` : incrémente `versionCode` (entier, +1 à chaque
dépôt) et `versionName` (ex. `1.0.0`) à chaque nouvelle version.

## 5. Publier sur la Play Console
1. **Créer l'application** (nom : Ahl-Sunnah, langue par défaut : français).
2. Remplir la **fiche** avec `play-store-listing-fr.md` (icône 512, bannière
   1024×500 fournies ; prendre 2–8 captures d'écran depuis l'app).
3. Renseigner **Politique de confidentialité** (URL — voir `privacy-policy-fr.md`),
   **Sécurité des données** (tout « aucune collecte »), **Classification de
   contenu**, **Public cible**.
4. Créer une **version** (production ou test interne d'abord), y déposer l'AAB.
5. Soumettre. Revue Google : généralement quelques jours.

## Mises à jour ultérieures
`npm run build:android` → regénérer un AAB signé avec la **même clé** et un
`versionCode` supérieur → déposer une nouvelle version. Le contenu éditorial
(questions, hadiths…) se met à jour côté serveur sans republier l'app ; seules
les évolutions de l'app elle-même nécessitent une nouvelle version.

## iOS (plus tard)
Nécessite un **Mac + Xcode** et un compte **Apple Developer** (99 $/an).
Ajouter la plateforme : `npx cap add ios`, puis générer les assets iOS et
builder via Xcode. À traiter dans un second temps.
