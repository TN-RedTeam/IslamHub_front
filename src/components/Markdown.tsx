import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// ---- Détection auto de l'arabe ------------------------------------------------
// Un paragraphe / une puce / un titre majoritairement arabe est rendu en
// RTL + Scheherazade (via lang="ar", stylé globalement dans index.css).
const AR_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const LAT_RE = /[A-Za-zÀ-ɏ]/g;
function textOf(node: React.ReactNode): string {
  if (node == null || node === false || node === true) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return '';
}
function isArabic(node: React.ReactNode): boolean {
  const t = textOf(node);
  const ar = (t.match(AR_RE) || []).length;
  if (!ar) return false;
  const lat = (t.match(LAT_RE) || []).length;
  return ar >= lat; // arabe dominant
}

/**
 * Rendu Markdown stylé et cohérent pour tout le site (fiqh, femmes, cours...).
 * Sans plugin typography : chaque balise est mappée sur des classes Tailwind.
 *
 * Supporte (via remark-gfm) :
 *  - titres ###, listes, sous-listes, gras/italique, citations, liens, tableaux
 *  - NOTES DE BAS DE PAGE : écrire  un mot[^1]  dans le texte, puis en bas :
 *      [^1]: l'explication de la note.
 *    => le [^1] devient un petit chiffre en exposant, et l'explication
 *       s'affiche automatiquement en bas du bloc.
 */
const mdComponents: Components = {
  h1: ({ children }) => <h3 lang={isArabic(children) ? 'ar' : undefined} className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri">{children}</h3>,
  h2: ({ children, id }) =>
    // remark-gfm génère un <h2 id="footnote-label"> pour le titre des notes :
    // on le garde masqué (sr-only) au lieu d'afficher "Footnotes".
    id === 'footnote-label'
      ? <h2 className="sr-only">{children}</h2>
      : <h4 lang={isArabic(children) ? 'ar' : undefined} className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri">{children}</h4>,
  h3: ({ children }) => <h4 lang={isArabic(children) ? 'ar' : undefined} className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri">{children}</h4>,
  p: ({ children }) => isArabic(children)
    ? <p lang="ar" dir="rtl" className="text-xl leading-loose my-3 text-gray-900 dark:text-white">{children}</p>
    : <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{children}</p>,
  ul: (props) => <ul className="list-disc pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  li: ({ children }) => isArabic(children)
    ? <li lang="ar" dir="rtl" className="leading-loose text-gray-900 dark:text-white marker:text-emerald-500">{children}</li>
    : <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>,
  strong: (props) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-emerald-400 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />,
  a: (props) => {
    const href = (props as { href?: string }).href ?? '';
    // Flèche de retour "↩" de la note : inutile ici (pas de navigation), on la masque.
    if (href.startsWith('#user-content-fnref')) return null;
    // Référence de note [^1] : petit chiffre en exposant, NON cliquable.
    // (un lien #user-content-fn casserait le HashRouter du site, et les ids
    //  se répètent entre entrées puisque la numérotation repart à 1 à chaque fois.)
    if (href.startsWith('#user-content-fn')) {
      return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{props.children}</span>;
    }
    return <a className="text-emerald-600 dark:text-emerald-400 underline" target="_blank" rel="noopener noreferrer" {...props} />;
  },
  hr: (props) => <hr className="my-4 border-gray-200 dark:border-gray-700" {...props} />,
  sup: (props) => <sup className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold" {...props} />,
  // La section des notes de bas de page (className="footnotes") est stylée
  // globalement dans index.css : plus petite, grisée, avec trait de séparation.
  table: (props) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/30 font-semibold text-left" {...props} />,
  td: (props) => <td className="border border-gray-200 dark:border-gray-700 px-3 py-2" {...props} />,
};

/** Composant Markdown réutilisable, style unifié pour tout le site. */
export const Markdown: React.FC<{ children: string; className?: string }> = ({ children, className }) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
      {children}
    </ReactMarkdown>
  </div>
);

export default Markdown;
