import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Markdown } from './Markdown';
import type { SourateDetail } from '../types';

type VersetT = SourateDetail['versets'][number];

// Aperçu court : retire le markdown léger et tronque proprement.
const preview = (s: string | null | undefined, max = 180) => {
  const t = (s ?? '').replace(/[*_>#`]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
};

/**
 * Carte d'un verset (toujours dépliée) : n° + arabe + translittération +
 * traduction + exégèse(s) juste en dessous. Reprend exactement les classes du
 * composant existant. `forwardRef` pour le scroll / l'IntersectionObserver.
 */
export const SourateVerseCard = forwardRef<HTMLElement, { v: VersetT; pulsing?: boolean }>(({ v, pulsing }, ref) => (
  <article
    ref={ref}
    id={`v${v.numero}`}
    data-numero={v.numero}
    className={`bg-surface border rounded-card p-5 scroll-mt-[160px] lg:scroll-mt-[128px] ${pulsing ? 'pulse-gold border-gold' : 'border-line'}`}
  >
    <div className="flex items-start gap-3.5">
      <span className="shrink-0 w-7 h-7 rounded-full bg-green-soft text-green-deep grid place-items-center text-xs font-semibold tabular-nums mt-1.5">{v.numero}</span>
      <div className="min-w-0 flex-1">
        {v.texte_arabe && (
          <p className="font-arabic text-right leading-[2] text-ink whitespace-pre-wrap" dir="rtl" lang="ar" style={{ fontSize: 'clamp(22px,4vw,27px)' }}>{v.texte_arabe}</p>
        )}
        {v.phonetique && <p className="text-muted italic text-sm mt-1.5 [unicode-bidi:plaintext]">{v.phonetique}</p>}
        {v.texte_francais && <div className="text-ink mt-1.5 [unicode-bidi:plaintext]"><Markdown>{v.texte_francais}</Markdown></div>}
      </div>
    </div>
    {v.exegeses.map((e, i) => (
      <div key={i} className="bg-green-soft/50 border border-green-line rounded-xl p-3.5 mt-3">
        <p className="text-[12px] font-semibold text-green-deep mb-1">Exégèse{e.source ? ` — ${e.source}` : ''}</p>
        <div className="text-ink/85"><Markdown>{e.texte}</Markdown></div>
      </div>
    ))}

    {/* Verset équivoque : renvoi vers l'explication complète (menu dépliable). */}
    {v.equivoque && (
      <details className="group mt-3 rounded-xl border border-gold/40 bg-gold/5 overflow-hidden">
        <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:bg-gold/10 transition-colors">
          <AlertTriangle className="w-4 h-4 shrink-0 text-gold" aria-hidden />
          <span className="flex-1 min-w-0">Ce verset est équivoque — voir l'explication complète</span>
          <ChevronRight className="w-4 h-4 shrink-0 text-gold transition-transform group-open:rotate-90" aria-hidden />
        </summary>
        <div className="px-3.5 pb-3.5 pt-1 border-t border-gold/20">
          <p className="text-[13px] font-semibold text-ink mb-1">{v.equivoque.theme}</p>
          {v.equivoque.sens_juste && (
            <p className="text-[13px] text-ink/70 leading-relaxed mb-2.5">{preview(v.equivoque.sens_juste)}</p>
          )}
          <Link
            to={`/croyance/versets-hadiths-equivoques/${v.equivoque.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold text-white font-semibold px-3 py-1.5 text-[13px] hover:brightness-95 transition"
          >
            Voir l'explication complète <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </details>
    )}
  </article>
));
SourateVerseCard.displayName = 'SourateVerseCard';

export default SourateVerseCard;
