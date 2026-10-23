// ============================================================================
// Prérendu SSG (Phase 15.6) — snapshot HTML par route ET par langue.
// Sert dist/ (build BrowserRouter, base VITE_BASE) via un petit serveur statique
// avec repli SPA, puis visite chaque route dans Chromium headless et écrit le
// HTML rendu dans dist/<langue>/<chemin>/index.html. GitHub Pages sert alors un
// HTML déjà peuplé (contenu + metas/hreflang/OG) aux robots qui n'exécutent pas
// le JS (aperçus de partage, indexation robuste) ; l'app React reprend la main
// côté client.
//
// Routes = pages coquille × {fr,en,ar} + FICHES ÉDITORIALES publiées (lues en
// base comme le sitemap ; RLS = publié uniquement). EN/AR se prérendent seuls
// quand ils se remplissent. Garde-fous : plafond PRERENDER_MAX + timeout court.
//
// À lancer APRÈS `vite build` (build browser). Chromium : binaire pré-installé
// (PLAYWRIGHT_CHROMIUM / /opt/pw-browsers) sinon résolution Playwright par défaut.
// Identifiants Supabase (env) requis pour lister les fiches ; sinon seules les
// pages coquille sont prérendues.
//
// Usage : node scripts/prerender.mjs
// ============================================================================
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const BASE = '/' + (process.env.VITE_BASE || '/IslamHub_front/').replace(/^\/+|\/+$/g, '');
const SITE_HOST = new URL(process.env.SITE_ORIGIN || 'https://tn-redteam.github.io/IslamHub_front').origin;
const MAX = Number(process.env.PRERENDER_MAX || 1500);
// Nombre d'onglets rendus en parallèle. Le prérendu est I/O-bound (attente
// réseau/rendu), donc plusieurs pages avancent de front sans saturer le CPU.
const CONCURRENCY = Math.max(1, Number(process.env.PRERENDER_CONCURRENCY || 8));
// Lancement FR-only : on ne prérende QUE les langues publiques (EN/AR dormants
// → pas de snapshot indexable). Réactiver = PUBLIC_LOCALES=fr,en,ar à l'env.
const LOCALES = (process.env.PUBLIC_LOCALES || 'fr').split(',').map((s) => s.trim()).filter(Boolean);

// Pages « coquille » présentes dans toutes les langues.
const SHELL = [
  '/', '/hadiths', '/coran/sourates', '/croyance', '/biographies', '/invocations',
  '/paroles', '/themes', '/dossiers', '/questions', '/recits', '/femmes', '/ecoles', '/recherche',
];

// Fiches éditoriales partageables (URL par ligne publiée).
const CONTENT = [
  { table: 'dossiers', cols: 'slug, locale', path: (r) => `/dossiers/${r.slug}` },
  { table: 'questions', cols: 'slug, locale', path: (r) => `/questions/${r.slug}` },
  { table: 'recits', cols: 'slug, locale', path: (r) => `/recits/${r.slug}` },
  { table: 'paroles', cols: 'slug, locale', path: (r) => `/paroles/${r.slug}` },
  { table: 'hadiths', cols: 'id, slug, locale', path: (r) => `/hadiths/${r.id}/${r.slug ?? ''}` },
  { table: 'savants', cols: 'slug, locale', path: (r) => `/savants/${r.slug}` },
  { table: 'sourates', cols: 'slug, locale', path: (r) => `/coran/sourates/${r.slug}` },
  { table: 'versets_equivoques', cols: 'slug, locale', path: (r) => `/croyance/versets-hadiths-equivoques/${r.slug}` },
  { table: 'exposes', cols: 'slug', path: (r) => `/exposes/${r.slug}`, locale: 'fr' },
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

async function contentRoutes() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[prerender] identifiants Supabase absents — seules les pages coquille sont prérendues.');
    return [];
  }
  const supabase = createClient(url, key);
  const routes = [];
  for (const { table, cols, path, locale } of CONTENT) {
    const { data, error } = await supabase.from(table).select(cols);
    if (error) { console.warn(`[prerender] ${table}: ${error.message}`); continue; }
    for (const row of data ?? []) {
      if (!row.slug && !row.id) continue;
      routes.push({ locale: row.locale ?? locale ?? 'fr', path: path(row) });
    }
  }
  return routes;
}

function startServer() {
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.startsWith(BASE)) p = p.slice(BASE.length) || '/';
    // Confinement : le chemin résolu DOIT rester sous dist/ (anti path-traversal).
    const file = resolve(DIST, '.' + sep + p);
    if ((file === DIST || file.startsWith(DIST + sep)) && existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { 'content-type': MIME[ext(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html' }); // repli SPA
    res.end(readFileSync(join(DIST, 'index.html')));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html absent — lance `vite build` d’abord.');
    return;
  }

  // Liste des routes : coquille × langues + fiches publiées (dédupliquées, plafonnées).
  const shell = LOCALES.flatMap((l) => SHELL.map((p) => ({ locale: l, path: p })));
  const content = await contentRoutes();
  const seen = new Set();
  const routes = [];
  for (const r of [...shell, ...content]) {
    const key = `${r.locale}${r.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    routes.push(r);
    if (routes.length >= MAX) break;
  }

  const server = await startServer();
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ executablePath: resolveChrome() });
  let n = 0;

  // Rendu d'une route (réutilise la page du worker).
  async function renderOne(page, { locale, path }) {
    const route = `/${locale}${path === '/' ? '' : path}`;
    const url = `${origin}${BASE}${route}`;
    // Le service worker étant bloqué (voir page.route ci-dessous), le réseau se
    // met réellement au repos une fois les données Supabase chargées : networkidle
    // redevient un bon signal « contenu prêt » et rapide (~1-2 s/page au lieu du
    // timeout de 20 s + 6 s d'attente hreflang qui ne venait jamais en FR-only).
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 12000 });
    } catch { /* cap de sécurité : on snapshotte l'état courant */ }
    const html = (await page.content()).replaceAll(origin, SITE_HOST);
    const outDir = join(DIST, locale, path === '/' ? '' : path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), html, 'utf8');
    n++;
  }

  // Pool d'onglets : chaque worker pioche dans la file partagée (JS mono-thread →
  // shift() est atomique) et réutilise sa page. Le gros du temps est en attente
  // réseau/rendu, donc N pages en parallèle divisent le temps d'autant.
  const queue = routes.slice();
  async function worker() {
    const page = await browser.newPage();
    // On n'a pas besoin des OCTETS des images/polices/médias pour le snapshot
    // HTML (les balises <img>/liens restent dans le DOM de toute façon). Les
    // bloquer accélère nettement `networkidle` (plus d'attente de téléchargement)
    // sans changer le HTML produit. On garde documents, scripts et requêtes de
    // données (fetch/xhr vers Supabase), indispensables au rendu du contenu.
    await page.route('**/*', (route) => {
      const req = route.request();
      // Pas de service worker / précache PWA en prérendu : il déclenche le
      // préchargement de ~186 fichiers qui empêche `networkidle` de se stabiliser.
      if (/\/sw\.js(\?|$)|workbox-[-\w.]+\.js/.test(req.url())) return route.abort();
      const t = req.resourceType();
      return t === 'image' || t === 'media' || t === 'font' ? route.abort() : route.continue();
    });
    try {
      for (let item = queue.shift(); item; item = queue.shift()) {
        await renderOne(page, item);
      }
    } finally {
      await page.close();
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, routes.length) || 1 }, worker));

  await browser.close();
  await new Promise((ok) => server.close(ok));
  console.log(`[prerender] ${n} pages écrites (${routes.length} routes ; coquille + fiches publiées).`);
}

main().catch((e) => { console.error('[prerender] échec :', e); process.exitCode = 1; });
