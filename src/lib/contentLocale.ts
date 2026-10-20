import i18n, { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n';

/**
 * Langue de CONTENU active pour les requêtes locale-aware (Phase 15.5).
 *
 * Lue sur i18next, que `LocaleEffects` (App.tsx) synchronise avec le préfixe
 * d'URL (`/fr` · `/en` · `/ar`). Repli sur la langue par défaut hors contexte
 * (ex. admin, prérendu). À passer en `p_locale` aux RPC de lecture :
 * le contenu EN retombe sur FR tant qu'il est vide ; l'AR est son corpus propre.
 */
export function getContentLocale(): Locale {
  const l = i18n.language?.slice(0, 2);
  return isLocale(l) ? l : DEFAULT_LOCALE;
}
