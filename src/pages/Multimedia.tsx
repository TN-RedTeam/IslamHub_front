import React, { useCallback, useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { VideoCard } from '../components/VideoCard';
import type { Multimedia as MultimediaType, MultimediaCategory } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

const PAGE_SIZE = 12;

export const Multimedia: React.FC = () => {
  usePageTitle('Multimédia');
  const [videos, setVideos]               = useState<MultimediaType[]>([]);
  const [categories, setCategories]       = useState<MultimediaCategory[]>([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedCategory, setCategory]   = useState<string | null>(null);
  const [hasSearched, setHasSearched]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [totalCount, setTotalCount]       = useState(0);
  const [currentPage, setCurrentPage]     = useState(0);
  const [hasMore, setHasMore]             = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Charger les catégories au mount (léger, pas de vidéos)
  useEffect(() => {
    dataService.getMultimediaCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const doSearch = useCallback(async (q: string, categorie: string | null, page: number, append: boolean) => {
    if (append) setIsLoadingMore(true);
    else        setIsLoading(true);
    setError(null);

    try {
      const result = await dataService.searchMultimedia(q, categorie, { page, pageSize: PAGE_SIZE });
      setVideos(prev => append ? [...prev, ...result.data] : result.data);
      setTotalCount(result.total);
      setCurrentPage(page);
      setHasMore((page + 1) * PAGE_SIZE < result.total);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
      if (!append) setVideos([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Recherche débouncée quand searchTerm/category changent (sauf au mount)
  useEffect(() => {
    const isInitial = !searchTerm && !selectedCategory && !hasSearched;
    if (isInitial) return;

    const t = setTimeout(() => {
      doSearch(searchTerm, selectedCategory, 0, false);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  // Infinite scroll : observe le sentinel et charge la page suivante
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          doSearch(searchTerm, selectedCategory, currentPage + 1, true);
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, currentPage, searchTerm, selectedCategory, doSearch]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategory(null);
    setHasSearched(false);
    setVideos([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      {/* En-tête */}
      <m.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />

        <div className="relative container mx-auto px-4 text-center">
          <m.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri"
          >
            Média Islamique
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Apprenez à travers notre collection de vidéos
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
        {/* Barre de recherche + filtre catégorie */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-12 sticky top-4 z-20 border border-emerald-100 dark:border-emerald-900"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Rechercher une vidéo, un savant, un sujet..."
                className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative md:w-64">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
              <select
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium"
                value={selectedCategory || ''}
                onChange={(e) => setCategory(e.target.value || null)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.categorie} value={c.categorie}>
                    {c.categorie} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedCategory || searchTerm) && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2"
            >
              <span className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">
                {hasSearched && !isLoading
                  ? `${totalCount} vidéo${totalCount > 1 ? 's' : ''} trouvée${totalCount > 1 ? 's' : ''}`
                  : 'Recherche en cours…'}
              </span>
              <button
                onClick={resetFilters}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
                aria-label="Réinitialiser les filtres"
              >
                <X className="h-5 w-5" />
              </button>
            </m.div>
          )}
        </m.section>

        {/* Résultats */}
        <section className="pb-16">
          <AnimatePresence mode="wait">
            {/* État initial : pas de recherche */}
            {!hasSearched && !isLoading && (
              <m.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <m.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-7xl mb-6"
                >
                  🎥
                </m.div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3 font-amiri">
                  Lance une recherche pour découvrir des vidéos
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Tape un mot-clé, le nom d'un savant, ou choisis une catégorie pour explorer notre sélection.
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                    {categories.slice(0, 8).map(c => (
                      <button
                        key={c.categorie}
                        onClick={() => setCategory(c.categorie)}
                        className="px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors text-sm font-medium"
                      >
                        {c.categorie} ({c.count})
                      </button>
                    ))}
                  </div>
                )}
              </m.div>
            )}

            {/* Loading initial */}
            {isLoading && (
              <m.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </m.div>
            )}

            {/* Erreur */}
            {error && !isLoading && (
              <m.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl"
              >
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </m.div>
            )}

            {/* Aucun résultat */}
            {hasSearched && !isLoading && !error && videos.length === 0 && (
              <m.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Essayez d'autres mots-clés ou changez de catégorie.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>
              </m.div>
            )}

            {/* Résultats */}
            {hasSearched && !isLoading && !error && videos.length > 0 && (
              <m.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map((video, i) => (
                    <VideoCard key={video.id} video={video} index={i} />
                  ))}
                </div>

                {/* Sentinel infinite scroll */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center mt-12">
                    {isLoadingMore ? (
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 mb-4 font-amiri text-xl">
            "Dieu existe de toute éternité et rien d'autre que Lui n'est de toute éternité"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Média Islamique</p>
        </div>
      </footer>
    </div>
  );
};

export default Multimedia;
