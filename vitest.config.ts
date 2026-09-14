import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Config de test isolée du build de prod (pas de plugin PWA, pas de workbox) :
// on ne touche donc pas à vite.config.ts ni au déploiement.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Les tests d'intégration (réseau/BDD) sont dans *.integration.test.ts et
    // ne tournent que si on le demande explicitement (voir script test:rls).
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
});
