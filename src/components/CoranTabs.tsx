import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Onglets de la rubrique « Coran » : deux entrées.
 *  - « Versets par thème »    → les arguments du Coran par sujet (/coran)
 *  - « Exégèse des sourates »  → le tafsir des sourates (/coran/sourates)
 */
const TABS = [
  { to: '/coran', label: 'Versets par thème' },
  { to: '/coran/sourates', label: 'Exégèse des sourates' },
];

export const CoranTabs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith('/coran/sourates') ? '/coran/sourates' : '/coran';
  return (
    <div role="tablist" aria-label="Coran" className={`inline-flex gap-1 rounded-full border border-line bg-surface p-1 ${className}`}>
      {TABS.map((t) => {
        const on = active === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            role="tab"
            aria-selected={on}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
              on ? 'bg-green text-white' : 'text-ink hover:bg-green-soft hover:text-green-deep'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
};

export default CoranTabs;
