import React from 'react';

/**
 * Marque « Ahl-Sunnah » : mosquée stylisée (deux minarets + coupole + socle).
 * Dessinée en `currentColor` pour s'adapter au contexte (vert sur fond clair,
 * clair sur l'en-tête admin sombre). Partagée entre l'en-tête public et l'admin.
 */
export const Mark: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
    <path d="M11 46 V30 Q11 26 13.5 24 Q16 26 16 30 V46Z" />
    <circle cx="13.5" cy="21.5" r="1.6" />
    <path d="M48 46 V30 Q48 26 50.5 24 Q53 26 53 30 V46Z" />
    <circle cx="50.5" cy="21.5" r="1.6" />
    <rect x="22" y="34" width="20" height="12" />
    <path d="M24 34 C21 27 25 20 32 13 C39 20 43 27 40 34 Z" />
    <rect x="31.1" y="7.5" width="1.8" height="6.5" rx="0.9" />
    <circle cx="32" cy="6.5" r="1.8" />
    <rect x="8" y="46" width="48" height="4" rx="1.5" />
  </svg>
);

export default Mark;
