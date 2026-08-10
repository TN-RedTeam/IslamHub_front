import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DhikrProvider } from './context/DhikrProvider.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// PWA retirée pour l'instant. Nettoyage : supprime tout service worker + cache
// résiduel d'une ancienne installation PWA, sur tous les navigateurs.
if ('serviceWorker' in navigator) {
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
