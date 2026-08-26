import React, { useMemo, useRef, useState } from 'react';
import { Search, ChevronRight, BookOpen, List, X } from 'lucide-react';

/**
 * Lecteur "documentation" réutilisable (fiqh, femmes...).
 *  - Colonne gauche : sommaire + recherche (remplace les tags non cherchables).
 *  - Colonne droite : un seul sujet à la fois, largeur de lecture confortable.
 * Le composant ne gère QUE la navigation + la recherche ; le contenu de chaque
 * sujet est fourni par l'appelant (prop `content`, déjà rendu en JSX/Markdown).
 */
export interface ReaderItem {
  key: string;
  title: string;
  search: string;          // texte servant à la recherche (titre + contenu brut)
  content: React.ReactNode; // rendu du sujet (arabe, markdown, source...)
}
export interface ReaderSection {
  chapitre?: string;       // en-tête de groupe (optionnel : liste plate si absent)
  items: ReaderItem[];
}

export const DocReader: React.FC<{
  sections: ReaderSection[];
  searchPlaceholder?: string;
  emptyLabel?: string;
}> = ({ sections, searchPlaceholder = 'Rechercher un sujet…', emptyLabel = 'Aucun contenu pour l\'instant.' }) => {
  const flat = useMemo(
    () => sections.flatMap((s) => s.items.map((it) => ({ ...it, chapitre: s.chapitre }))),
    [sections],
  );
  const total = flat.length;
  // Groupé (fiqh : chapitres) vs plat (femmes : liste de cours).
  const grouped = useMemo(() => sections.some((s) => s.chapitre), [sections]);

  // À l'arrivée : sommaire replié + aucun sujet ouvert si groupé ;
  // liste plate -> on ouvre directement le premier.
  const [selected, setSelected] = useState<string>(() => (grouped ? '' : flat[0]?.key ?? ''));
  const [query, setQuery] = useState('');
  const [tocOpen, setTocOpen] = useState(false); // mobile
  const [closed, setClosed] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    if (grouped) sections.forEach((s) => { if (s.chapitre) o[s.chapitre] = true; });
    return o;
  });
  const readRef = useRef<HTMLDivElement>(null);

  // Recherche insensible à la casse ET aux accents (é = e).
  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const q = norm(query.trim());
  const matches = (it: ReaderItem) => !q || norm(it.title).includes(q) || norm(it.search).includes(q);

  const current = selected ? flat.find((it) => it.key === selected) ?? null : null;

  const pick = (key: string) => {
    setSelected(key);
    setTocOpen(false);
    // Sur mobile, ramener la vue en haut du volet de lecture.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => readRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  if (total === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-10">{emptyLabel}</p>;
  }

  const visibleSections = sections
    .map((s) => ({ ...s, items: s.items.filter(matches) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start max-w-6xl mx-auto">
      {/* ---------- Sommaire ---------- */}
      <aside className="lg:sticky lg:top-24 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-bold text-emerald-900 dark:text-emerald-300 font-amiri text-lg">Sommaire</span>
          <span className="text-xs text-gray-400 font-medium">{total} sujets</span>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Rechercher dans le sommaire"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* bouton mobile pour dérouler le sommaire */}
        <button
          type="button"
          onClick={() => setTocOpen((v) => !v)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300 border-t border-gray-100 dark:border-gray-700"
          aria-expanded={tocOpen}
        >
          <span className="flex items-center gap-2">
            {tocOpen ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {tocOpen ? 'Fermer le sommaire' : 'Parcourir les sujets'}
          </span>
        </button>

        <nav className={`${tocOpen ? 'block' : 'hidden'} lg:block max-h-[70vh] overflow-auto pb-2`}>
          {visibleSections.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400">Aucun sujet ne correspond.</p>
          ) : (
            visibleSections.map((s, si) => {
              const hasHeader = !!s.chapitre;
              const isClosed = hasHeader ? (q ? false : closed[s.chapitre as string]) : false;
              return (
                <div key={s.chapitre ?? `sec-${si}`} className="border-t border-gray-100 dark:border-gray-700">
                  {hasHeader && (
                    <button
                      type="button"
                      onClick={() => setClosed((c) => ({ ...c, [s.chapitre as string]: !c[s.chapitre as string] }))}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left font-bold text-gray-800 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-none" />
                      <span className="flex-1 truncate">{s.chapitre}</span>
                      <span className="text-xs text-gray-400 font-medium">{s.items.length}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isClosed ? '' : 'rotate-90'}`} />
                    </button>
                  )}
                  {!isClosed && (
                    <div className={hasHeader ? 'pb-1.5' : 'py-1.5'}>
                      {s.items.map((it) => {
                        const on = it.key === current?.key;
                        return (
                          <button
                            key={it.key}
                            type="button"
                            onClick={() => pick(it.key)}
                            className={`block w-full text-left text-sm leading-snug px-4 py-2 border-l-2 transition-colors ${
                              on
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-amber-500 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-900/40 hover:text-gray-900 dark:hover:text-gray-200'
                            } ${hasHeader ? 'pl-8' : ''}`}
                          >
                            {it.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </aside>

      {/* ---------- Volet de lecture ---------- */}
      <article
        ref={readRef}
        className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm px-5 sm:px-8 lg:px-10 py-8"
      >
        {current ? (
          <div className="mx-auto max-w-[72ch]">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3 flex-wrap">
              {current.chapitre && (
                <>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {current.chapitre}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className="text-emerald-600 dark:text-emerald-400">{current.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-amiri leading-tight mb-6">
              {current.title}
            </h2>
            <div>{current.content}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400 dark:text-gray-500">
            <BookOpen className="w-9 h-9 mb-3 opacity-60" />
            <p className="text-sm">Choisissez un sujet dans le sommaire pour commencer la lecture.</p>
          </div>
        )}
      </article>
    </div>
  );
};

export default DocReader;
