// Forme RAPPORTÉE d'un libellé de question (Règle A, rubrique Questions).
//
// Une question qui présuppose un faux (« Où est Allah ? » sous-entend qu'Allah
// serait dans un lieu) n'est JAMAIS posée à son propre compte dans un titre,
// un <h1> ou le champ `name` d'un schéma QAPage/FAQPage : on la met en forme
// rapportée (« Réponse à ceux qui demandent : où est Allah ? »).
//
// - La phrase réellement cherchée reste À L'INTÉRIEUR (c'est elle qui porte le
//   SEO) ; la question nue reste par ailleurs stockée en base (slug, champ
//   `text` du schéma, variantes, recherche interne) — rien n'est renommé côté
//   données, donc aucun slug ne bouge.
// - Si l'auteur a DÉJÀ rédigé le libellé en forme rapportée, on le laisse tel
//   quel (pas de double préfixe).

/** Libellés déjà en forme rapportée (ou non interrogative) → laissés intacts. */
const DEJA_RAPPORTE = /^(réponse\b|pour ceux\b|pour celui\b|que répondre\b|à ceux\b|ce qu'il faut\b|comprendre\b)/i;

/** Premiers mots dont la MAJUSCULE doit être préservée (noms sacrés/propres). */
const PRESERVE_CASE = /^(allah|dieu|allāh)\b/i;

/** « Où est Allah ? » → « Réponse à ceux qui demandent : où est Allah ? ». */
export function reportedQuestionTitle(question: string): string {
  const q = (question ?? '').trim();
  if (!q) return q;
  if (DEJA_RAPPORTE.test(q)) return q;
  // Minuscule sur la 1re lettre pour enchaîner après « : » (interrogatifs
  // « Où/Comment/Que… »), SAUF si la question commence par un nom sacré/propre
  // (« Allah », « Dieu ») dont la majuscule doit être conservée.
  const body = PRESERVE_CASE.test(q) ? q : q.charAt(0).toLowerCase() + q.slice(1);
  return `Réponse à ceux qui demandent : ${body}`;
}
