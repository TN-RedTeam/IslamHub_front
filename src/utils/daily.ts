/**
 * Numéro du jour dans l'année (1er janvier ≈ 1). Base de la rotation
 * DÉTERMINISTE des contenus du jour (hadith/verset/invocation/parole) et de
 * l'index de départ du carrousel : même valeur toute la journée, incrémentée au
 * passage de minuit. La date est injectable pour les tests.
 */
export const dayOfYear = (d: Date = new Date()): number =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
