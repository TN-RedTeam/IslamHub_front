import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Search, Book, Quote, Heart, BookOpen, Tag } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import { compteur } from '../utils/compteur';
import type { SearchResults, SearchHit } from '../types';

const EMPTY: SearchResults = { hadiths: [], paroles: [], invocations: [], versets: [], themes: [] };

const Hit: React.FC<{ to: string; icon: React.ReactNode; titre: string; sous?: string | null; extrait?: string | null }> = ({ to, icon, titre, sous, extrait }) => (
  <li>
    <Link to={to} className="flex gap-3 rounded-card border border-line bg-surface p-3.5 hover:border-green transition-colors">
      <span className="w-9 h-9 rounded-lg bg-green-soft text-green grid place-items-center shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block font-display font-semibold text-green-deep leading-tight">{titre}</span>
        {sous && <span className="block text-[12.5px] text-muted">{sous}</span>}
        {extrait && <span className="block text-[13.5px] text-ink/80 mt-0.5 line-clamp-2">{extrait}</span>}
      </span>
    </Link>
  </li>
);

export const Recherche: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const q0 = params.get('q') ?? '';
  const [input, setInput] = useState(q0);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useSeo({ title: q0 ? `Recherche : ${q0}` : 'Recherche', description: 'Recherchez dans les hadiths, paroles, invocations, versets et thèmes.' });

  // Recherche débouncée + synchro de l'URL (?q=).
  useEffect(() => {
    window.clearTimeout(timer.current);
    const term = input.trim();
    setParams(term ? { q: term } : {}, { replace: true });
    if (!term) { setResults(EMPTY); setSearched(false); return; }
    setLoading(true);
    timer.current = window.setTimeout(() => {
      dataService.searchAll(term, 12)
        .then((r) => { setResults(r); setSearched(true); })
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const total = useMemo(() => results.hadiths.length + results.paroles.length + results.invocations.length + results.versets.length + results.themes.length, [results]);
  const invLabel = (h: SearchHit) => (h.type_id === 2 ? 'Évocation' : 'Invocation');

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader eyebrow="Recherche" title="Rechercher" subtitle="Hadiths, paroles, invocations, versets et thèmes." crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Recherche' }]} />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            autoFocus value={input} onChange={(e) => setInput(e.target.value)} type="search"
            aria-label="Rechercher sur le site"
            placeholder="Ex. « sans endroit », « istighfar », « an-Nasafī »…"
            className="w-full rounded-panel border border-line bg-surface pl-12 pr-4 py-3.5 text-[16px] text-ink focus:outline-none focus:ring-2 focus:ring-green"
          />
          {loading && <Loader2 className="w-5 h-5 text-green animate-spin absolute right-4 top-1/2 -translate-y-1/2" />}
        </div>

        {!input.trim() ? (
          <p className="text-muted italic py-10 text-center">Tape un mot pour lancer la recherche.</p>
        ) : searched && total === 0 && !loading ? (
          <p className="text-muted py-10 text-center">Aucun résultat pour « {input.trim()} ». Essaie un autre terme (les accents et la casse sont ignorés).</p>
        ) : (
          <div className="space-y-8">
            {results.hadiths.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-green-deep text-xl mb-3">{compteur(results.hadiths.length, 'hadith')}</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {results.hadiths.map((h) => <Hit key={h.id} to={`/hadiths/${h.id}/${h.slug ?? ''}`} icon={<Book className="w-4 h-4" />} titre={h.sujet ?? 'Hadith'} extrait={h.extrait} />)}
                </ul>
              </section>
            )}
            {results.paroles.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-green-deep text-xl mb-3">{compteur(results.paroles.length, 'parole')}</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {results.paroles.map((p) => <Hit key={p.id} to={p.slug ? `/paroles/${p.slug}` : '/savants/paroles'} icon={<Quote className="w-4 h-4" />} titre={p.sujet ?? 'Parole'} sous={p.savant} extrait={p.extrait} />)}
                </ul>
              </section>
            )}
            {results.versets.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-green-deep text-xl mb-3">{compteur(results.versets.length, 'verset')}</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {results.versets.map((c) => <Hit key={c.id} to="/coran" icon={<BookOpen className="w-4 h-4" />} titre={c.sujet ?? 'Verset'} sous={c.sourate} extrait={c.extrait} />)}
                </ul>
              </section>
            )}
            {results.invocations.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-green-deep text-xl mb-3">{compteur(results.invocations.length, 'invocation')}</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {results.invocations.map((i) => <Hit key={i.id} to="/invocations" icon={<Heart className="w-4 h-4" />} titre={i.sujet ?? 'Invocation'} sous={invLabel(i)} extrait={i.extrait} />)}
                </ul>
              </section>
            )}
            {results.themes.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-green-deep text-xl mb-3">{compteur(results.themes.length, 'theme')}</h2>
                <ul className="flex flex-wrap gap-2">
                  {results.themes.map((t) => (
                    <li key={t.slug}>
                      <Link to={`/themes/${t.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-green-line bg-green-soft text-green-deep px-3.5 py-1.5 text-sm hover:border-green"><Tag className="w-3.5 h-3.5" /> {t.nom}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Recherche;
