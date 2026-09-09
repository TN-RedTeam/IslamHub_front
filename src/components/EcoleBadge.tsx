import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';

/** Mappe le nom d'école (colonne `ecole`) vers le segment d'URL de sa page. */
export const ECOLE_ROUTE: Record<string, string> = {
  // Noms normalisés (adjectifs)
  'Hanafite': 'Hanafi',
  'Malikite': 'Malikite',
  'Shafiite': 'Shafii',
  'Hanbalite': 'Hanbalite',
  // Anciens libellés conservés en repli (données non encore migrées)
  'Hanafi': 'Hanafi',
  'Ach-Chafi^iyy': 'Shafii',
  'Hanbali': 'Hanbalite',
};

/** Badge « École X » cliquable -> page de l'école (si connue). */
export const EcoleBadge: React.FC<{ ecole: string; onClick?: (e: React.MouseEvent) => void }> = ({ ecole, onClick }) => {
  const slug = ECOLE_ROUTE[ecole];
  const cls = 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-soft text-green-deep';
  const inner = <><Landmark className="w-3.5 h-3.5" /> École {ecole}</>;
  return slug ? (
    <Link to={`/ecoles/${slug}`} onClick={onClick} className={`${cls} hover:bg-green-soft dark:hover:bg-green-deep transition-colors`}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
};

export default EcoleBadge;
