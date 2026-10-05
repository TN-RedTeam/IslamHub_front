import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';

/** Mappe le nom d'école (colonne `ecole`) vers le segment d'URL de sa page. */
export const ECOLE_ROUTE: Record<string, string> = {
  // Noms uniformisés (minuscule, adjectif français)
  'hanafite': 'Hanafi',
  'malikite': 'Malikite',
  'chaféite': 'Shafii',
  'hanbalite': 'Hanbalite',
  // Anciens libellés conservés en repli (données non encore migrées)
  'Hanafite': 'Hanafi',
  'Malikite': 'Malikite',
  'Chaféite': 'Shafii',
  'Shafiite': 'Shafii',
  'Hanbalite': 'Hanbalite',
  'Hanafi': 'Hanafi',
  'Ach-Chafi^iyy': 'Shafii',
  'Hanbali': 'Hanbalite',
};

/** Segment d'URL de la page d'une école, quel que soit l'orthographe stockée. */
export const ecoleRoute = (ecole?: string | null): string | null =>
  ecole ? (ECOLE_ROUTE[ecole] ?? ECOLE_ROUTE[ecole.toLowerCase()] ?? null) : null;

/** Badge « École X » cliquable -> page de l'école (si connue). */
export const EcoleBadge: React.FC<{ ecole: string; onClick?: (e: React.MouseEvent) => void }> = ({ ecole, onClick }) => {
  const slug = ECOLE_ROUTE[ecole];
  const cls = 'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-glass-tint text-ink';
  const inner = <><Landmark className="w-3.5 h-3.5" /> École {ecole}</>;
  return slug ? (
    <Link to={`/ecoles/${slug}`} onClick={onClick} className={`${cls} hover:bg-glass-tint dark:hover:bg-green-deep transition-colors`}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
};

export default EcoleBadge;
