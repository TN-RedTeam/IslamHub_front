import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

// Charte Ahl-Sunnah : fond teal nuit + mosquée en teal clair.
const BG = '#0b1e22';
const FG = '#3fbfae';
const RES = 'android/app/src/main/res';

// Tracé de la mosquée (même géométrie que le composant BrandMark, viewBox 64×64).
const MARK = `
  <path d="M11 46 V30 Q11 26 13.5 24 Q16 26 16 30 V46Z"/>
  <circle cx="13.5" cy="21.5" r="1.6"/>
  <path d="M48 46 V30 Q48 26 50.5 24 Q53 26 53 30 V46Z"/>
  <circle cx="50.5" cy="21.5" r="1.6"/>
  <rect x="22" y="34" width="20" height="12"/>
  <path d="M24 34 C21 27 25 20 32 13 C39 20 43 27 40 34 Z"/>
  <rect x="31.1" y="7.5" width="1.8" height="6.5" rx="0.9"/>
  <circle cx="32" cy="6.5" r="1.8"/>
  <rect x="8" y="46" width="48" height="4" rx="1.5"/>`;

// SVG : marque centrée (fraction du canevas), sur fond optionnel.
const svg = (size, frac, withBg) => {
  const s = Math.round(size * frac);
  const off = Math.round((size - s) / 2);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
       ${withBg ? `<rect width="${size}" height="${size}" fill="${BG}"/>` : ''}
       <svg x="${off}" y="${off}" width="${s}" height="${s}" viewBox="0 0 64 64" fill="${FG}">${MARK}</svg>
     </svg>`,
  );
};
const circleMask = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);

const png = (buf, out) => sharp(buf).png().toFile(out);

// --- Icônes adaptatives (Android 8+) : foreground PNG (marque sur transparent) ---
const FG_SIZES = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
// --- Icônes legacy (Android 7-) : carré plein + rond ---
const LEG_SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

const jobs = [];
for (const [d, size] of Object.entries(FG_SIZES)) {
  mkdirSync(`${RES}/mipmap-${d}`, { recursive: true });
  // foreground : marque dans la zone de sécurité centrale (~60 %), fond transparent
  jobs.push(png(svg(size, 0.6, false), `${RES}/mipmap-${d}/ic_launcher_foreground.png`));
}
for (const [d, size] of Object.entries(LEG_SIZES)) {
  // carré : fond teal + marque 68 %
  jobs.push(png(svg(size, 0.68, true), `${RES}/mipmap-${d}/ic_launcher.png`));
  // rond : idem masqué en cercle
  jobs.push(
    sharp(svg(size, 0.68, true))
      .composite([{ input: circleMask(size), blend: 'dest-in' }])
      .png()
      .toFile(`${RES}/mipmap-${d}/ic_launcher_round.png`),
  );
}

// --- Splash : fond teal + marque centrée pour chaque fichier existant ---
const splashDirs = [
  'drawable', 'drawable-port-mdpi', 'drawable-port-hdpi', 'drawable-port-xhdpi',
  'drawable-port-xxhdpi', 'drawable-port-xxxhdpi', 'drawable-land-mdpi', 'drawable-land-hdpi',
  'drawable-land-xhdpi', 'drawable-land-xxhdpi', 'drawable-land-xxxhdpi',
];
for (const dir of splashDirs) {
  const file = `${RES}/${dir}/splash.png`;
  try {
    const meta = await sharp(file).metadata();
    const w = meta.width, h = meta.height;
    const markS = Math.round(Math.min(w, h) * 0.34);
    const inner = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
         <rect width="${w}" height="${h}" fill="${BG}"/>
         <svg x="${Math.round((w - markS) / 2)}" y="${Math.round((h - markS) / 2)}" width="${markS}" height="${markS}" viewBox="0 0 64 64" fill="${FG}">${MARK}</svg>
       </svg>`,
    );
    jobs.push(sharp(inner).png().toFile(file + '.tmp').then(async () => {
      const { renameSync } = await import('node:fs');
      renameSync(file + '.tmp', file);
    }));
  } catch { /* dossier absent : on ignore */ }
}

// --- Icône Play Store 512×512 (hi-res) ---
mkdirSync('store', { recursive: true });
jobs.push(png(svg(512, 0.66, true), 'store/play-icon-512.png'));
// --- Visuel de présentation Play 1024×500 (feature graphic) ---
jobs.push(
  sharp(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
       <rect width="1024" height="500" fill="${BG}"/>
       <svg x="90" y="150" width="200" height="200" viewBox="0 0 64 64" fill="${FG}">${MARK}</svg>
       <text x="320" y="250" font-family="serif" font-size="74" fill="${FG}">أهل السنة</text>
       <text x="320" y="315" font-family="serif" font-size="44" letter-spacing="8" fill="#e9f4f1">AHL-SUNNAH</text>
     </svg>`,
  )).png().toFile('store/play-feature-1024x500.png'),
);

await Promise.all(jobs);
console.log('assets OK — ' + jobs.length + ' fichiers');
