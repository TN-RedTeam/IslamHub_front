/**
 * Libellés d'interface — point de collecte unique (Phase 9.4).
 *
 * RÈGLE (dette i18n) : tout NOUVEAU texte d'interface visible se déclare ici,
 * plutôt qu'en dur dans les composants. Cela prépare une éventuelle
 * externalisation sans l'imposer maintenant.
 *
 * HORS PÉRIMÈTRE pour l'instant : l'externalisation de TOUT l'existant, la
 * traduction arabe et la bascule RTL restent un chantier futur non décidé.
 * On n'externalise donc pas rétroactivement les libellés déjà en place.
 */
export const UI = {
  nav: {
    home: 'Accueil',
    coran: 'Coran',
    croyance: 'Croyance',
    savants: 'Savants',
    search: 'Rechercher',
  },
} as const;
