import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { Lightbox, type LightboxImage } from '../components/Lightbox';
import { BadgeGeneration, honorificFor } from '../components/BadgeGeneration';
import { EcoleBadge } from '../components/EcoleBadge';
import { ThemeChips } from '../components/ThemeChips';
import { RelatedByTheme } from '../components/RelatedByTheme';
import { ArticleBlocs } from '../components/ArticleBlocs';
import { useSeo } from '../hooks/useSeo';
import type { ParoleDetail, ParoleImage, Bloc, HadithSegment } from '../types';

/** Bloc « dialogue » d'une parole (intro → arabe → phonétique → traduction → explication). */
const ParoleDialogue: React.FC<{ sg: HadithSegment }> = ({ sg }) => (
  <div className="rounded-panel border border-line bg-surface p-6 sm:p-7 shadow-card space-y-4">
    {sg.intro && <p className="text-ink/80 italic [unicode-bidi:plaintext]">{sg.intro}</p>}
    {sg.texte_arabe && <p className="font-arabic text-3xl leading-loose text-right text-ink whitespace-pre-wrap" dir="rtl" lang="ar">{sg.texte_arabe}</p>}
    {sg.phonetique && <p className="text-sm text-muted italic [unicode-bidi:plaintext]">{sg.phonetique}</p>}
    {sg.texte_francais && (
      <div className="pl-4 border-l-4 border-gold [unicode-bidi:plaintext]"><Markdown className="font-bold">{sg.texte_francais}</Markdown></div>
    )}
    {sg.explication && (
      <div className="bg-glass-tint rounded-lg p-4"><p className="text-sm font-bold text-ink mb-1">Explication :</p><Markdown className="[unicode-bidi:plaintext]">{sg.explication}</Markdown></div>
    )}
  </div>
);

export const ParolePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [p, setP] = useState<ParoleDetail | null>(null);
  const [blocs, setBlocs] = useState<Bloc[]>([]); // corps composé (parole tissée)
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [zoomed, setZoomed] = useState<LightboxImage | null>(null);

  useSeo({
    title: p ? (p.sujet || `Parole de ${p.savant}`) : 'Parole',
    description: p?.texte_francais || (p ? `Parole de ${p.savant}.` : undefined),
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false); setBlocs([]);
    dataService.getParole(slug)
      .then((d) => {
        if (!alive) return;
        if (!d) setNotFound(true);
        else { setP(d); dataService.getBlocs('parole', d.id).then((bl) => { if (alive) setBlocs(bl); }).catch(() => {}); }
        setLoading(false);
      })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (notFound || !p) {
    return (
      <div className="min-h-screen grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-ink mb-2">Parole introuvable</h1>
          <Link to="/savants/paroles" className="text-green font-medium hover:underline">Toutes les paroles</Link>
        </div>
      </div>
    );
  }

  const reference = [p.source_livre, p.page ? `p. ${p.page}` : ''].filter(Boolean).join(' — ');

  // Scans du livre : 0..N, depuis la table enfant `parole_images`.
  const scans: ParoleImage[] = p.images ?? [];

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/savants/paroles" className="hover:text-ink">Paroles</Link>
          {p.savant && <> <span aria-hidden>·</span> {p.savant}</>}
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-accent mb-1">Parole de savant{p.rubrique ? <span className="text-muted"> · {p.rubrique}</span> : null}</p>
        {p.sujet && <h1 className="font-display font-semibold text-ink leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{p.sujet}</h1>}

        {/* Savant : lien + honorifique + badge + école */}
        <div className="flex items-center gap-2.5 flex-wrap mt-2.5">
          {p.savant && (p.savant_slug ? (
            <Link to={`/savants/${p.savant_slug}`} className="font-display font-semibold text-lg text-ink hover:underline">{p.savant}</Link>
          ) : (
            <span className="font-display font-semibold text-lg text-ink">{p.savant}</span>
          ))}
          {honorificFor(p.generation) && (
            <span className="font-arabic-name font-medium text-ink" lang="ar" dir="rtl">{honorificFor(p.generation)}</span>
          )}
          <BadgeGeneration generation={p.generation} />
          {p.ecole && <EcoleBadge ecole={p.ecole} />}
        </div>

        {(p.rapporteur || p.commente || p.commente_livre) && (
          <div className="mt-2 text-sm text-muted flex flex-col gap-0.5">
            {p.rapporteur && (
              <span>Rapporté par{' '}
                <Link to={`/savants/${p.rapporteur.slug}`} className="text-ink font-medium hover:underline">{p.rapporteur.nom}</Link>
              </span>
            )}
            {p.commente && (
              <span>Commente une parole&nbsp;:{' '}
                <Link to={`/paroles/${p.commente.slug}`} className="text-green font-medium hover:underline">{p.commente.sujet} →</Link>
              </span>
            )}
            {p.commente_livre && (
              <span>Commente le livre&nbsp;: <span className="text-ink font-medium">{p.commente_livre}</span></span>
            )}
          </div>
        )}

        <ThemeChips themes={p.themes} className="mt-3" />

        {/* Texte */}
        <div className="rounded-panel border border-line bg-surface p-6 sm:p-7 mt-5 shadow-card">
          {p.intro && (
            <p className="text-ink/80 italic mb-4 [unicode-bidi:plaintext]">{p.intro}</p>
          )}
          {p.texte_arabe && (
            <p className="font-arabic text-3xl leading-loose text-right text-ink whitespace-pre-wrap" dir="rtl" lang="ar">{p.texte_arabe}</p>
          )}
          {p.phonetique && (
            <p className="text-sm text-muted italic mt-4 [unicode-bidi:plaintext]">{p.phonetique}</p>
          )}
          {p.texte_francais && (
            <div className="mt-4 pl-4 border-l-4 border-gold [unicode-bidi:plaintext]">
              <Markdown className="font-bold">{p.texte_francais}</Markdown>
            </div>
          )}
          {reference && (
            <p className="text-xs uppercase tracking-[0.05em] text-accent font-semibold mt-4">{reference}</p>
          )}
        </div>

        {/* Dialogue — suite de la parole */}
        {p.segments && p.segments.length > 0 && (
          <div className="mt-5 space-y-5">
            {p.segments.map((sg, i) => <ParoleDialogue key={i} sg={sg} />)}
          </div>
        )}

        {/* Explication */}
        {p.explication && (
          <section className="mt-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-2">Explication</h2>
            <div className="rounded-card border border-line bg-surface p-5"><Markdown>{p.explication}</Markdown></div>
          </section>
        )}

        {/* Scans du livre (0..N) */}
        {scans.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-2">
              {scans.length > 1 ? `Scans du livre (${scans.length})` : 'Scan du livre'}
            </h2>
            <div className={`grid gap-4 ${scans.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
              {scans.map((s) => (
                <figure key={s.id} className="rounded-card border border-line bg-surface overflow-hidden">
                  <button
                    onClick={() => setZoomed({ image_url: s.image_url, alt: s.alt, legende: s.legende ?? undefined, source_livre: s.source_livre ?? reference ?? undefined, source_livre_ar: s.source_livre_ar ?? undefined })}
                    className="block w-full hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                    aria-label={`Agrandir : ${s.alt}`}
                  >
                    <img
                      src={s.image_url}
                      alt={s.alt}
                      loading="lazy"
                      className="w-full max-h-[460px] object-contain bg-white"
                    />
                  </button>
                  {(s.legende || s.source_livre || s.source_livre_ar) && (
                    <figcaption className="px-3 py-2 text-sm text-muted border-t border-line">
                      {s.legende}{s.legende && s.source_livre ? ' — ' : ''}{s.source_livre}
                      {s.source_livre_ar && (
                        <span dir="rtl" lang="ar" className="block font-arabic text-base text-ink mt-0.5">{s.source_livre_ar}</span>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Corps composé (parole tissée) : narrations + versets + prose dans l'ordre */}
        {blocs.length > 0 && (
          <section className="mt-6 rounded-card border border-line bg-surface p-5">
            <ArticleBlocs blocs={blocs} />
          </section>
        )}

        <RelatedByTheme kind="parole" id={p.id} className="mt-8" />

        <div className="mt-8">
          <Link to="/savants/paroles" className="inline-flex items-center gap-1.5 text-green font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Toutes les paroles
          </Link>
        </div>
      </main>

      <Lightbox image={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
};

export default ParolePage;
