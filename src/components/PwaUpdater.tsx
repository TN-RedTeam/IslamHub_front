import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Gère le cycle de vie du service worker de la PWA (aucun affichage).
 *
 *  • Web en production : enregistre le SW en mode auto-update silencieux — un
 *    nouveau build déployé remplace l'ancien tout seul, sans message.
 *  • WebView Capacitor (app native) : pas de SW → nettoyage de tout résidu.
 *  • Développement : rien (le SW n'est jamais actif en dev).
 */
export const PwaUpdater: React.FC = () => {
  useEffect(() => {
    const isNativeApp = Boolean(
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
        .Capacitor?.isNativePlatform?.(),
    );

    if (isNativeApp) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {});
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }
      }
      return;
    }

    if (import.meta.env.PROD) {
      registerSW({ immediate: true });
    }
  }, []);

  return null;
};

export default PwaUpdater;
