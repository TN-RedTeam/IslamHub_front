import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { ExposeBody } from '../../components/ExposeBody';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Expose, ExposeCitation } from '../../types';

/**
 * « Le jugement rationnel » — le nécessaire (al-wājib), l'impossible
 * (al-mustaḥīl), le possible (al-jāʾiz), et la raison comme voie vers la
 * connaissance du Créateur. Prose éditable (`exposes` slug jugement-rationnel)
 * + preuves via le mécanisme réutilisable (`expose_citations`).
 */
export const JugementRationnel: React.FC = () => {
  usePageTitle('Le jugement rationnel');
  const [expose, setExpose] = useState<Expose | null>(null);
  const [citations, setCitations] = useState<ExposeCitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataService.getExpose('jugement-rationnel').catch(() => null),
      dataService.getExposeCitations('jugement-rationnel').catch(() => []),
    ]).then(([e, ci]) => { setExpose(e); setCitations(ci); }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/croyance" className="hover:text-green-deep">Croyance</Link>
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Aqida · ʿaql</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>
          {expose?.titre || 'Le jugement rationnel'}
        </h1>
        <p className="text-muted text-[15px] mt-2 max-w-[64ch]">
          L'obligatoire, l'impossible et le possible — et comment la raison saine mène à la connaissance du Créateur.
        </p>

        <div className="mt-6">
          <ExposeBody contenuMd={expose?.contenu_md ?? null} citations={citations} />
        </div>
      </main>
    </div>
  );
};

export default JugementRationnel;
