// Recherche « tolérante » de noms de savants / narrateurs / rapporteurs.
// Insensible aux accents/diacritiques, aux titres (imam, cheikh…), à l'article
// (al-, an-…), aux marques hamza/ʿayn, et robuste aux variantes de translittération
// (Bukhari ↔ Boukhariyy) via un squelette consonantique + similarité bigrammes.
// 100 % côté client — ne modifie rien en base.

const HONORIFICS = new Set([
  'imam', 'imaam', 'cheikh', 'cheik', 'cheykh', 'sheikh', 'shaykh', 'chaykh', 'sheykh', ' cheikh',
  'hafiz', 'hafidh', 'al-hafiz', 'sayyid', 'sayyed', 'mawlana', 'mufti', 'qadi', 'cadi',
  'sheikhoul', 'cheikhoul', 'ustadh', 'oustadh',
]);
// Articles arabes (assimilés) souvent présents ou non selon la source.
const ARTICLES = new Set(['al', 'el', 'ad', 'ar', 'as', 'an', 'at', 'az', 'ash', 'adh', 'ath', 'ate']);

/** Forme normalisée : minuscules, sans diacritiques, sans titres ni articles. */
export const normalizeName = (s: string): string => {
  const base = (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')      // enlève les diacritiques
    .toLowerCase()
    .replace(/[ʾʿʼ'`´’‘ʹ]/g, '')                           // marques hamza / ʿayn / apostrophes
    .replace(/[-_.·,()[\]/]+/g, ' ')                        // séparateurs → espace
    .replace(/\s+/g, ' ').trim();
  const tokens = base.split(' ').filter((t) => t && !HONORIFICS.has(t) && !ARTICLES.has(t));
  return tokens.join(' ');
};

/** Squelette consonantique (voyelles + y/w retirés, lettres doublées réduites). */
const skeleton = (s: string): string =>
  normalizeName(s).replace(/\s+/g, '').replace(/[aeiouwy]/g, '').replace(/(.)\1+/g, '$1');

const bigrams = (s: string): string[] => {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
};
/** Similarité de Dice sur bigrammes (0..1). */
const dice = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ba = bigrams(a), bb = bigrams(b);
  if (ba.length === 0 || bb.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const g of ba) counts.set(g, (counts.get(g) ?? 0) + 1);
  let inter = 0;
  for (const g of bb) { const c = counts.get(g) ?? 0; if (c > 0) { inter++; counts.set(g, c - 1); } }
  return (2 * inter) / (ba.length + bb.length);
};

/** Score de pertinence nom↔requête (0 = ne correspond pas). */
export const scoreName = (name: string, query: string): number => {
  const qn = normalizeName(query);
  if (!qn) return 1;                                   // requête vide → tout afficher
  const nn = normalizeName(name);
  if (!nn) return 0;
  if (nn === qn) return 1000;
  const nTok = nn.split(' '), qTok = qn.split(' ');
  if (nn.startsWith(qn)) return 600;
  if (nTok.some((t) => t.startsWith(qn))) return 500;  // un mot commence par la requête
  if (nn.includes(qn)) return 400;
  // chaque mot de la requête est le début d'un mot du nom (ordre libre)
  if (qTok.every((qt) => nTok.some((nt) => nt.startsWith(qt) || qt.startsWith(nt)))) return 300;
  // variantes de translittération → squelette consonantique (≥3 pour éviter le bruit)
  const sk = skeleton(name), sq = skeleton(query);
  if (sq.length >= 3 && sk.length >= 3) {
    if (sk.includes(sq) || sq.includes(sk)) return 200;
    const sim = dice(sk, sq);
    if (sim >= 0.5) return Math.round(120 * sim);
  }
  // dernier recours : similarité directe sur formes normalisées
  const a = nn.replace(/\s/g, ''), b = qn.replace(/\s/g, '');
  if (b.length >= 4) { const sim2 = dice(a, b); if (sim2 >= 0.6) return Math.round(80 * sim2); }
  return 0;
};

/** Filtre + trie une liste d'options {nom} par pertinence vis-à-vis de `query`. */
export const rankNames = <T extends { nom: string }>(options: T[], query: string, limit = 40): T[] => {
  const scored = options
    .map((o) => ({ o, s: scoreName(o.nom, query) }))
    .filter((x) => x.s > 0);
  scored.sort((a, b) => b.s - a.s || a.o.nom.localeCompare(b.o.nom));
  return scored.slice(0, limit).map((x) => x.o);
};
