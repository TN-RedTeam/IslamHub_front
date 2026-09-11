import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { Lightbox, type LightboxImage } from '../components/Lightbox';
import { BadgeGeneration, honorificFor } from '../components/BadgeGeneration';
import { EcoleBadge } from '../components/EcoleBadge';
import { useSeo } from '../hooks/useSeo';
import type { ParoleDetail, ParoleImage } from '../types';

export const ParolePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [p, setP] = useState<ParoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [zoomed, setZoomed] = useState<LightboxImage | null>(null);

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

  // Scans : la table enfant `parole_images` (0..N) ; repli sur l'ancienne
  // colonne unique `image_url` si aucune ligne enfant n'existe encore.
  const scans: ParoleImage[] = p.images && p.images.length
    ? p.images
    : p.image_url
      ? [{ id: 0, image_url: p.image_url, legende: p.source_livre, alt: `Scan du livre${p.source_livre ? ` — ${p.source_livre}` : ''}${p.page ? `, p. ${p.page}` : ''}`, source_livre: p.source_livre, ordre: 0 }]
      : [];

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

        {/* Scans du livre (0..N) */}
        {scans.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display font-semibold text-green-deep text-lg mb-2">
              {scans.length > 1 ? `Scans du livre (${scans.length})` : 'Scan du livre'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {scans.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setZoomed({ image_url: s.image_url, alt: s.alt, legende: s.legende ?? undefined, source_livre: s.source_livre ?? reference ?? undefined })}
                  className="block rounded-card border border-line overflow-hidden hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                  aria-label={`Agrandir : ${s.alt}`}
                >
                  <img
                    src={s.image_url}
                    alt={s.alt}
                    loading="lazy"
                    className="max-h-[300px] w-auto object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <Link to="/paroles" className="inline-flex items-center gap-1.5 text-green font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Toutes les paroles
          </Link>
        </div>
      </main>

      <Lightbox image={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
};

export default ParolePage;
