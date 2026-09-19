import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, BookOpen, ChevronRight, BookOpenText, ArrowDownToLine } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import { loadSuraText } from '../utils/quranText';
import type { SourateDetail } from '../types';
import { IconBadge } from '../components/Icon';

// Chiffres arabes (indo-arabes) pour les marqueurs de fin de verset ۝.
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabicNum = (n: number) => String(n).split('').map((d) => AR_DIGITS[Number(d)] ?? d).join('');

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-green-soft border border-line px-3 py-1 text-xs font-semibold text-ink/80 whitespace-nowrap">
    {children}
  </span>
);

export const SouratePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<SourateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fullText, setFullText] = useState<string[] | null>(null);
  const [fullLoading, setFullLoading] = useState(false);

  useSeo({
    title: data ? `Sourate ${data.sourate.nom} — exégèse` : 'Sourate',
    description: data ? `Exégèse de la sourate ${data.sourate.nom} (${data.sourate.revelation ?? ''}).` : undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false); setFullText(null); setFullLoading(false);
    dataService.getSourate(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  // Charge le texte complet de la sourate à la première ouverture du volet.
  const openFull = (numero: number) => {
    if (fullText !== null || fullLoading) return;
    setFullLoading(true);
    loadSuraText(numero).then((v) => setFullText(v)).finally(() => setFullLoading(false));
  };

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
        <div className="text-center max-w-md mx-auto p-8 bg-surface rounded-card shadow-card border border-line">
          <IconBadge name="book" />
          <h1 className="text-xl font-bold text-ink mb-2 font-display">Sourate introuvable</h1>
          <Link to="/coran/sourates" className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors inline-block mt-2">Toutes les sourates</Link>
        </div>
      </div>
    );
  }

  const { sourate, versets } = data;

  return (
    <div className="min-h-screen bg-ground">
      {/* 6.5 — En-tête resserré, aligné sur le corps, enrichi */}
      <header className="bg-ivory border-b border-line">
        <div className="max-w-4xl mx-auto px-4 py-7">
          <Link to="/coran/sourates" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-green-deep mb-3">
            <ArrowLeft className="h-4 w-4" /> Toutes les sourates
          </Link>
          <div className="flex items-center gap-5 flex-wrap">
            <span className="shrink-0 w-14 h-14 rounded-2xl bg-green-soft text-green-deep grid place-items-center font-display font-semibold text-2xl tabular-nums">
              {sourate.numero}
            </span>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(24px,3.4vw,32px)' }}>{sourate.nom}</h1>
              {sourate.nom_arabe && <p className="font-arabic text-gold text-2xl leading-none mt-1" dir="rtl" lang="ar">{sourate.nom_arabe}</p>}
            </div>
            <div className="flex gap-2 flex-wrap sm:ml-auto">
              {sourate.revelation && <Chip>{sourate.revelation}</Chip>}
              {sourate.ordre_revelation != null && <Chip>{sourate.ordre_revelation}ᵉ à la révélation</Chip>}
              {sourate.nb_versets != null && <Chip>{sourate.nb_versets} versets</Chip>}
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap mt-4">
            <a href="#full" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface text-green px-3.5 py-2 text-sm font-semibold hover:border-gold transition-colors">
              <BookOpenText className="w-4 h-4" /> Lire la sourate entière
            </a>
            {versets.length > 0 && (
              <a href={`#v${versets[0].numero}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface text-green px-3.5 py-2 text-sm font-semibold hover:border-gold transition-colors">
                <ArrowDownToLine className="w-4 h-4" /> Aller à l'exégèse
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* 6.1 — Introduction (masquée si vide) */}
        {sourate.introduction_md && (
          <section className="mt-5 bg-surface border border-line border-l-[3px] border-l-gold rounded-r-card p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gold font-semibold mb-1.5">À propos de la sourate</p>
            <div className="text-ink/85 leading-relaxed"><Markdown>{sourate.introduction_md}</Markdown></div>
          </section>
        )}

        {/* 6.4 / 6.6 — Lire la sourate entière (texte du muṣḥaf de Médine, chargé à l'ouverture) */}
        <details id="full" className="group mt-4 bg-surface border border-line rounded-card overflow-hidden"
          onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) openFull(sourate.numero); }}>
          <summary className="cursor-pointer list-none px-5 py-3.5 font-display font-semibold text-green-deep flex items-center gap-2.5">
            <ChevronRight className="w-4 h-4 text-gold transition-transform group-open:rotate-90 motion-reduce:transition-none" /> Lire la sourate entière
          </summary>
          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-line">
            {fullLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-green animate-spin" /></div>
            ) : fullText && fullText.length > 0 ? (
              <>
                <p className="font-arabic text-right text-ink" dir="rtl" lang="ar" style={{ fontSize: '26px', lineHeight: 2.4 }}>
                  {fullText.map((t, i) => (
                    <React.Fragment key={i}>
                      {t}{' '}
                      <span className="text-gold" style={{ fontSize: '19px' }}>{'۝'}{toArabicNum(i + 1)}</span>{' '}
                    </React.Fragment>
                  ))}
                </p>
                <p className="text-[11px] text-muted text-center mt-3">Texte ʿUthmānī (Ḥafṣ) — muṣḥaf de Médine.</p>
              </>
            ) : fullText ? (
              <p className="text-sm text-muted text-center py-2">Texte indisponible pour le moment.</p>
            ) : (
              <p className="text-sm text-muted text-center py-2">Ouvre pour afficher le texte…</p>
            )}
          </div>
        </details>
      </div>

      {/* 6.4 — Navigateur de versets (sticky sous la barre de navigation) */}
      {versets.length > 1 && (
        <nav aria-label="Aller au verset" className="sticky top-16 z-10 mt-4 bg-ground/90 backdrop-blur border-y border-line">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-muted whitespace-nowrap">Aller au verset :</span>
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
              {versets.map((v) => (
                <a key={v.numero} href={`#v${v.numero}`} className="shrink-0 w-[30px] h-[30px] grid place-items-center rounded-lg border border-line bg-surface text-ink text-[13px] tabular-nums hover:border-gold hover:text-green transition-colors">
                  {v.numero}
                </a>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* 6.3 — Versets + exégèses en accordéon */}
      <main className="max-w-4xl mx-auto px-4 pb-16 pt-2">
        {versets.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-card shadow-card border border-line mt-4">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-green opacity-70" />
            <p className="text-muted">Le texte et l'exégèse de cette sourate seront bientôt disponibles.</p>
          </div>
        ) : (
          versets.map((v) => (
            <article key={v.numero} id={`v${v.numero}`} className="mt-4 bg-surface border border-line rounded-card p-5" style={{ scrollMarginTop: '120px' }}>
              <div className="flex items-start gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-full bg-green-soft text-green-deep grid place-items-center text-xs font-semibold tabular-nums mt-1.5">{v.numero}</span>
                <div className="min-w-0 flex-1">
                  {v.texte_arabe && (
                    <p className="font-arabic text-right leading-[2] text-ink whitespace-pre-wrap" dir="rtl" lang="ar" style={{ fontSize: 'clamp(22px,4vw,27px)' }}>{v.texte_arabe}</p>
                  )}
                  {v.phonetique && <p className="text-muted italic text-sm mt-1.5 [unicode-bidi:plaintext]">{v.phonetique}</p>}
                  {v.texte_francais && (
                    <div className="text-ink mt-1.5 [unicode-bidi:plaintext]"><Markdown>{v.texte_francais}</Markdown></div>
                  )}
                </div>
              </div>

              {v.exegeses.map((e, i) => (
                <details key={i} className="group mt-3 bg-green-soft/50 border border-green-line rounded-xl overflow-hidden">
                  <summary className="cursor-pointer list-none px-4 py-2.5 flex items-center gap-2 text-[13px] font-semibold text-green-deep">
                    <ChevronRight className="w-3.5 h-3.5 text-gold transition-transform group-open:rotate-90 motion-reduce:transition-none" />
                    Exégèse
                    {e.source && <span className="ml-auto text-[11.5px] font-medium text-muted">{e.source}</span>}
                  </summary>
                  <div className="px-4 pb-3.5 text-ink/85"><Markdown>{e.texte}</Markdown></div>
                </details>
              ))}
            </article>
          ))
        )}
      </main>
    </div>
  );
};

export default SouratePage;
