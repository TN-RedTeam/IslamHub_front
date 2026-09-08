import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Search, X, Star, ChevronRight, Loader, SlidersHorizontal } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FilterSelect } from '../components/FilterSelect';
import { PageHeader } from '../components/PageHeader';
import { slugify } from '../utils/slug';
import type { Hadith as HadithType } from '../types';
import { IconBadge } from '../components/Icon';

interface Hadith extends HadithType {
  id: number;
  sujet: string;
  rapporteur: string | null;
  narrateur: string | null;
  statut: string | null;
  texte_arabe: string;
  texte_francais: string | null;
  phonétique: string | null;
  explication: string | null;
  tag: string;
}

const HadithCard: React.FC<{ hadith: Hadith; onClick: () => void }> = ({ hadith, onClick }) => (
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

      {hadith.sujet && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-amber-500 dark:text-amber-300 mr-2" />
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-display">
              {hadith.sujet}
            </h3>
          </div>
      )}

      {hadith.rapporteur && (
          <div className="text-sm text-green italic">
            Rapporteur: {hadith.rapporteur}
          </div>
      )}

      <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-line flex-grow">
        <p className="text-2xl text-gray-900 dark:text-white font-arabic leading-loose text-right line-clamp-3 whitespace-pre-wrap">
          {hadith.texte_arabe}
        </p>

        {hadith.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-amber-300 dark:border-green line-clamp-2">
              <p className="text-sm text-amber-700 dark:text-amber-200 mb-1">Signification :</p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{hadith.texte_francais}</p>
            </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(hadith.tag || '').split(',').filter(Boolean).map(tag => (
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

const HadithModal: React.FC<{ hadith: Hadith; onClose: () => void }> = ({ hadith, onClose }) => (
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
          exit={{ scale: 0.9, y: 50 }}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-display">
                {hadith.sujet}
              </h2>
              {hadith.rapporteur && (
                  <p className="text-green mt-1">
                    Rapporteur: {hadith.rapporteur}
                  </p>
              )}
              {hadith.narrateur && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Narrateur: {hadith.narrateur}
                  </p>
              )}
            </div>

            {hadith.statut && (
                <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm">
                  {hadith.statut}
                </span>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-gray-700 p-6 rounded-lg">
            <p className="text-3xl text-gray-900 dark:text-white font-arabic leading-loose text-right whitespace-pre-wrap">
              {hadith.texte_arabe}
            </p>

            {hadith.phonétique && (
                <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Phonétique:</p>
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap [unicode-bidi:plaintext]">{hadith.phonétique}</p>
                </div>
            )}

            {hadith.texte_francais && (
                <div className="mt-6 pl-4 border-l-4 border-green">
                  <p className="text-sm text-green mb-2">Traduction:</p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{hadith.texte_francais}</p>
                </div>
            )}
          </div>

          {hadith.explication && (
              <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                <p className="text-lg font-bold text-green-deep mb-3">Explication:</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{hadith.explication}</p>
              </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(hadith.tag || '').split(',').filter(Boolean).map(tag => (
                <span
                    key={tag.trim()}
                    className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 px-3 py-1 rounded-full"
                >
                  {tag.trim()}
                </span>
            ))}
          </div>

          <div className="pt-2">
            <Link
                to={`/hadiths/${hadith.id}/${slugify(hadith.sujet)}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-sm font-medium text-green hover:underline"
            >
              Ouvrir la page dédiée →
            </Link>
          </div>
        </div>
      </m.div>
    </m.div>
);

const ITEMS_PER_PAGE = 20;

// Thèmes rapides (Aqida) — cliquent une recherche sur le tag correspondant.
const AQIDA_THEMES = [
  { label: 'Croyance', q: 'croyance' },
  { label: 'Noms et Attributs', q: 'attributs' },
  { label: 'Foi', q: 'foi' },
];

export const Hadiths: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // sujet
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedRapporteur, setSelectedRapporteur] = useState('');
  const [selectedNarrateur, setSelectedNarrateur] = useState('');
  const [showAll, setShowAll] = useState(false);

  const [allTags, setAllTags] = useState<string[]>([]); // sujets
  const [statuts, setStatuts] = useState<string[]>([]);
  const [rapporteurs, setRapporteurs] = useState<string[]>([]);
  const [narrateurs, setNarrateurs] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0); // total en base (bouton « Tout afficher »)

  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasRubricFilter = !!(selectedStatut || selectedRapporteur || selectedNarrateur);
  const hasQuery = !!(searchTerm.trim() || selectedTag || hasRubricFilter);

  const rubrics = { statut: selectedStatut, rapporteur: selectedRapporteur, narrateur: selectedNarrateur };

  // Préchargement des listes (sujets + rubriques) + total — sans charger les hadiths.
  useEffect(() => {
    dataService.getHadithSujets().then(setAllTags).catch(() => {});
    dataService.getHadithRubriques()
      .then((r) => { setStatuts(r.statuts); setRapporteurs(r.rapporteurs); setNarrateurs(r.narrateurs); })
      .catch(() => {});
    dataService.searchHadiths('', null, { page: 0, pageSize: 1 })
      .then((res) => setTotalCount(res.count ?? 0)).catch(() => {});
  }, []);

  const doSearch = useCallback(async (
    q: string, tag: string | null,
    r: { statut: string; rapporteur: string; narrateur: string },
    page: number, append: boolean,
  ) => {
    if (page === 0) { setIsLoading(true); setError(null); } else setIsLoadingMore(true);
    try {
      const res = await dataService.searchHadiths(q, tag, { page, pageSize: ITEMS_PER_PAGE }, r);
      const items = (res.data ?? []) as Hadith[];
      const tot = res.count ?? 0;
      setHadiths((prev) => (append ? [...prev, ...items] : items));
      setTotal(tot);
      setHasMore((page + 1) * ITEMS_PER_PAGE < tot);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching hadiths:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Recherche débouncée à chaque changement de critère (rien tant qu'aucun filtre).
  useEffect(() => {
    if (!hasQuery && !showAll) {
      setHadiths([]); setTotal(0); setHasMore(false); setCurrentPage(0); setHasSearched(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(searchTerm, selectedTag, rubrics, 0, false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTag, selectedStatut, selectedRapporteur, selectedNarrateur, showAll]);

  // Scroll infini.
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || isLoadingMore || isLoading || !hasSearched) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) doSearch(searchTerm, selectedTag, rubrics, currentPage + 1, true);
    }, { threshold: 0.1, rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isLoading, hasSearched, currentPage, searchTerm, selectedTag, selectedStatut, selectedRapporteur, selectedNarrateur]);

  const handleResetFilters = () => {
    setSearchTerm(''); setSelectedTag(null);
    setSelectedStatut(''); setSelectedRapporteur(''); setSelectedNarrateur('');
    setShowAll(false);
  };

  if (error) {
    return (
        <div className="min-h-screen bg-ground flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
            <IconBadge name="sad" />
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Une erreur est survenue</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
                onClick={() => doSearch(searchTerm, selectedTag, rubrics, 0, false)}
                className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors">
              Réessayer
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-ground">
        <PageHeader
            eyebrow="Sunna"
            title="Hadiths du Prophète ﷺ"
            subtitle="Explorez les Hadiths à travers cette page"
            crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Hadiths' }]}
        />

        <main className="container mx-auto px-4 py-12 relative z-10">
          <m.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-card shadow-card p-6 mb-12 border border-line">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-green" />
                </div>
                <input
                    type="text" aria-label="Rechercher un hadith" placeholder="Rechercher un hadith..."
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
            </div>

            {(statuts.length > 0 || rapporteurs.length > 0 || narrateurs.length > 0) && (
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {statuts.length > 0 && (
                      <label className="text-sm">
                        <span className="flex items-center gap-1.5 mb-1 font-medium text-gray-600 dark:text-gray-300">
                          <SlidersHorizontal className="h-3.5 w-3.5" /> Authenticité
                        </span>
                        <FilterSelect value={selectedStatut} onChange={setSelectedStatut}
                            options={statuts} allLabel="Tous les statuts" ariaLabel="Filtrer par statut" className="w-full" />
                      </label>
                  )}
                  {rapporteurs.length > 0 && (
                      <label className="text-sm">
                        <span className="mb-1 font-medium text-gray-600 dark:text-gray-300 block">Rapporteur</span>
                        <FilterSelect value={selectedRapporteur} onChange={setSelectedRapporteur}
                            options={rapporteurs} allLabel="Tous les rapporteurs" ariaLabel="Filtrer par rapporteur" className="w-full" />
                      </label>
                  )}
                  {narrateurs.length > 0 && (
                      <label className="text-sm">
                        <span className="mb-1 font-medium text-gray-600 dark:text-gray-300 block">Narrateur</span>
                        <FilterSelect value={selectedNarrateur} onChange={setSelectedNarrateur}
                            options={narrateurs} allLabel="Tous les narrateurs" ariaLabel="Filtrer par narrateur" className="w-full" />
                      </label>
                  )}
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thèmes :</span>
              {AQIDA_THEMES.map((t) => (
                  <button key={t.q} onClick={() => setSearchTerm(t.q)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-emerald-800/60 text-amber-800 hover:bg-amber-200 dark:hover:bg-green-deep transition-colors">
                    {t.label}
                  </button>
              ))}
            </div>

            {(selectedTag || hasRubricFilter) && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2">
                  <span className="font-medium text-green-deep flex flex-wrap items-center gap-2">
                    Filtres :
                    {selectedTag && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 rounded-full text-sm">{selectedTag}</span>}
                    {selectedStatut && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full text-sm">{selectedStatut}</span>}
                    {selectedRapporteur && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 rounded-full text-sm">{selectedRapporteur}</span>}
                    {selectedNarrateur && <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800 rounded-full text-sm">{selectedNarrateur}</span>}
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
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Recherchez un hadith</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Saisissez un mot-clé (cherche aussi dans les tags et l'arabe) ou choisissez un filtre (sujet, authenticité, rapporteur, narrateur) — ou affichez tout.
                </p>
                <button onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 mb-6 rounded-xl bg-green hover:bg-green-deep text-white font-medium shadow">
                  Tout afficher{totalCount > 0 ? ` (${totalCount})` : ''}
                </button>
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                    <span className="w-full text-sm text-gray-400 mb-1">Sujets :</span>
                    {allTags.slice(0, 10).map((t) => (
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
            ) : hadiths.length === 0 ? (
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
                  {hadiths.length}{total > hadiths.length ? ` / ${total}` : ''} hadith{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                </m.p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {hadiths.map((hadith, index) => (
                        <m.div key={hadith.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index % ITEMS_PER_PAGE, 10) * 0.05 }} layout>
                          <HadithCard hadith={hadith} onClick={() => setSelectedHadith(hadith)} />
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
            <p className="text-emerald-200">© {new Date().getFullYear()} Collection de Hadiths</p>
          </div>
        </footer>

        <AnimatePresence>
          {selectedHadith && (
              <HadithModal hadith={selectedHadith} onClose={() => setSelectedHadith(null)} />
          )}
        </AnimatePresence>
      </div>
  );
};
