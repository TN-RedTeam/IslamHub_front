import type { FocusEvent } from 'react';

/**
 * Gabarits de ponctuation pré-remplis dans les champs de texte arabe, pour
 * éviter de les retaper à chaque saisie. Le texte se place entre les deux signes.
 *
 * - coran  : parenthèses coraniques ornées ﴿ … ﴾ (réservées à la parole divine).
 * - hadith : guillemets français « … » (parole rapportée du Prophète ﷺ).
 * - parole : guillemets simples ‹ … › (parole d'un savant — distinct du hadith).
 *
 * L'espace entre la parenthèse et le texte est une ESPACE FINE INSÉCABLE
 * (U+202F) : la parenthèse de fermeture ne peut plus se retrouver seule en début
 * de ligne (surtout en mobile).
 *
 * Remarque : ces signes sont ignorés par la détection de doublon (arabe_hash)
 * et par la normalisation de recherche — ils n'affectent donc pas l'unicité.
 */
const NNBSP = ' '; // narrow no-break space

export const AR_TEMPLATE: { coran: string; hadith: string; parole: string } = {
  coran: `﴿${NNBSP}${NNBSP}﴾`, // ﴿ ﴾
  hadith: `«${NNBSP}${NNBSP}»`, // « »
  parole: `‹${NNBSP}${NNBSP}›`, // ‹ ›
};

/**
 * Gabarit de traduction d'un verset (exégèse du Coran) : « ce qui signifie : »
 * suivi de la signification en gras entre guillemets (espaces fines insécables).
 * L'auteur n'a plus qu'à saisir la signification entre « … ».
 */
export const TRAD_TEMPLATE = `ce qui signifie : **«${NNBSP}${NNBSP}»**.`;

/** onFocus : place le curseur entre les guillemets « … » quand le champ = gabarit. */
export function caretInsideGuillemets(tpl: string) {
  return (e: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value === tpl) {
      const i = tpl.indexOf('«');
      if (i >= 0) { const p = i + 2; try { e.target.setSelectionRange(p, p); } catch { /* selon type */ } }
    }
  };
}

/**
 * Normalise l'espace autour des parenthèses/guillemets : toute espace normale
 * (ou U+00A0) adjacente à une parenthèse ouvrante (﴿ « ‹) ou fermante (﴾ » ›)
 * devient une espace fine insécable (U+202F). Idempotent.
 * À appliquer à l'enregistrement sur les champs de texte arabe.
 */
export function normalizeBracketSpaces(t: string): string {
  if (!t) return t;
  return t
    .replace(/([﴿«‹])[   ]+/g, `$1${NNBSP}`)
    .replace(/[   ]+([﴾»›])/g, `${NNBSP}$1`);
}

/**
 * Handler onFocus : quand le champ contient encore le gabarit vierge, place le
 * curseur au milieu (entre les deux signes) pour saisir directement le texte.
 */
export function caretBetween(tpl: string) {
  return (e: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value === tpl) {
      const pos = Math.floor(tpl.length / 2);
      try { e.target.setSelectionRange(pos, pos); } catch { /* certains navigateurs refusent selon le type */ }
    }
  };
}
