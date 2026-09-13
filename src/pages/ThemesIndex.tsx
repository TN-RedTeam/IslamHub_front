import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import type { ThemeCard, ThemeFamille } from '../types';

const FAMILLES: { key: ThemeFamille; label: string }[] = [
  { key: 'croyance', label: 'Croyance' },
  { key: 'prophete', label: 'Le Prophète ﷺ' },
  { key: 'adoration', label: 'Adoration & spiritualité' },
  { key: 'comportement', label: 'Comportement & vie' },
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const ThemesIndex: React.FC = () => {
  useSeo({ title: 'Thèmes', description: 'Explorer par thème : ce que disent le Coran, la Sunna et les savants sur chaque sujet.' });
  const [themes, setThemes] = useState<ThemeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    dataService.getThemes().then(setThemes).catch(() => setThemes([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = norm(q.trim());
    // On masque les thèmes sans aucun contenu.
    return themes.filter((t) => (t.n_coran + t.n_hadith + t.n_parole) > 0 && (!term || norm(t.nom).includes(term)));
  }, [themes, q]);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Thématique"
        title="Explorer par thème"
        subtitle="Ce que disent le Coran, la Sunna et les savants — regroupé par sujet."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Thèmes' }]}
      />

      <main className="max-w-5xl mx-auto px-5 py-8 pb-16">
        <div role="search" className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un thème…"
            aria-label="Chercher un thème"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-muted italic">Aucun thème ne correspond.</p>
        ) : (
          FAMILLES.map(({ key, label }) => {
            const items = filtered.filter((t) => t.famille === key);
            if (items.length === 0) return null;
            return (
              <section key={key} className="mb-10">
                <h2 className="font-display font-semibold text-green-deep text-2xl mb-4">{label}</h2>
                <div className="grid gap-3.5 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                  {items.map((t) => {
                    const total = t.n_coran + t.n_hadith + t.n_parole;
                    const parts: string[] = [];
                    if (t.n_coran) parts.push(`${t.n_coran} v.`);
                    if (t.n_hadith) parts.push(`${t.n_hadith} h.`);
                    if (t.n_parole) parts.push(`${t.n_parole} p.`);
                    return (
                      <Link
                        key={t.slug}
                        to={`/themes/${t.slug}`}
                        className="group flex flex-col gap-2 rounded-card border border-line bg-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                      >
                        <h3 className="font-display font-semibold text-green-deep text-lg leading-tight group-hover:text-green">{t.nom}</h3>
                        <span className="text-xs text-muted">{parts.join(' · ')}</span>
                        <span className="mt-auto pt-1.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-green group-hover:gap-2.5 transition-all motion-reduce:transition-none">
                          {total} contenu{total > 1 ? 's' : ''} <ArrowRight className="w-4 h-4" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
};

export default ThemesIndex;
