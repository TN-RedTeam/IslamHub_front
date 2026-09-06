import React from 'react';
import { Filter, type LucideIcon } from 'lucide-react';

interface FilterSelectProps {
  /** Valeur sélectionnée ('' = aucune / « tous »). */
  value: string;
  onChange: (value: string) => void;
  /** Liste des choix (sujets, catégories, savants…). */
  options: string[];
  /** Libellé de l'option par défaut, ex. « Tous les sujets ». */
  allLabel: string;
  ariaLabel?: string;
  /** Icône affichée à droite (par défaut : entonnoir de filtre). */
  icon?: LucideIcon;
  /** Largeur / classes du conteneur (par défaut md:w-64). */
  className?: string;
}

/**
 * Menu déroulant de filtre unifié pour toutes les pages (sujets, catégories,
 * savants…). Un simple <select> natif, même style partout : « Tous les … »
 * par défaut puis la liste, sans hashtag, sans compteur, sans icône interne.
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
  icon: Icon = Filter,
  className,
}) => (
  <div className={`relative ${className ?? 'md:w-64'}`}>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <select
      aria-label={ariaLabel ?? allLabel}
      className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

export default FilterSelect;
