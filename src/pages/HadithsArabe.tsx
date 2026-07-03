import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, X, Loader, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import type { HadithArabe } from '../types';

const ITEMS_PER_PAGE = 12;

// ─── Carte ───────────────────────────────────────────────────────────────────

const HadithArabeCard: React.FC<{ hadith: HadithArabe; onClick: () => void }> = ({ hadith, onClick }) => (
  <m.div
    whileHover={{ scale: 1.01 }}
    onClick={onClick}
    className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 space-y-4 overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-2xl"
  >
    <div className="absolute top-0 left-0 w-24 h-24 opacity-20">
      <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
        <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
      </svg>
    </div>

    <h3
      className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri leading-relaxed line-clamp-2 text-right"
      lang="ar"
      dir="rtl"
      translate="no"
    >
      {hadith.sujet}
    </h3>

    <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-amber-100 dark:border-emerald-800 flex-grow">
      <p
        className="text-xl text-gray-900 dark:text-white font-amiri leading-loose text-right line-clamp-4"
        lang="ar"
        dir="rtl"
        translate="no"
      >
        {hadith.texte_arabe}
      </p>
    </div>

    <div className="mt-auto pt-2 text-center">
      <button className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
        اقرأ المزيد
      </button>
    </div>
  </m.div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────

const HadithArabeModal: React.FC<{ hadith: HadithArabe; onClose: () => void }> = ({ hadith, onClose }) => (
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="space-y-6">
        <h2
          className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-amiri leading-relaxed text-right pl-10"
          lang="ar"
          dir="rtl"
          translate="no"
        >
          {hadith.sujet}
        </h2>

        <div className="bg-amber-50/50 dark:bg-gray-900/40 p-6 rounded-xl border border-amber-100 dark:border-emerald-800">
          <p
            className="text-2xl text-gray-900 dark:text-white font-amiri leading-loose text-right whitespace-pre-line"
            lang="ar"
            dir="rtl"
            translate="no"
          >
            {hadith.texte_arabe}
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
          <a
            href={hadith.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            المصدر : sunnaonline.org
          </a>
          {hadith.date_site && <span>{hadith.date_site}</span>}
        </div>
      </div>
    </m.div>
  </m.div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export const HadithsArabe: React.FC = () => {
  usePageTitle('أحاديث بالعربية');
  const [hadiths, setHadiths] = useState<HadithArabe[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHadith, setSelectedHadith] = useState<HadithArabe | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchPage = useCallback(async (q: string, p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page: p, pageSize: ITEMS_PER_PAGE };
      const res = q.trim()
        ? await dataService.searchHadithsArabe(q, params)
        : await dataService.getHadithsArabe(params);
      setHadiths(res.data ?? []);
      setTotalCount(res.count ?? 0);
    } catch {
      setError('Erreur lors du chargement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPage(searchQuery, page), searchQuery ? 300 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, page, fetchPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      {/* En-tête avec motif islamique */}
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
            lang="ar"
            dir="rtl"
            translate="no"
          >
            أحاديث شريفة
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Hadiths en arabe, recopiés fidèlement depuis sunnaonline.org
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
        {/* Barre de recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-8">
          <div className="relative">
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث في الأحاديث..."
              dir="rtl"
              lang="ar"
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right font-amiri focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                aria-label="Effacer la recherche"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchPage(searchQuery, page)}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : hadiths.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucun hadith trouvé</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
              {totalCount} hadith{totalCount > 1 ? 's' : ''}
              {searchQuery && <> pour «&nbsp;<span className="font-bold" translate="no">{searchQuery}</span>&nbsp;»</>}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hadiths.map((hadith, index) => (
                <m.div
                  key={hadith.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3) }}
                >
                  <HadithArabeCard hadith={hadith} onClick={() => setSelectedHadith(hadith)} />
                </m.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Page précédente"
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 disabled:opacity-40 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Page suivante"
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 disabled:opacity-40 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedHadith && (
          <HadithArabeModal hadith={selectedHadith} onClose={() => setSelectedHadith(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HadithsArabe;
