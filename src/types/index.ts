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
  ecole?: string | null; // école du savant (dénormalisée) : Hanafi, Malikite...
}

/** Alias historique — `Parole` est le nom canonique. */
export type Savant = Parole;

/** Fiche savant (table `savants`) pour la page /savants */
export interface SavantInfo {
  id: number;
  nom: string;
  slug: string;               // segment d'URL de la fiche savant
  ecole: string | null;       // nom de l'école (Hanafi, Malikite...)
  ecole_slug: string | null;  // segment d'URL de la page école
  biographie: string | null;  // Markdown
  nb_paroles: number;         // nombre de paroles rattachées
}

/** Coran — exégèse (Phase 8). */
export interface SourateInfo {
  numero: number;
  nom: string;
  nom_arabe: string | null;
  slug: string;
  revelation: string | null;
  nb_versets: number | null;
  a_du_contenu: boolean;
}
export interface SourateDetail {
  sourate: {
    numero: number;
    nom: string;
    nom_arabe: string | null;
    slug: string;
    revelation: string | null;
    nb_versets: number | null;
  };
  versets: {
    numero: number;
    texte_arabe: string | null;
    texte_francais: string | null;
    phonetique: string | null;
    exegeses: { texte: string; source: string | null }[];
  }[];
}

/** Fiche d'un hadith (page /hadiths/:id/:slug). */
export interface HadithDetail {
  id: number;
  sujet: string;
  slug: string | null;
  texte_arabe: string;
  texte_francais: string | null;
  'phonétique'?: string | null;
  explication: string | null;
  degre_authenticite: string | null;
  type_hadith: string | null;
  juge_par: string | null;
  rapporteur: string | null;
  narrateur: string | null;
  tag: string | null;
  recueils: string | null;
}

/** Fiche savant détaillée (page /savants/:slug) : bio + paroles + hadiths jugés. */
export interface SavantDetail {
  savant: {
    id: number;
    nom: string;
    slug: string;
    biographie: string | null;
    ecole: string | null;
    ecole_slug: string | null;
  };
  paroles: {
    id: number;
    sujet: string | null;
    slug: string | null;
    texte_arabe: string | null;
    texte_francais: string | null;
    'phonétique'?: string | null;
    explication: string | null;
    ecole: string | null;
  }[];
  hadiths_juges: { id: number; sujet: string | null; slug: string | null; degre_authenticite: string | null }[];
}

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
// Fiqh / Madhaheb (points de jurisprudence par école)
// ==========================================

/** Un point de jurisprudence (table `fiqh`) */
export interface FiqhPoint {
  id: number;
  sujet: string | null;
  type: string | null;         // jugement / preuve / avis... (libre)
  texte: string | null;        // contenu français
  texte_arabe: string | null;  // contenu arabe (optionnel)
  source: string | null;
  tag: string | null;
}

/** Un chapitre regroupant des points de fiqh (pour l'accordéon école) */
export interface FiqhChapitre {
  chapitre: string;
  points: FiqhPoint[];
}

// ==========================================
// Femmes (format matn + commentaire)
// ==========================================

/** Un segment : phrase du texte de base (matn) + son commentaire */
export interface FemmesSegment {
  id: number;
  matn: string | null;         // phrase du texte de base (vide pour intro/titre)
  commentaire: string | null;  // explication (ou paragraphe libre)
  texte_arabe: string | null;
  source: string | null;
}

/** Un chapitre regroupant des segments (pour l'accordéon Femmes) */
export interface FemmesChapitre {
  chapitre: string;
  segments: FemmesSegment[];
}

// ==========================================
// Types pour les horaires de prière
// ==========================================

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

// ==========================================
// Dossiers thématiques (croyance / preuves / réponse)
// ==========================================

export interface DossierPreuveRef {
  id: number;
  sujet?: string | null;
  slug?: string | null;
  texte_arabe?: string | null;
  texte_francais?: string | null;
  'phonétique'?: string | null;
  // hadith
  degre_authenticite?: string | null;
  type_hadith?: string | null;
  juge_par?: string | null;
  recueils?: string | null;
  // parole
  savant?: string | null;
  ecole?: string | null;
  explication?: string | null;
  // verset
  sourate?: string | null;
}

export interface DossierPreuve {
  id: number;
  type: 'hadith' | 'parole' | 'verset';
  ordre: number;
  ref: DossierPreuveRef | null;
}

export interface DossierImage {
  id: number;
  image_url: string;
  legende?: string | null;
  alt: string;
  source_livre?: string | null;
  ordre: number;
}

export interface DossierData {
  dossier: {
    id: number;
    slug: string;
    h1: string;
    meta_title?: string | null;
    meta_description?: string | null;
    croyance_texte?: string | null;
    objection_texte?: string | null;
    reponse_texte?: string | null;
  };
  preuves: DossierPreuve[];
  images: DossierImage[];
  lies: { slug: string; h1: string }[];
}
