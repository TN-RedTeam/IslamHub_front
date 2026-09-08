import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader, Copy, Check, Share2, Star, BookOpen, ArrowLeft, Quote } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import { SavantHover } from '../components/SavantHover';
import type { DossierData, DossierPreuve } from '../types';
import { IconBadge } from '../components/Icon';

const FAV_KEY = 'islamhub:favoris:dossiers';

function readFavoris(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
}

// Référence lisible d'une preuve (recueils + authenticité, savant, sourate…).
function refLine(p: DossierPreuve): string {
  const r = p.ref;
  if (!r) return '';
  if (p.type === 'hadith') {
    const parts: string[] = [];
    if (r.recueils) parts.push(`Rapporté par ${r.recueils}`);
    if (r.degre_authenticite) parts.push(`Authenticité : ${r.degre_authenticite}${r.juge_par ? ` (${r.juge_par})` : ''}`);
    if (r.type_hadith) parts.push(r.type_hadith);
    return parts.join(' — ');
  }
  if (p.type === 'parole') return [r.savant, r.ecole].filter(Boolean).join(' — ');
  if (p.type === 'verset') return r.sourate ? `Sourate ${r.sourate}` : '';
  return '';
}

const TYPE_LABEL: Record<DossierPreuve['type'], string> = {
  verset: 'Verset', hadith: 'Hadith', parole: 'Parole de savant',
};

export const DossierThematique: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<DossierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useSeo({
    title: data?.dossier.meta_title || data?.dossier.h1,
    description: data?.dossier.meta_description || undefined,
  });

  useEffect(() => {
    let alive = true;
    setIsLoading(true); setError(null);
    dataService.getDossier(slug)
      .then((d) => { if (alive) { setData(d); setIsLoading(false); } })
      .catch(() => { if (alive) { setError('Erreur lors du chargement du dossier.'); setIsLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => { setIsFav(readFavoris().includes(slug)); }, [slug]);

  // JSON-LD FAQPage pour le SEO (question = titre, réponse = résumé).
  useEffect(() => {
    if (!data) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'dossier-jsonld';
    el.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [{
        '@type': 'Question',
        name: data.dossier.meta_title || data.dossier.h1,
        acceptedAnswer: { '@type': 'Answer', text: (data.dossier.reponse_texte || '').slice(0, 500) },
      }],
    });
    document.getElementById('dossier-jsonld')?.remove();
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [data]);

  const toggleFav = () => {
    const cur = readFavoris();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setIsFav(next.includes(slug));
  };

  // Texte « format débat » : chaque preuve en AR — « traduction » — réf.
  const debateText = useMemo(() => {
    if (!data) return '';
    const blocks = data.preuves.map((p) => {
      const r = p.ref; if (!r) return '';
      const line = [r.texte_arabe, r.texte_francais ? `« ${r.texte_francais} »` : '', refLine(p)]
        .filter(Boolean).join('\n');
      return line;
    }).filter(Boolean);
    return `${data.dossier.h1}\n\n${blocks.join('\n\n')}`;
  }, [data]);

  const copyDebate = async () => {
    try { await navigator.clipboard.writeText(debateText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  const share = async () => {
    const url = window.location.href;
    const title = data?.dossier.h1 || 'IslamHub';
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* annulé */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <Loader className="h-12 w-12 text-green animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-card shadow-card">
          <IconBadge name="folder" />
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-display">Dossier introuvable</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "Ce dossier n'existe pas ou n'est pas encore publié."}</p>
          <Link to="/" className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors">Accueil</Link>
        </div>
      </div>
    );
  }

  const { dossier, preuves, images, lies } = data;

  return (
    <div className="min-h-screen bg-ground">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-ivory border-b border-line py-10">
        
        
        <div className="relative container mx-auto px-4 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-muted hover:text-green-deep text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-green-deep font-display">{dossier.h1}</h1>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={copyDebate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-line text-green hover:bg-green-soft dark:hover:bg-emerald-900/40 transition-colors">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copier (format débat)
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-line text-green hover:bg-green-soft dark:hover:bg-emerald-900/40 transition-colors">
            <Share2 className="h-4 w-4" /> Partager
          </button>
          <button onClick={toggleFav} aria-pressed={isFav} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isFav ? 'bg-gold border-green-line text-white' : 'bg-white dark:bg-gray-800 border-line text-green hover:bg-green-soft dark:hover:bg-emerald-900/40'}`}>
            <Star className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} /> {isFav ? 'Favori' : 'Ajouter aux favoris'}
          </button>
        </div>

        {/* ① La croyance */}
        {dossier.croyance_texte && (
          <section className="bg-green-soft border border-line rounded-card p-6">
            <h2 className="text-lg font-bold text-green-deep mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> La croyance
            </h2>
            <Markdown>{dossier.croyance_texte}</Markdown>
          </section>
        )}

        {/* ② Les preuves */}
        {preuves.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-deep mb-4">Les preuves</h2>
            <div className="space-y-4">
              {preuves.map((p) => p.ref && (
                <article key={`${p.type}-${p.id}`} className="bg-white dark:bg-gray-800 rounded-card p-5 shadow border border-green-line dark:border-emerald-900">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-green">{TYPE_LABEL[p.type]}</span>
                    {p.ref.sujet && <span className="text-sm text-gray-500 dark:text-gray-400 font-display">{p.ref.sujet}</span>}
                  </div>
                  {p.ref.texte_arabe && (
                    <p className="text-2xl leading-loose text-right font-arabic text-gray-900 dark:text-white whitespace-pre-wrap mb-3">{p.ref.texte_arabe}</p>
                  )}
                  {p.ref.texte_francais && (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext] mb-3">« {p.ref.texte_francais} »</p>
                  )}
                  {p.type === 'parole' && p.ref.savant && (
                    <p className="text-sm">
                      <SavantHover nom={p.ref.savant} className="text-green hover:underline" />
                      {p.ref.ecole ? ` — ${p.ref.ecole}` : ''}
                    </p>
                  )}
                  {refLine(p) && p.type !== 'parole' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">{refLine(p)}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ③ L'argument avancé (objection citée, non endossée) */}
        {dossier.objection_texte && (
          <section className="bg-green-soft border-l-4 border-green-line rounded-r-2xl p-6">
            <h2 className="text-lg font-bold text-green-deep mb-3 flex items-center gap-2">
              <Quote className="h-5 w-5" /> L'argument avancé
            </h2>
            <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap [unicode-bidi:plaintext]">{dossier.objection_texte}</p>
          </section>
        )}

        {/* ④ La réponse */}
        {dossier.reponse_texte && (
          <section className="bg-white dark:bg-gray-800 border border-line rounded-card p-6">
            <h2 className="text-lg font-bold text-green-deep mb-3">La réponse</h2>
            <Markdown>{dossier.reponse_texte}</Markdown>
          </section>
        )}

        {/* Images de pages de livres */}
        {images.length > 0 && (
          <section className="grid sm:grid-cols-2 gap-4">
            {images.map((img) => (
              <figure key={img.id} className="bg-white dark:bg-gray-800 rounded-card overflow-hidden shadow border border-green-line dark:border-emerald-900">
                <img src={img.image_url} alt={img.alt} loading="lazy" className="w-full" />
                {(img.legende || img.source_livre) && (
                  <figcaption className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    {img.legende}{img.source_livre ? ` — ${img.source_livre}` : ''}
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        )}

        {/* Voir aussi */}
        {lies.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-green-deep mb-3">Voir aussi</h2>
            <ul className="space-y-2">
              {lies.map((l) => (
                <li key={l.slug}>
                  <Link to={`/dossiers/${l.slug}`} className="text-green hover:underline">{l.h1}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-10 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-green-deep font-display">« Rien n'est tel que Lui »</p>
        </div>
      </footer>
    </div>
  );
};

export default DossierThematique;
