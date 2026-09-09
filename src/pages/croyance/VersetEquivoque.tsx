import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Copy, Check, Share2, Star, ChevronRight, BookOpen } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { Markdown } from '../../components/Markdown';
import { Lightbox, type LightboxImage } from '../../components/Lightbox';
import { useSeo } from '../../hooks/useSeo';
import type { VersetEquivoqueDetail, VersetPreuve } from '../../types';

const FAV_KEY = 'islamhub:versets-favoris';
const readFavs = (): string[] => { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; } };

// Bloc « preuve » (Coran libre, ou hadith/parole résolus).
const Proof: React.FC<{ p: VersetPreuve }> = ({ p }) => (
  <div className="rounded-xl border border-line bg-surface p-5 mt-3">
    {p.texte_arabe && <p className="font-arabic text-[22px] leading-[1.95] text-right text-ink" lang="ar" dir="rtl">{p.texte_arabe}</p>}
    {p.contenu_libre && !p.texte_arabe && <p className="font-arabic text-[22px] leading-[1.95] text-right text-ink" lang="ar" dir="rtl">{p.contenu_libre}</p>}
    {p.texte_francais && <p className="text-[15px] text-ink mt-2.5 pl-3.5 border-l-2 border-gold">{p.texte_francais}</p>}
    {(p.sujet || p.degre) && (
      <p className="text-xs uppercase tracking-wide text-muted mt-2.5">
        {p.sujet}{p.degre ? ` — ${p.degre}` : ''}
      </p>
    )}
  </div>
);

export const VersetEquivoque: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<VersetEquivoqueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [box, setBox] = useState<LightboxImage | null>(null);

  const v = data?.verset;
  const title = v ? `Le sens de « ${v.theme} »` : 'Verset équivoque';

  useSeo({ title, description: v?.sens_juste || undefined });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getVersetEquivoque(slug)
      .then((d) => { if (!alive) return; if (!d || !d.verset) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => { setIsFav(readFavs().includes(slug)); }, [slug]);

  // JSON-LD FAQPage (retiré au démontage).
  useEffect(() => {
    if (!v) return;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [{
        '@type': 'Question', name: title,
        acceptedAnswer: { '@type': 'Answer', text: (v.sens_juste || '').replace(/[*_>#`]/g, '').slice(0, 500) },
      }],
    });
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [v, title]);

  const preuves = data?.preuves ?? [];
  const coran = preuves.filter((p) => p.type === 'coran');
  const hadith = preuves.filter((p) => p.type === 'hadith');
  const paroles = preuves.filter((p) => p.type === 'parole');
  const images = data?.images ?? [];

  // Sections présentes (pour le sommaire ancré).
  const sections = useMemo(() => {
    if (!v) return [] as { id: string; label: string }[];
    const s: { id: string; label: string }[] = [];
    if (v.sens_juste) s.push({ id: 'sens', label: 'Le sens juste' });
    if (coran.length) s.push({ id: 'coran', label: 'Preuve du Coran' });
    if (hadith.length) s.push({ id: 'sunna', label: 'Preuve de la Sunna' });
    if (paroles.length) s.push({ id: 'savants', label: 'Paroles des savants' });
    if (v.objection) s.push({ id: 'objection', label: "L'interprétation erronée" });
    if (v.reponse) s.push({ id: 'reponse', label: 'La réponse' });
    return s;
  }, [v, coran.length, hadith.length, paroles.length]);

  const toggleFav = () => {
    const favs = readFavs();
    const next = favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug];
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setIsFav(next.includes(slug));
  };

  const copyDebate = async () => {
    if (!v) return;
    const ref = `${v.sourate}${v.ayah != null ? ` : ${v.ayah}` : ''}`;
    const firstSavant = paroles.find((p) => p.savant)?.savant;
    const txt = [v.verset_arabe, v.verset_traduction ? `« ${v.verset_traduction} »` : '', ref, firstSavant]
      .filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* annulé */ }
  };

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (notFound || !v) {
    return (
      <div className="min-h-screen bg-ground grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-green-deep mb-2">Verset introuvable</h1>
          <Link to="/croyance/versets-equivoques" className="text-green font-medium hover:underline">Tous les versets équivoques</Link>
        </div>
      </div>
    );
  }

  const num = (id: string) => sections.findIndex((s) => s.id === id) + 1;
  const H2: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
    <h2 id={id} className="font-display font-semibold text-green-deep text-[23px] mb-3 flex items-center gap-2.5" style={{ scrollMarginTop: 20 }}>
      <span className="w-[26px] h-[26px] rounded-full bg-green-soft text-green grid place-items-center text-sm shrink-0 font-display">{num(id)}</span>
      {children}
    </h2>
  );

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-6 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/croyance" className="hover:text-green-deep">Croyance</Link> <span aria-hidden>·</span>{' '}
          <Link to="/croyance/versets-equivoques" className="hover:text-green-deep">Versets équivoques</Link>
        </nav>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">{v.theme}</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{title}</h1>

        {/* Verset */}
        <div className="rounded-panel border border-line bg-surface p-6 sm:p-7 mt-4 text-center shadow-card">
          <p className="font-arabic text-green-deep leading-[2]" dir="rtl" lang="ar" style={{ fontSize: 'clamp(26px,4.4vw,38px)' }}>{v.verset_arabe}</p>
          {v.verset_traduction && <p className="text-[17px] text-ink mt-3.5">{v.verset_traduction}</p>}
          {v.verset_phonetique && <p className="text-[13px] text-muted italic mt-1.5 [unicode-bidi:plaintext]">{v.verset_phonetique}</p>}
          <p className="text-xs uppercase tracking-[0.06em] text-gold font-semibold mt-3">{v.sourate}{v.ayah != null ? ` · ${v.ayah}` : ''}</p>
        </div>

        {/* Sommaire + contenu */}
        <div className="grid grid-cols-1 min-[860px]:grid-cols-[210px_1fr] gap-7 mt-5">
          {sections.length > 0 && (
            <nav aria-label="Sommaire" className="self-start min-[860px]:sticky min-[860px]:top-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">Sur cette page</p>
              <ol className="list-none m-0 p-0">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg text-sm text-ink hover:bg-green-soft hover:text-green-deep">
                      <span className="font-display font-semibold text-gold text-[13px]">{i + 1}</span>{s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div>
            {v.sens_juste && (
              <section className="mb-8"><H2 id="sens">Le sens juste</H2><Markdown>{v.sens_juste}</Markdown></section>
            )}

            {coran.length > 0 && (
              <section className="mb-8"><H2 id="coran">Preuve du Coran</H2>{coran.map((p) => <Proof key={p.id} p={p} />)}</section>
            )}

            {hadith.length > 0 && (
              <section className="mb-8"><H2 id="sunna">Preuve de la Sunna</H2>{hadith.map((p) => <Proof key={p.id} p={p} />)}</section>
            )}

            {paroles.length > 0 && (
              <section className="mb-8">
                <H2 id="savants">Paroles des savants</H2>
                {paroles.slice(0, 2).map((p) => <SavantQuote key={p.id} p={p} />)}
                {paroles.length > 2 && (
                  <details className="mt-3 border-t border-dashed border-line pt-3">
                    <summary className="cursor-pointer font-semibold text-green text-sm list-none flex items-center gap-1.5">
                      <ChevronRight className="w-4 h-4" /> Voir les {paroles.length - 2} autres paroles
                    </summary>
                    {paroles.slice(2).map((p) => <SavantQuote key={p.id} p={p} />)}
                  </details>
                )}
                {images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setBox(img)}
                        className="flex items-center gap-3 bg-green-soft border border-dashed border-green-line rounded-lg p-3 text-left hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                      >
                        <span className="w-[52px] h-16 rounded bg-surface border border-line grid place-items-center text-muted shrink-0 overflow-hidden">
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </span>
                        <span className="text-[13px] text-muted">
                          <b className="text-ink block">{img.legende || 'Scan du livre'}</b>
                          {img.source_livre}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {v.objection && (
              <section className="mb-8">
                <H2 id="objection">L'interprétation erronée</H2>
                <div className="rounded-r-xl border border-line border-l-[3px] border-l-gold bg-gold-soft p-4"><div className="italic"><Markdown>{v.objection}</Markdown></div></div>
              </section>
            )}

            {v.reponse && (
              <section className="mb-8"><H2 id="reponse">La réponse</H2><Markdown>{v.reponse}</Markdown></section>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 mt-7 pt-5 border-t border-line">
              <button onClick={copyDebate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green text-white text-sm font-medium hover:bg-green-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copier (format débat)
              </button>
              <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-line bg-surface text-green-deep text-sm hover:bg-green-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
                <Share2 className="w-4 h-4" /> Partager
              </button>
              <button onClick={toggleFav} aria-pressed={isFav} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${isFav ? 'bg-gold text-white border-gold' : 'border-green-line bg-surface text-green-deep hover:bg-green-soft'}`}>
                <Star className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} /> {isFav ? 'Favori' : 'Ajouter aux favoris'}
              </button>
            </div>

            {/* Voir aussi */}
            {data && data.lies.length > 0 && (
              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2">Voir aussi</p>
                {data.lies.map((l) => (
                  <Link key={l.slug} to={`/croyance/versets-equivoques/${l.slug}`} className="inline-block mr-2 mb-2 text-[13.5px] text-green-deep bg-green-soft border border-green-line px-3.5 py-1.5 rounded-full hover:border-green transition-colors">
                    {l.theme} — {l.sourate}{l.ayah != null ? ` : ${l.ayah}` : ''}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Lightbox image={box} onClose={() => setBox(null)} />
    </div>
  );
};

// Parole de savant : nom → lien fiche savant, texte AR/FR, source.
const SavantQuote: React.FC<{ p: VersetPreuve }> = ({ p }) => (
  <div className="rounded-xl border border-line bg-surface p-5 mt-3">
    <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
      <BookOpen className="w-4 h-4 text-green shrink-0" aria-hidden="true" />
      {p.savant_slug ? (
        <Link to={`/savants/${p.savant_slug}`} className="font-display font-semibold text-[17px] text-green-deep hover:underline">{p.savant}</Link>
      ) : (
        <span className="font-display font-semibold text-[17px] text-green-deep">{p.savant}</span>
      )}
      {p.ecole && <span className="text-[11px] font-medium text-green-deep bg-green-soft border border-green-line px-2 py-0.5 rounded-full">{p.ecole}</span>}
    </div>
    {p.texte_arabe && <p className="font-arabic text-xl leading-[1.9] text-right text-ink" lang="ar" dir="rtl">{p.texte_arabe}</p>}
    {p.texte_francais && <p className="text-[15px] text-ink mt-2.5">{p.texte_francais}</p>}
    {p.sujet && <p className="text-xs text-muted mt-2.5">{p.sujet}</p>}
  </div>
);

export default VersetEquivoque;
