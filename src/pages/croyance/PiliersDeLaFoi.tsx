import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Markdown } from '../../components/Markdown';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Exposé éditorial « Les piliers de la foi » (les six fondements).
 * Structure scaffoldée ; le contenu doctrinal de chaque pilier est saisi/vérifié
 * par l'auteur (marqué « Bientôt » tant qu'il n'est pas prêt — rien n'est fabriqué).
 */
const CONTENU = `
La foi (al-īmān) repose sur six fondements, énoncés dans le hadith de Jibrīl :
croire en Allah, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier,
et au destin — qu'il soit bon ou mauvais.

### 1. La croyance en Allah
> **Bientôt** — exposé à compléter par l'auteur.

### 2. La croyance en Ses anges
> **Bientôt** — exposé à compléter par l'auteur.

### 3. La croyance en Ses livres
> **Bientôt** — exposé à compléter par l'auteur.

### 4. La croyance en Ses messagers
> **Bientôt** — exposé à compléter par l'auteur.

### 5. La croyance au Jour dernier
> **Bientôt** — exposé à compléter par l'auteur.

### 6. La croyance au destin (al-qadar)
> **Bientôt** — exposé à compléter par l'auteur.
`;

export const PiliersDeLaFoi: React.FC = () => {
  usePageTitle('Les piliers de la foi');
  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les piliers de la foi"
        subtitle="Les six fondements de la croyance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: 'Piliers de la foi' }]}
      />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <article className="rounded-card border border-line bg-surface p-6 sm:p-8 shadow-card">
          <Markdown>{CONTENU}</Markdown>
        </article>
      </main>
    </div>
  );
};

export default PiliersDeLaFoi;
