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

## Phase 9 — /savants en annuaire
- [x] Colonnes (nom_arabe, naissance, deces, resume, resume_auto, domaines),
      résumés auto-générés, RPC enrichies, page annuaire (grille + recherche +
      filtres + tri + chips), fiche enrichie (nom arabe + dates). Voir
      `supabase/refonte/phase9.sql`.
- [ ] **À faire (toi)** : relire les 10 `resume` auto (`resume_auto=true`) ;
      remplir `nom_arabe`, `naissance`, `deces`, `domaines` (Hadith/Fiqh/Aqida/
      Tafsir/Langue) pour enrichir les cartes.
- [ ] Ajouter la maquette au repo pour comparaison fine (fait : docs/savants-annuaire-mockup.html).

## Phase 6 — reste
- [ ] Migration des extraits de savants de `src/_legacy/` : **21 des 22 fichiers
      étaient vides**, seul `Al-Baghdadiyy.tsx` avait du contenu →
      `supabase/refonte/migrer_extrait_albaghdadiyy.sql` (à exécuter dans Supabase).
- [x] Mini-bio d'un savant au survol de son nom (popover) — fait (`SavantHover`).
- [ ] Enrichir le schéma `savants` (nom_arabe, naissance, deces, image_url).

## Phase 7 — images de pages de livres
- [x] Bucket Storage `references` (public) créé + script d'optimisation
      (`scripts/optimize-images.mjs`, WebP ~1200px) + template de liaison
      (`supabase/refonte/phase7_lier_images.sql`). Le front affiche déjà
      `dossier_images` (alt + lazy).
- [ ] **À faire (toi)** : `npm i -D sharp` → lancer le script sur `public/img` →
      uploader les `.webp` dans le bucket `references` → exécuter
      `phase7_lier_images.sql` (les 2 pages Al-Baghdadiyy apparaîtront dans le
      dossier istiwā').

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
