import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import type { FiqhChapitre } from '../types';

/**
 * Accordéon réutilisable : affiche des chapitres dépliables, chacun contenant
 * des points de jurisprudence (arabe + français + type + source).
 * Utilisé par les pages écoles (via EcoleFiqhSection) et la page Femmes.
 */
export const FiqhAccordion: React.FC<{ chapitres: FiqhChapitre[] }> = ({ chapitres }) => {
  const [openChap, setOpenChap] = useState<string | null>(chapitres[0]?.chapitre ?? null);

  return (
    <div className="space-y-4">
      {chapitres.map((chap) => {
        const isOpen = openChap === chap.chapitre;
        return (
          <div
            key={chap.chapitre}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenChap(isOpen ? null : chap.chapitre)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span className="text-lg font-bold text-emerald-900 dark:text-emerald-300 font-amiri truncate">
                  {chap.chapitre}
                </span>
                <span className="text-xs text-gray-400 shrink-0">({chap.points.length})</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-5">
                    {chap.points.map((pt) => (
                      <article
                        key={pt.id}
                        className="border-l-4 border-emerald-400 dark:border-emerald-600 pl-4 py-1"
                      >
                        {(pt.sujet || pt.type) && (
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {pt.sujet && (
                              <h4 className="font-bold text-gray-800 dark:text-gray-100">{pt.sujet}</h4>
                            )}
                            {pt.type && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                                {pt.type}
                              </span>
                            )}
                          </div>
                        )}

                        {pt.texte_arabe && (
                          <p lang="ar" dir="rtl" className="text-2xl font-amiri leading-loose text-gray-900 dark:text-white mb-2">
                            {pt.texte_arabe}
                          </p>
                        )}

                        {pt.texte && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {pt.texte}
                          </p>
                        )}

                        {pt.source && (
                          <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-2">
                            Source : {pt.source}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FiqhAccordion;
