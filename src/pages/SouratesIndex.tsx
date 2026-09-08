import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import type { SourateInfo } from '../types';

export const SouratesIndex: React.FC = () => {
  useSeo({ title: 'Exégèse du Coran', description: "Exégèse (tafsir) des sourates du Coran : sens des versets selon les savants." });
  const [sourates, setSourates] = useState<SourateInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getSourates().then(setSourates).catch(() => setSourates([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ground">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-ivory border-b border-line py-10">
        
        
        <div className="relative container mx-auto px-4 max-w-4xl text-center">
          <Link to="/coran" className="inline-flex items-center gap-1.5 text-muted hover:text-green-deep text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Le Noble Coran
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">Exégèse du Coran</h1>
          <p className="text-muted mt-3 max-w-2xl mx-auto">Le sens des sourates et des versets, expliqué à la lumière des savants.</p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sourates.map((s) => (
              <Link
                key={s.numero}
                to={`/coran/sourates/${s.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-card border border-line shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-green dark:hover:border-green transition-all"
              >
                <span className="shrink-0 w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-800 text-green-deep dark:text-muted flex items-center justify-center font-bold">
                  {s.numero}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-green-deep dark:text-muted font-display group-hover:text-green dark:group-hover:text-green-deep">{s.nom}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {[s.revelation, s.nb_versets ? `${s.nb_versets} versets` : null].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${s.a_du_contenu ? 'bg-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {s.a_du_contenu ? 'Exégèse' : 'À venir'}
                </span>
              </Link>
            ))}
          </div>
        )}
        <p className="text-center text-sm text-gray-400 mt-8 flex items-center justify-center gap-1.5">
          <BookOpen className="h-4 w-4" /> D'autres sourates seront ajoutées progressivement.
        </p>
      </main>
    </div>
  );
};

export default SouratesIndex;
