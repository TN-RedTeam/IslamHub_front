// ==========================================
// Types de base pour les textes islamiques
// ==========================================

/** Structure de base commune à tous les textes */
export interface BaseText {
  id: number;
  sujet: string;
  texte_arabe: string;
  texte_francais: string | null;
  phonétique: string | null;
  explication: string | null;
  tag: string | null;
}

/** Hadith - Parole du Prophète (ﷺ) */
export interface Hadith extends BaseText {
  rapporteur: string | null;  // Ex: "Al-Bukhari", "Muslim"
  narrateur: string | null;   // Ex: "`Aichah", "Omar"
  statut: string | null;      // Ex: "Sahih", "Hassan"
}

/** Verset du Coran */
export interface Coran extends BaseText {
  sourate: string | null;     // Ex: "Al-Baqarah / 26"
}

/** Dhikr - Évocation/Rappel */
export interface Dhikr extends BaseText {
  commentaire: string | null;
}

/** Douaa - Invocation */
export interface Douaa extends BaseText {
  commentaire: string | null;
}

/** Citation de savant */
export interface Savant extends BaseText {
  savant: string;             // Nom du savant
}

/** Vidéo YouTube (lien externe, pas de contenu Arabe/Français) */
export interface Multimedia {
  id: number;
  youtube_id: string;
  titre: string;
  description: string | null;
  categorie: string;
  savant: string | null;
  duree_secondes: number | null;
  created_at: string;
}

/** Catégorie multimédia avec compteur */
export interface MultimediaCategory {
  categorie: string;
  count: number;
}

// ==========================================
// Types pour les horaires de prière
// ==========================================

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface City {
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// ==========================================
// Types pour l'état de l'application
// ==========================================

export interface DataState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

export interface DailyQuote {
  text: string;
  author: string;
  source?: string;
}

// ==========================================
// Types pour les filtres et recherche
// ==========================================

export interface SearchFilters {
  searchTerm: string;
  selectedTag: string | null;
  selectedType: number | null;
}

// ==========================================
// Union type pour tous les textes
// ==========================================

export type IslamicText = Hadith | Coran | Dhikr | Douaa | Savant;

// ==========================================
// Types pour la pagination (futur Supabase)
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
