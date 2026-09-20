import { forwardRef } from 'react';
import { Markdown } from './Markdown';
import type { SourateDetail } from '../types';

type VersetT = SourateDetail['versets'][number];

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
  </article>
));
SourateVerseCard.displayName = 'SourateVerseCard';

export default SourateVerseCard;
