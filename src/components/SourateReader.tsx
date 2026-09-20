import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { SourateVerseCard } from './SourateVerseCard';
import type { SourateDetail } from '../types';

type VersetT = SourateDetail['versets'][number];

// Aperçu texte tronqué (sidebar) : retire le markdown léger.
const strip = (s: string | null | undefined) => (s ?? '').replace(/[*_>#`]/g, '').replace(/\s+/g, ' ').trim();

// Amène un élément dans la partie visible de son conteneur défilable (sans bouger la fenêtre).
function ensureVisible(container: HTMLElement | null, item: HTMLElement | null, axis: 'x' | 'y') {
  if (!container || !item) return;
  const c = container.getBoundingClientRect();
  const r = item.getBoundingClientRect();
  if (axis === 'y') {
    if (r.top < c.top) container.scrollBy({ top: r.top - c.top - 12, behavior: 'smooth' });
    else if (r.bottom > c.bottom) container.scrollBy({ top: r.bottom - c.bottom + 12, behavior: 'smooth' });
  } else {
    if (r.left < c.left) container.scrollBy({ left: r.left - c.left - 12, behavior: 'smooth' });
    else if (r.right > c.right) container.scrollBy({ left: r.right - c.right + 12, behavior: 'smooth' });
  }
}

/**
 * Lecteur « Exégèse d'une sourate » à deux colonnes :
 *  - sommaire sticky à gauche (desktop) / bande de pastilles sticky (mobile),
 *  - tous les versets dépliés à droite,
 *  - barre sticky (compteur + progression + « aller au verset »),
 *  - scroll-spy natif (IntersectionObserver).
 */
export const SourateReader: React.FC<{ versets: VersetT[] }> = ({ versets }) => {
  const total = versets.length;
  const [active, setActive] = useState<number>(versets[0]?.numero ?? 0);
  const [pulsing, setPulsing] = useState<number | null>(null);
  const [gotoVal, setGotoVal] = useState('');

  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const sidebarRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());   // items sidebar (desktop)
  const pillRefs = useRef<Map<number, HTMLElement>>(new Map());   // pastilles (mobile)
  const interRef = useRef<Map<number, boolean>>(new Map());
  const pulseTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeIndex = useMemo(() => Math.max(0, versets.findIndex((v) => v.numero === active)), [versets, active]);
  const pct = total > 0 ? Math.round(((activeIndex + 1) / total) * 100) : 0;

  // Scroll-spy : le verset le plus haut encore visible devient l'actif.
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const n = Number((e.target as HTMLElement).dataset.numero);
        interRef.current.set(n, e.isIntersecting);
      }
      let next: number | null = null;
      for (const v of versets) { if (interRef.current.get(v.numero)) { next = v.numero; break; } }
      if (next != null) setActive(next);
    }, { rootMargin: '-132px 0px -55% 0px', threshold: 0 });
    cardRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [versets]);

  // Garde l'item actif visible dans la sidebar / la bande mobile.
  useEffect(() => {
    ensureVisible(sidebarRef.current, itemRefs.current.get(active) ?? null, 'y');
    ensureVisible(stripRef.current, pillRefs.current.get(active) ?? null, 'x');
  }, [active]);

  const goToVerse = useCallback((n: number, pulse = true) => {
    const el = cardRefs.current.get(n);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(n);
    if (pulse) {
      setPulsing(n);
      clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setPulsing(null), 2000);
    }
  }, []);

  const submitGoto = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(gotoVal, 10);
    if (Number.isFinite(n) && cardRefs.current.has(n)) { goToVerse(n); setGotoVal(''); }
  };

  return (
    <>
      {/* Barre sticky (compteur + progression + aller au verset) + bande mobile */}
      <div className="sticky top-16 z-30 bg-ground/95 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 py-2.5">
            <span className="text-[13px] font-semibold text-green-deep tabular-nums whitespace-nowrap">Verset {active} / {total}</span>
            <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden min-w-[40px]">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-green transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            <form onSubmit={submitGoto} className="flex items-center gap-1.5 shrink-0">
              <input
                type="number" inputMode="numeric" min={1} value={gotoVal}
                onChange={(e) => setGotoVal(e.target.value)}
                placeholder="N°" aria-label="Aller au verset numéro"
                className="w-16 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink tabular-nums focus:outline-none focus:ring-2 focus:ring-green"
              />
              <button type="submit" aria-label="Aller au verset" className="inline-flex items-center gap-1 rounded-lg bg-green text-white font-semibold px-3 py-1.5 text-sm hover:bg-green-deep transition-colors">
                Aller <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Mobile : bande horizontale de pastilles numérotées */}
          <div ref={stripRef} className="lg:hidden -mx-4 px-4 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex gap-1.5 w-max">
              {versets.map((v) => (
                <button
                  key={v.numero}
                  ref={(el) => { if (el) pillRefs.current.set(v.numero, el); else pillRefs.current.delete(v.numero); }}
                  type="button" onClick={() => goToVerse(v.numero)}
                  aria-current={v.numero === active}
                  className={`shrink-0 w-8 h-8 grid place-items-center rounded-lg text-[13px] tabular-nums border transition-colors ${
                    v.numero === active ? 'bg-green text-white border-green font-semibold' : 'bg-surface text-ink border-line hover:border-green'
                  }`}
                >
                  {v.numero}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] items-start">
        {/* Sommaire vertical sticky (desktop) */}
        <aside
          ref={sidebarRef}
          className="hidden lg:block sticky top-[7rem] self-start max-h-[calc(100vh-8rem)] overflow-y-auto rounded-card border border-line bg-surface"
        >
          <p className="px-3 pt-3 pb-2 text-[11px] uppercase tracking-[0.14em] text-gold font-semibold">Versets</p>
          <ul className="pb-2">
            {versets.map((v) => {
              const on = v.numero === active;
              return (
                <li key={v.numero}>
                  <button
                    type="button"
                    ref={(el) => { if (el) itemRefs.current.set(v.numero, el); else itemRefs.current.delete(v.numero); }}
                    onClick={() => goToVerse(v.numero)}
                    aria-current={on}
                    className={`w-full text-left px-3 py-2 border-l-2 transition-colors ${
                      on ? 'bg-green-soft border-green' : 'border-transparent hover:bg-green-soft/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-[11px] font-semibold tabular-nums ${on ? 'bg-green text-white' : 'bg-green-soft text-green-deep'}`}>{v.numero}</span>
                      {v.texte_arabe && <span className="flex-1 min-w-0 font-arabic text-right text-ink/90 text-[15px] leading-tight truncate" dir="rtl" lang="ar">{v.texte_arabe}</span>}
                    </span>
                    {v.texte_francais && <span className="block mt-0.5 pl-8 text-[11.5px] text-muted line-clamp-1 [unicode-bidi:plaintext]">{strip(v.texte_francais)}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Versets dépliés */}
        <div className="space-y-4 min-w-0">
          {versets.map((v) => (
            <SourateVerseCard
              key={v.numero}
              v={v}
              pulsing={pulsing === v.numero}
              ref={(el) => { if (el) cardRefs.current.set(v.numero, el as HTMLElement); else cardRefs.current.delete(v.numero); }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SourateReader;
