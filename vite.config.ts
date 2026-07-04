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
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'IslamicHub',
        short_name: 'IslamicHub',
        description: 'Hadiths, douaas, dhikrs, Coran et vidéos islamiques',
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
        // Les chunks de données JSON (fallback local, volumineux) ne sont pas
        // précachés : ils seraient téléchargés d'office par chaque visiteur
        // alors qu'ils ne servent que si Supabase est indisponible.
        globIgnores: ['**/assets/data-*.js'],
        navigateFallback: 'index.html',
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
          // Thumbnails YouTube (page Multimedia)
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API IslamHub : réseau d'abord, cache en secours (consultation hors-ligne
          // des recherches déjà effectuées)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
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

  // Optimisation du build
  build: {
    // Code splitting pour réduire la taille du bundle initial
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) n'accepte plus la forme objet : fonction obligatoire.
        manualChunks(id) {
          // Chunks nommés pour les données JSON locales (exclus de la précache PWA)
          if (id.includes('/src/data/') && id.endsWith('.json')) {
            const name = id.split('/').pop()!.replace('.json', '');
            return `data-${name}`;
          }
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor-react';
          // framer-motion volontairement absent : laisser Rolldown le découper
          // pour que le moteur (domMax) reste dans un chunk asynchrone.
          if (id.includes('node_modules/@supabase/')) return 'vendor-supabase';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-ui';
        },
      },
    },
    // Limite d'avertissement pour la taille des chunks
    chunkSizeWarningLimit: 500,
    // Source maps désactivés en production
    sourcemap: false,
  },

  // Optimisation du serveur de développement
  server: {
    port: 3000,
    open: true,
  },
});
