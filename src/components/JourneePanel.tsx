import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Sunrise, ArrowRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from './Markdown';
import { parseMoments, type MomentDef } from '../data/moments';
import { useTranslation } from 'react-i18next';
import type { Invocation } from '../types';

const typeLabel = (t: number) => (t === 2 ? 'Évocation' : 'Invocation');

/** Une invocation dépliée dans la frise : arabe + translittération + traduction + source. */
const InvocationInline: React.FC<{ it: Invocation; onOpen: (it: Invocation) => void }> = ({ it, onOpen }) => {
  const { t } = useTranslation();
  return (
  <li className="rounded-lg border border-line bg-surface p-3.5">
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line shrink-0">{typeLabel(it.type_id)}</span>
      <span className="text-sm font-semibold text-ink min-w-0 truncate">{it.sujet || t('journee.untitled')}</span>
    </div>
    {it.texte_arabe && (
      <p dir="rtl" lang="ar" className="font-arabic text-right leading-loose text-ink whitespace-pre-wrap" style={{ fontSize: 'clamp(18px,3vw,22px)' }}>{it.texte_arabe}</p>
    )}
    {it['phonétique'] && <p className="text-[13px] text-muted italic mt-1.5 [unicode-bidi:plaintext]">{it['phonétique']}</p>}
    {it.texte_francais && (
      <div className="mt-2 pl-3 border-l-2 border-gold/70 [unicode-bidi:plaintext]"><Markdown className="text-[14px] font-bold">{it.texte_francais}</Markdown></div>
    )}
    {it.commentaire && <p className="text-[12.5px] text-muted mt-2 [unicode-bidi:plaintext]">{it.commentaire}</p>}
    {it.kind === 'hadith' && (
      <button type="button" onClick={() => onOpen(it)} className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-green hover:text-green-deep transition-colors">
        {t('journee.seeHadith')} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    )}
  </li>
  );
};

/**
 * « Les invocations à dire dans une journée » (finitions 13.5) — une FRISE
 * chronologique verticale, du réveil au coucher. Chaque moment est une étape ;
 * la dérouler révèle ses invocations (arabe + translittération + traduction + source).
 * Repère d'ambiance discret (matin clair → soir profond) dans la charte.
 * Bandeau dépliant, au-dessus du moteur de recherche. Masqué si rien à montrer.
 */
export const JourneePanel: React.FC<{ onOpen: (it: Invocation) => void }> = ({ onOpen }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Invocation[]>([]);
  const [moments, setMoments] = useState<MomentDef[]>([]);
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    dataService.getMoments().then(setMoments).catch(() => {});
    dataService.getJourneeInvocations().then(setItems).catch(() => {});
  }, []);

  const groups = useMemo(() =>
    moments
      .map((m) => ({ ...m, list: items.filter((it) => parseMoments(it.moments).includes(m.key)) }))
      .filter((g) => g.list.length > 0),
    [items, moments]);

  if (groups.length === 0) return null;
  const last = Math.max(groups.length - 1, 1);

  return (
    <section className="mb-8 bg-ivory rounded-card border border-line shadow-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-glass-tint transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-accent-deep text-white shrink-0"><Sunrise className="w-[18px] h-[18px]" /></span>
        <span className="flex-1 min-w-0">
          <span className="block font-display font-semibold text-ink text-lg">{t('journee.title')}</span>
          <span className="block text-sm text-muted">{t('journee.subtitle')} — {groups.length} moment{groups.length > 1 ? 's' : ''}</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line p-4 sm:p-6">
          <ol className="relative ml-2 border-l-2 border-green-line/70 space-y-2">
            {groups.map((g, i) => {
              const isOpen = openKey === g.key;
              // Ambiance : le repère se fonce du matin (clair) au soir (profond), dans la charte.
              const shade = `color-mix(in srgb, var(--accdeep) ${30 + Math.round((i / last) * 55)}%, var(--surface))`;
              return (
                <li key={g.key} className="relative pl-6">
                  <span aria-hidden className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 border-ivory shadow-sm" style={{ background: shade }} />
                  <h3>
                    <button onClick={() => setOpenKey(isOpen ? null : g.key)} aria-expanded={isOpen}
                      className="w-full flex items-center gap-2 text-left py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
                      <span className="font-display font-semibold text-ink text-[15px]">{g.label}</span>
                      <span className="ml-auto text-[11px] text-muted tabular-nums">{g.list.length}</span>
                      <ChevronDown className={`w-4 h-4 text-muted transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  {isOpen && (
                    <ul className="mt-1.5 mb-2 space-y-2.5">
                      {g.list.map((it) => <InvocationInline key={`${it.kind ?? 'inv'}-${it.id}`} it={it} onOpen={onOpen} />)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
};

export default JourneePanel;
