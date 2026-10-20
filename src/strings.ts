/**
 * Libellés d'interface — SOURCE UNIQUE = src/locales/fr.json (Phase 15).
 *
 * `UI` reste disponible pour les composants déjà écrits (accès statique FR).
 * Les nouveaux composants et ceux rendus réactifs à la langue utilisent
 * `useTranslation()` / `t()` de react-i18next (voir src/i18n.ts). FR = défaut,
 * EN/AR vides → repli FR. Aucun texte d'interface codé en dur.
 */
import fr from './locales/fr.json';

export const UI = fr;
