import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { FemmesChapitre } from '../types';

// Rendu Markdown stylé (titres, listes, sous-listes, gras...) sans plugin typography.
const mdComponents: Components = {
  h1: (props) => <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  h2: (props) => <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  h3: (props) => <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-4 mb-2 font-amiri" {...props} />,
  p: (props) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
  li: (props) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-emerald-400 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />,
  a: (props) => <a className="text-emerald-600 dark:text-emerald-400 underline" target="_blank" rel="noopener noreferrer" {...props} />,
};

/**
 * Accordéon dédié aux cours "femmes".
 *  - matn : phrase du texte de base (encadré vert)
 *  - commentaire : rendu en Markdown (titres, listes, sous-listes, gras...) => aéré
 *  - texte_arabe : optionnel (RTL)
 * Un simple paragraphe reste un simple paragraphe : le Markdown est optionnel.
 */
export const FemmesAccordion: React.FC<{ chapitres: FemmesChapitre[] }> = ({ chapitres }) => {
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
                  <div className="px-5 pb-6 space-y-6">
                    {chap.segments.map((seg) => (
                      <div key={seg.id} className="space-y-2">
                        {seg.texte_arabe && (
                          <p lang="ar" dir="rtl" className="font-amiri text-2xl leading-loose text-emerald-900 dark:text-emerald-200 text-center">
                            {seg.texte_arabe}
                          </p>
                        )}

                        {seg.matn && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg px-4 py-3">
                            <p className="font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed">
                              {seg.matn}
                            </p>
                          </div>
                        )}

                        {seg.commentaire && (
                          <div className={seg.matn ? 'px-4 pt-1' : ''}>
                            {seg.matn && (
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
                                Commentaire
                              </p>
                            )}
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                              {seg.commentaire}
                            </ReactMarkdown>
                          </div>
                        )}

                        {seg.source && (
                          <p className="text-xs italic text-gray-500 dark:text-gray-400 px-4">
                            Source : {seg.source}
                          </p>
                        )}
                      </div>
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

export default FemmesAccordion;
