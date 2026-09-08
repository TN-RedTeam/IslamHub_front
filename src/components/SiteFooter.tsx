import React from 'react';

/**
 * Pied de page unifié (charte Phase 11.5) — identique sur toutes les pages,
 * monté une seule fois dans App. Fond vert profond FIXE (les tokens
 * theme-aware s'inverseraient en sombre : un pied de page reste sombre dans
 * les deux thèmes), filet doré de 120px centré en haut, citation en
 * font-display italique + ligne de copyright discrète.
 */
export const SiteFooter: React.FC = () => (
  <footer className="relative mt-11 bg-[#0f3d2e] text-center px-6 pt-9 pb-7">
    <span
      aria-hidden="true"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[3px] bg-gold rounded-b-[3px]"
    />
    <p
      className="font-display italic text-[#eaf5ef] mx-auto mb-2 max-w-[60ch] leading-snug"
      style={{ fontSize: 'clamp(16px,2.2vw,20px)' }}
    >
      «&nbsp;Que l'un de vous apprenne un chapitre de la religion ou l'enseigne, cela lui vaut mieux que mille rakʿah surérogatoires.&nbsp;»
    </p>
    <p className="text-[12.5px] tracking-wide text-[#9dc3b1]">
      © 2026 IslamHub — Ahl as-Sunna wa-l-Jamāʿa
    </p>
  </footer>
);

export default SiteFooter;
