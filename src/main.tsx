import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './i18n'; // initialise i18next (libellés d'interface, bundlé, repli FR)
import './styles/fonts.css';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// La PWA (enregistrement du service worker + bandeau de mise à jour) est
// gérée par le composant <PwaUpdater /> monté dans App.tsx.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
