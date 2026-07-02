import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Heart, BookOpen, Loader, Search, Filter, X, Sparkles, Tags, Hash, Star } from 'lucide-react';
import { dataService } from '../services/DataService';
import type { Dhikr } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

const getTagsArray = (tags: string | null | undefined): string[] => {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
};

const ITEMS_PER_PAGE = 20;

export const Dhikrs: React.FC = () => {
  usePageTitle('Dhikrs');
    const [dhikrs, setDhikrs] = useState<Dhikr[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
    const [categories, setCategories] = useState<string[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Charger les tags au montage (léger, sans les dhikrs)
    useEffect(() => {
        dataService.getDhikrTags()
            .then(tags => setAllTags([...new Set(tags)].sort((a, b) => a.localeCompare(b))))
            .catch(() => {});
    }, []);

    // Recalculer les catégories et tagCounts depuis les résultats
    useEffect(() => {
        const cats = new Set<string>();
        const counts = new Map<string, number>();
        dhikrs.forEach(d => {
            if (d.categorie) cats.add(d.categorie);
            getTagsArray(d.tags).forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
        });
        setCategories(Array.from(cats).sort());
        setTagCounts(counts);
    }, [dhikrs]);

    const doSearch = useCallback(async (q: string, tag: string | null) => {
        if (!q.trim() && !tag) {
            setDhikrs([]);
            setHasSearched(false);
            setTotalCount(0);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await dataService.searchDhikrs(q, tag, { page: 0, pageSize: ITEMS_PER_PAGE });
            setDhikrs(res.data ?? []);
            setTotalCount(res.total ?? 0);
            setHasSearched(true);
        } catch {
            setError('Erreur lors de la recherche. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Recherche déclenchée par searchQuery ou selectedTag (debounced)
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(searchQuery, selectedTag), 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, selectedTag, doSearch]);

    // Filtrage client-side par catégorie (sur les résultats déjà chargés)
    const displayedDhikrs = selectedCategory
        ? dhikrs.filter(d => d.categorie === selectedCategory)
        : dhikrs;

    const handleTagClick = (tag: string) => {
        setSelectedTag(tag);
        setSelectedCategory(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedTag(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
            <m.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
            >
                <div className="absolute inset-0 opacity-20 bg-arabesque" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
                <div className="relative container mx-auto px-4 text-center">
                    <m.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6"
                    >
                        <Heart className="h-10 w-10 text-white" />
                    </m.div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri">
                        Évocations et Dhikrs
                    </h1>
                    <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
                        "N'est-ce pas par l'évocation d'Allah que les cœurs se tranquillisent?"
                    </p>
                    <p className="text-emerald-300 mt-4 font-amiri">Sourate Ar-Ra'd, verset 28</p>
                    {hasSearched && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mt-6">
                            <span className="text-emerald-200">{totalCount} dhikrs trouvés</span>
                        </div>
                    )}
                </div>
            </m.header>

            <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">

                {/* Catégories — visibles seulement après recherche */}
                {hasSearched && categories.length > 0 && (
                    <m.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300">Catégories</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleCategoryClick(null)}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${
                                        !selectedCategory ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                                    }`}
                                >
                                    Tous
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`px-4 py-2 rounded-full transition-all duration-300 ${
                                            selectedCategory === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </m.section>
                )}

                {/* Tags — visibles seulement après recherche */}
                {hasSearched && tagCounts.size > 0 && (
                    <m.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Tags className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300">Mots-clés dans les résultats</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([tag, count]) => (
                                    <m.button
                                        key={tag}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTagClick(tag)}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                            selectedTag === tag ? 'bg-emerald-600 text-white shadow-md' : 'bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 hover:bg-amber-200 dark:hover:bg-emerald-700'
                                        }`}
                                    >
                                        <Hash className="h-3 w-3" />
                                        {tag}
                                        <span className="text-xs opacity-75">({count})</span>
                                    </m.button>
                                ))}
                            </div>
                        </div>
                    </m.section>
                )}

                {/* Barre de recherche et filtres */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-8 sticky top-20 z-20 border border-emerald-100 dark:border-emerald-900"
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <input
                                type="text"
                                aria-label="Rechercher une évocation"
                                placeholder="Rechercher une évocation..."
                                className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-amiri"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-80">
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <select
                                aria-label="Filtrer par mot-clé"
                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium cursor-pointer"
                                value={selectedTag || ''}
                                onChange={(e) => { setSelectedTag(e.target.value || null); setSelectedCategory(null); }}
                            >
                                <option value="">🏷️ Tous les mots-clés</option>
                                {allTags.map(tag => (
                                    <option key={tag} value={tag}>
                                        {tag}{tagCounts.get(tag) ? ` (${tagCounts.get(tag)})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(selectedCategory || selectedTag || searchQuery) && (
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg px-4 py-2"
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-emerald-800 dark:text-emerald-200">Filtre actif :</span>
                                {selectedCategory && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-full text-sm">
                                        <Star className="h-3 w-3" />{selectedCategory}
                                    </span>
                                )}
                                {selectedTag && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600 text-white rounded-full text-sm">
                                        <Hash className="h-3 w-3" />{selectedTag}
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-full text-sm">
                                        <Search className="h-3 w-3" />"{searchQuery}"
                                    </span>
                                )}
                            </div>
                            <button onClick={handleResetFilters} aria-label="Retirer les filtres" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-1 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </m.div>
                    )}
                </m.section>

                {/* Résultats */}
                <section className="pb-16">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-16 gap-4">
                            <Loader className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
                            <p className="text-emerald-700 dark:text-emerald-300 font-amiri text-xl">Recherche en cours...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                            <div className="text-6xl mb-4">😔</div>
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <button onClick={() => doSearch(searchQuery, selectedTag)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Réessayer</button>
                        </div>
                    ) : !hasSearched ? (
                        <m.div
                            key="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-24"
                        >
                            <div className="max-w-lg mx-auto">
                                <m.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="text-9xl mb-8 select-none"
                                >
                                    💫
                                </m.div>
                                <h3 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-4 font-amiri">
                                    Recherchez parmi les dhikrs
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                                    Saisissez un mot-clé ou sélectionnez un tag pour trouver une évocation.
                                </p>
                                {allTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <p className="w-full text-sm text-gray-500 dark:text-gray-400 mb-2">Suggestions :</p>
                                        {allTags.slice(0, 8).map(tag => (
                                            <m.button
                                                key={tag}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleTagClick(tag)}
                                                className="px-4 py-2 bg-amber-100 dark:bg-emerald-800/60 text-amber-800 dark:text-emerald-200 rounded-full text-sm font-medium hover:bg-amber-200 dark:hover:bg-emerald-700 transition-colors border border-amber-200 dark:border-emerald-700"
                                            >
                                                #{tag}
                                            </m.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </m.div>
                    ) : displayedDhikrs.length === 0 ? (
                        <m.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-4">💫</div>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun dhikr trouvé</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
                                <button onClick={handleResetFilters} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Réinitialiser</button>
                            </div>
                        </m.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <>
                                <m.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6"
                                >
                                    {displayedDhikrs.length} évocation{displayedDhikrs.length > 1 ? 's' : ''} trouvée{displayedDhikrs.length > 1 ? 's' : ''}
                                    {totalCount > dhikrs.length && <span className="ml-1 text-gray-400">(sur {totalCount})</span>}
                                </m.p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {displayedDhikrs.map((dhikr, index) => {
                                        const tags = getTagsArray(dhikr.tags);
                                        return (
                                            <m.div
                                                key={dhikr.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(index, 10) * 0.05 }}
                                                layout
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 hover:shadow-2xl transition-all duration-300"
                                            >
                                                <div className="relative">
                                                    <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                                                        <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                                                            <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex items-start gap-4 relative z-10">
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 dark:from-amber-600 dark:to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                            <Heart className="w-7 h-7 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-3 font-amiri">{dhikr.sujet}</h3>
                                                            <div className="bg-white/50 dark:bg-gray-800/50 p-5 rounded-lg mb-4 border border-amber-100 dark:border-emerald-800">
                                                                <p className="text-3xl font-arabic text-right leading-loose text-gray-900 dark:text-white font-amiri">{dhikr.texte_arabe}</p>
                                                            </div>
                                                            {dhikr.phonétique && (
                                                                <div className="mb-3 p-3 bg-amber-100/50 dark:bg-emerald-900/30 rounded-lg">
                                                                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-1 font-medium">Phonétique :</p>
                                                                    <p className="text-gray-700 dark:text-gray-300 italic">{dhikr.phonétique}</p>
                                                                </div>
                                                            )}
                                                            {dhikr.texte_francais && (
                                                                <div className="mb-4 pl-4 border-l-4 border-emerald-500">
                                                                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-1 font-medium">Traduction :</p>
                                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{dhikr.texte_francais}</p>
                                                                </div>
                                                            )}
                                                            {dhikr.commentaire && (
                                                                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-emerald-900/20 rounded-lg mt-3">
                                                                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{dhikr.commentaire}</p>
                                                                </div>
                                                            )}
                                                            {tags.length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-2">
                                                                    {tags.map(tag => (
                                                                        <m.button
                                                                            key={tag}
                                                                            whileHover={{ scale: 1.05 }}
                                                                            onClick={() => handleTagClick(tag)}
                                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 hover:bg-amber-200 dark:hover:bg-emerald-700 transition-colors cursor-pointer"
                                                                        >
                                                                            <Hash className="h-3 w-3" />{tag}
                                                                        </m.button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {dhikr.categorie && (
                                                                <div className="mt-3">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200">
                                                                        <Sparkles className="h-3 w-3 mr-1" />{dhikr.categorie}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </m.div>
                                        );
                                    })}
                                </div>
                            </>
                        </AnimatePresence>
                    )}
                </section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">"Et glorifiez-Le matin et soir"</p>
                    <p className="text-emerald-200">Sourate Al-Ahzab, verset 42</p>
                </div>
            </footer>
        </div>
    );
};