import React, { useMemo, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { rankNames, normalizeName } from '../../utils/nameSearch';

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

export interface NameOption { id: number; nom: string; }

/**
 * Sélecteur unique « cherchable » de nom (savant / narrateur / rapporteur),
 * avec recherche tolérante (accents, titres « imam/cheikh », variantes
 * d'écriture). Optionnellement un bouton « Créer « … » ».
 */
export const NameSelect: React.FC<{
  options: NameOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
  onCreate?: (nom: string) => void;
  createLabel?: string;
}> = ({ options, value, onChange, placeholder = 'Chercher un nom…', allowCreate, onCreate, createLabel = 'Créer' }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedName = useMemo(() => options.find((o) => o.id === value)?.nom ?? '', [options, value]);
  const matches = useMemo(() => (open ? rankNames(options, q, 30) : []), [options, q, open]);
  const exact = useMemo(() => !!q.trim() && options.some((o) => normalizeName(o.nom) === normalizeName(q)), [options, q]);

  const pick = (id: number) => { onChange(id); setQ(''); setOpen(false); inputRef.current?.blur(); };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          className={field}
          value={open ? q : selectedName}
          placeholder={placeholder}
          onFocus={() => { setOpen(true); setQ(''); }}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {value != null && !open && (
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onChange(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-red-600" aria-label="Effacer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && (matches.length > 0 || (allowCreate && q.trim() && !exact)) && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border border-line bg-surface shadow-lg py-1">
          {matches.map((o) => (
            <button key={o.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o.id)}
              className={`block w-full text-left px-3.5 py-2 text-[14px] hover:bg-glass-tint ${o.id === value ? 'text-green font-medium' : 'text-ink'}`}>
              {o.nom}
            </button>
          ))}
          {allowCreate && q.trim() && !exact && (
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onCreate?.(q.trim()); setOpen(false); }}
              className="block w-full text-left px-3.5 py-2 text-[14px] text-accent hover:bg-glass-tint inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {createLabel} «&nbsp;{q.trim()}&nbsp;»
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NameSelect;
