import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2, Users, ChevronRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { EcoleBadge } from '../components/EcoleBadge';
import { usePageTitle } from '../hooks/usePageTitle';
import type { SavantInfo } from '../types';

export const Savants: React.FC = () => {
  usePageTitle('Savants');
  const [savants, setSavants] = useState<SavantInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getSavants()
      .then(setSavants)
      .catch(() => setSavants([]))
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-amiri">Les Savants</h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Les savants de Ahlou s-Sounnah wa l-Jamâ‘ah et leurs biographies
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : savants.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-60" />
            <p>Les fiches des savants seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {savants.map((s) => (
              <m.article
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 font-amiri">{s.nom}</h2>
                  {s.ecole && <EcoleBadge ecole={s.ecole} />}
                </div>

                {s.biographie && (
                  <div className="max-w-[70ch]">
                    <Markdown>{s.biographie}</Markdown>
                  </div>
                )}

                {s.nb_paroles > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      to={`/paroles?savant=${encodeURIComponent(s.nom)}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                    >
                      Voir ses {s.nb_paroles} parole{s.nb_paroles > 1 ? 's' : ''}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </m.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Savants;
