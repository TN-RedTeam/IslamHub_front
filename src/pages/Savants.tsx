import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Users } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import type { SavantInfo } from '../types';

// Libellés d'affichage des domaines (valeur en base → étiquette FR).
const DOMAINE_LABEL: Record<string, string> = {
  Hadith: 'Hadith', Fiqh: 'Fiqh', Aqida: 'Croyance', Tafsir: 'Exégèse', Langue: 'Langue',
};
const labelDom = (d: string) => DOMAINE_LABEL[d] ?? d;

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const epoque = (s: SavantInfo) => {
  const n = parseInt((s.naissance ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

export const Savants: React.FC = () => {
  useSeo({
    title: 'Annuaire des savants',
    description: "Annuaire des savants de Ahlou s-Sounnah cités dans les hadiths, paroles et dossiers : école, époque, domaines, biographie.",
  });

  const [savants, setSavants] = useState<SavantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [ecole, setEcole] = useState('');
  const [sort, setSort] = useState<'az' | 'epoque'>('az');
  const [domaines, setDomaines] = useState<Set<string>>(new Set());

  useEffect(() => {
    dataService.getSavants().then(setSavants).catch(() => setSavants([])).finally(() => setLoading(false));
  }, []);

  const ecoles = useMemo(
    () => Array.from(new Set(savants.map((s) => s.ecole).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, 'fr')),
    [savants],
  );
  const domainesDispo = useMemo(
    () => Array.from(new Set(savants.flatMap((s) => s.domaines ?? []))).sort(),
    [savants],
  );

  const toggleDom = (d: string) =>
    setDomaines((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  const list = useMemo(() => {
    const term = norm(q.trim());
    const raw = q.trim();
    const sel = [...domaines];
    const out = savants.filter((s) => {
      if (term) {
        const hay = norm(`${s.nom} ${s.nom_arabe ?? ''}`);
        if (!hay.includes(term) && !(s.nom_arabe && raw && s.nom_arabe.includes(raw))) return false;
      }
      if (ecole && s.ecole !== ecole) return false;
      if (sel.length && !sel.every((d) => (s.domaines ?? []).includes(d))) return false;
      return true;
    });
    out.sort((a, b) => (sort === 'epoque' ? epoque(a) - epoque(b) : a.nom.localeCompare(b.nom, 'fr')));
    return out;
  }, [savants, q, ecole, sort, domaines]);

  return (
    <div className="min-h-screen bg-ground">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-1">
            Ahlou s-Sounnah wa l-Jamā‘ah · Références
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">Annuaire des savants</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Les savants cités à travers les hadiths, les paroles et les dossiers. Chaque fiche donne le crédit et le contexte de celui dont on rapporte la parole.
          </p>
        </header>

        {/* Barre d'outils sticky */}
        <div
          role="search"
          className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-green-soft dark:bg-gray-900/80 backdrop-blur px-3 py-3"
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un savant…"
              aria-label="Rechercher un savant"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </div>
          <select
            aria-label="Filtrer par école"
            value={ecole}
            onChange={(e) => setEcole(e.target.value)}
            className="py-2.5 px-3 rounded-lg border border-line bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="">Toutes les écoles</option>
            {ecoles.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            aria-label="Trier"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'az' | 'epoque')}
            className="py-2.5 px-3 rounded-lg border border-line bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="az">A → Z</option>
            <option value="epoque">Par époque</option>
          </select>
        </div>

        {/* Chips domaines (affichées si des domaines existent en base) */}
        {domainesDispo.length > 0 && (
          <div role="group" aria-label="Filtrer par domaine" className="flex flex-wrap gap-2 mt-3">
            {domainesDispo.map((d) => {
              const on = domaines.has(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDom(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                    on
                      ? 'bg-green text-white border-green'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-line hover:border-green'
                  }`}
                >
                  {labelDom(d)}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium my-4">
          <span className="text-green font-bold">{list.length}</span> savant{list.length > 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p>Aucun savant ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {list.map((s) => {
              const dates = [s.naissance, s.deces].filter(Boolean).join(' – ');
              const mono = (s.nom_arabe?.trim()?.charAt(0)) || s.nom.charAt(0);
              return (
                <Link
                  key={s.id}
                  to={`/savants/${s.slug}`}
                  className="group flex flex-col gap-3 rounded-card border border-line bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-lg hover:border-green dark:hover:border-green hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-[52px] h-[52px] rounded-full grid place-items-center font-display text-2xl font-bold text-white bg-green ring-2 ring-inset ring-gold/40"
                    >
                      {mono}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-xl font-bold leading-tight text-green-deep group-hover:text-green">{s.nom}</span>
                      {s.nom_arabe && (
                        <span dir="rtl" className="block font-display text-base text-gray-500 dark:text-gray-400 [unicode-bidi:plaintext]">{s.nom_arabe}</span>
                      )}
                    </span>
                  </div>

                  {(dates || s.ecole) && (
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      {dates && <span>{dates}</span>}
                      {dates && s.ecole && <span aria-hidden="true">·</span>}
                      {s.ecole && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gold">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold" /> {s.ecole}
                        </span>
                      )}
                    </div>
                  )}

                  {s.resume && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{s.resume}</p>
                  )}

                  {(s.domaines?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {s.domaines.map((d) => (
                        <span key={d} className="text-[11px] font-semibold tracking-wide text-green bg-green-soft px-2 py-0.5 rounded">{labelDom(d)}</span>
                      ))}
                    </div>
                  )}

                  <span className="mt-auto pt-1 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">
                    Lire la biographie →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Savants;
