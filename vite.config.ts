import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // './' works for both GitHub Pages (HashRouter) and Capacitor Android WebView.
  // '/IslamHub_front/' would break all asset paths inside the Android WebView.
  base: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    // NB : pas de `manualChunks` en objet — Vite 8 (Rolldown) exige une fonction.
    // On laisse Rolldown découper automatiquement (résultat déjà très correct).
    chunkSizeWarningLimit: 800,
    // Source maps désactivés en production
    sourcemap: false,
  },

  // Optimisation du serveur de développement
  server: {
    port: 3000,
    open: true,
  },
});
