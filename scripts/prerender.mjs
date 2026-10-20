// ============================================================================
// Prérendu SSG (Phase 15.6) — snapshot HTML par route ET par langue.
// Sert dist/ (build BrowserRouter, base VITE_BASE) via un petit serveur statique
// avec repli SPA, puis visite chaque route coquille × {fr,en,ar} dans Chromium
// headless et écrit le HTML rendu dans dist/<langue>/<chemin>/index.html.
// GitHub Pages sert alors un HTML déjà peuplé (contenu + metas/hreflang) aux
// robots qui n'exécutent pas le JS ; l'app React reprend la main côté client.
//
// À lancer APRÈS `vite build` (build browser). Chromium : binaire pré-installé
// (PLAYWRIGHT_CHROMIUM / /opt/pw-browsers) sinon résolution Playwright par défaut.
//
// Usage : node scripts/prerender.mjs
// ============================================================================
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const BASE = '/' + (process.env.VITE_BASE || '/IslamHub_front/').replace(/^\/+|\/+$/g, '');
// Origine réelle du site (pour réécrire les URLs localhost des canonical/hreflang
// générées par SeoHead pendant le prérendu).
const SITE_HOST = new URL(process.env.SITE_ORIGIN || 'https://Sou55i.github.io/IslamHub_front').origin;
const LOCALES = ['fr', 'en', 'ar'];
const PATHS = [
  '/', '/hadiths', '/coran/sourates', '/croyance', '/biographies', '/invocations',
  '/paroles', '/themes', '/dossiers', '/recits', '/femmes', '/ecoles', '/recherche',
];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};
const ext = (p) => p.slice(p.lastIndexOf('.'));

function resolveChrome() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dir = readdirSync(root).find((d) => d.startsWith('chromium-'));
    if (dir) {
      const bin = join(root, dir, 'chrome-linux', 'chrome');
      if (existsSync(bin)) return bin;
    }
  } catch { /* résolution par défaut de Playwright */ }
  return undefined;
}

function startServer() {
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.startsWith(BASE)) p = p.slice(BASE.length) || '/';
    let file = join(DIST, p);
    if (existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': MIME[ext(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
      return;
    }
    // repli SPA
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(readFileSync(join(DIST, 'index.html')));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html absent — lance `vite build` d’abord.');
    return;
  }
  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ executablePath: resolveChrome() });
  const page = await browser.newPage();
  let n = 0;

  for (const locale of LOCALES) {
    for (const path of PATHS) {
      const route = `/${locale}${path === '/' ? '' : path}`;
      const url = `${origin}${BASE}${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      } catch {
        /* réseau lent / pas d’identifiants : on attend les metas ci-dessous */
      }
      // Attendre que SeoHead ait injecté les hreflang (sinon snapshot trop tôt).
      await page.waitForFunction(() => document.querySelectorAll('link[hreflang]').length >= 3, { timeout: 8000 })
        .catch(() => {});
      // Remplace l'origine locale du serveur de prérendu par l'origine réelle
      // (canonical/hreflang/og:url pointent vers le site déployé).
      const html = (await page.content()).replaceAll(origin, SITE_HOST);
      const outDir = join(DIST, locale, path === '/' ? '' : path.replace(/^\//, ''));
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html, 'utf8');
      n++;
    }
  }

  await browser.close();
  await new Promise((ok) => server.close(ok));
  console.log(`[prerender] ${n} pages écrites (${LOCALES.length} langues × ${PATHS.length} routes).`);
}

main().catch((e) => { console.error('[prerender] échec :', e); process.exitCode = 1; });
