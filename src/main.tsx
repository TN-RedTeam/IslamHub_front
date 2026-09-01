import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DhikrProvider } from './context/DhikrProvider.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// La PWA (enregistrement du service worker + bandeau de mise à jour) est
// gérée par le composant <PwaUpdater /> monté dans App.tsx.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DhikrProvider>
        <App />
      </DhikrProvider>
    </ErrorBoundary>
  </StrictMode>
);
