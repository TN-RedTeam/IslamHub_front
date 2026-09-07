# `_legacy/` — contenu conservé, hors application

Ce dossier contient d'anciennes pages **retirées de l'application active** lors
de la Phase 0 de la refonte (`refonte/architecture-v2`), mais **conservées
volontairement** parce que leur contenu (aqida, extraits de savants, réponses)
doit être **migré** vers le nouveau modèle de données dans les phases suivantes :

- `foi/**` et `repliques/AllahExisteSansEndroit.tsx` → matière pour les
  **dossiers thématiques** (Phase 5).
- `repliques/ExtraitsDesLivresDesSavants/**` (22 fichiers) → migration vers les
  tables `savants` / `paroles` (Phase 6).
- `Biographies.tsx`, `Croyance.tsx`, `Jurisprudence.tsx`, `Mise-en-garde.tsx`,
  `Repliques.tsx` → anciennes pages-hub, à miner si prose utile.

⚠️ **Ce dossier est exclu du typecheck** (`tsconfig.app.json` → `exclude`) et
n'est référencé par aucune route : il n'est **pas** compilé dans le site. Ne
rien importer d'ici depuis `src/`. Une fois le contenu migré (Phases 5–6), ce
dossier sera supprimé.
