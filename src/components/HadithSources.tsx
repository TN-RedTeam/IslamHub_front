import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { HadithSource } from '../types';

/**
 * Affichage de la source d'un hadith, groupée par rapporteur.
 * - `compact` (carte) : juste les noms des rapporteurs, sur une ligne.
 * - complet (modale / page dédiée) : un bloc par rapporteur → ses livres →
 *   la référence (chapitre / n°) en second, affichée seulement si renseignée.
 *   Reste lisible même avec plusieurs rapporteurs et plusieurs livres.
 */
export const HadithSources: React.FC<{ sources?: HadithSource[] | null; compact?: boolean }> = ({ sources, compact }) => {
  if (!sources || sources.length === 0) return null;

  if (compact) {
    const noms = sources.map((s) => s.savant).filter(Boolean).join(', ');
    if (!noms) return null;
    return <span className="[unicode-bidi:plaintext]">{noms}</span>;
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden divide-y divide-line">
      {sources.map((s, i) => (
        <div key={i} className="p-3 sm:p-3.5">
          <div className="flex items-center gap-1.5 text-green-deep font-semibold text-sm">
            <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden />
            {s.savant_slug ? (
              <Link to={`/savants/${s.savant_slug}`} className="hover:underline">{s.savant}</Link>
            ) : (
              <span>{s.savant}</span>
            )}
          </div>
          <ul className="mt-1.5 space-y-1.5 pl-5">
            {s.livres.map((b, j) => (
              <li key={j} className="text-sm text-ink leading-snug">
                <span className="[unicode-bidi:plaintext]">{b.titre}</span>
                {b.reference && (
                  <span className="block text-xs text-muted mt-0.5 [unicode-bidi:plaintext]">{b.reference}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HadithSources;
