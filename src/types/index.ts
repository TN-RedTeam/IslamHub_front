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
  tag: string;
}

/** Hadith - Parole du Prophète (ﷺ) */
export interface Hadith extends BaseText {
  rapporteur: string | null;
  narrateur: string | null;
  statut: string | null;
}

/** Verset du Coran */
export interface Coran extends BaseText {
  sourate: string | null;
}

/** Dhikr - Évocation/Rappel */
export interface Dhikr extends BaseText {
  commentaire: string | null;
}

/** Douaa - Invocation */
export interface Douaa extends BaseText {
  commentaire: string | null;
}

/** Parole de savant (table `paroles`) */
export interface Parole extends BaseText {
  savant: string;
}

/** Alias historique — `Parole` est le nom canonique. */
export type Savant = Parole;

/** Vidéo YouTube (lien externe) */
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
// Fiqh / Madhaheb / Femmes
// ==========================================

/** Un point de jurisprudence (tables `fiqh` et `femmes`) */
export interface FiqhPoint {
  id: number;
  sujet: string | null;
  type: string | null;         // jugement / preuve / avis... (libre)
  texte: string | null;        // contenu français
  texte_arabe: string | null;  // contenu arabe (optionnel)
  source: string | null;
  tag: string | null;
}

/** Un chapitre regroupant des points (pour l'accordéon) */
export interface FiqhChapitre {
  chapitre: string;
  points: FiqhPoint[];
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

export type IslamicText = Hadith | Coran | Dhikr | Douaa | Parole;

// ==========================================
// Types pour la pagination
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
