import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, Layers } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import type { DossierListItem } from '../types';

/** Index public des dossiers thématiques (/dossiers). */
export const DossiersIndex: React.FC = () => {
  const [items, setItems] = useState<DossierListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({ title: 'Dossiers thématiques', description: 'Des dossiers de croyance approfondis, preuves à l’appui.' });

  useEffect(() => {
    dataService.getDossiers().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Croyance"
        title="Dossiers thématiques"
        subtitle="Des dossiers approfondis sur des questions de croyance, exposés avec leurs preuves."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: 'Dossiers thématiques' }]}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-muted italic py-10 text-center">Aucun dossier pour le moment.</p>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {items.map((d) => (
              <Link
                key={d.slug}
                to={`/dossiers/${d.slug}`}
                className="group flex flex-col gap-2 rounded-card border border-line bg-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                <span className="w-10 h-10 rounded-card bg-green-soft text-green grid place-items-center"><Layers className="w-5 h-5" /></span>
                <h2 className="font-display font-semibold text-green-deep text-lg leading-tight group-hover:text-green">{d.h1}</h2>
                {d.meta_description && <p className="text-sm text-muted line-clamp-2">{d.meta_description}</p>}
                <span className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-green group-hover:gap-2.5 transition-all motion-reduce:transition-none">Ouvrir le dossier <ArrowRight className="w-4 h-4" /></span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DossiersIndex;
