import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

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
  h1: (props) => <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  h2: (props) =>
    // remark-gfm génère un <h2 id="footnote-label"> pour le titre des notes :
    // on le garde masqué (sr-only) au lieu d'afficher "Footnotes".
    (props as { id?: string }).id === 'footnote-label'
      ? <h2 className="sr-only" {...props} />
      : <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  h3: (props) => <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  p: (props) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  li: (props) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-emerald-400 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />,
  a: (props) => <a className="text-emerald-600 dark:text-emerald-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
  hr: (props) => <hr className="my-4 border-gray-200 dark:border-gray-700" {...props} />,
  sup: (props) => <sup className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold" {...props} />,
  // Section des notes de bas de page : trait de séparation + texte plus petit.
  section: (props) =>
    (props as { 'data-footnotes'?: unknown })['data-footnotes'] !== undefined
      ? <section className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400" {...props} />
      : <section {...props} />,
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
