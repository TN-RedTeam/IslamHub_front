import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Users } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import { BadgeGeneration } from '../components/BadgeGeneration';
import { SavantsTabs } from '../components/SavantsTabs';
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
// Rang honorifique : califes bien-guidés, puis mères des croyants, puis autres
// Compagnons, puis les savants (non-compagnons).
const rang = (s: SavantInfo) =>
  s.role === 'calife_rachidoun' ? 0 : s.role === 'epouse_prophete' ? 1 : s.is_compagnon ? 2 : 3;

export const Savants: React.FC = () => {
  useSeo({
    title: "Les Savants de l'Islam",
    description: "Les savants de Ahlou s-Sounnah cités dans les hadiths, paroles et dossiers : école, époque, domaines, biographie.",
  });

  const [savants, setSavants] = useState<SavantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [ecole, setEcole] = useState('');
  const [gen, setGen] = useState(''); // '', 'sahabi', 'salaf', 'khalaf'
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
    () => Array.from(new Set(savants.flatMap((s) => s.domaines ?? []))).filter((d) => d !== 'Compagnon').sort(),
    [savants],
  );

  const toggleDom = (d: string) =>
    setDomaines((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  // Filtrage, puis séparation Compagnons / Savants (les Compagnons en premier,
  // classés par rang honorifique).
  const { compagnons, autres, total } = useMemo(() => {
    const term = norm(q.trim());
    const raw = q.trim();
    const sel = [...domaines];
    const sortCmp = (a: SavantInfo, b: SavantInfo) =>
      sort === 'epoque' ? epoque(a) - epoque(b) : a.nom.localeCompare(b.nom, 'fr');
    const out = savants.filter((s) => {
      if (term) {
        const hay = norm(`${s.nom} ${s.nom_arabe ?? ''}`);
        if (!hay.includes(term) && !(s.nom_arabe && raw && s.nom_arabe.includes(raw))) return false;
      }
      if (ecole && s.ecole !== ecole) return false;
      if (gen) {
        const g = s.generation ?? '';
        if (gen === 'salaf') { if (g !== 'salaf' && g !== 'tabii' && g !== 'tabi_tabii') return false; }
        else if (g !== gen) return false;
      }
      if (sel.length && !sel.every((d) => (s.domaines ?? []).includes(d))) return false;
      return true;
    });
    const comp = out.filter((s) => s.is_compagnon).sort((a, b) => rang(a) - rang(b) || sortCmp(a, b));
    const sav = out.filter((s) => !s.is_compagnon).sort(sortCmp);
    return { compagnons: comp, autres: sav, total: comp.length + sav.length };
  }, [savants, q, ecole, gen, sort, domaines]);

  const renderCard = (s: SavantInfo) => {
    const dates = [s.naissance, s.deces].filter(Boolean).join(' – ');
    const mono = (s.nom_arabe?.trim()?.charAt(0)) || s.nom.charAt(0);
    const doms = (s.domaines ?? []).filter((d) => d !== 'Compagnon');
    return (
      <Link
        key={s.id}
        to={`/savants/${s.slug}`}
        className="group flex flex-col gap-3 rounded-card border border-line bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-lg hover:border-green dark:hover:border-green hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
      >
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className={`shrink-0 w-[52px] h-[52px] rounded-full grid place-items-center font-display text-2xl font-bold text-white ring-2 ring-inset ${
              s.is_compagnon ? 'bg-gold ring-[#7a5a17]/30' : 'bg-green ring-gold/40'
            }`}
          >
            {mono}
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-bold leading-tight text-green-deep group-hover:text-green">{s.nom}</span>
            {s.nom_arabe && (
              <span dir="rtl" lang="ar" className="block font-arabic-name font-medium text-base text-ink [unicode-bidi:plaintext]">{s.nom_arabe}</span>
            )}
          </span>
        </div>

        <BadgeGeneration generation={s.generation} role={s.role} sexe={s.role === 'epouse_prophete' ? 'f' : undefined} />

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

        {s.resume && <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{s.resume}</p>}

        {doms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doms.map((d) => (
              <span key={d} className="text-[11px] font-semibold tracking-wide text-green bg-green-soft px-2 py-0.5 rounded">{labelDom(d)}</span>
            ))}
          </div>
        )}

        <span className="mt-auto pt-1 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">
          {s.resume || !s.is_compagnon ? 'Lire la biographie' : 'Voir la fiche'} →
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-ground">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-1">
            Ahlou s-Sounnah wa l-Jamā‘ah · Références
          </p>
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span> Savants</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">Les Savants de l'Islam</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
            Les savants cités à travers les hadiths, les paroles et les dossiers. Chaque fiche donne le crédit et le contexte de celui dont on rapporte la parole.
          </p>
          <SavantsTabs className="mt-5" />
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
            aria-label="Filtrer par génération"
            value={gen}
            onChange={(e) => setGen(e.target.value)}
            className="py-2.5 px-3 rounded-lg border border-line bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="">Toutes générations</option>
            <option value="sahabi">Compagnons</option>
            <option value="salaf">Salaf</option>
            <option value="khalaf">Khalaf</option>
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
          <span className="text-green font-bold">{total}</span> référence{total > 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p>Aucune référence ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {compagnons.length > 0 && (
              <section aria-labelledby="sec-compagnons">
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 id="sec-compagnons" className="font-display text-2xl font-bold text-green-deep">
                    Les Compagnons du Prophète&nbsp;{'ﷺ'}
                  </h2>
                  <span className="text-xs font-semibold text-[#7a5a17] bg-gold-soft border border-[#e6d3a3] rounded-full px-2.5 py-0.5 tabular-nums">{compagnons.length}</span>
                </div>
                <p className="text-sm text-muted mb-4 max-w-2xl">
                  Ceux qui ont vu le Prophète&nbsp;{'ﷺ'} en étant croyants&nbsp;: les meilleurs de cette communauté, dont on rapporte les hadiths.
                  <span className="font-arabic-name text-ink ms-1.5" lang="ar" dir="rtl">{'رضي الله عنهم'}</span>
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                  {compagnons.map(renderCard)}
                </div>
              </section>
            )}

            {autres.length > 0 && (
              <section aria-labelledby="sec-savants">
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 id="sec-savants" className="font-display text-2xl font-bold text-green-deep">Les Savants</h2>
                  <span className="text-xs font-semibold text-green-deep bg-green-soft border border-green-line rounded-full px-2.5 py-0.5 tabular-nums">{autres.length}</span>
                </div>
                <p className="text-sm text-muted mb-4 max-w-2xl">
                  Les savants de Ahlou s-Sounnah qui ont transmis, jugé et expliqué la religion après les Compagnons.
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                  {autres.map(renderCard)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Savants;
