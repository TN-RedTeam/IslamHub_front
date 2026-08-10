import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DhikrProvider } from './context/DhikrProvider.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { registerSW } from 'virtual:pwa-register';

// Service worker UNIQUEMENT en production sur le web.
//  - En dev (`npm run dev`) : pas de SW, sinon il met en cache index.html et
//    casse le HMR (ex: CSP figée, changements non pris en compte).
//  - Dans la WebView Capacitor : inutile, l'app Android embarque ses assets.
if (import.meta.env.PROD && !('Capacitor' in window)) {
  registerSW({ immediate: true });
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
