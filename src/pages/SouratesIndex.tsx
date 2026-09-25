import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Search, LayoutGrid, List, Check, ChevronRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { CoranTabs } from '../components/CoranTabs';
import { useSeo } from '../hooks/useSeo';
import type { SourateInfo } from '../types';

// Sections de l'index (dérivées du numéro de sourate — aucun champ en base).
// Al-Fātiḥah (hors Juz 29 & 30) ouvre la page, puis les deux juz.
const SECTIONS: { key: string; badge: React.ReactNode; titre: string; arabe: string; has: (n: number) => boolean }[] = [
  { key: 'fatiha', badge: <BookOpen className="w-5 h-5" aria-hidden />, titre: 'Al-Fātiḥah · L’ouverture', arabe: 'الفاتحة', has: (n) => n === 1 },
  { key: 'juz29', badge: '29', titre: 'Juz 29 · Tabārak', arabe: 'تبارك', has: (n) => n >= 67 && n <= 77 },
  { key: 'juz30', badge: '30', titre: 'Juz 30 · ʿAmma', arabe: 'عمّ', has: (n) => n >= 78 && n <= 114 },
];

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const hasTafsir = (s: SourateInfo) => s.a_exegese ?? s.a_du_contenu;

const StatusBadge: React.FC<{ s: SourateInfo }> = ({ s }) =>
  hasTafsir(s) ? (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green text-white">Exégèse</span>
  ) : (
    <span className="shrink-0 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border border-dashed border-line text-muted">Bientôt</span>
  );

export const SouratesIndex: React.FC = () => {
  useSeo({ title: 'Exégèse des sourates', description: "Exégèse (tafsir) des sourates du Coran : sens des versets selon les savants." });
  const [sourates, setSourates] = useState<SourateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [onlyExegese, setOnlyExegese] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dataService.getSourates().then(setSourates).catch(() => setSourates([])).finally(() => setLoading(false));
  }, []);

  const matches = (s: SourateInfo) => {
    const term = norm(q.trim());
    if (onlyExegese && !hasTafsir(s)) return false;
    if (!term) return true;
    return norm(s.nom).includes(term) || (s.nom_arabe ?? '').includes(q.trim()) || String(s.numero).includes(term);
  };

  const blocks = useMemo(() =>
    SECTIONS.map((sec) => {
      const all = sourates.filter((s) => sec.has(s.numero));
      const shown = all.filter(matches);
      const stats = {
        sourates: all.length,
        versets: all.reduce((n, s) => n + (s.nb_versets ?? 0), 0),
        avecExegese: all.filter(hasTafsir).length,
      };
      return { sec, all, shown, stats };
    }).filter((b) => b.all.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourates, q, onlyExegese],
  );

  const totalShown = blocks.reduce((n, b) => n + b.shown.length, 0);

  return (
    <div className="min-h-screen bg-ground">
      <header className="bg-ivory border-b border-line py-10">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span> <Link to="/coran" className="hover:text-green-deep">Coran</Link> <span aria-hidden>·</span> Sourates</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">Exégèse des sourates</h1>
          <p className="text-muted mt-3 max-w-2xl mx-auto">Le tafsir d’Al-Fātiḥah et des Juz 29 &amp; 30, expliqué à la lumière des savants.</p>
          <div className="mt-5 flex justify-center"><CoranTabs /></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Contrôles : recherche + filtre + vue */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une sourate (nom, arabe, numéro)…" aria-label="Rechercher une sourate"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
          <button
            type="button" onClick={() => setOnlyExegese((v) => !v)} aria-pressed={onlyExegese}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              onlyExegese ? 'bg-green text-white border-green' : 'bg-surface text-green-deep border-line hover:border-green'
            }`}
          >
            {onlyExegese && <Check className="w-4 h-4" />} Exégèse disponible
          </button>
          <div className="inline-flex rounded-xl border border-line bg-surface p-1 self-start" role="group" aria-label="Vue">
            {([['grid', LayoutGrid, 'Grille'], ['list', List, 'Liste']] as const).map(([v, Icon, label]) => (
              <button
                key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} title={label}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  view === v ? 'bg-green text-white' : 'text-ink hover:bg-green-soft'
                }`}
              >
                <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : totalShown === 0 ? (
          <p className="text-center text-muted py-16">Aucune sourate ne correspond.</p>
        ) : (
          <div className="space-y-10">
            {blocks.map(({ sec, shown, stats }) => (
              <section key={sec.key} aria-label={sec.titre}>
                {/* En-tête de section */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="shrink-0 grid place-items-center w-11 h-11 rounded-2xl bg-green text-white font-display font-semibold text-lg tabular-nums">{sec.badge}</span>
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-green-deep text-xl leading-tight">
                      {sec.titre} <span className="font-arabic text-gold" dir="rtl" lang="ar">{sec.arabe}</span>
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      {stats.sourates} sourate{stats.sourates > 1 ? 's' : ''} · {stats.versets} versets · {stats.avecExegese} avec exégèse
                    </p>
                  </div>
                </div>

                {shown.length === 0 ? (
                  <p className="text-sm text-muted italic pl-14">Aucune sourate de cette section ne correspond.</p>
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shown.map((s) => (
                      <Link
                        key={s.numero} to={`/coran/sourates/${s.slug}`}
                        className="group flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-sm hover:shadow-md hover:border-green transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 w-10 h-10 rounded-full bg-green-soft text-green-deep grid place-items-center font-bold tabular-nums">{s.numero}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display font-bold text-green-deep group-hover:text-green truncate">{s.nom}</span>
                            {s.nom_arabe && <span className="block font-arabic text-gold text-lg leading-none" dir="rtl" lang="ar">{s.nom_arabe}</span>}
                          </span>
                          <StatusBadge s={s} />
                        </div>
                        <span className="text-xs text-muted">
                          {[s.revelation, s.nb_versets ? `${s.nb_versets} versets` : null].filter(Boolean).join(' · ')}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-card border border-line bg-surface overflow-hidden divide-y divide-line">
                    {shown.map((s) => (
                      <Link key={s.numero} to={`/coran/sourates/${s.slug}`} className="group flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                        <span className="shrink-0 w-8 h-8 rounded-full bg-green-soft text-green-deep grid place-items-center text-sm font-bold tabular-nums">{s.numero}</span>
                        <span className="min-w-0 flex-1 flex items-baseline gap-2">
                          <span className="font-display font-semibold text-green-deep group-hover:text-green truncate">{s.nom}</span>
                          {s.nom_arabe && <span className="font-arabic text-gold shrink-0" dir="rtl" lang="ar">{s.nom_arabe}</span>}
                        </span>
                        <span className="hidden sm:block text-xs text-muted w-24 text-right">{s.revelation}</span>
                        <span className="hidden sm:block text-xs text-muted tabular-nums w-20 text-right">{s.nb_versets ? `${s.nb_versets} v.` : ''}</span>
                        <StatusBadge s={s} />
                        <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted mt-10 flex items-center justify-center gap-1.5">
          <BookOpen className="h-4 w-4" /> D'autres sourates des Juz 29 &amp; 30 seront ajoutées progressivement.
        </p>
      </main>
    </div>
  );
};

export default SouratesIndex;
