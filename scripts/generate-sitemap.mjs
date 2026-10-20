// ============================================================================
// Génère public/sitemap.xml multilingue (Phase 15.6).
// Avec la RLS durcie (15.7c), la clé ANON ne lit QUE le contenu publié → le
// sitemap n'inclut que des URLs réellement publiées, par langue. Les entrées
// liées par translation_group reçoivent leurs balises <xhtml:link hreflang>.
//
// Exécuté AVANT `vite build` (le fichier est dans public/). Sans identifiants
// Supabase, le script s'arrête proprement en conservant le sitemap existant.
//
// Usage : node scripts/generate-sitemap.mjs
// ============================================================================
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITE = (process.env.SITE_ORIGIN || 'https://Sou55i.github.io/IslamHub_front').replace(/\/+$/, '');
const LOCALES = ['fr', 'en', 'ar'];
const URL_ENV = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY_ENV = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/sitemap.xml');

// Pages « coquille » présentes dans toutes les langues.
const STATIC_PATHS = [
  '/', '/hadiths', '/coran/sourates', '/croyance', '/croyance/attributs',
  '/croyance/piliers-de-la-foi', '/croyance/noms-d-allah',
  '/croyance/versets-hadiths-equivoques', '/biographies', '/invocations',
  '/paroles', '/themes', '/dossiers', '/recits', '/femmes', '/ecoles',
  '/recherche', '/multimedia',
];

// Tables de contenu internées → URL par ligne (slug/id localisés).
const CONTENT = [
  { table: 'dossiers', cols: 'slug, locale, translation_group', path: (r) => `/dossiers/${r.slug}` },
  { table: 'recits', cols: 'slug, locale, translation_group', path: (r) => `/recits/${r.slug}` },
  { table: 'paroles', cols: 'slug, locale, translation_group', path: (r) => `/paroles/${r.slug}` },
  { table: 'hadiths', cols: 'id, slug, locale, translation_group', path: (r) => `/hadiths/${r.id}/${r.slug ?? ''}` },
  { table: 'savants', cols: 'slug, locale, translation_group', path: (r) => `/savants/${r.slug}` },
  { table: 'sourates', cols: 'slug, locale, translation_group', path: (r) => `/coran/sourates/${r.slug}` },
  { table: 'versets_equivoques', cols: 'slug, locale, translation_group', path: (r) => `/croyance/versets-hadiths-equivoques/${r.slug}` },
];

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const abs = (locale, path) => `${SITE}/${locale}${path === '/' ? '' : path}`;

/** Construit un bloc <url> avec alternates hreflang pour les langues fournies. */
function urlBlock(path, locales, loc) {
  const alts = locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEscape(abs(l, path))}"/>`);
  if (locales.includes('fr')) alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(abs('fr', path))}"/>`);
  return [
    '  <url>',
    `    <loc>${xmlEscape(abs(loc, path))}</loc>`,
    ...alts,
    '  </url>',
  ].join('\n');
}

async function main() {
  if (!URL_ENV || !KEY_ENV) {
    console.warn('[sitemap] VITE_SUPABASE_URL/ANON_KEY absents — sitemap existant conservé.');
    return;
  }
  const supabase = createClient(URL_ENV, KEY_ENV);
  const blocks = [];

  // 1) Pages coquille : présentes dans les 3 langues.
  for (const p of STATIC_PATHS) blocks.push(urlBlock(p, LOCALES, 'fr'));

  // 2) Contenu publié (RLS = publié uniquement), regroupé par translation_group.
  for (const { table, cols, path } of CONTENT) {
    const { data, error } = await supabase.from(table).select(cols);
    if (error) { console.warn(`[sitemap] ${table}: ${error.message}`); continue; }
    const groups = new Map(); // tg → [{locale, path}]
    for (const row of data ?? []) {
      const tg = row.translation_group ?? `${table}:${row.id ?? row.slug}`;
      if (!groups.has(tg)) groups.set(tg, []);
      groups.get(tg).push({ locale: row.locale ?? 'fr', path: path(row) });
    }
    for (const entries of groups.values()) {
      const locales = entries.map((e) => e.locale);
      for (const e of entries) blocks.push(urlBlock(e.path, locales, e.locale));
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...blocks,
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(OUT, xml, 'utf8');
  console.log(`[sitemap] ${blocks.length} URLs écrites → public/sitemap.xml`);
}

main().catch((e) => { console.error('[sitemap] échec :', e); process.exitCode = 1; });
