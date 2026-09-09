import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader2, ArrowLeft, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { EcoleBadge } from '../components/EcoleBadge';
import { BadgeGeneration, honorificFor } from '../components/BadgeGeneration';
import { useSeo } from '../hooks/useSeo';
import type { SavantDetail } from '../types';
import { IconBadge } from '../components/Icon';

export const SavantPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<SavantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({
    title: data?.savant.nom,
    description: data?.savant.biographie || (data ? `Biographie et paroles de ${data.savant.nom}.` : undefined),
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getSavantBySlug(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
          <IconBadge name="user" />
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Savant introuvable</h1>
          <Link to="/savants" className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors inline-block mt-2">Tous les savants</Link>
        </div>
      </div>
    );
  }

  const { savant, paroles, hadiths_juges } = data;

  return (
    <div className="min-h-screen bg-ground">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-ivory border-b border-line py-10">
        
        
        <div className="relative container mx-auto px-4 max-w-4xl">
          <Link to="/savants" className="inline-flex items-center gap-1.5 text-muted hover:text-green-deep text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Tous les savants
          </Link>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">{savant.nom}</h1>
            {honorificFor(savant.generation) && (
              <span className="font-arabic text-muted text-lg" lang="ar" dir="rtl">{honorificFor(savant.generation)}</span>
            )}
          </div>
          {savant.nom_arabe && (
            <p dir="rtl" lang="ar" className="font-arabic text-2xl text-green-deep mt-1 [unicode-bidi:plaintext]">{savant.nom_arabe}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {[savant.naissance, savant.deces].filter(Boolean).length > 0 && (
              <span className="text-muted text-sm tabular-nums">
                {[savant.naissance, savant.deces].filter(Boolean).join(' – ')}
              </span>
            )}
            {savant.ecole && <EcoleBadge ecole={savant.ecole} />}
            <BadgeGeneration generation={savant.generation} />
          </div>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        {savant.biographie && (
          <section className="bg-white dark:bg-gray-800 rounded-card p-6 shadow border border-line">
            <Markdown>{savant.biographie}</Markdown>
          </section>
        )}

        {paroles.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-deep mb-4 flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5" /> Ses paroles ({paroles.length})
            </h2>
            <div className="space-y-4">
              {paroles.map((p) => (
                <article key={p.id} className="bg-white dark:bg-gray-800 rounded-card p-5 shadow border border-green-line">
                  {p.sujet && <h3 className="font-bold text-green-deep font-display mb-2">{p.sujet}</h3>}
                  {p.texte_arabe && (
                    <p className="text-2xl leading-loose text-right font-arabic text-gray-900 dark:text-white whitespace-pre-wrap mb-3">{p.texte_arabe}</p>
                  )}
                  {p.texte_francais && (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext] mb-2">« {p.texte_francais} »</p>
                  )}
                  {p.explication && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <Markdown>{p.explication}</Markdown>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {hadiths_juges.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-deep mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Hadiths qu'il a authentifiés ({hadiths_juges.length})
            </h2>
            <ul className="space-y-2">
              {hadiths_juges.map((h) => (
                <li key={h.id} className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-green-line flex items-center justify-between gap-3">
                  <span className="text-gray-800 dark:text-gray-200 font-display">{h.sujet}</span>
                  {h.degre_authenticite && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-soft text-green-deep dark:text-muted shrink-0">{h.degre_authenticite}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {paroles.length === 0 && hadiths_juges.length === 0 && !savant.biographie && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">Fiche en cours de rédaction.</p>
        )}
      </main>
    </div>
  );
};

export default SavantPage;
