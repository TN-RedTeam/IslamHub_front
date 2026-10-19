import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UI } from '../strings';

export interface HeroSlide {
  key: string;
  eyebrow: string;       // ex. « Verset du jour »
  eyebrowAr?: string;    // ex. « آية اليوم »
  arabic?: string | null;
  translation?: string | null;
  source?: string | null;
  to?: string | null;    // lien vers la fiche (facultatif)
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Carrousel de texte du hero (Phase 14 A.1) — superposé à l'image (intacte).
 * Alterne en FONDU (opacity) entre verset / hadith / parole. Rotation
 * déterministe par date au 1er affichage, puis cycle (~6 s). Puces cliquables.
 * prefers-reduced-motion : pas de rotation ni de fondu (1er élément statique).
 * On anime le TEXTE, jamais la photo.
 */
export const HeroCarousel: React.FC<{ slides: HeroSlide[]; startIndex?: number }> = ({ slides, startIndex = 0 }) => {
  const n = slides.length;
  const reduced = prefersReduced();
  const [active, setActive] = useState(() => (n ? startIndex % n : 0));
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (reduced || n <= 1) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % n), 6000);
    return () => clearInterval(timer.current);
  }, [n, reduced]);

  const goTo = (i: number) => { setActive(i); if (timer.current) clearInterval(timer.current); };

  if (n === 0) return null;
  const cur = slides[active];

  const Body = (
    <>
      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#7fe9d8] [text-shadow:0_1px_10px_rgba(0,0,0,.7)]">
        {cur.eyebrowAr ? <span lang="ar" className="ml-1">{cur.eyebrowAr} · </span> : null}{cur.eyebrow}
      </p>
      {cur.arabic && (
        <p className="font-arabic-display text-white [text-shadow:0_2px_16px_rgba(0,0,0,.7)] max-w-2xl mx-auto" lang="ar" dir="rtl" style={{ fontSize: 'clamp(23px,3vw,32px)', lineHeight: 1.7 }}>{cur.arabic}</p>
      )}
      {(cur.translation || cur.source) && (
        <p className="mt-2.5 max-w-xl mx-auto text-[14px] font-medium text-[#f3f6f4] [text-shadow:0_1px_10px_rgba(0,0,0,.6)]">
          {cur.translation && <>«&nbsp;{cur.translation}&nbsp;»</>}{cur.source ? <span className="text-[#cfe7df]"> — {cur.source}</span> : ''}
        </p>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center">
      {/* zone de texte : les slides sont empilées en absolu pour un fondu propre ;
          une slide « fantôme » en flux fixe la hauteur. */}
      <div className="relative w-full">
        <div className="invisible" aria-hidden="true">{Body}</div>
        <div className="absolute inset-0 flex items-end justify-center">
          {reduced ? (
            <div className="w-full text-center">{cur.to ? <Link to={cur.to} className="block">{Body}</Link> : Body}</div>
          ) : (
            slides.map((s, i) => (
              <div key={s.key}
                className={`absolute inset-0 flex flex-col items-center justify-end text-center transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={i === active ? undefined : true}>
                {s.to ? <Link to={s.to} className="block w-full">{i === active ? Body : null}</Link> : (i === active ? Body : null)}
              </div>
            ))
          )}
        </div>
      </div>

      {n > 1 && (
        <div className="mt-3.5 flex items-center gap-2" role="tablist" aria-label="Contenus du jour">
          {slides.map((s, i) => (
            <button key={s.key} type="button" role="tab" aria-selected={i === active}
              aria-label={`${UI.hero.goTo} : ${s.eyebrow}`} onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${i === active ? 'w-6 bg-[#7fe9d8]' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
