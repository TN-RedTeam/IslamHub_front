import { useEffect } from 'react';

const SITE_NAME = 'IslamHub';

/**
 * Met à jour le titre de l'onglet par page (SEO + UX).
 * Restaure le titre du site au démontage.
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = SITE_NAME;
    };
  }, [title]);
}
