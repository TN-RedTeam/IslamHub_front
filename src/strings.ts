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
  brand: {
    name: 'Aqida',
  },
  nav: {
    home: 'Accueil',
    coran: 'Coran',
    croyance: 'Croyance',
    savants: 'Savants',
    biographies: 'Biographies',
    search: 'Rechercher',
  },
  article: {
    toc: 'Sommaire',
    backToTop: 'Haut de page',
    viewScan: 'Voir le scan',
    openSource: 'Ouvrir la fiche',
    sourceDetails: 'Détails de la source',
  },
  journee: {
    title: 'Les invocations à dire dans une journée',
    subtitle: 'Du réveil au coucher',
    seeHadith: 'Voir le hadith',
  },
  hero: {
    verset: 'Verset du jour',
    versetAr: 'آية اليوم',
    hadith: 'Hadith du jour',
    parole: 'Parole de savant',
    prev: 'Précédent',
    next: 'Suivant',
    goTo: 'Aller au contenu',
  },
  femme: {
    eyebrow: 'Pour toi, ma sœur',
    title: 'La femme musulmane',
    intro: 'Les règles et prescriptions qui te concernent, expliquées avec clarté et pudeur, à partir du Coran et de la Sunna et selon la compréhension des savants.',
  },
  home: {
    featured: 'Dossier à la une',
    openDossier: 'Ouvrir le dossier',
    byTheme: 'Parcourir par thème',
    allThemes: 'Tous les thèmes',
    recent: 'Derniers ajouts',
    adhkar: 'Les évocations de la journée',
    adhkarSub: 'Un parcours d’adhkâr, du réveil au coucher.',
    startParcours: 'Commencer le parcours',
    figures: 'Repères',
  },
  browse: {
    bySubject: 'Parcourir par sujet',
    searchSubject: 'Filtrer les sujets…',
    allSubjects: 'Tous les sujets',
    noSubject: 'Aucun sujet ne correspond.',
    subjectChip: 'Sujet',
    seeTheme: 'Voir ce thème en entier',
  },
  list: {
    reset: 'Réinitialiser les filtres',
    noResultFor: 'Aucun résultat pour',
    noResultHint: 'Essaie un autre mot-clé, ou retire un filtre.',
    clearSearch: 'Effacer la recherche',
  },
} as const;
