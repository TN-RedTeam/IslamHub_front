import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

/**
 * Fondations i18n (Phase 15) — libellés d'INTERFACE.
 * Ressources BUNDLÉES (offline Capacitor, aucun chargement réseau).
 * FR rempli ; EN/AR vides → repli automatique sur FR (returnEmptyString:false)
 * pour ne jamais afficher de clé brute ni de vide.
 */
export const LOCALES = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';
export const RTL_LOCALES: readonly Locale[] = ['ar'];
export const isLocale = (v: string | undefined | null): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);
export const dirFor = (l: Locale): 'rtl' | 'ltr' => (RTL_LOCALES.includes(l) ? 'rtl' : 'ltr');

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: LOCALES as unknown as string[],
  interpolation: { escapeValue: false }, // React échappe déjà
  returnEmptyString: false,               // valeur vide EN/AR → repli FR
  keySeparator: '.',
  nsSeparator: false,
});

export default i18n;
