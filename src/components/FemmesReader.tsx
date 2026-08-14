import React from 'react';
import { Markdown } from './Markdown';
import { DocReader } from './DocReader';
import type { ReaderSection, ReaderItem } from './DocReader';
import type { FemmesChapitre, FemmesSegment } from '../types';

/** Rendu d'un segment : matn (encadré) + commentaire (Markdown) + arabe + source. */
const Segment: React.FC<{ seg: FemmesSegment }> = ({ seg }) => (
  <div className="space-y-2">
    {seg.texte_arabe && (
      <p lang="ar" dir="rtl" className="font-amiri text-2xl leading-loose text-emerald-900 dark:text-emerald-200 text-center">
        {seg.texte_arabe}
      </p>
    )}
    {seg.matn && (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg px-4 py-3">
        <p className="font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed">{seg.matn}</p>
      </div>
    )}
    {seg.commentaire && (
      <div className={seg.matn ? 'px-4 pt-1' : ''}>
        {seg.matn && (
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">Commentaire</p>
        )}
        <Markdown>{seg.commentaire}</Markdown>
      </div>
    )}
    {seg.source && <p className="text-xs italic text-gray-500 dark:text-gray-400 px-4">Source : {seg.source}</p>}
  </div>
);

/**
 * Lecteur des cours "femmes" : sommaire = liste des cours (chapitres),
 * volet de lecture = tous les segments d'un cours (matn + commentaire).
 */
export const FemmesReader: React.FC<{ chapitres: FemmesChapitre[] }> = ({ chapitres }) => {
  const items: ReaderItem[] = chapitres.map((chap) => ({
    key: chap.chapitre,
    title: chap.chapitre,
    search: `${chap.chapitre} ${chap.segments.map((s) => `${s.matn ?? ''} ${s.commentaire ?? ''}`).join(' ')}`,
    content: (
      <div className="space-y-6">
        {chap.segments.map((seg) => (
          <Segment key={seg.id} seg={seg} />
        ))}
      </div>
    ),
  }));

  const sections: ReaderSection[] = [{ items }];
  return <DocReader sections={sections} searchPlaceholder="Rechercher un cours…" />;
};

export default FemmesReader;
