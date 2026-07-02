import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, Loader, Tags, Hash, ChevronDown, Heart } from 'lucide-react';
import { dataService } from '../services/DataService';
import type { Douaa as DouaaType } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

interface Douaa extends DouaaType {
    id: number;
    sujet: string;
    texte_arabe: string;
    texte_francais: string | null;
    phonétique: string | null;
    explication: string | null;
    commentaire: string | null;
    tag: string | null;
}

const getTagsArray = (tag: string | null, sujet?: string): string[] => {
    if (tag && tag.trim()) {
        return tag.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (sujet && sujet.trim() && sujet !== 'Sujet inconnu') {
        return [sujet.trim()];
    }
    return [];
};

const ITEMS_PER_PAGE = 20;

// ─── DouaaCard ────────────────────────────────────────────────────────────────

const DouaaCard: React.FC<{ douaa: Douaa; onClick: () => void; onTagClick?: (tag: string) => void }> = ({ douaa, onClick, onTagClick }) => {
    const tags = getTagsArray(douaa.tag, douaa.sujet);
    const handleTagClick = (e: React.MouseEvent, tag: string) => { e.stopPropagation(); onTagClick?.(tag); };

    return (
        <m.div
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 space-y-4 overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-300 hover:shadow-2xl"
        >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                    <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
                </svg>
            </div>
            {douaa.sujet && (
                <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 dark:text-amber-300 mr-2" />
                    <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">{douaa.sujet}</h3>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-amber-100 dark:border-emerald-800 flex-grow">
                <p className="text-2xl text-gray-900 dark:text-white font-arabic leading-loose text-right line-clamp-3">{douaa.texte_arabe}</p>
                {douaa.texte_francais && (
                    <div className="mt-4 pl-4 border-l-4 border-amber-300 dark:border-emerald-600 line-clamp-2">
                        <p className="text-sm text-amber-700 dark:text-amber-200 mb-1">Signification :</p>
                        <p className="text-gray-700 dark:text-gray-300">{douaa.texte_francais}</p>
                    </div>
                )}
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <m.span key={tag} whileHover={{ scale: 1.05 }} onClick={(e) => handleTagClick(e, tag)}
                                     className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-amber-200 dark:hover:bg-emerald-700 transition-colors">
                            <Hash className="h-3 w-3 mr-1" />{tag}
                        </m.span>
                    ))}
                </div>
            )}
            <div className="mt-auto pt-4 text-center">
                <button className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">Lire la suite...</button>
            </div>
        </m.div>
    );
};

// ─── DouaaModal ───────────────────────────────────────────────────────────────

const DouaaModal: React.FC<{ douaa: Douaa; onClose: () => void; onTagClick?: (tag: string) => void }> = ({ douaa, onClose, onTagClick }) => {
    const tags = getTagsArray(douaa.tag, douaa.sujet);
    const handleTagClick = (tag: string) => { onTagClick?.(tag); onClose(); };

    return (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <m.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <X className="h-6 w-6" />
                </button>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-amiri">{douaa.sujet}</h2>
                    <div className="bg-amber-50 dark:bg-gray-700 p-6 rounded-lg">
                        <p className="text-3xl text-gray-900 dark:text-white font-arabic leading-loose text-right">{douaa.texte_arabe}</p>
                        {douaa.phonétique && (
                            <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Phonétique:</p>
                                <p className="text-gray-700 dark:text-gray-200">{douaa.phonétique}</p>
                            </div>
                        )}
                        {douaa.texte_francais && (
                            <div className="mt-6 pl-4 border-l-4 border-emerald-500">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">Traduction:</p>
                                <p className="text-gray-700 dark:text-gray-300">{douaa.texte_francais}</p>
                            </div>
                        )}
                        {douaa.explication && (
                            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Explication:</p>
                                <p className="text-gray-700 dark:text-gray-300">{douaa.explication}</p>
                            </div>
                        )}
                        {douaa.commentaire && (
                            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Commentaire:</p>
                                <p className="text-gray-700 dark:text-gray-300">{douaa.commentaire}</p>
                            </div>
                        )}
                    </div>
                    {tags.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                <Tags className="h-4 w-4" />Mots-clés :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <m.span key={tag} whileHover={{ scale: 1.05 }} onClick={() => handleTagClick(tag)}
                                                 className="cursor-pointer text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full hover:bg-amber-200 dark:hover:bg-emerald-700 transition-colors">
                                        <Hash className="h-3 w-3 inline mr-1" />{tag}
                                    </m.span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </m.div>
        </m.div>
    );
};

// ─── TagSelector ──────────────────────────────────────────────────────────────

const TagSelector: React.FC<{
    allTags: string[];
    selectedTag: string | null;
    tagCounts: Map<string, number>;
    onTagSelect: (tag: string | null) => void;
}> = ({ allTags, selectedTag, tagCounts, onTagSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const filteredTags = allTags.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">{selectedTag ? `Mot-clé: ${selectedTag}` : 'Filtrer par mot-clé'}</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-emerald-200 dark:border-emerald-800 z-50 overflow-hidden">
                        <div className="p-3 border-b border-emerald-200 dark:border-emerald-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Rechercher un mot-clé..." value={searchQuery}
                                       onChange={(e) => setSearchQuery(e.target.value)}
                                       className="w-full pl-9 pr-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            <button onClick={() => { onTagSelect(null); setIsOpen(false); setSearchQuery(''); }}
                                    className={`w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors ${!selectedTag ? 'bg-emerald-100 dark:bg-emerald-900/30 font-medium' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <span>🏷️ Tous les mots-clés</span>
                                    <span className="text-xs text-gray-500">{allTags.length} mots-clés</span>
                                </div>
                            </button>
                            {filteredTags.length > 0 ? filteredTags.map(tag => (
                                <button key={tag} onClick={() => { onTagSelect(tag); setIsOpen(false); setSearchQuery(''); }}
                                        className={`w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-between ${selectedTag === tag ? 'bg-emerald-100 dark:bg-emerald-900/30 font-medium' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-emerald-500" /><span>{tag}</span>
                                    </div>
                                    {tagCounts.get(tag) ? <span className="text-xs text-gray-500">({tagCounts.get(tag)})</span> : null}
                                </button>
                            )) : (
                                <div className="px-4 py-8 text-center text-gray-500">Aucun mot-clé trouvé pour "{searchQuery}"</div>
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const Douaas: React.FC = () => {
  usePageTitle('Douaas');
    const [douaas, setDouaas] = useState<Douaa[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
    const [totalCount, setTotalCount] = useState(0);
    const [selectedDouaa, setSelectedDouaa] = useState<Douaa | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Charger les tags au montage
    useEffect(() => {
        dataService.getDouaaTags()
            .then(tags => setAllTags([...new Set(tags)].sort((a, b) => a.localeCompare(b))))
            .catch(() => {});
    }, []);

    // Recalculer les tagCounts depuis les résultats
    useEffect(() => {
        const counts = new Map<string, number>();
        douaas.forEach(d => getTagsArray(d.tag, d.sujet).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
        setTagCounts(counts);
    }, [douaas]);

    const doSearch = useCallback(async (q: string, tag: string | null) => {
        if (!q.trim() && !tag) {
            setDouaas([]);
            setHasSearched(false);
            setTotalCount(0);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await dataService.searchDouaas(q, tag, { page: 0, pageSize: ITEMS_PER_PAGE });
            setDouaas(res.data ?? []);
            setTotalCount(res.count ?? 0);
            setHasSearched(true);
        } catch {
            setError('Erreur lors de la recherche. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(searchTerm, selectedTag), 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, selectedTag, doSearch]);

    const handleTagClick = (tag: string) => { setSelectedTag(tag); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleResetFilters = () => { setSearchTerm(''); setSelectedTag(null); };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
            <m.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                           className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-arabesque" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
                <div className="relative container mx-auto px-4 text-center">
                    <m.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                        <Heart className="h-10 w-10 text-white" />
                    </m.div>
                    <m.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                               className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri">
                        Les Invocations
                    </m.h1>
                    <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
                        "Invoquez-Moi, Je vous répondrai" - Sourate Ghafir, verset 60
                    </p>
                    {hasSearched && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mt-6">
                            <span className="text-emerald-200">{totalCount} invocations trouvées</span>
                        </div>
                    )}
                </div>
            </m.header>

            <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">

                {/* Tag cloud — après recherche */}
                {hasSearched && tagCounts.size > 0 && (
                    <m.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Tags className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300">
                                    Tags dans les résultats ({tagCounts.size})
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
                                {Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                                    <m.button key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                   onClick={() => handleTagClick(tag)}
                                                   className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                                       selectedTag === tag ? 'bg-emerald-600 text-white shadow-md' : 'bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 hover:bg-amber-200 dark:hover:bg-emerald-700'
                                                   }`}>
                                        <Hash className="h-3 w-3" />{tag}
                                        <span className="text-xs opacity-75">({count})</span>
                                    </m.button>
                                ))}
                            </div>
                        </div>
                    </m.section>
                )}

                {/* Barre de recherche */}
                <m.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-12 sticky top-20 z-20 border border-emerald-100 dark:border-emerald-900">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <input type="text" aria-label="Rechercher une invocation"
                                   placeholder="Rechercher par texte arabe, français, phonétique, mot-clé..."
                                   className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-amiri"
                                   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="md:w-80">
                            <TagSelector allTags={allTags} selectedTag={selectedTag} tagCounts={tagCounts} onTagSelect={setSelectedTag} />
                        </div>
                    </div>

                    {(selectedTag || searchTerm) && (
                        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mt-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-emerald-800 dark:text-emerald-200">Filtre actif :</span>
                                {selectedTag && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-full text-sm">
                                        <Hash className="h-3 w-3" />{selectedTag}
                                        {tagCounts.get(selectedTag) ? <span className="text-xs opacity-75 ml-1">({tagCounts.get(selectedTag)})</span> : null}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600 text-white rounded-full text-sm">
                                        <Search className="h-3 w-3" />"{searchTerm}"
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
                            <button onClick={() => doSearch(searchTerm, selectedTag)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Réessayer</button>
                        </div>
                    ) : !hasSearched ? (
                        <m.div key="empty-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                            <div className="max-w-lg mx-auto">
                                <m.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                            className="text-9xl mb-8 select-none">🤲</m.div>
                                <h3 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-4 font-amiri">
                                    Recherchez parmi les invocations
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                                    Saisissez un mot-clé ou sélectionnez un tag pour trouver une douaa.
                                </p>
                                {allTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <p className="w-full text-sm text-gray-500 dark:text-gray-400 mb-2">Suggestions :</p>
                                        {allTags.slice(0, 8).map(tag => (
                                            <m.button key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                           onClick={() => handleTagClick(tag)}
                                                           className="px-4 py-2 bg-amber-100 dark:bg-emerald-800/60 text-amber-800 dark:text-emerald-200 rounded-full text-sm font-medium hover:bg-amber-200 dark:hover:bg-emerald-700 transition-colors border border-amber-200 dark:border-emerald-700">
                                                #{tag}
                                            </m.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </m.div>
                    ) : douaas.length === 0 ? (
                        <m.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-4">📖</div>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun résultat trouvé</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Essayez de modifier vos critères de recherche</p>
                                <button onClick={handleResetFilters} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Réinitialiser</button>
                            </div>
                        </m.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <>
                                <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                          className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6">
                                    {douaas.length} invocation{douaas.length > 1 ? 's' : ''} trouvée{douaas.length > 1 ? 's' : ''}
                                    {totalCount > douaas.length && <span className="ml-1 text-gray-400">(sur {totalCount})</span>}
                                </m.p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {douaas.map((douaa, index) => (
                                        <m.div key={`${douaa.id}-${index}`}
                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index, 10) * 0.05 }} layout>
                                            <DouaaCard douaa={douaa} onClick={() => setSelectedDouaa(douaa)} onTagClick={handleTagClick} />
                                        </m.div>
                                    ))}
                                </div>
                            </>
                        </AnimatePresence>
                    )}
                </section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">"On n'obéit pas à une créature pour désobéir au Créateur"</p>
                    <p className="text-emerald-200">© 2023 Collection d'invocations</p>
                </div>
            </footer>

            <AnimatePresence>
                {selectedDouaa && (
                    <DouaaModal douaa={selectedDouaa} onClose={() => setSelectedDouaa(null)} onTagClick={handleTagClick} />
                )}
            </AnimatePresence>
        </div>
    );
};