#!/usr/bin/env node
// Optimise des images pour le bucket Storage « references » (Phase 7).
// Convertit en WebP, largeur max 1200px, qualité ~80.
//
// Prérequis :  npm i -D sharp
// Usage :      node scripts/optimize-images.mjs <dossier-source> [dossier-sortie]
//   ex :       node scripts/optimize-images.mjs public/img build/references-webp
//
// Ensuite : upload les .webp générés dans Supabase → Storage → bucket « references »
// (glisser-déposer), puis relie-les via supabase/refonte/phase7_lier_images.sql.

import { readdir, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const SRC = process.argv[2] || 'public/img';
const OUT = process.argv[3] || 'build/references-webp';
const MAX_WIDTH = 1200;
const QUALITY = 80;

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('❌ Le module « sharp » est requis : npm i -D sharp');
  process.exit(1);
}

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (files.length === 0) { console.log('Aucune image dans', SRC); process.exit(0); }

for (const f of files) {
  const out = join(OUT, `${slug(basename(f, extname(f)))}.webp`);
  await sharp(join(SRC, f))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  console.log('✓', f, '→', out);
}
console.log(`\nFait. Upload le contenu de « ${OUT} » dans le bucket Storage « references ».`);
