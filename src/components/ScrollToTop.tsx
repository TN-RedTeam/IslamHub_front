import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remonte en haut de page à chaque changement de route.
 * Sans ce composant, la position de scroll est conservée entre les pages.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};
