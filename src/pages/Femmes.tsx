import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FiqhAccordion } from '../components/FiqhAccordion';
import type { FiqhChapitre } from '../types';

export const Femmes: React.FC = () => {
  const [chapitres, setChapitres] = useState<FiqhChapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getFemmes()
      .then(setChapitres)
      .catch(() => setChapitres([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      <m.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
        <div className="relative container mx-auto px-4 text-center">
          <m.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="h-10 w-10 text-white" />
          </m.div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri">
            Les femmes en Islam
          </h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Les règles et prescriptions spécifiques aux femmes
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : chapitres.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            Le contenu sera bientôt disponible.
          </p>
        ) : (
          <FiqhAccordion chapitres={chapitres} />
        )}
      </main>
    </div>
  );
};

export default Femmes;
