import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { Lightbox } from '../components/Lightbox';
import { BadgeGeneration, honorificFor } from '../components/BadgeGeneration';
import { EcoleBadge } from '../components/EcoleBadge';
import { useSeo } from '../hooks/useSeo';
import type { ParoleDetail } from '../types';

export const ParolePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [p, setP] = useState<ParoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [zoom, setZoom] = useState(false);

  useSeo({
    title: p ? (p.sujet || `Parole de ${p.savant}`) : 'Parole',
    description: p?.texte_francais || (p ? `Parole de ${p.savant}.` : undefined),
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getParole(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setP(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (notFound || !p) {
    return (
      <div className="min-h-screen bg-ground grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-green-deep mb-2">Parole introuvable</h1>
          <Link to="/paroles" className="text-green font-medium hover:underline">Toutes les paroles</Link>
        </div>
      </div>
    );
  }

  const reference = [p.source_livre, p.page ? `p. ${p.page}` : ''].filter(Boolean).join(' — ');

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-3xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/paroles" className="hover:text-green-deep">Paroles</Link>
          {p.savant && <> <span aria-hidden>·</span> {p.savant}</>}
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Parole de savant</p>
        {p.sujet && <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{p.sujet}</h1>}

        {/* Savant : lien + honorifique + badge + école */}
        <div className="flex items-center gap-2.5 flex-wrap mt-2.5">
          {p.savant && (p.savant_slug ? (
            <Link to={`/savants/${p.savant_slug}`} className="font-display font-semibold text-lg text-green-deep hover:underline">{p.savant}</Link>
          ) : (
            <span className="font-display font-semibold text-lg text-green-deep">{p.savant}</span>
          ))}
          {honorificFor(p.generation) && (
            <span className="font-arabic-name font-medium text-ink" lang="ar" dir="rtl">{honorificFor(p.generation)}</span>
          )}
          <BadgeGeneration generation={p.generation} />
          {p.ecole && <EcoleBadge ecole={p.ecole} />}
        </div>

        {/* Texte */}
        <div className="rounded-panel border border-line bg-surface p-6 sm:p-7 mt-5 shadow-card">
          {p.texte_arabe && (
            <p className="font-arabic text-3xl leading-loose text-right text-ink whitespace-pre-wrap" dir="rtl" lang="ar">{p.texte_arabe}</p>
          )}
          {p.phonetique && (
            <p className="text-sm text-muted italic mt-4 [unicode-bidi:plaintext]">{p.phonetique}</p>
          )}
          {p.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-gold [unicode-bidi:plaintext]">
              <Markdown>{p.texte_francais}</Markdown>
            </div>
          )}
          {reference && (
            <p className="text-xs uppercase tracking-[0.05em] text-gold font-semibold mt-4">{reference}</p>
          )}
        </div>

        {/* Explication */}
        {p.explication && (
          <section className="mt-6">
            <h2 className="font-display font-semibold text-green-deep text-lg mb-2">Explication</h2>
            <div className="rounded-card border border-line bg-surface p-5"><Markdown>{p.explication}</Markdown></div>
          </section>
        )}

        {/* Scan du livre */}
        {p.image_url && (
          <section className="mt-6">
            <h2 className="font-display font-semibold text-green-deep text-lg mb-2">Scan du livre</h2>
            <button
              onClick={() => setZoom(true)}
              className="block rounded-card border border-line overflow-hidden hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              aria-label="Agrandir le scan du livre"
            >
              <img
                src={p.image_url}
                alt={`Scan du livre${p.source_livre ? ` — ${p.source_livre}` : ''}${p.page ? `, p. ${p.page}` : ''}`}
                loading="lazy"
                className="max-h-[420px] w-auto object-contain bg-white"
              />
            </button>
          </section>
        )}

        <div className="mt-8">
          <Link to="/paroles" className="inline-flex items-center gap-1.5 text-green font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Toutes les paroles
          </Link>
        </div>
      </main>

      <Lightbox
        image={zoom && p.image_url ? { image_url: p.image_url, alt: `Scan — ${p.source_livre || p.sujet || p.savant}`, legende: p.source_livre, source_livre: reference || null } : null}
        onClose={() => setZoom(false)}
      />
    </div>
  );
};

export default ParolePage;
