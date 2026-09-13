import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Search, Loader, ArrowRight } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { FilterSelect } from '../../components/FilterSelect';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { VersetEquivoqueCard } from '../../types';

// Aperçu texte : retire le markdown léger et tronque.
const snippet = (s: string | null, n = 120): string => {
  if (!s) return '';
  const clean = s.replace(/[*_>#`]/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n).trimEnd() + '…' : clean;
};

const TYPE_TABS = [
  { value: '', label: 'Tout' },
  { value: 'verset', label: 'Versets' },
  { value: 'hadith', label: 'Hadiths' },
];

export const VersetsEquivoques: React.FC = () => {
  usePageTitle('Versets et hadiths équivoques');
  const [items, setItems] = useState<VersetEquivoqueCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<string | null>(null);
  const [sourate, setSourate] = useState<string | null>(null);
  const [type, setType] = useState<string>(''); // '', 'verset', 'hadith'
  const [themes, setThemes] = useState<string[]>([]);
  const [sourates, setSourates] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    dataService.getVersetThemes().then(setThemes).catch(() => setThemes([]));
    dataService.getVersetSourates().then(setSourates).catch(() => setSourates([]));
  }, []);

  const run = useCallback(async (query: string, th: string | null, so: string | null, ty: string) => {
    setLoading(true);
    try {
      const res = await dataService.searchVersetsEquivoques(query, th, so, { page: 0, pageSize: 60 }, ty);
      setItems(res.data ?? []);
      setTotal(res.count ?? 0);
    } catch {
      setItems([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => run(q, theme, sourate, type), 250);
    return () => clearTimeout(debounceRef.current);
  }, [q, theme, sourate, type, run]);

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-6xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden="true">·</span>{' '}
          <Link to="/croyance" className="hover:text-green-deep">Croyance</Link>
        </nav>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Croyance · Mutashābihāt</p>
        <h1 className="font-display font-semibold text-green-deep" style={{ fontSize: 'clamp(28px,4.4vw,42px)' }}>Versets et hadiths équivoques</h1>
        <p className="text-muted text-[15px] mt-2 max-w-[62ch]">
          Les versets <b className="text-ink">et les hadiths</b> dont le sens apparent prêterait à confusion sur Allah —
          <b className="text-ink"> on va à l'essentiel</b> : le sens conforme à Sa transcendance, avec les preuves.
        </p>

        {/* À lire en premier */}
        <Link
          to="/croyance/versets-hadiths-equivoques/comprendre"
          className="group mt-6 flex items-center justify-between gap-4 rounded-card border border-green-line bg-green-soft px-5 py-4 hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">À lire en premier</span>
            <span className="block font-display font-semibold text-green-deep text-lg">Comprendre les textes équivoques</span>
          </span>
          <ArrowRight className="w-5 h-5 text-green shrink-0 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
        </Link>

        {/* Filtre par type */}
        <div role="tablist" aria-label="Type" className="inline-flex gap-1 mt-6 rounded-full border border-line bg-surface p-1">
          {TYPE_TABS.map((t) => {
            const on = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setType(t.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                  on ? 'bg-green text-white' : 'text-ink hover:bg-green-soft hover:text-green-deep'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Contrôles */}
        <div role="search" className="flex flex-wrap items-center gap-3 mt-6 mb-1 p-3.5 rounded-card border border-line bg-surface">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden="true" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un verset, un thème…"
              aria-label="Rechercher"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
          <FilterSelect value={theme || ''} onChange={(v) => setTheme(v || null)} options={themes} allLabel="Tous les thèmes" ariaLabel="Filtrer par thème" />
          <FilterSelect value={sourate || ''} onChange={(v) => setSourate(v || null)} options={sourates} allLabel="Toutes les sourates" ariaLabel="Filtrer par sourate" />
        </div>
        <p className="text-[13px] text-muted my-3.5">
          {loading ? 'Recherche…' : <><b className="text-green tabular-nums">{total}</b> texte{total > 1 ? 's' : ''}</>}
        </p>

        {/* Grille */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-green animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted rounded-card border border-line bg-surface">
            Aucun verset ne correspond. Ajustez la recherche ou les filtres.
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
            {items.map((v) => (
              <m.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                  to={`/croyance/versets-hadiths-equivoques/${v.slug}`}
                  className="group flex flex-col gap-3 h-full rounded-card border border-line bg-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`text-[10.5px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                        v.type === 'hadith' ? 'bg-gold-soft text-[#7a5a17] border-[#e6d3a3]' : 'bg-green-soft text-green-deep border-green-line'
                      }`}>{v.type === 'hadith' ? 'Hadith' : 'Verset'}</span>
                      <span className="text-[11.5px] font-semibold text-green-deep bg-green-soft border border-green-line px-2.5 py-1 rounded-full">{v.theme}</span>
                    </span>
                    <span className="text-xs text-muted tabular-nums whitespace-nowrap text-right">
                      {v.type === 'hadith'
                        ? [v.rapporteur, v.recueil].filter(Boolean).join(' · ')
                        : `${v.sourate}${v.ayah != null ? ` : ${v.ayah}` : ''}`}
                    </span>
                  </div>
                  <p className="font-arabic text-2xl leading-[1.9] text-right text-ink my-0.5" lang="ar" dir="rtl">{v.verset_arabe}</p>
                  {v.sens_juste && <p className="text-sm text-ink/80">{snippet(v.sens_juste)}</p>}
                  <span className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-green group-hover:gap-2.5 transition-all motion-reduce:transition-none">
                    Voir l'explication <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </m.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VersetsEquivoques;
