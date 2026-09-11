import React from 'react';

/**
 * Petites icônes au trait (charte Phase 11.3) — remplacent tous les emojis des
 * empty states, en-têtes et tuiles. `stroke="currentColor"`, trait 1.7 :
 * la couleur vient de la classe texte du parent (ex. text-green dans un chip).
 */
const PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  book: <><path d="M12 5C9.5 5 6 6 5 6.7v12C6 18 9.5 17 12 17s6 1 7 1.7v-12C18 6 14.5 5 12 5z" /><path d="M12 6.7v11" /></>,
  hands: <path d="M7 13V6a1.5 1.5 0 0 1 3 0v5m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0-1V6a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6 7s-6-2-7-5l-1.2-3a1.5 1.5 0 0 1 2.6-1.4L7 13" />,
  beads: <><circle cx="7" cy="7" r="2" /><circle cx="12" cy="5.5" r="2" /><circle cx="17" cy="7" r="2" /><circle cx="19" cy="12" r="2" /><path d="M12 14v6" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M6 18l1.4-1.4" /></>,
  camera: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></>,
  // Icônes complémentaires pour les empty states.
  sad: <><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5c.9-1.1 2.1-1.7 3.5-1.7s2.6.6 3.5 1.7" /><path d="M9 9.5h.01M15 9.5h.01" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6" /></>,
  alert: <><path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17h.01" /></>,
  star: <path d="M12 3l2.1 6.3H20l-5 3.9 2 6.3-5-4-5 4 2-6.3-5-3.9h5.9z" />,
  pillars: <path d="M4 9l8-5 8 5M6 9v9M10 9v9M14 9v9M18 9v9M4 21h16" />,
  // Diamant (facettes de la perfection) — Attributs d'Allah.
  diamant: <><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M9 3 6 9l6 12M15 3l3 6-6 12" /></>,
  // Qalam (plume, les noms calligraphiés) — 99 Noms.
  qalam: <><path d="M5 19l1.2-4.2L16.5 4.5a2 2 0 0 1 2.8 2.8L9 17.6z" /><path d="M14.5 6.5l3 3" /><path d="M5 19l3.2-1.1" /></>,
};

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);

/** Chip rond (fond --green-soft, trait --green) contenant une icône — pour les empty states. */
export const IconBadge: React.FC<{ name: IconName; className?: string }> = ({ name, className }) => (
  <div className={`mx-auto mb-4 w-16 h-16 rounded-full bg-green-soft text-green grid place-items-center ${className ?? ''}`}>
    <Icon name={name} className="w-8 h-8" />
  </div>
);

export default Icon;
