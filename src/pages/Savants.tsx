import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { SavantsTabs } from '../components/SavantsTabs';
import { SavantsDirectory } from '../components/SavantsDirectory';

/** Rubrique « Savants » : les savants proprement dits (Salaf + autres). */
export const Savants: React.FC = () => {
  useSeo({
    title: "Les Savants de l'Islam",
    description: "Les savants de Ahlou s-Sounnah (Salaf et siècles suivants) : école, époque, domaines et paroles. Les Compagnons ont leur propre rubrique.",
  });

  return (
    <SavantsDirectory
      tiers={['salaf', 'autres']}
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-1">
            Ahlou s-Sounnah wa l-Jamā‘ah · Références
          </p>
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span> Savants</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-display">Les Savants de l'Islam</h1>
          <p className="text-muted mt-2 max-w-2xl">
            Les savants de Ahlou s-Sounnah qui ont transmis, jugé et expliqué la religion après les Compagnons.
          </p>
          <Link to="/compagnons" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-green hover:gap-2.5 transition-all">
            <Users className="w-4 h-4" /> Voir les Compagnons &amp; la famille du Prophète ﷺ →
          </Link>
        </>
      }
      tabs={<SavantsTabs className="mt-5" />}
    />
  );
};

export default Savants;
