import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, ChevronRight, Loader, GraduationCap } from 'lucide-react';
import { dataService } from '../services/DataService';
import type { Parole } from '../types';

const ParoleCard: React.FC<{ parole: Parole; onClick: () => void }> = ({ parole, onClick }) => (
    <m.div
        whileHover={{ scale: 1.01 }}
        onClick={onClick}
        className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 space-y-4 overflow-hidden cursor-pointer h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
          <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
        </svg>
      </div>

      {parole.sujet && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-amber-500 dark:text-amber-300 mr-2" />
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
              {parole.sujet}
            </h3>
          </div>
      )}

      {parole.savant && (
          <div className="text-sm text-emerald-700 dark:text-emerald-300 italic">
            Savant : {parole.savant}
          </div>
      )}

      <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-amber-100 dark:border-emerald-800 flex-grow">
        <p className="text-2xl text-gray-900 dark:text-white font-arabic leading-loose text-right line-clamp-3">
          {parole.texte_arabe}
        </p>

        {parole.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-amber-300 dark:border-emerald-600 line-clamp-2">
              <p className="text-sm text-amber-700 dark:text-amber-200 mb-1">Signification :</p>
              <p className="text-gray-700 dark:text-gray-300">{parole.texte_francais}</p>
            </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {parole.tag.split(',').map(tag => (
            <m.span
                key={tag.trim()}
                whileHover={{ scale: 1.05 }}
                className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full flex items-center"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              {tag.trim()}
            </m.span>
        ))}
      </div>

      <div className="mt-auto pt-4 text-center">
        <button className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
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
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                {parole.sujet}
              </h2>
              {parole.savant && (
                  <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                    Savant : {parole.savant}
                  </p>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-3xl text-gray-900 dark:text-white font-arabic leading-loose text-right">
                {parole.texte_arabe}
              </p>

              {parole['phonétique'] && (
                  <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Phonétique :</p>
                    <p className="text-gray-700 dark:text-gray-200">{parole['phonétique']}</p>
                  </div>
              )}

              {parole.texte_francais && (
                  <div className="mt-6 pl-4 border-l-4 border-emerald-500">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">Traduction :</p>
                    <p className="text-gray-700 dark:text-gray-300">{parole.texte_francais}</p>
                  </div>
              )}
            </div>

            {parole.explication && (
                <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Explication :</p>
                  <p className="text-gray-700 dark:text-gray-300">{parole.explication}</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
              {parole.tag.split(',').map(tag => (
                  <span
                      key={tag.trim()}
                      className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full"
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

export const Paroles: React.FC = () => {
  const [paroles, setParoles] = useState<Parole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<Parole[]>([]);
  const [selected, setSelected] = useState<Parole | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadParoles();
    dataService.getParoleTags().then(setAllTags).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadParoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dataService.getParoles({ page: 0, pageSize: 200 });
      setParoles(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Error loading paroles:', err);
      setError('Erreur lors du chargement des paroles. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!searchTerm.trim() && !selectedTag) {
        setFiltered(paroles);
        return;
      }
      setIsSearching(true);
      try {
        const res = await dataService.searchParoles(searchTerm, selectedTag, { page: 0, pageSize: 200 });
        setFiltered(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedTag, paroles]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-xl text-emerald-800 dark:text-emerald-200 font-amiri">Chargement des paroles...</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Une erreur est survenue</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button onClick={loadParoles} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Réessayer</button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
        <m.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
          <div className="relative container mx-auto px-4 text-center">
            <m.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <GraduationCap className="h-10 w-10 text-white" />
            </m.div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri">Paroles de savants</h1>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              Explorez les paroles des savants de Ahlu s-Sounnah
            </p>
          </div>
        </m.header>

        <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
          <m.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-12 sticky top-20 z-20 border border-emerald-100 dark:border-emerald-900"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <input
                    type="text"
                    aria-label="Rechercher une parole"
                    placeholder="Rechercher une parole, un savant..."
                    className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-amiri"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                    </div>
                )}
              </div>

              <div className="relative md:w-64">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <select
                    aria-label="Filtrer par thème"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium"
                    value={selectedTag || ''}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                >
                  <option value="">Tous les thèmes</option>
                  {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTag && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2"
                >
                  <span className="font-medium text-emerald-800 dark:text-emerald-200">
                    Filtre : <span className="font-bold">{selectedTag}</span>
                  </span>
                  <button
                      onClick={() => setSelectedTag(null)}
                      aria-label="Retirer le filtre"
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </m.div>
            )}
          </m.section>

          <section className="pb-16">
            <AnimatePresence>
              {filtered.length === 0 ? (
                  <m.div
                      key="no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
                  >
                    <div className="max-w-md mx-auto">
                      <div className="text-6xl mb-4">📖</div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun résultat trouvé</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
                      <button onClick={handleResetFilters} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Réinitialiser</button>
                    </div>
                  </m.div>
              ) : (
                  <>
                    <m.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6"
                    >
                      {filtered.length} parole{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
                    </m.p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {filtered.map((parole, index) => (
                          <m.div
                              key={`${parole.id}-${index}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(index, 10) * 0.05 }}
                              layout
                          >
                            <ParoleCard parole={parole} onClick={() => setSelected(parole)} />
                          </m.div>
                      ))}
                    </div>
                  </>
              )}
            </AnimatePresence>
          </section>
        </main>

        <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-emerald-300 mb-4 font-amiri text-xl">
              "On n'obéit pas à une créature pour désobéir au Créateur"
            </p>
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
