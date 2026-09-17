// Compteurs explicites avec accord singulier/pluriel (Phase 4.2).
// Fonction unique utilisée partout — aucune abréviation (« 11 v. » interdit).

type CompteurType =
  | 'verset' | 'hadith' | 'parole' | 'invocation' | 'evocation'
  | 'video' | 'savant' | 'recit' | 'theme' | 'sourate' | 'preuve' | 'scan';

const LABELS: Record<CompteurType, [string, string]> = {
  verset: ['verset', 'versets'],
  hadith: ['hadith', 'hadiths'],
  parole: ['parole', 'paroles'],
  invocation: ['invocation', 'invocations'],
  evocation: ['évocation', 'évocations'],
  video: ['vidéo', 'vidéos'],
  savant: ['savant', 'savants'],
  recit: ['récit', 'récits'],
  theme: ['thème', 'thèmes'],
  sourate: ['sourate', 'sourates'],
  preuve: ['preuve', 'preuves'],
  scan: ['scan', 'scans'],
};

/** « 11 versets », « 1 hadith » — accord automatique (0 et 1 → singulier). */
export function compteur(n: number, type: CompteurType): string {
  const l = LABELS[type];
  if (!l) return String(n);
  return `${n} ${n > 1 ? l[1] : l[0]}`;
}

/** Assemble plusieurs compteurs, en masquant ceux à 0 : « 11 versets · 18 hadiths ». */
export function compteurs(parts: { n: number; type: CompteurType }[], sep = ' · '): string {
  return parts.filter((p) => p.n > 0).map((p) => compteur(p.n, p.type)).join(sep);
}
