import React from 'react';
import { Link } from 'react-router-dom';
import type { ThemeRef } from '../types';

/** Puces de thèmes cliquables (→ /themes/:slug), style discret cohérent avec les badges. */
export const ThemeChips: React.FC<{ themes?: ThemeRef[] | null; className?: string }> = ({ themes, className = '' }) => {
  if (!themes || themes.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {themes.map((t) => (
        <Link
          key={t.slug}
          to={`/themes/${t.slug}`}
          className="text-xs font-medium text-green-deep bg-green-soft border border-green-line px-2.5 py-0.5 rounded-full hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          {t.nom}
        </Link>
      ))}
    </div>
  );
};

export default ThemeChips;
