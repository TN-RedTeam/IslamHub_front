# Refonte IslamHub — reste à faire

Suivi des tâches différées de la refonte (branche `refonte/architecture-v2`).
Fait : Phases 0, 1, 2a, 3, 3b, 4a, 5, 6 (cœur). Voir `supabase/refonte/*.sql`.

## Phase 4b — URLs propres + SEO complet ⏸️ (en attente d'un nom de domaine)
Reportée volontairement : la config dépend de l'URL finale du site.
- [ ] `HashRouter` → `BrowserRouter` (enlever le `#`) avec le bon `basename`
      (`/` avec un domaine racine, `/IslamHub_front/` si on reste en sous-dossier).
- [ ] Fallback SPA GitHub Pages : `404.html` = copie d'`index.html`.
- [ ] Prérendu SSG (contenu visible sans JS) — plugin type `vite-react-ssg`,
      liste des routes dynamiques récupérée depuis Supabase au build.
- [ ] `sitemap.xml` (URLs propres) + `Sitemap:` dans `robots.txt`.
- [ ] Adapter les liens `<Link>`/canonical/OG (déjà en place via `useSeo`).
> À faire en une passe le jour où le domaine est choisi.

## Phase 6 — reste
- [ ] Migration des extraits de savants de `src/_legacy/` : **21 des 22 fichiers
      étaient vides**, seul `Al-Baghdadiyy.tsx` avait du contenu →
      `supabase/refonte/migrer_extrait_albaghdadiyy.sql` (à exécuter dans Supabase).
- [x] Mini-bio d'un savant au survol de son nom (popover) — fait (`SavantHover`).
- [ ] Enrichir le schéma `savants` (nom_arabe, naissance, deces, image_url).

## Phase 7 — images de pages de livres
- [ ] Bucket Storage `references` (lecture publique), upload optimisé (WebP ~1200px),
      `dossier_images.image_url`. Les images `public/img/Al-Baghdadiyy*.jpg`
      (dans `_legacy`) peuvent y aller.

## Phase 8 — Coran → exégèse
- [x] Structure `sourates`/`versets`/`exegeses` + RPC + pages `/coran/sourates`
      et `/coran/sourates/:slug` + lien depuis la page Coran. 5 sourates semées.
- [ ] **Contenu** : coller les versets (arabe + traduction + phonétique) et les
      exégèses via `supabase/refonte/phase8.sql` (template). Commencer par
      al-Fātiḥa, al-Ikhlāṣ, Āyat al-Kursī (2:255), et les versets équivoques (20:5 ; 42:11).

## Divers
- [x] Passe « coquilles de sujets » — faite (voir `supabase/refonte/coquilles_sujets.sql`).
- [ ] Dossier istiwa : compléter les preuves (versets 20:5 / 42:11) et lier
      l'extrait Al-Baghdadiyy une fois inséré.
- [ ] Un jour : Phase 2b (supprimer les anciennes colonnes rapporteur/narrateur/
      tag/statut/statut_id une fois le front 100 % rebranché) + supprimer `_legacy/`
      et les tables `*_backup`.
- [ ] Menu / page d'index `/dossiers` quand il y aura plusieurs dossiers publiés.
