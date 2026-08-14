import React from 'react';
import { Markdown } from './Markdown';
import { DocReader } from './DocReader';
import type { ReaderSection } from './DocReader';
import type { FiqhChapitre } from '../types';

/**
 * Lecteur de jurisprudence (fiqh) pour une école.
 * Sommaire = chapitres -> sujets ; volet de lecture = un sujet à la fois,
 * rendu en Markdown (titres, listes, notes de bas de page...).
 */
export const FiqhReader: React.FC<{ chapitres: FiqhChapitre[] }> = ({ chapitres }) => {
  const sections: ReaderSection[] = chapitres.map((chap) => ({
    chapitre: chap.chapitre,
    items: chap.points.map((pt) => ({
      key: String(pt.id),
      title: pt.sujet || chap.chapitre,
      search: `${pt.sujet ?? ''} ${pt.tag ?? ''} ${chap.chapitre} ${pt.texte ?? ''}`,
      content: (
        <div className="space-y-3">
          {pt.type && (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
              {pt.type}
            </span>
          )}
          {pt.texte_arabe && (
            <p lang="ar" dir="rtl" className="text-2xl font-amiri leading-loose text-gray-900 dark:text-white">
              {pt.texte_arabe}
            </p>
          )}
          {pt.texte && <Markdown>{pt.texte}</Markdown>}
          {pt.source && (
            <p className="text-xs italic text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
              Source : {pt.source}
            </p>
          )}
        </div>
      ),
    })),
  }));

  return <DocReader sections={sections} searchPlaceholder="Rechercher un point de fiqh…" />;
};

export default FiqhReader;
