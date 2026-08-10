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

  // Optimisation du build
  build: {
    // Code splitting pour réduire la taille du bundle initial
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les librairies volumineuses
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-animation': ['framer-motion'],
          'vendor-utils': ['date-fns', 'moment-hijri', 'axios'],
          'vendor-ui': ['lucide-react'],
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
