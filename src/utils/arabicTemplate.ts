import type { FocusEvent } from 'react';

/**
 * Gabarits de ponctuation pré-remplis dans les champs de texte arabe, pour
 * éviter de les retaper à chaque saisie. Le texte se place entre les deux signes.
 *
 * - coran  : parenthèses coraniques ornées ﴿ … ﴾ (réservées à la parole divine).
 * - hadith : guillemets français « … » (parole rapportée du Prophète ﷺ).
 * - parole : guillemets simples ‹ … › (parole d'un savant — distinct du hadith).
 *
 * Remarque : ces signes sont ignorés par la détection de doublon (arabe_hash)
 * et par la normalisation de recherche — ils n'affectent donc pas l'unicité.
 */
export const AR_TEMPLATE: { coran: string; hadith: string; parole: string } = {
  coran: '﴿  ﴾', // ﴿  ﴾
  hadith: '«  »', // «  »
  parole: '‹  ›', // ‹  ›
};

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
