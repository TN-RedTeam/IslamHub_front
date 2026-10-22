import { DEFAULT_LOCALE, type Locale } from '../i18n';

/**
 * Langues EXPOSÉES PUBLIQUEMENT au lancement.
 *
 * Décision de lancement : on ouvre en **français uniquement**. Tout le socle
 * i18n/RTL (Phase 15) reste en place mais DORMANT — l'anglais et l'arabe ne
 * sont ni listés dans le sélecteur, ni déclarés en hreflang, ni indexés, ni au
 * sitemap. Les routes `/en` et `/ar` restent accessibles (contenu éventuel)
 * mais passent en `noindex`.
 *
 * Réactiver une langue plus tard = l'ajouter ici (`['fr', 'en']` puis
 * `['fr', 'en', 'ar']`) — AUCUNE autre modification nécessaire.
 */
export const PUBLIC_LOCALES: Locale[] = ['fr'];

/** La langue publique par défaut (toujours la première exposée). */
export const PUBLIC_DEFAULT_LOCALE: Locale = PUBLIC_LOCALES[0] ?? DEFAULT_LOCALE;

/** Vrai si `l` est une langue exposée publiquement. */
export const isPublicLocale = (l: unknown): l is Locale =>
  typeof l === 'string' && (PUBLIC_LOCALES as string[]).includes(l);

/** Vrai si plusieurs langues sont exposées (→ afficher le sélecteur de langue). */
export const MULTILINGUAL_PUBLIC = PUBLIC_LOCALES.length > 1;
