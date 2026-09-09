import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, Loader, Tags, Hash } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FilterSelect } from '../components/FilterSelect';
import { PageHeader } from '../components/PageHeader';
import type { Invocation as InvocationType, InvocationType as TypeId } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';
import { IconBadge, type IconName } from '../components/Icon';

interface Item extends Omit<InvocationType, 'tag'> {
    tag: string | null;
}

// Métadonnées d'affichage par type.
const TYPES: { id: TypeId; label: string; icon: IconName; noun: string; nounPlural: string }[] = [
    { id: 1, label: 'Invocations', icon: 'hands', noun: 'invocation', nounPlural: 'invocations' },
    { id: 2, label: 'Évocations',  icon: 'beads', noun: 'évocation',  nounPlural: 'évocations' },
];

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

// ─── Carte ────────────────────────────────────────────────────────────────────

const InvocationCard: React.FC<{ item: Item; onClick: () => void; onTagClick?: (tag: string) => void }> = ({ item, onClick, onTagClick }) => {
    const tags = getTagsArray(item.tag, item.sujet);
    const handleTagClick = (e: React.MouseEvent, tag: string) => { e.stopPropagation(); onTagClick?.(tag); };

    return (
        <m.div
            whileHover={{ y: -3 }}
            onClick={onClick}
            className="relative bg-ivory rounded-card p-6 shadow-card border border-line space-y-4 overflow-hidden cursor-pointer h-full flex flex-col transition-shadow duration-300 hover:shadow-card-hover motion-reduce:transition-none"
        >
            {item.sujet && (
                <div className="flex items-center">
                    <Star className="h-5 w-5 text-gold mr-2 shrink-0" />
                    <h3 className="text-xl font-semibold text-green-deep font-display">{item.sujet}</h3>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-line flex-grow">
                <p className="text-2xl text-ink font-arabic leading-loose text-right line-clamp-3 whitespace-pre-wrap">{item.texte_arabe}</p>
                {item.texte_francais && (
                    <div className="mt-4 pl-4 border-l-4 border-gold/60 line-clamp-2">
                        <p className="text-sm text-muted mb-1">Signification :</p>
                        <p className="text-ink/90 whitespace-pre-wrap [unicode-bidi:plaintext]">{item.texte_francais}</p>
                    </div>
                )}
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <m.span key={tag} whileHover={{ scale: 1.05 }} onClick={(e) => handleTagClick(e, tag)}
                                     className="text-xs bg-green-soft text-green-deep px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-green hover:text-white transition-colors">
                            <Hash className="h-3 w-3 mr-1" />{tag}
                        </m.span>
                    ))}
                </div>
            )}
            <div className="mt-auto pt-4 text-center">
                <button className="text-green text-sm font-medium hover:underline">Lire la suite...</button>
            </div>
        </m.div>
    );
};

// ─── Modale ───────────────────────────────────────────────────────────────────

const InvocationModal: React.FC<{ item: Item; onClose: () => void; onTagClick?: (tag: string) => void }> = ({ item, onClose, onTagClick }) => {
    const tags = getTagsArray(item.tag, item.sujet);
    const handleTagClick = (tag: string) => { onTagClick?.(tag); onClose(); };

    return (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <m.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 p-2 text-muted hover:text-green-deep">
                    <X className="h-6 w-6" />
                </button>
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-green-deep font-display">{item.sujet}</h2>
                    <div className="bg-green-soft p-6 rounded-lg">
                        <p className="text-3xl text-ink font-arabic leading-loose text-right whitespace-pre-wrap">{item.texte_arabe}</p>
                        {item.phonétique && (
                            <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                                <p className="text-sm text-muted mb-2">Phonétique :</p>
                                <p className="text-ink whitespace-pre-wrap [unicode-bidi:plaintext]">{item.phonétique}</p>
                            </div>
                        )}
                        {item.texte_francais && (
                            <div className="mt-6 pl-4 border-l-4 border-green">
                                <p className="text-sm text-green mb-2">Traduction :</p>
                                <p className="text-ink whitespace-pre-wrap [unicode-bidi:plaintext]">{item.texte_francais}</p>
                            </div>
                        )}
                        {item.explication && (
                            <div className="mt-6 bg-white dark:bg-gray-700 p-6 rounded-lg border border-line">
                                <p className="text-lg font-semibold text-green-deep mb-3">Explication :</p>
                                <p className="text-ink whitespace-pre-wrap [unicode-bidi:plaintext]">{item.explication}</p>
                            </div>
                        )}
                        {item.commentaire && (
                            <div className="mt-6 bg-white dark:bg-gray-700 p-6 rounded-lg border border-line">
                                <p className="text-lg font-semibold text-green-deep mb-3">Commentaire :</p>
                                <p className="text-ink whitespace-pre-wrap [unicode-bidi:plaintext]">{item.commentaire}</p>
                            </div>
                        )}
                    </div>
                    {tags.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-muted mb-2 flex items-center gap-2">
                                <Tags className="h-4 w-4" />Mots-clés :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <m.span key={tag} whileHover={{ scale: 1.05 }} onClick={() => handleTagClick(tag)}
                                                 className="cursor-pointer text-xs bg-green-soft text-green-deep px-3 py-1 rounded-full hover:bg-green hover:text-white transition-colors">
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

// ─── Composant principal ────────────────────────────────────────────────────────

export const Invocations: React.FC = () => {
    usePageTitle('Invocations & Évocations');
    const [activeType, setActiveType] = useState<TypeId>(1);
    const [items, setItems] = useState<Item[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
    const [totalCount, setTotalCount] = useState(0);
    const [selected, setSelected] = useState<Item | null>(null);

    const meta = TYPES.find(t => t.id === activeType) ?? TYPES[0];
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Charger les SUJETS du type actif (le menu déroulant filtre par sujet).
    useEffect(() => {
        dataService.getInvocationSujets(activeType)
            .then(sujets => setAllTags([...new Set(sujets)].sort((a, b) => a.localeCompare(b))))
            .catch(() => setAllTags([]));
    }, [activeType]);

    // Recalculer les tagCounts depuis les résultats.
    useEffect(() => {
        const counts = new Map<string, number>();
        items.forEach(d => getTagsArray(d.tag, d.sujet).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
        setTagCounts(counts);
    }, [items]);

    const doSearch = useCallback(async (q: string, tag: string | null, type: TypeId) => {
        if (!q.trim() && !tag) {
            setItems([]); setHasSearched(false); setTotalCount(0);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = await dataService.searchInvocations(q, tag, type, { page: 0, pageSize: ITEMS_PER_PAGE });
            setItems((res.data ?? []) as Item[]);
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
        debounceRef.current = setTimeout(() => doSearch(searchTerm, selectedTag, activeType), 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, selectedTag, activeType, doSearch]);

    // Changement d'onglet : on repart d'un état propre pour le nouveau type.
    const handleTypeChange = (type: TypeId) => {
        if (type === activeType) return;
        setActiveType(type);
        setSearchTerm('');
        setSelectedTag(null);
        setItems([]);
        setHasSearched(false);
        setTotalCount(0);
    };

    const handleTagClick = (tag: string) => { setSelectedTag(null); setSearchTerm(tag); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSujetClick = (sujet: string) => { setSelectedTag(sujet); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleResetFilters = () => { setSearchTerm(''); setSelectedTag(null); };

    const showAll = async () => {
        setIsLoading(true);
        try {
            const res = await dataService.searchInvocations('', null, activeType, { page: 0, pageSize: 1000 });
            setItems((res.data ?? []) as Item[]); setTotalCount(res.count ?? 0); setHasSearched(true);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-ground">
            <PageHeader
                eyebrow="Spiritualité"
                title="Invocations & Évocations"
                subtitle="« Invoquez-Moi, Je vous répondrai » — Sourate Ghafir, verset 60"
                crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Invocations & Évocations' }]}
            >
                {hasSearched && (
                    <span className="inline-flex items-center rounded-full bg-green-soft px-3 py-1 text-sm text-green-deep tabular-nums">
                        {totalCount} {meta.nounPlural}
                    </span>
                )}
            </PageHeader>

            <main className="container mx-auto px-4 py-10 relative z-10">
                {/* Contrôle segmenté Invocations / Évocations (charte 11.7, option A) */}
                <div className="flex justify-center mb-8">
                    <div role="tablist" aria-label="Type" className="inline-flex gap-1 rounded-full bg-surface border border-line p-1 shadow-[inset_0_1px_2px_rgba(27,38,32,.05)]">
                        {TYPES.map(t => {
                            const on = activeType === t.id;
                            return (
                                <button
                                    key={t.id}
                                    role="tab"
                                    aria-selected={on}
                                    onClick={() => handleTypeChange(t.id)}
                                    className={`px-5 py-2 rounded-full text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-green focus-visible:outline-offset-2 ${
                                        on ? 'bg-green text-white' : 'text-muted hover:text-green-deep'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tag cloud — après recherche */}
                {hasSearched && tagCounts.size > 0 && (
                    <m.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="bg-ivory rounded-card p-6 shadow-card border border-line">
                            <div className="flex items-center gap-2 mb-4">
                                <Tags className="h-5 w-5 text-green" />
                                <h3 className="text-lg font-semibold text-green-deep">Tags dans les résultats ({tagCounts.size})</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
                                {Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                                    <m.button key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                   onClick={() => handleTagClick(tag)}
                                                   className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                       selectedTag === tag ? 'bg-green text-white' : 'bg-green-soft text-green-deep hover:bg-green hover:text-white'
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
                                className="bg-ivory rounded-card shadow-card p-6 mb-12 border border-line">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Search className="h-5 w-5 text-green" />
                            </div>
                            <input type="text" aria-label={`Rechercher une ${meta.noun}`}
                                   placeholder="Rechercher par texte arabe, français, phonétique, mot-clé..."
                                   className="w-full pl-12 pr-6 py-3 rounded-xl border border-line bg-white dark:bg-gray-800 text-ink focus:ring-2 focus:ring-green focus:border-transparent text-lg font-display"
                                   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <FilterSelect
                            value={selectedTag || ''}
                            onChange={(v) => setSelectedTag(v || null)}
                            options={allTags}
                            allLabel="Tous les sujets"
                            ariaLabel="Filtrer par sujet"
                            className="md:w-80"
                        />
                    </div>

                    {(selectedTag || searchTerm) && (
                        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mt-4 flex items-center justify-between bg-green-soft rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-green-deep">Filtre actif :</span>
                                {selectedTag && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green text-white rounded-full text-sm">
                                        <Filter className="h-3 w-3" />{selectedTag}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold text-white rounded-full text-sm">
                                        <Search className="h-3 w-3" />"{searchTerm}"
                                    </span>
                                )}
                            </div>
                            <button onClick={handleResetFilters} aria-label="Retirer les filtres" className="text-green hover:text-green-deep p-1 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </m.div>
                    )}
                </m.section>

                {/* Résultats */}
                <section className="pb-16">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-16 gap-4">
                            <Loader className="h-12 w-12 text-green animate-spin" />
                            <p className="text-green-deep font-display text-xl">Recherche en cours...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-ivory rounded-card shadow-card border border-line">
                            <IconBadge name="sad" />
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <button onClick={() => doSearch(searchTerm, selectedTag, activeType)} className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg">Réessayer</button>
                        </div>
                    ) : !hasSearched ? (
                        <m.div key="empty-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-14">
                            <div className="max-w-lg mx-auto">
                                <h3 className="text-3xl font-semibold text-green-deep mb-4 font-display">
                                    Recherchez parmi les {meta.nounPlural}
                                </h3>
                                <p className="text-muted mb-6 leading-relaxed text-lg">
                                    Saisissez un mot-clé, sélectionnez un sujet — ou affichez tout.
                                </p>
                                <button
                                    onClick={showAll}
                                    className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-xl bg-green hover:bg-green-deep text-white font-medium shadow-card"
                                >
                                    Tout afficher
                                </button>
                                {allTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <p className="w-full text-sm text-muted mb-2">Sujets :</p>
                                        {allTags.slice(0, 8).map(sujet => (
                                            <m.button key={sujet} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                           onClick={() => handleSujetClick(sujet)}
                                                           className="px-4 py-2 bg-green-soft text-green-deep rounded-full text-sm font-medium hover:bg-green hover:text-white transition-colors border border-line">
                                                {sujet}
                                            </m.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </m.div>
                    ) : items.length === 0 ? (
                        <m.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-16 bg-ivory rounded-card shadow-card border border-line">
                            <div className="max-w-md mx-auto">
                                <IconBadge name="book" />
                                <h3 className="text-xl font-semibold text-green-deep mb-2">Aucun résultat trouvé</h3>
                                <p className="text-muted mb-6">Essayez de modifier vos critères de recherche</p>
                                <button onClick={handleResetFilters} className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors">Réinitialiser</button>
                            </div>
                        </m.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <>
                                <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                          className="text-sm font-medium text-green-deep mb-6">
                                    {items.length} {meta.noun}{items.length > 1 ? 's' : ''} trouvée{items.length > 1 ? 's' : ''}
                                    {totalCount > items.length && <span className="ml-1 text-muted">(sur {totalCount})</span>}
                                </m.p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {items.map((item, index) => (
                                        <m.div key={`${item.id}-${index}`}
                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(index, 10) * 0.05 }} layout>
                                            <InvocationCard item={item} onClick={() => setSelected(item)} onTagClick={handleTagClick} />
                                        </m.div>
                                    ))}
                                </div>
                            </>
                        </AnimatePresence>
                    )}
                </section>
            </main>

            <AnimatePresence>
                {selected && (
                    <InvocationModal item={selected} onClose={() => setSelected(null)} onTagClick={handleTagClick} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Invocations;
