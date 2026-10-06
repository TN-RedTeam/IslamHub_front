import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FemmesReader } from '../components/FemmesReader';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import type { FemmesChapitre } from '../types';

export const Femmes: React.FC = () => {
  useSeo({ title: 'La femme musulmane', description: "La femme musulmane : fiqh, croyance et conduite, expliqués à partir du Coran et de la Sunna." });
  const [chapitres, setChapitres] = useState<FemmesChapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getFemmes()
      .then(setChapitres)
      .catch(() => setChapitres([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Fiqh"
        title="La femme musulmane"
        subtitle="Les règles et prescriptions spécifiques aux femmes"
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'La femme musulmane' }]}
      />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
          </div>
        ) : chapitres.length === 0 ? (
          <p className="text-center text-muted py-16">
            Le contenu sera bientôt disponible.
          </p>
        ) : (
          <FemmesReader chapitres={chapitres} />
        )}
      </main>
    </div>
  );
};

export default Femmes;
