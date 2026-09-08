import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import type { SourateDetail } from '../types';

export const SouratePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<SourateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({
    title: data ? `Sourate ${data.sourate.nom} — exégèse` : 'Sourate',
    description: data ? `Exégèse de la sourate ${data.sourate.nom} (${data.sourate.revelation ?? ''}).` : undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getSourate(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Sourate introuvable</h1>
          <Link to="/coran/sourates" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-block mt-2">Toutes les sourates</Link>
        </div>
      </div>
    );
  }

  const { sourate, versets } = data;

  return (
    <div className="min-h-screen bg-ground">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative py-16 bg-emerald-800 dark:bg-emerald-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
        <div className="relative container mx-auto px-4 max-w-3xl text-center">
          <Link to="/coran/sourates" className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Toutes les sourates
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
            {sourate.numero}. {sourate.nom}
          </h1>
          {sourate.nom_arabe && <p className="text-2xl text-emerald-100 font-arabic mt-2">{sourate.nom_arabe}</p>}
          <p className="text-emerald-200 mt-2 text-sm">
            {[sourate.revelation, sourate.nb_versets ? `${sourate.nb_versets} versets` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 -mt-10 relative z-10 max-w-3xl space-y-6">
        {versets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-card shadow border border-line">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-emerald-500 opacity-70" />
            <p className="text-gray-500 dark:text-gray-400">Le texte et l'exégèse de cette sourate seront bientôt disponibles.</p>
          </div>
        ) : (
          versets.map((v) => (
            <article key={v.numero} className="bg-white dark:bg-gray-800 rounded-card p-6 shadow border border-amber-100 dark:border-emerald-900">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-sm font-bold shrink-0">{v.numero}</span>
              </div>
              {v.texte_arabe && (
                <p className="text-3xl leading-loose text-right font-arabic text-gray-900 dark:text-white whitespace-pre-wrap">{v.texte_arabe}</p>
              )}
              {v.phonetique && (
                <p className="text-gray-600 dark:text-gray-300 italic mt-3 whitespace-pre-wrap [unicode-bidi:plaintext]">{v.phonetique}</p>
              )}
              {v.texte_francais && (
                <div className="mt-3 pl-4 border-l-4 border-emerald-500">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext]">{v.texte_francais}</p>
                </div>
              )}
              {v.exegeses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {v.exegeses.map((e, i) => (
                    <div key={i} className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">Exégèse{e.source ? ` — ${e.source}` : ''}</p>
                      <Markdown>{e.texte}</Markdown>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </main>
    </div>
  );
};

export default SouratePage;
