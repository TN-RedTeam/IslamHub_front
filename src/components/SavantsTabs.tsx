import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Onglets de la rubrique « Savants » : deux entrées.
 *  - « Par savant »        → le répertoire (/savants)
 *  - « Toutes les paroles » → la recherche de paroles (/savants/paroles)
 */
const TABS = [
  { to: '/savants', label: 'Par savant' },
  { to: '/savants/paroles', label: 'Toutes les paroles' },
];

export const SavantsTabs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith('/savants/paroles') ? '/savants/paroles' : '/savants';
  return (
    <div role="tablist" aria-label="Savants" className={`inline-flex gap-1 rounded-full border border-line bg-surface p-1 ${className}`}>
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

export default SavantsTabs;
