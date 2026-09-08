import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FemmesReader } from '../components/FemmesReader';
import { PageHeader } from '../components/PageHeader';
import type { FemmesChapitre } from '../types';

export const Femmes: React.FC = () => {
  const [chapitres, setChapitres] = useState<FemmesChapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getFemmes()
      .then(setChapitres)
      .catch(() => setChapitres([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Fiqh"
        title="Les femmes en Islam"
        subtitle="Les règles et prescriptions spécifiques aux femmes"
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Les femmes en Islam' }]}
      />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
          </div>
        ) : chapitres.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
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
