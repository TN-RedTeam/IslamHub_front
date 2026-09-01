import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Gère le service worker de la PWA et affiche un bandeau discret
 * « Nouvelle version disponible » quand un nouveau build est déployé.
 *
 *  • Web en production : enregistre le SW et écoute les mises à jour.
 *  • WebView Capacitor (app native) : pas de SW → nettoyage de tout résidu.
 *  • Développement : rien (le SW n'est jamais actif en dev).
 *
 * Si l'utilisateur ignore le bandeau, la nouvelle version s'applique tout de
 * même à la prochaine ouverture complète de l'app.
 */
export const PwaUpdater: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

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
      updateSWRef.current = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true);
        },
      });
    }
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-xl px-4 py-3 flex items-center gap-3"
    >
      <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
        Nouvelle version disponible
      </span>
      <button
        onClick={() => updateSWRef.current?.(true)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0"
      >
        Actualiser
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label="Fermer"
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PwaUpdater;
