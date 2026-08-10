import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DhikrProvider } from './context/DhikrProvider.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD && !('Capacitor' in window)) {
  // Production web : la PWA est active.
  registerSW({ immediate: true });
} else if ('serviceWorker' in navigator) {
  // Dev (ou Capacitor) : AUCUN service worker ne doit tourner.
  // On purge automatiquement tout SW + cache résiduel d'une ancienne PWA,
  // pour tous les navigateurs, sans manipulation manuelle dans DevTools.
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if ('caches' in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DhikrProvider>
        <App />
      </DhikrProvider>
    </ErrorBoundary>
  </StrictMode>
);
