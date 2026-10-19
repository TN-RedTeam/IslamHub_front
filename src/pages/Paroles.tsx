import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Star, ChevronRight, Loader, GraduationCap as SavantIcon, BookOpen } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FilterSelect } from '../components/FilterSelect';
import { SubjectBrowser, FilterChip } from '../components/SubjectBrowser';
import { EcoleBadge } from '../components/EcoleBadge';
import { SavantHover } from '../components/SavantHover';
import { PageHeader } from '../components/PageHeader';
import { HadithsParolesTabs } from '../components/HadithsParolesTabs';
import { UI } from '../strings';
import type { Parole, SubjectCount } from '../types';
import { IconBadge } from '../components/Icon';

const ParoleCard: React.FC<{ parole: Parole }> = ({ parole }) => {
  const navigate = useNavigate();
  const go = () => { if (parole.slug) navigate(`/paroles/${parole.slug}`); };
  return (
    <m.div
        whileHover={{ scale: 1.01 }}
        onClick={go}
        role="link"
        tabIndex={0}
        aria-label={`Parole : ${parole.sujet || parole.savant}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}
        className="relative bg-ivory rounded-card p-6 shadow-card border border-line space-y-4 overflow-hidden cursor-pointer h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="text-accent">
          <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45" />
        </svg>
      </div>

      {parole.sujet && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-accent mr-2" />
            <h3 className="text-xl font-bold text-ink font-display">
              {parole.sujet}
            </h3>
          </div>
      )}

      {(parole.savant || parole.ecole) && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {parole.savant && (
                <span className="text-sm text-green italic" onClick={(e) => e.stopPropagation()}>
                  Savant : <SavantHover nom={parole.savant} />
                </span>
            )}
            {parole.ecole && <EcoleBadge ecole={parole.ecole} onClick={(e) => e.stopPropagation()} />}
          </div>
      )}

      <div className="bg-glass-tint p-4 rounded-lg border border-line flex-grow">
        <p className="text-xl text-ink font-arabic leading-loose text-right line-clamp-3 whitespace-pre-wrap">
          {parole.texte_arabe}
        </p>

        {parole.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-green-line dark:border-green line-clamp-2">
              <p className="text-sm text-ink mb-1">Signification :</p>
              <p className="text-ink font-bold whitespace-pre-wrap [unicode-bidi:plaintext]">{parole.texte_francais}</p>
            </div>
        )}
      </div>

      {parole.source_livre && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-green" />
            <span className="[unicode-bidi:plaintext]">
              {parole.source_livre}{parole.page ? `, p. ${parole.page}` : ''}
            </span>
          </p>
      )}

      <div className="flex flex-wrap gap-2">
        {(parole.tag || '').split(',').filter(Boolean).map(tag => (
            <m.span
                key={tag.trim()}
                whileHover={{ scale: 1.05 }}
                className="text-xs bg-glass-tint text-ink px-3 py-1 rounded-full flex items-center"
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
};

const ITEMS_PER_PAGE = 20;
const sPl = (n: number) => (n > 1 ? 's' : '');

export const Paroles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') ?? '');
  const [selectedTag, setSelectedTag] = useState<string | null>(() => searchParams.get('sujet')); // sujet
  const [selectedSavant, setSelectedSavant] = useState('');
  const [selectedSource, setSelectedSource] = useState(() => searchParams.get('source') ?? ''); // recueil/source

  const [subjects, setSubjects] = useState<SubjectCount[]>([]); // sujets + compteur
  const [savants, setSavants] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]); // recueils / ouvrages

  const [paroles, setParoles] = useState<Parole[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isApprox, setIsApprox] = useState(false); // résultats approchants (repli fuzzy)
  const [isLoading, setIsLoading] = useState(true); // contenu d'abord
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasFilter = !!(searchTerm.trim() || selectedTag || selectedSavant || selectedSource);

  // Listes (sujets + compteurs + savants + recueils). La liste se charge dès l'arrivée.
  useEffect(() => {
    dataService.getParoleSujetsCounts().then(setSubjects).catch(() => {});
    dataService.getParoleNames().then(setSavants).catch(() => {});
    dataService.getParoleSources().then(setSources).catch(() => {});
  }, []);

  // Pré-filtre par savant si on arrive depuis /savants (?savant=Nom).
  useEffect(() => {
    const s = searchParams.get('savant');
    if (s) setSelectedSavant(s);
  }, [searchParams]);

  const doSearch = useCallback(async (
    q: string, tag: string | null, savant: string, source: string, page: number, append: boolean,
  ) => {
    if (page === 0) { setIsLoading(true); setError(null); } else setIsLoadingMore(true);
    try {
      const res = await dataService.searchParoles(q, tag, { page, pageSize: ITEMS_PER_PAGE }, savant, source);
      let items = (res.data ?? []) as Parole[];
      let tot = res.count ?? 0;
      let approx = false;
      // Repli automatique : si l'exact ne donne rien, on tente l'approximatif (similarité).
      if (page === 0 && tot === 0 && q.trim()) {
        try {
          const fz = await dataService.searchParolesFuzzy(q, 12);
          const fzItems = (fz.data ?? []) as Parole[];
          if (fzItems.length) { items = fzItems; tot = fz.count ?? fzItems.length; approx = true; }
        } catch { /* on garde le résultat vide */ }
      }
      setParoles((prev) => (append ? [...prev, ...items] : items));
      setTotal(tot);
      setHasMore(!approx && (page + 1) * ITEMS_PER_PAGE < tot);
      setCurrentPage(page);
      setHasSearched(true);
      if (page === 0) setIsApprox(approx);
    } catch (err) {
      console.error('Search error:', err);
      setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(searchTerm, selectedTag, selectedSavant, selectedSource, 0, false), 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTag, selectedSavant, selectedSource]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || isLoadingMore || isLoading || !hasSearched) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) doSearch(searchTerm, selectedTag, selectedSavant, selectedSource, currentPage + 1, true);
    }, { threshold: 0.1, rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, isLoading, hasSearched, currentPage, searchTerm, selectedTag, selectedSavant, selectedSource]);

  // Synchro URL partagée. q + sujet sont communs aux deux onglets (portés par le
  // toggle Hadiths/Paroles) ; source est un filtre secondaire propre aux paroles.
  useEffect(() => {
    const p = new URLSearchParams(searchParams);
    if (searchTerm.trim()) p.set('q', searchTerm.trim()); else p.delete('q');
    if (selectedTag) p.set('sujet', selectedTag); else p.delete('sujet');
    if (selectedSource) p.set('source', selectedSource); else p.delete('source');
    if (p.toString() !== searchParams.toString()) setSearchParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTag, selectedSource]);

  const handleResetFilters = () => {
    setSearchTerm(''); setSelectedTag(null); setSelectedSavant(''); setSelectedSource('');
  };

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8 bg-glass rounded-card shadow-card">
            <IconBadge name="sad" />
            <h3 className="text-xl font-bold text-low mb-2">Une erreur est survenue</h3>
            <p className="text-muted mb-6">{error}</p>
            <button onClick={() => doSearch(searchTerm, selectedTag, selectedSavant, selectedSource, 0, false)}
                className="px-6 py-2 bg-accent-deep hover:brightness-110 text-white rounded-lg transition-colors">Réessayer</button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen">
        <PageHeader
            eyebrow="Preuves"
            title="Hadiths & paroles"
            subtitle="Les paroles des savants de Ahlu s-Sounnah par thème ou mot-clé"
            crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Hadiths & paroles', to: '/hadiths' }, { label: 'Paroles de savants' }]}
        >
          <HadithsParolesTabs active="paroles" />
        </PageHeader>

        <main className="container mx-auto px-4 py-12 relative z-10">
          <m.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-glass rounded-card shadow-card p-6 mb-12 border border-line">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-green" />
                </div>
                <input
                    type="text" aria-label="Rechercher une parole" placeholder="Rechercher une parole, un savant..."
                    className="w-full pl-12 pr-6 py-3 rounded-xl border border-line bg-glass text-ink focus:ring-2 focus:ring-green focus:border-transparent text-lg font-display"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader className="h-5 w-5 text-green animate-spin" />
                    </div>
                )}
              </div>

              <SubjectBrowser subjects={subjects} value={selectedTag} onChange={setSelectedTag} className="md:w-64" />

              {savants.length > 0 && (
                <FilterSelect
                    value={selectedSavant} onChange={setSelectedSavant}
                    options={savants} allLabel="Tous les savants" ariaLabel="Filtrer par savant" icon={SavantIcon} />
              )}

              {sources.length > 0 && (
                <FilterSelect
                    value={selectedSource} onChange={setSelectedSource}
                    options={sources} allLabel="Tous les recueils" ariaLabel="Filtrer par recueil ou source" icon={BookOpen} />
              )}
            </div>

            {hasFilter && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selectedTag && <FilterChip prefix={UI.browse.subjectChip} label={selectedTag} onRemove={() => setSelectedTag(null)} />}
                {selectedSavant && <FilterChip label={selectedSavant} onRemove={() => setSelectedSavant('')} />}
                {selectedSource && <FilterChip label={selectedSource} onRemove={() => setSelectedSource('')} />}
                <button type="button" onClick={handleResetFilters} className="text-sm text-green hover:text-ink font-medium ml-1">{UI.list.reset}</button>
              </div>
            )}
          </m.section>

          <section className="pb-16">
            {isLoading ? (
              <div className="flex flex-col items-center py-16 gap-4">
                <Loader className="h-12 w-12 text-green animate-spin" />
              </div>
            ) : paroles.length === 0 ? (
              <div className="rounded-card border border-line bg-glass px-5 py-6 text-center">
                <p className="text-ink font-medium">
                  {UI.list.noResultFor} {searchTerm.trim() ? <>«&nbsp;{searchTerm.trim()}&nbsp;»</> : 'ces filtres'}.
                </p>
                <p className="text-sm text-muted mt-1">{UI.list.noResultHint}</p>
                {hasFilter && (
                  <button onClick={handleResetFilters} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-green-deep">
                    <X className="w-4 h-4" /> {UI.list.reset}
                  </button>
                )}
              </div>
            ) : (
              <>
                {isApprox && (
                  <div className="mb-5 rounded-lg border border-gold bg-glass-tint px-4 py-3 text-sm text-ink">
                    <b>Aucun résultat exact.</b> Voici les paroles les plus proches (recherche approximative).
                    Astuce : pour un texte arabe, cherche un court extrait distinctif.
                  </div>
                )}
                <p className="text-sm font-medium text-ink mb-6">
                  <span className="tabular-nums">{total}</span> parole{sPl(total)} {isApprox ? `approchante${sPl(total)}` : hasFilter ? `trouvée${sPl(total)}` : ''}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {paroles.map((parole) => (
                    <ParoleCard key={parole.id} parole={parole} />
                  ))}
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
      </div>
  );
};

export default Paroles;
