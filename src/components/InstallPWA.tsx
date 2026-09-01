import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

// L'événement `beforeinstallprompt` n'est pas encore standardisé dans les types
// du DOM : on le décrit nous-mêmes.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Bouton « Installer l'app ».
 *
 * Il ne s'affiche QUE lorsque le navigateur signale que la PWA est réellement
 * installable (événement `beforeinstallprompt`, émis par Chrome/Edge/Android
 * quand les critères PWA sont réunis). Il disparaît si l'app est déjà installée
 * ou juste après l'installation.
 *
 * ⚠️ iOS/Safari n'émet pas cet événement : sur iPhone l'installation se fait via
 * Partager → « Sur l'écran d'accueil ». Le bouton reste donc masqué sur iOS,
 * c'est volontaire (pas de faux bouton qui ne ferait rien).
 */
export const InstallPWA: React.FC<{ className?: string }> = ({ className }) => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Déjà installée (lancée en mode « application ») → pas de bouton.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // évite l'infobar par défaut : on gère nous-mêmes
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!promptEvent) return null;

  const handleInstall = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    // L'événement n'est pas réutilisable une fois consommé : on masque le bouton.
    setPromptEvent(null);
  };

  return (
    <button
      onClick={handleInstall}
      aria-label="Installer l'application"
      className={
        className ??
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors'
      }
    >
      <Download className="w-4 h-4 shrink-0" />
      <span className="font-amiri">Installer l'app</span>
    </button>
  );
};

export default InstallPWA;
