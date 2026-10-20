import React, { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FemmesReader } from '../components/FemmesReader';
import { useSeo } from '../hooks/useSeo';
import { UI } from '../strings';
import type { FemmesChapitre } from '../types';

export const Femmes: React.FC = () => {
  useSeo({ title: UI.femme.title, description: UI.femme.intro });
  const [chapitres, setChapitres] = useState<FemmesChapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getFemmes().then(setChapitres).catch(() => setChapitres([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* 14.B.1 — Couverture adressée à la lectrice, accent chaud (--warm) réservé à la rubrique. */}
      <header className="relative overflow-hidden border-b border-line" style={{ background: 'linear-gradient(180deg, var(--warm-soft), transparent)' }}>
        {/* Ornement géométrique discret (motif en losange), faible opacité, en coin. */}
        <svg aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 w-56 h-56 opacity-[0.12]" viewBox="0 0 100 100" fill="none" style={{ color: 'var(--warm)' }}>
          <g stroke="currentColor" strokeWidth="1.4">
            <path d="M50 4 L96 50 L50 96 L4 50 Z" />
            <path d="M50 22 L78 50 L50 78 L22 50 Z" />
            <path d="M50 40 L60 50 L50 60 L40 50 Z" />
          </g>
        </svg>
        <div className="container mx-auto px-4 max-w-6xl py-9">
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2">
            <Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span> {UI.femme.title}
          </nav>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'var(--warm)' }}>{UI.femme.eyebrow}</p>
          <h1 className="font-display font-bold text-ink leading-tight" style={{ fontSize: 'clamp(28px,5vw,42px)' }}>{UI.femme.title}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{UI.femme.intro}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        ) : chapitres.length === 0 ? (
          <p className="text-center text-muted py-16">Le contenu sera bientôt disponible.</p>
        ) : (
          <FemmesReader chapitres={chapitres} />
        )}
      </main>
    </div>
  );
};

export default Femmes;
