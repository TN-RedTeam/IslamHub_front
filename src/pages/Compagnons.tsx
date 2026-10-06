import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { SavantsDirectory } from '../components/SavantsDirectory';

/**
 * Rubrique « Compagnons & famille du Prophète ﷺ » : califes bien-guidés,
 * mères des croyants, et Compagnons. La plupart sont des narrateurs (badge) ;
 * ceux qui ont aussi une science propre portent « Narrateur & savant ».
 */
export const Compagnons: React.FC = () => {
  useSeo({
    title: 'Compagnons & famille du Prophète ﷺ',
    description: "Les Compagnons du Prophète ﷺ, les califes bien-guidés et les mères des croyants : ceux qui ont transmis la religion, par ordre de mérite.",
  });

  return (
    <SavantsDirectory
      tiers={['califes', 'meres', 'compagnons']}
      showProfile
      header={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-1">
            Ahlou s-Sounnah wa l-Jamā‘ah · Références
          </p>
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span> Compagnons &amp; famille</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-display">Compagnons &amp; famille du Prophète ﷺ</h1>
          <p className="text-muted mt-2 max-w-2xl">
            Les califes bien-guidés, les mères des croyants et les Compagnons — par ordre de mérite. La plupart sont avant tout des <b>narrateurs</b> ; certains ont aussi une science propre (<i>« Narrateur &amp; savant »</i>).
          </p>
          <Link to="/savants" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-green hover:gap-2.5 transition-all">
            <GraduationCap className="w-4 h-4" /> Voir les Savants (Salaf &amp; siècles suivants) →
          </Link>
        </>
      }
    />
  );
};

export default Compagnons;
