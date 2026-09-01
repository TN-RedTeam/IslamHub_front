import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';

/** Mappe le nom d'école (colonne `ecole`) vers le segment d'URL de sa page. */
export const ECOLE_ROUTE: Record<string, string> = {
  'Hanafi': 'Hanafi',
  'Malikite': 'Malikite',
  'Ach-Chafi^iyy': 'Shafii',
  'Hanbali': 'Hanbalite',
};

/** Badge « École X » cliquable -> page de l'école (si connue). */
export const EcoleBadge: React.FC<{ ecole: string; onClick?: (e: React.MouseEvent) => void }> = ({ ecole, onClick }) => {
  const slug = ECOLE_ROUTE[ecole];
  const cls = 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200';
  const inner = <><Landmark className="w-3.5 h-3.5" /> École {ecole}</>;
  return slug ? (
    <Link to={`/ecoles/${slug}`} onClick={onClick} className={`${cls} hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors`}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
};

export default EcoleBadge;
