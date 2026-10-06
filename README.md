# IslamHub — front

Site francophone de savoir islamique (ʿaqīda, fiqh, hadiths, Coran thématique,
invocations, savants…) avec une partie publique et une interface
d'administration. Application React mono‑page (SPA) adossée à une base
**Supabase** (PostgreSQL), déployée en statique sur **GitHub Pages** et
packageable en application **Android** via Capacitor.

---

## Stack technique

| Domaine        | Choix |
|----------------|-------|
| UI             | React 18 + TypeScript |
| Build          | Vite 8 (+ `vite-plugin-pwa`) |
| Styles         | Tailwind CSS 3 (design system « Nuit Teal » par tokens CSS) |
| Routing        | React Router 7 — routeur choisi au build (`VITE_ROUTER`) : BrowserRouter en prod web, HashRouter par défaut (Android, démos) |
| Animations     | Framer Motion |
| Icônes         | lucide-react |
| Markdown       | react-markdown + remark-gfm |
| Backend        | Supabase (PostgreSQL, RPC `SECURITY DEFINER`, Auth e-mail/mot de passe) |
| Mobile         | Capacitor (Android) |
| Qualité        | ESLint, TypeScript, Vitest + Testing Library |

---

## Démarrage rapide

**Prérequis :** Node 22+ et npm.

```bash
npm install
# créer un fichier .env.local (voir « Variables d'environnement » ci-dessous)
npm run dev
```

L'application démarre sur le port Vite par défaut (http://localhost:5173).

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```bash
VITE_SUPABASE_URL=https://<votre-projet>.supabase.co
VITE_SUPABASE_ANON_KEY=<clé publique anon>
```

Sans ces variables, l'application se charge quand même mais sans accès à la base
(le client Supabase bascule proprement et déclenche les fallbacks de
`DataService`). En déploiement, les clés sont injectées depuis les *secrets* du
dépôt GitHub (`Settings → Secrets and variables → Actions`).

---

## Scripts npm

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Prévisualise le build |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Tests Vitest (une passe) |
| `npm run test:watch` | Tests en mode watch |
| `npm run build:android` / `npm run android` | Build + synchro/ouverture Capacitor Android |
| `npm run deploy` | Build + publication `gh-pages` (déploiement manuel) |

Avant de pousser, l'enchaînement recommandé est :
`npm run typecheck && npm run lint && npm run build`.

---

## Structure du projet

```
src/
  pages/            Pages publiques (Coran, Hadiths, Savants, Thèmes, Écoles…)
    admin/          Interface d'administration (listes + formulaires par rubrique)
    croyance/       Pages de la rubrique ʿaqīda
    ecoles/         Pages des 4 écoles (Hanafi, Malikite, Shafii, Hanbalite)
  components/       Composants partagés (cartes, badges, lecteurs…)
    admin/          Composants spécifiques à l'admin (TagPicker, SujetField,
                    InlineSujetTagEditor…)
  services/
    supabase.ts     Client Supabase (tolérant à l'absence de config)
    DataService.ts  Lecture publique (RPC)
    AdminService.ts Écriture admin (RPC SECURITY DEFINER)
  context/          AuthContext (session + rôle admin)
  hooks/            usePageTitle, useSeo…
  types/            Types partagés (index.ts)
  utils/            Helpers (compteur, slug, templates arabes…)
  index.css         Tokens du design system (thèmes clair/sombre)
supabase/
  schema.sql        Schéma de base
  refonte/          Migrations incrémentales et RPC (fichiers .sql à exécuter)
  data/             Jeux de données d'import
public/             Assets statiques + manifeste PWA
```

---

## Base de données (Supabase)

- Le schéma et les évolutions vivent dans `supabase/` (voir `schema.sql` et
  `supabase/refonte/*.sql`, ainsi que `supabase/MIGRATION_GUIDE.md`).
- Les écritures passent par des fonctions RPC `SECURITY DEFINER` protégées par
  `public.is_admin()` (contrôle de l'e-mail de l'administrateur). La lecture
  publique utilise des RPC `STABLE`.
- **Appliquer une migration :** ouvrir le fichier `.sql` concerné dans le
  *SQL Editor* de Supabase et l'exécuter. Les fichiers de `refonte/` sont conçus
  pour être **idempotents** (`create or replace`, `add column if not exists`…).

Fichiers récents utiles :

| Fichier | Contenu |
|---------|---------|
| `refonte/fiqh_in_search_themes.sql` | Fiqh dans la recherche globale et les pages thèmes |
| `refonte/coran_equivoque.sql` | Lien d'un verset thématique vers une fiche « équivoque » |
| `refonte/admin_inline_edit.sql` | Aperçu + édition inline (sujet/tags) dans l'admin |
| `refonte/tags_manager.sql` / `sujets_manager.sql` | Gestionnaires de tags et de sujets |

---

## Administration

- Accès via la route `/admin` (`#/admin` en mode HashRouter). Authentification Supabase par
  e-mail / mot de passe ; seul le compte administrateur (défini dans
  `AuthContext` et aligné sur `public.is_admin()` côté base) peut écrire.
- Chaque rubrique (Hadiths, Paroles, Coran, Invocations, Fiqh, Récits, Dossiers,
  Exposés, Savants, Sourates, Femmes, Équivoques) dispose d'une liste et d'un
  formulaire.
- Outils transverses : **Tags & mots-clés**, **Sujets** (fusion/renommage,
  aperçu et édition inline), recherche admin.

---

## Design system « Nuit Teal »

Les couleurs sont définies en tokens CSS sur `:root` dans `src/index.css`
(`--bg1`, `--acc`, `--glass`, `--dome`…), avec des variantes pour le thème
sombre, puis mappées dans `tailwind.config.js` (`accent`, `glass`, `dome`…).
Thème clair beige, thème sombre crépuscule teal → violet.

## Routeur & SEO

Le routeur est choisi **au build** via deux variables d'environnement :

| Cible | `VITE_ROUTER` | `VITE_BASE` | Routeur |
|-------|---------------|-------------|---------|
| Prod web (GitHub Pages racine) | `browser` | `/IslamHub_front/` | BrowserRouter (URLs propres, indexables) |
| Android (Capacitor) / démos /v2 /v3 / défaut | *(absent)* | *(défaut `./`)* | HashRouter (`#/…`) |

- **BrowserRouter** exige une base **absolue** (sinon les assets cassent sur les
  liens profonds) et un **fallback `public/404.html`** (déjà en place) : GitHub
  Pages sert `404.html` pour toute URL profonde, qui ré-encode le chemin et le
  restaure via un script dans `index.html`.
- **HashRouter** reste le défaut car c'est le seul compatible avec la WebView
  **Capacitor Android** (servie à la racine) et les **démos** en sous-dossier.
- Le build de prod active automatiquement BrowserRouter (voir `deploy.yml`,
  étape « site principal »). Sur un **domaine personnalisé**, mettre `VITE_BASE=/`
  et passer `pathSegmentsToKeep` à `0` dans `public/404.html`.

> **Ancres internes :** elles utilisent un `onClick` avec `preventDefault()` +
> `scrollIntoView()` — compatible avec les deux routeurs (ne pas revenir à
> `href="#id"`, qui casserait le routage sous HashRouter).

---

## Déploiement

Déploiement automatique sur **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy.yml`) à chaque push sur `main`. En plus du site
principal, deux démos par branche sont publiées sur des sous-URLs pour comparer
les chartes :

- `/v2/` → branche `refonte/architecture-v2`
- `/v3/` → branche `refonte/architecture-v3` (Nuit Teal)

`base: './'` dans `vite.config.ts` rend l'application fonctionnelle dans un
sous-dossier. Un déploiement manuel reste possible avec `npm run deploy`.

Autres workflows : `ci.yml` (typecheck + lint) et `codeql.yml` (analyse de
sécurité).

---

## Android (Capacitor)

```bash
npm run build:android   # build web + cap sync android
npm run android         # ouvre le projet dans Android Studio
```

Voir `ANDROID_GUIDE.md` pour les détails.

---

## Documentation complémentaire

- `CHEATSHEET.md` — aide-mémoire du projet
- `ANDROID_GUIDE.md` — packaging Android
- `SECURITY.md` — politique de sécurité
- `supabase/MIGRATION_GUIDE.md` — migrations de base de données
