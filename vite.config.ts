import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // './' works for both GitHub Pages (HashRouter) and Capacitor Android WebView.
  // '/IslamHub_front/' would break all asset paths inside the Android WebView.
  base: './',
  plugins: [
    react(),
    VitePWA({
      // Mise à jour automatique et silencieuse : un nouveau build déployé
      // remplace l'ancien sans message ni bandeau (aucune mention à l'écran).
      registerType: 'autoUpdate',
      // On enregistre le SW nous-mêmes (PwaUpdater) pour pouvoir le désactiver
      // en dev et dans la WebView Capacitor. Pas d'injection automatique.
      injectRegister: null,
      // JAMAIS de service worker en développement (cause du bug d'origine :
      // le SW servait d'anciens assets pendant qu'on codait).
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'IslamHub',
        short_name: 'IslamHub',
        description: 'Hadiths, douaas, dhikrs, Coran et paroles de savants',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#064e3b',
        theme_color: '#065f46',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        // Purge les anciens précaches à chaque déploiement (anti version périmée).
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          // Feuilles de style Google Fonts : revalidées en arrière-plan
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          // Fichiers de polices : immuables, cache 1 an
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Miniatures YouTube (page Multimedia)
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
