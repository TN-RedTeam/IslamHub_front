import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import type { SourateDetail } from '../types';
import { IconBadge } from '../components/Icon';

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
      {/* En-tête resserré, aligné sur le corps, enrichi */}
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

          {/* Commentaire / introduction — dans l'en-tête, près du nom (masqué si vide) */}
          {sourate.introduction_md && (
            <div className="mt-4 border-l-[3px] border-l-gold pl-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold font-semibold mb-1">À propos de la sourate</p>
              <div className="text-ink/80 leading-relaxed text-[15px]"><Markdown>{sourate.introduction_md}</Markdown></div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        {versets.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-card shadow-card border border-line">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-green opacity-70" />
            <p className="text-muted">Le texte et l'exégèse de cette sourate seront bientôt disponibles.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versets.map((v) => (
              <details key={v.numero} className="group bg-surface border border-line rounded-card overflow-hidden">
                {/* Repliable : le verset reste visible, le détail (traduction + exégèse) s'ouvre au clic */}
                <summary className="cursor-pointer list-none px-4 py-3.5 flex items-start gap-3">
                  <ChevronRight className="w-4 h-4 text-gold shrink-0 mt-1.5 transition-transform group-open:rotate-90 motion-reduce:transition-none" />
                  <span className="shrink-0 w-7 h-7 rounded-full bg-green-soft text-green-deep grid place-items-center text-xs font-semibold tabular-nums mt-0.5">{v.numero}</span>
                  {v.texte_arabe
                    ? <span className="flex-1 min-w-0 font-arabic text-right text-ink leading-[1.9]" dir="rtl" lang="ar" style={{ fontSize: 'clamp(20px,3.6vw,25px)' }}>{v.texte_arabe}</span>
                    : <span className="flex-1 font-display font-semibold text-green-deep">Verset {v.numero}</span>}
                </summary>
                <div className="px-4 pb-4 pt-3 border-t border-line space-y-2.5">
                  {v.phonetique && <p className="text-muted italic text-sm [unicode-bidi:plaintext]">{v.phonetique}</p>}
                  {v.texte_francais && <div className="text-ink [unicode-bidi:plaintext]"><Markdown>{v.texte_francais}</Markdown></div>}
                  {v.exegeses.map((e, i) => (
                    <div key={i} className="bg-green-soft/50 border border-green-line rounded-xl p-3.5">
                      <p className="text-[12px] font-semibold text-green-deep mb-1">Exégèse{e.source ? ` — ${e.source}` : ''}</p>
                      <div className="text-ink/85"><Markdown>{e.texte}</Markdown></div>
                    </div>
                  ))}
                  {!v.texte_francais && v.exegeses.length === 0 && !v.phonetique && (
                    <p className="text-sm text-muted italic">Pas de commentaire pour ce verset.</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SouratePage;
