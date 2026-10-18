import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Sunrise } from 'lucide-react';
import { dataService } from '../services/DataService';
import { parseMoments, type MomentDef } from '../data/moments';
import type { Invocation } from '../types';

const typeLabel = (t: number) => (t === 2 ? 'Évocation' : 'Invocation');

/**
 * Bandeau « Au fil de la journée » (ex « La journée du musulman ») : les
 * invocations/évocations rattachées à un moment, regroupées du réveil au
 * coucher. Pleine largeur, dépliant (bandeau global + chaque moment en grille).
 * Masqué si aucun moment n'a de contenu.
 */
export const JourneePanel: React.FC<{ onOpen: (it: Invocation) => void }> = ({ onOpen }) => {
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

  return (
    <section className="mb-8 bg-ivory rounded-card border border-line shadow-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-glass-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-accent-deep text-white shrink-0"><Sunrise className="w-4.5 h-4.5" /></span>
        <span className="flex-1 min-w-0">
          <span className="block font-display font-semibold text-ink text-lg">Les invocations à dire dans une journée</span>
          <span className="block text-sm text-muted">Du réveil au coucher — {groups.length} moment{groups.length > 1 ? 's' : ''}</span>
        </span>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => {
              const isOpen = openKey === g.key;
              return (
                <div key={g.key} className="rounded-lg border border-line bg-surface overflow-hidden self-start">
                  <button onClick={() => setOpenKey(isOpen ? null : g.key)} aria-expanded={isOpen}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-glass-tint transition-colors">
                    <span className="flex-1 font-semibold text-ink text-sm">{g.label}</span>
                    <span className="text-[11px] text-muted tabular-nums">{g.list.length}</span>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <ul className="px-2.5 pb-2.5 space-y-1.5 max-h-72 overflow-y-auto">
                      {g.list.map((it) => (
                        <li key={it.id}>
                          <button onClick={() => onOpen(it)}
                            className="w-full text-left rounded-lg border border-line bg-ivory px-3 py-2 hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
                            <span className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line shrink-0">{typeLabel(it.type_id)}</span>
                              <span className="text-sm font-medium text-ink truncate">{it.sujet || 'Invocation'}</span>
                            </span>
                            {it.texte_arabe && (
                              <span dir="rtl" lang="ar" className="block font-arabic text-base leading-relaxed text-right text-ink/90 line-clamp-1">{it.texte_arabe}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default JourneePanel;
