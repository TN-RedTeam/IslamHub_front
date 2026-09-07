import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Loader, Copy, Check, Share2, Star, BookOpen, ArrowLeft, Quote } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { usePageTitle } from '../hooks/usePageTitle';
import { slugify } from '../utils/slug';
import type { DossierData, DossierPreuve } from '../types';

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

  usePageTitle(data?.dossier.meta_title || data?.dossier.h1 || 'Dossier');

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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center">
        <Loader className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">📁</div>
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 font-amiri">Dossier introuvable</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "Ce dossier n'existe pas ou n'est pas encore publié."}</p>
          <Link to="/" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Accueil</Link>
        </div>
      </div>
    );
  }

  const { dossier, preuves, images, lies } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      <m.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative py-16 bg-emerald-800 dark:bg-emerald-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
        <div className="relative container mx-auto px-4 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-amiri">{dossier.h1}</h1>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-10 -mt-10 relative z-10 max-w-4xl space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={copyDebate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copier (format débat)
          </button>
          <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors">
            <Share2 className="h-4 w-4" /> Partager
          </button>
          <button onClick={toggleFav} aria-pressed={isFav} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${isFav ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'}`}>
            <Star className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} /> {isFav ? 'Favori' : 'Ajouter aux favoris'}
          </button>
        </div>

        {/* ① La croyance */}
        {dossier.croyance_texte && (
          <section className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> La croyance
            </h2>
            <Markdown>{dossier.croyance_texte}</Markdown>
          </section>
        )}

        {/* ② Les preuves */}
        {preuves.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-4">Les preuves</h2>
            <div className="space-y-4">
              {preuves.map((p) => p.ref && (
                <article key={`${p.type}-${p.id}`} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-amber-100 dark:border-emerald-900">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{TYPE_LABEL[p.type]}</span>
                    {p.ref.sujet && <span className="text-sm text-gray-500 dark:text-gray-400 font-amiri">{p.ref.sujet}</span>}
                  </div>
                  {p.ref.texte_arabe && (
                    <p className="text-2xl leading-loose text-right font-arabic text-gray-900 dark:text-white whitespace-pre-wrap mb-3">{p.ref.texte_arabe}</p>
                  )}
                  {p.ref.texte_francais && (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap [unicode-bidi:plaintext] mb-3">« {p.ref.texte_francais} »</p>
                  )}
                  {p.type === 'parole' && p.ref.savant && (
                    <Link to={`/savants/${slugify(p.ref.savant)}`} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                      {p.ref.savant}{p.ref.ecole ? ` — ${p.ref.ecole}` : ''}
                    </Link>
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
          <section className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-2xl p-6">
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
              <Quote className="h-5 w-5" /> L'argument avancé
            </h2>
            <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-wrap [unicode-bidi:plaintext]">{dossier.objection_texte}</p>
          </section>
        )}

        {/* ④ La réponse */}
        {dossier.reponse_texte && (
          <section className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">La réponse</h2>
            <Markdown>{dossier.reponse_texte}</Markdown>
          </section>
        )}

        {/* Images de pages de livres */}
        {images.length > 0 && (
          <section className="grid sm:grid-cols-2 gap-4">
            {images.map((img) => (
              <figure key={img.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow border border-amber-100 dark:border-emerald-900">
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
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Voir aussi</h2>
            <ul className="space-y-2">
              {lies.map((l) => (
                <li key={l.slug}>
                  <Link to={`/dossiers/${l.slug}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{l.h1}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-10 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 font-amiri">« Rien n'est tel que Lui »</p>
        </div>
      </footer>
    </div>
  );
};

export default DossierThematique;
