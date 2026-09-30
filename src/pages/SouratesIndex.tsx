import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Search, LayoutGrid, List, Check } from 'lucide-react';
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
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-glass-tint text-accent border border-glass-border">Exégèse</span>
  ) : (
    <span className="shrink-0 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border border-dashed border-glass-border text-muted">Bientôt</span>
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
    <div className="min-h-screen">
      <header className="max-w-3xl mx-auto px-4 pt-7 pb-2">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-accent">Accueil</Link> <span aria-hidden>·</span> <Link to="/coran" className="hover:text-accent">Coran</Link> <span aria-hidden>·</span> Sourates</nav>
        <h1 className="font-display font-extrabold tracking-[-0.02em] text-ink" style={{ fontSize: 'clamp(24px,5vw,34px)' }}>Exégèse des sourates</h1>
        <p className="text-muted mt-2 text-[14px] max-w-2xl">Le tafsir d’Al-Fātiḥah et des Juz 29 &amp; 30, expliqué à la lumière des savants.</p>
        <div className="mt-4"><CoranTabs /></div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Contrôles : recherche + filtre + vue */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-accent" aria-hidden />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une sourate (nom, arabe, numéro)…" aria-label="Rechercher une sourate"
              className="w-full pl-11 pr-4 py-2.5 rounded-[16px] border border-glass-border bg-glass text-ink placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="button" onClick={() => setOnlyExegese((v) => !v)} aria-pressed={onlyExegese}
            className={`inline-flex items-center gap-1.5 rounded-[16px] border px-4 py-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${
              onlyExegese ? 'bg-glass-tint text-accent border-accent' : 'bg-glass text-ink border-glass-border hover:border-accent/60'
            }`}
          >
            {onlyExegese && <Check className="w-4 h-4" />} Exégèse disponible
          </button>
          <div className="inline-flex rounded-[16px] border border-glass-border bg-glass p-1 self-start" role="group" aria-label="Vue">
            {([['grid', LayoutGrid, 'Grille'], ['list', List, 'Liste']] as const).map(([v, Icon, label]) => (
              <button
                key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} title={label}
                className={`inline-flex items-center gap-1.5 rounded-[12px] px-3 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${
                  view === v ? 'bg-glass-tint text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-accent animate-spin" /></div>
        ) : totalShown === 0 ? (
          <p className="text-center text-muted py-16">Aucune sourate ne correspond.</p>
        ) : (
          <div className="space-y-9">
            {blocks.map(({ sec, shown, stats }) => (
              <section key={sec.key} aria-label={sec.titre}>
                {/* En-tête de section */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="shrink-0 grid place-items-center w-11 h-11 rounded-[14px] bg-glass-tint border border-glass-border text-accent font-display font-extrabold text-lg tabular-nums">{sec.badge}</span>
                  <div className="min-w-0">
                    <h2 className="font-display font-extrabold tracking-[-0.01em] text-ink text-lg leading-tight">
                      {sec.titre} <span className="font-arabic text-accent-br" dir="rtl" lang="ar">{sec.arabe}</span>
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      {stats.sourates} sourate{stats.sourates > 1 ? 's' : ''} · {stats.versets} versets · {stats.avecExegese} avec exégèse
                    </p>
                  </div>
                </div>

                {shown.length === 0 ? (
                  <p className="text-sm text-muted italic pl-14">Aucune sourate de cette section ne correspond.</p>
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shown.map((s) => (
                      <Link
                        key={s.numero} to={`/coran/sourates/${s.slug}`}
                        className="group flex flex-col gap-2 rounded-[18px] border border-glass-border bg-glass p-4 backdrop-blur-md shadow-glass transition-colors hover:border-accent/60 motion-reduce:transition-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 grid place-items-center w-9 h-9 rotate-45 rounded-[11px] bg-glass-tint text-accent font-extrabold text-[13px]"><span className="-rotate-45 tabular-nums">{s.numero}</span></span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-bold text-ink truncate">{s.nom}</span>
                            {s.nom_arabe && <span className="block font-arabic text-accent-br text-lg leading-none" dir="rtl" lang="ar">{s.nom_arabe}</span>}
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
                  <div className="flex flex-col gap-2.5">
                    {shown.map((s) => (
                      <Link key={s.numero} to={`/coran/sourates/${s.slug}`} className="group flex items-center gap-3.5 rounded-[16px] border border-glass-border bg-glass px-4 py-3 transition-colors hover:border-accent/60 motion-reduce:transition-none">
                        <span className="shrink-0 grid place-items-center w-[34px] h-[34px] rotate-45 rounded-[11px] bg-glass-tint text-accent font-extrabold text-[13px]"><span className="-rotate-45 tabular-nums">{s.numero}</span></span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold text-[14px] text-ink truncate">{s.nom}</span>
                          <span className="block text-[11px] text-muted mt-0.5 truncate">{[s.revelation, s.nb_versets ? `${s.nb_versets} versets` : null].filter(Boolean).join(' · ')}</span>
                        </span>
                        {s.nom_arabe && <span className="font-arabic text-[19px] text-accent-br shrink-0" dir="rtl" lang="ar">{s.nom_arabe}</span>}
                        <StatusBadge s={s} />
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
