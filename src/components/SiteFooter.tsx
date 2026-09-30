import React from 'react';

/**
 * Pied de page unifié « Nuit Teal » — identique sur toutes les pages, monté une
 * seule fois dans App. Chrome sombre FIXE (reste teal profond dans les deux
 * thèmes), filet menthe centré en haut, citation + ligne de copyright discrète.
 */
export const SiteFooter: React.FC = () => (
  <footer className="relative mt-12 text-center px-6 pt-9 pb-24 md:pb-7 bg-[#0b1e22]">
    <span
      aria-hidden="true"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[3px] rounded-b-[3px] bg-[linear-gradient(90deg,#66e0cd,#0e8f80)]"
    />
    <p
      className="font-display font-medium text-[#e9f4f1] mx-auto mb-2 max-w-[60ch] leading-snug"
      style={{ fontSize: 'clamp(16px,2.2vw,20px)' }}
    >
      «&nbsp;Que l'un de vous apprenne un chapitre de la religion ou l'enseigne, cela lui vaut mieux que mille rakʿah surérogatoires.&nbsp;»
    </p>
    <p className="text-[12.5px] tracking-wide text-[#8fb2ad]">
      © 2026 IslamHub — Ahl as-Sunna wa-l-Jamāʿa
    </p>
  </footer>
);

export default SiteFooter;
