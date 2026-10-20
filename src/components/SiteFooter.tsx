import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Pied de page unifié « Nuit Teal » — identique sur toutes les pages, monté une
 * seule fois dans App. Chrome sombre FIXE (reste teal profond dans les deux
 * thèmes), filet menthe centré en haut, citation + ligne de copyright discrète.
 */
export const SiteFooter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative mt-12 text-center px-6 pt-9 pb-24 md:pb-7 bg-[#0b1e22]">
      <span
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[3px] rounded-b-[3px] bg-[linear-gradient(90deg,#66e0cd,#0e8f80)]"
      />
      <p
        className="font-display font-medium text-[#e9f4f1] mx-auto mb-2 max-w-[60ch] leading-snug"
        style={{ fontSize: 'clamp(16px,2.2vw,20px)' }}
      >
        {t('footer.quote')}
      </p>
      <p className="text-[12.5px] tracking-wide text-[#8fb2ad]">
        {t('footer.rights')}
      </p>
    </footer>
  );
};

export default SiteFooter;
