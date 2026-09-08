import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Star, ChevronRight, Loader, GraduationCap as SavantIcon, Users } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FilterSelect } from '../components/FilterSelect';
import { Markdown } from '../components/Markdown';
import { EcoleBadge } from '../components/EcoleBadge';
import { SavantHover } from '../components/SavantHover';
import { PageHeader } from '../components/PageHeader';
import type { Parole } from '../types';
import { IconBadge } from '../components/Icon';

const ParoleCard: React.FC<{ parole: Parole; onClick: () => void }> = ({ parole, onClick }) => (
    <m.div
        whileHover={{ scale: 1.01 }}
        onClick={onClick}
        className="relative bg-ivory rounded-card p-6 shadow-card border border-line space-y-4 overflow-hidden cursor-pointer h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="text-amber-500">
          <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
        </svg>
      </div>

      {parole.sujet && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-amber-500 dark:text-amber-300 mr-2" />
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-display">
              {parole.sujet}
            </h3>
          </div>
      )}

      {(parole.savant || parole.ecole) && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {parole.savant && (
                <span className="text-sm text-green italic">
                  Savant : <SavantHover nom={parole.savant} />
                </span>
            )}
            {parole.ecole && <EcoleBadge ecole={parole.ecole} onClick={(e) => e.stopPropagation()} />}
          </div>
      )}

      <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-line flex-grow">
        <p className="text-2xl text-gray-900 dark:text-white font-arabic leading-loose text-right line-clamp-3 whitespace-pre-wrap">
          {parole.texte_arabe}
        </p>

        {parole.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-amber-300 dark:border-green line-clamp-2">
              <p className="text-sm text-amber-700 dark:text-amber-200 mb-1">Signification :</p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{parole.texte_francais}</p>
            </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(parole.tag || '').split(',').filter(Boolean).map(tag => (
            <m.span
                key={tag.trim()}
                whileHover={{ scale: 1.05 }}
                className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 px-3 py-1 rounded-full flex items-center"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              {tag.trim()}
            </m.span>
        ))}
      </div>

      <div className="mt-auto pt-4 text-center">
        <button className="text-green text-sm font-medium hover:underline">
          Lire la suite...
        </button>
      </div>
    </m.div>
);

const ParoleModal: React.FC<{ parole: Parole | null; onClose: () => void }> = ({ parole, onClose }) => {
  if (!parole) return null;
  return (
      <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
      >
        <m.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        >
          <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-display">
                {parole.sujet}
              </h2>
              {parole.savant && (
                  <p className="text-green mt-1">
                    Savant : <SavantHover nom={parole.savant} />
                  </p>
              )}
              {parole.ecole && <div className="mt-2"><EcoleBadge ecole={parole.ecole} /></div>}
            </div>

            <div className="bg-amber-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-3xl text-gray-900 dark:text-white font-arabic leading-loose text-right whitespace-pre-wrap">
                {parole.texte_arabe}
              </p>

              {parole['phonétique'] && (
                  <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Phonétique :</p>
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap [unicode-bidi:plaintext]">{parole['phonétique']}</p>
                  </div>
              )}

              {parole.texte_francais && (
                  <div className="mt-6 pl-4 border-l-4 border-green">
                    <p className="text-sm text-green mb-2">Traduction :</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{parole.texte_francais}</p>
                  </div>
              )}
            </div>

            {parole.explication && (
                <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                  <p className="text-lg font-bold text-green-deep mb-3">Explication :</p>
                  <Markdown>{parole.explication}</Markdown>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(parole.tag || '').split(',').filter(Boolean).map(tag => (
                  <span
                      key={tag.trim()}
                      className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 px-3 py-1 rounded-full"
                  >
                    {tag.trim()}
                  </span>
              ))}
            </div>
          </div>
        </m.div>
      </m.div>
  );
};

const ITEMS_PER_PAGE = 20;

export const Paroles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // sujet
  const [selectedSavant, setSelectedSavant] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [allTags, setAllTags] = useState<string[]>([]); // sujets
  const [savants, setSavants] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0); // total en base

  const [paroles, setParoles] = useState<Parole[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Parole | null>(null);

  const [searchParams] = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasQuery = !!(searchTerm.trim() || selectedTag || selectedSavant);

  // Listes (sujets + savants) + total, sans charger les paroles.
  useEffect(() => {
    dataService.getParoleSujets().then(setAllTags).catch(() => {});
    dataService.getParoleNames().then(setSavants).catch(() => {});
    dataService.searchParoles('', null, { page: 0, pageSize: 1 })
      .then((r) => setTotalCount(r.count ?? 0)).catch(() => {});
  }, []);

  // Pré-filtre par savant si on arrive depuis /savants (?savant=Nom).
  useEffect(() => {
    const s = searchParams.get('savant');
    if (s) setSelectedSavant(s);
  }, [searchParams]);

  const doSearch = useCallback(async (
    q: string, tag: string | null, savant: string, page: number, append: boolean,
  ) => {
    if (page === 0) { setIsLoading(true); setError(null); } else setIsLoadingMore(true);
    try {
      const res = await dataService.searchParoles(q, tag, { page, pageSize: ITEMS_PER_PAGE }, savant);
      const items = (res.data ?? []) as Parole[];
      const tot = res.count ?? 0;
      setParoles((prev) => (append ? [...prev, ...items] : items));
      setTotal(tot);
      setHasMore((page + 1) * ITEMS_PER_PAGE < tot);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!hasQuery && !showAll) {
      setParoles([]); setTotal(0); setHasMore(false); setCurrentPage(0); setHasSearched(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchTerm, selectedTag, selectedSavant, 0, false), 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTag, selectedSavant, showAll]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || isLoadingMore || isLoading || !hasSearched) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) doSearch(searchTerm, selectedTag, selectedSavant, currentPage + 1, true);
    }, { threshold: 0.1, rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isLoading, hasSearched, currentPage, searchTerm, selectedTag, selectedSavant]);

  const handleResetFilters = () => {
    setSearchTerm(''); setSelectedTag(null); setSelectedSavant(''); setShowAll(false);
  };

  if (error) {
    return (
        <div className="min-h-screen bg-ground flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
            <IconBadge name="sad" />
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Une erreur est survenue</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button onClick={() => doSearch(searchTerm, selectedTag, selectedSavant, 0, false)}
                className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors">Réessayer</button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-ground">
        <PageHeader
            eyebrow="Savants"
            title="Paroles de savants"
            subtitle="Explorez les paroles des savants de Ahlu s-Sounnah"
            crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Paroles' }]}
        >
          <Link to="/savants"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-green-deep hover:bg-green-soft font-medium transition-colors">
            <Users className="h-5 w-5" /> Découvrir les savants
          </Link>
        </PageHeader>

        <main className="container mx-auto px-4 py-12 relative z-10">
          <m.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-card shadow-card p-6 mb-12 border border-line">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-green" />
                </div>
                <input
                    type="text" aria-label="Rechercher une parole" placeholder="Rechercher une parole, un savant..."
                    className="w-full pl-12 pr-6 py-3 rounded-xl border border-line bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green focus:border-transparent text-lg font-display"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader className="h-5 w-5 text-green animate-spin" />
                    </div>
                )}
              </div>

              <FilterSelect
                  value={selectedTag || ''} onChange={(v) => setSelectedTag(v || null)}
                  options={allTags} allLabel="Tous les sujets" ariaLabel="Filtrer par sujet" />

              {savants.length > 0 && (
                <FilterSelect
                    value={selectedSavant} onChange={setSelectedSavant}
                    options={savants} allLabel="Tous les savants" ariaLabel="Filtrer par savant" icon={SavantIcon} />
              )}
            </div>

            {(selectedTag || selectedSavant) && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2">
                  <span className="font-medium text-green-deep flex flex-wrap items-center gap-2">
                    Filtres :
                    {selectedTag && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 rounded-full text-sm">{selectedTag}</span>}
                    {selectedSavant && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 rounded-full text-sm">{selectedSavant}</span>}
                  </span>
                  <button onClick={handleResetFilters} aria-label="Retirer les filtres"
                      className="text-green hover:text-green-deep dark:hover:text-emerald-200 p-1 shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                </m.div>
            )}
          </m.section>

          <section className="pb-16">
            {!hasQuery && !showAll ? (
              <div className="text-center py-20 bg-white/70 dark:bg-gray-800/70 rounded-card border border-line">
                <IconBadge name="search" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Recherchez une parole</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Saisissez un mot-clé (cherche aussi les tags), un savant, choisissez un sujet — ou affichez tout.
                </p>
                <button onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-xl bg-green hover:bg-green-deep text-white font-medium shadow">
                  Tout afficher{totalCount > 0 ? ` (${totalCount})` : ''}
                </button>
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    <span className="w-full text-sm text-gray-400 mb-1">Sujets :</span>
                    {allTags.slice(0, 8).map((t) => (
                      <button key={t} onClick={() => setSelectedTag(t)}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-amber-100 dark:bg-emerald-800/60 text-amber-800 hover:bg-amber-200 dark:hover:bg-green-deep transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <Loader className="h-12 w-12 text-green animate-spin" />
                <p className="text-green font-display text-xl">Recherche en cours...</p>
              </div>
            ) : paroles.length === 0 ? (
              <m.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white dark:bg-gray-800 rounded-card shadow-card">
                <div className="max-w-md mx-auto">
                  <IconBadge name="book" />
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
                  <button onClick={handleResetFilters}
                      className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors">Réinitialiser</button>
                </div>
              </m.div>
            ) : (
              <>
                <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-sm font-medium text-green mb-6">
                  {paroles.length}{total > paroles.length ? ` / ${total}` : ''} parole{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
                </m.p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {paroles.map((parole, index) => (
                        <m.div key={parole.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index % ITEMS_PER_PAGE, 10) * 0.05 }} layout>
                          <ParoleCard parole={parole} onClick={() => setSelected(parole)} />
                        </m.div>
                    ))}
                  </AnimatePresence>
                </div>
                {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center py-8">
                      {isLoadingMore ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader className="h-8 w-8 text-green animate-spin" />
                            <p className="text-green text-sm">Chargement…</p>
                          </div>
                      ) : <div className="h-10" />}
                    </div>
                )}
              </>
            )}
          </section>
        </main>

        <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-emerald-300 mb-4 font-display text-xl">"On n'obéit pas à une créature pour désobéir au Créateur"</p>
            <p className="text-emerald-200">© {new Date().getFullYear()} Paroles de savants</p>
          </div>
        </footer>

        <AnimatePresence>
          {selected && <ParoleModal parole={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </div>
  );
};

export default Paroles;
