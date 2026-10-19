import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { UI } from '../strings';
import type { SubjectCount } from '../types';

/** Puce de filtre retirable (sujet, savant, recueil, authenticité…). */
export const FilterChip: React.FC<{ label: string; prefix?: string; onRemove: () => void }> = ({ label, prefix, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 text-sm bg-glass-tint text-ink border border-green-line rounded-full pl-3 pr-1.5 py-1">
    {prefix ? <span className="text-muted">{prefix} :</span> : null} {label}
    <button type="button" onClick={onRemove} aria-label={`Retirer ${label}`} className="grid place-items-center w-5 h-5 rounded-full text-muted hover:text-ink hover:bg-line/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"><X className="w-3.5 h-3.5" /></button>
  </span>
);

/**
 * « Parcourir par sujet » (Phase 12.2) — un seul contrôle, dans la barre de
 * filtres. Menu déroulant listant tous les sujets avec leur compteur + un
 * mini-champ de recherche interne. Mono-sélection ; l'état est reflété par une
 * puce retirable gérée par le parent. Accessible clavier (ouverture, flèches,
 * Entrée, Échap), aria-expanded/role corrects, focus visible.
 */
export const SubjectBrowser: React.FC<{
  subjects: SubjectCount[];
  value: string | null;
  onChange: (sujet: string | null) => void;
  className?: string;
}> = ({ subjects, value, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? subjects.filter((s) => s.sujet.toLowerCase().includes(q)) : subjects;
  }, [subjects, filter]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => { if (open) { setFilter(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);
  useEffect(() => { setActive(0); }, [filter]);

  const choose = (sujet: string) => { onChange(sujet); setOpen(false); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) choose(filtered[active].sujet); }
  };

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}
        className="w-full inline-flex items-center gap-2 rounded-xl border border-line bg-glass px-4 py-3 text-left text-ink hover:border-green transition-colors focus:outline-none focus:ring-2 focus:ring-green"
      >
        <span className="truncate">{value ? value : UI.browse.bySubject}</span>
        <ChevronDown className={`w-4 h-4 text-muted ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[260px] rounded-xl border border-line bg-surface shadow-card-hover overflow-hidden" onKeyDown={onKeyDown}>
          <div className="relative border-b border-line">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef} value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder={UI.browse.searchSubject} aria-label={UI.browse.searchSubject}
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none"
            />
          </div>
          <ul ref={listRef} role="listbox" aria-label={UI.browse.bySubject} className="max-h-72 overflow-y-auto py-1">
            <li>
              <button type="button" onClick={() => { onChange(null); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[14px] text-left hover:bg-glass-tint ${!value ? 'text-green font-semibold' : 'text-muted'}`}>
                {!value && <Check className="w-3.5 h-3.5" />} {UI.browse.allSubjects}
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted italic">{UI.browse.noSubject}</li>
            ) : filtered.map((s, i) => {
              const on = value === s.sujet;
              return (
                <li key={s.sujet}>
                  <button type="button" data-i={i} role="option" aria-selected={on}
                    onMouseEnter={() => setActive(i)} onClick={() => choose(s.sujet)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[14px] text-left transition-colors ${i === active ? 'bg-glass-tint' : ''} ${on ? 'text-green font-semibold' : 'text-ink'}`}>
                    {on && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{s.sujet}</span>
                    <span className="ml-auto text-[12px] text-muted tabular-nums shrink-0">{s.n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubjectBrowser;
