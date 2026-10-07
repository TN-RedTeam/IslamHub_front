import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ScrollText, Quote } from 'lucide-react';

/**
 * Contrôle segmenté de la rubrique « Hadiths & paroles » (Phase 11).
 * Même principe que le toggle Invocations / Évocations : bascule le TYPE de
 * preuve affiché. Chaque onglet est un lien (URL partageable, retour navigateur)
 * qui conserve la recherche texte (?q) et le sujet (?sujet) d'un type à l'autre.
 */
const TABS = [
  { key: 'hadiths' as const, to: '/hadiths', label: 'Hadiths', icon: ScrollText },
  { key: 'paroles' as const, to: '/paroles', label: 'Paroles de savants', icon: Quote },
];

export const HadithsParolesTabs: React.FC<{ active: 'hadiths' | 'paroles'; className?: string }> = ({ active, className = '' }) => {
  const [sp] = useSearchParams();
  const carried = (() => {
    const p = new URLSearchParams();
    const q = sp.get('q'); const sujet = sp.get('sujet');
    if (q) p.set('q', q);
    if (sujet) p.set('sujet', sujet);
    const s = p.toString();
    return s ? `?${s}` : '';
  })();

  return (
    <div role="tablist" aria-label="Type de preuve" className={`inline-flex gap-1 rounded-full border border-line bg-surface p-1 ${className}`}>
      {TABS.map((t) => {
        const on = active === t.key;
        const Icon = t.icon;
        return (
          <Link
            key={t.key}
            to={`${t.to}${carried}`}
            role="tab"
            aria-selected={on}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
              on ? 'bg-green text-white' : 'text-ink hover:bg-glass-tint'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden /> {t.label}
          </Link>
        );
      })}
    </div>
  );
};

export default HadithsParolesTabs;
