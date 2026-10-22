import { defineConfig, devices } from '@playwright/test';

// Binaire Chromium pré-installé dans l'environnement (pas de téléchargement).
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// E2E « smoke » : l'app est servie SANS Supabase (pas de .env) ; elle bascule sur
// les données locales bundlées (src/data). On sert à la racine (--base=/).
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'fr-FR', // force la langue de contenu par défaut (sinon la langue du navigateur)
    trace: 'off',
    launchOptions: { executablePath: CHROME },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: undefined, launchOptions: { executablePath: CHROME } } },
    { name: 'mobile', use: { ...devices['Pixel 5'], channel: undefined, launchOptions: { executablePath: CHROME } } },
  ],
  webServer: {
    // BrowserRouter (comme la prod web) + base racine pour des URL propres en test.
    command: 'VITE_ROUTER=browser npm run build -- --base=/ && npx vite preview --port 4173 --strictPort --base=/',
    url: 'http://localhost:4173',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
