import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader2, ArrowLeft, Copy, Check, Share2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { BadgeGeneration } from '../components/BadgeGeneration';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import type { HadithDetail } from '../types';
import { IconBadge } from '../components/Icon';

export const HadithPage: React.FC = () => {
  const { id = '' } = useParams();
  const [hadith, setHadith] = useState<HadithDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const numId = Number(id);

  useSeo({
    title: hadith?.sujet,
    description: hadith?.texte_francais || hadith?.explication || undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    if (!Number.isFinite(numId)) { setNotFound(true); setLoading(false); return; }
    dataService.getHadith(numId)
      .then((h) => { if (!alive) return; if (!h) setNotFound(true); else setHadith(h); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [numId]);

  const reference = hadith && [
    hadith.recueils ? `Rapporté par ${hadith.recueils}` : '',
    hadith.degre_authenticite ? `Authenticité : ${hadith.degre_authenticite}${hadith.juge_par ? ` (${hadith.juge_par})` : ''}` : '',
    hadith.type_hadith || '',
  ].filter(Boolean).join(' — ');

  const copyDebate = async () => {
    if (!hadith) return;
    const txt = [hadith.texte_arabe, hadith.texte_francais ? `« ${hadith.texte_francais} »` : '', reference]
      .filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: hadith?.sujet || 'Hadith', url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* annulé */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green animate-spin" />
      </div>
    );
  }

  if (notFound || !hadith) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
          <IconBadge name="book" />
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Hadith introuvable</h1>
          <Link to="/hadiths" className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors inline-block mt-2">Tous les hadiths</Link>
        </div>
      </div>
    );
  }

  const tags = (hadith.tag || '').split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-ground">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-ivory border-b border-line py-10">
        
        
        <div className="relative container mx-auto px-4 max-w-3xl">
          <Link to="/hadiths" className="inline-flex items-center gap-1.5 text-muted hover:text-green-deep text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Tous les hadiths
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-green-deep font-display">{hadith.sujet}</h1>
          {reference && <p className="text-muted mt-2 text-sm">{reference}</p>}
          {hadith.narrateur && (
            <p className="text-muted mt-1.5 text-sm flex items-center gap-2 flex-wrap">
              Narrateur : {hadith.narrateur}
              <BadgeGeneration generation={hadith.narrateur_generation} withHonorific />
            </p>
          )}
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={copyDebate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-line text-green hover:bg-green-soft transition-colors">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copier (format débat)
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-line text-green hover:bg-green-soft transition-colors">
            <Share2 className="h-4 w-4" /> Partager
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow border border-green-line space-y-5">
          <p className="text-3xl leading-loose text-right font-arabic text-gray-900 dark:text-white whitespace-pre-wrap">{hadith.texte_arabe}</p>
          {hadith['phonétique'] && (
            <div className="bg-green-soft rounded-lg p-4">
              <p className="text-sm text-green-deep mb-1">Phonétique :</p>
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap [unicode-bidi:plaintext]">{hadith['phonétique']}</p>
            </div>
          )}
          {hadith.texte_francais && (
            <div className="pl-4 border-l-4 border-green">
              <p className="text-sm text-green mb-1">Traduction :</p>
              <Markdown className="[unicode-bidi:plaintext]">{hadith.texte_francais}</Markdown>
            </div>
          )}
          {hadith.explication && (
            <div className="bg-green-soft rounded-lg p-4">
              <p className="text-sm font-bold text-green-deep mb-1">Explication :</p>
              <Markdown className="[unicode-bidi:plaintext]">{hadith.explication}</Markdown>
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((t) => (
                <span key={t} className="text-xs bg-green-soft text-green-deep dark:text-muted px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HadithPage;
