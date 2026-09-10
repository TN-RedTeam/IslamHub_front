import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Markdown } from '../../components/Markdown';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Exposé éditorial « Les Attributs d'Allah ».
 * Le contenu doctrinal est saisi/vérifié par l'auteur : ce fichier fournit la
 * structure et un texte d'amorce marqué « à compléter » — rien n'est fabriqué.
 */
const CONTENU = `
La croyance authentique consiste à affirmer d'Allah ce qu'Il a affirmé de Lui-même
et ce que Son Messager ﷺ a affirmé de Lui, **sans Lui attribuer de lieu, de forme,
de limite ni de ressemblance avec les créatures** :

> « Rien ne Lui ressemble, et Il est Celui qui entend et qui voit. » — Sourate Ash-Shūrā, 11

### Sections à venir

_Cet exposé est en cours de rédaction par l'auteur. Les sections suivantes seront
complétées prochainement :_

- La transcendance d'Allah (tanzīh)
- Les Noms d'Allah et leur sens
- Les Attributs affirmés par les textes
- La position des Salaf sur les versets équivoques

> **Bientôt** — contenu détaillé à venir.
`;

export const NomsEtAttributs: React.FC = () => {
  usePageTitle("Les Attributs d'Allah");
  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les Attributs d'Allah"
        subtitle="Ce qu'il convient de croire d'Allah, exempt de tout lieu, forme et ressemblance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: "Attributs d'Allah" }]}
      />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <article className="rounded-card border border-line bg-surface p-6 sm:p-8 shadow-card">
          <Markdown>{CONTENU}</Markdown>
        </article>
      </main>
    </div>
  );
};

export default NomsEtAttributs;
