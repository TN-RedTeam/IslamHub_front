import React, { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * Sélecteur de valeurs multiples sous forme de puces, avec autocomplétion.
 * Contrairement à `MultiPicker` (identifiants), il travaille sur des CHAÎNES :
 * on propose une liste de suggestions (ex. noms de savants) pour homogénéiser
 * les graphies, mais la saisie libre reste possible (Entrée). C'est ce qu'il
 * faut pour un champ texte historique — comme `rapporteur` des équivoques —
 * qu'on veut enrichir sans changer le schéma.
 */
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const norm = (s: string) => s.trim().toLowerCase();

export const TagPicker: React.FC<{
  suggestions: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  allowFree?: boolean;
}> = ({ suggestions, value, onChange, placeholder, allowFree = true }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const add = (tag: string) => {
    const t = tag.trim();
    setQ('');
    if (!t || value.some((v) => norm(v) === norm(t))) return;
    onChange([...value, t]);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  const filtered = useMemo(() => {
    const needle = norm(q);
    return suggestions
      .filter((s) => !value.some((v) => norm(v) === norm(s)) && (!needle || norm(s).includes(needle)))
      .slice(0, 40);
  }, [suggestions, value, q]);
  const exactExists = [...suggestions, ...value].some((s) => norm(s) === norm(q));

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((t, i) => (
            <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-green-soft text-green-deep border border-green-line px-2.5 py-1 text-[13px]">
              {t}
              <button type="button" onClick={() => remove(i)} className="text-green-deep/70 hover:text-red-600" aria-label="Retirer"><X className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className={field}
          value={q}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={(e) => { if (allowFree && e.key === 'Enter') { e.preventDefault(); add(q); } }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && (filtered.length > 0 || (allowFree && q.trim() && !exactExists)) && (
          <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-line bg-surface shadow-lg py-1">
            {filtered.map((s) => (
              <button key={s} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(s)} className="block w-full text-left px-3.5 py-2 text-[14px] text-ink hover:bg-green-soft">{s}</button>
            ))}
            {allowFree && q.trim() && !exactExists && (
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(q)} className="flex w-full items-center gap-1.5 text-left px-3.5 py-2 text-[14px] text-green-deep hover:bg-green-soft border-t border-line">
                <Plus className="w-3.5 h-3.5" /> Ajouter «&nbsp;{q.trim()}&nbsp;»
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPicker;
