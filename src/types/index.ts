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
  narrateur_generation?: string | null; // génération du narrateur (Phase 12.6, option 1)
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

/** Type d'une entrée de la table unifiée `invocations`. */
export type InvocationType = 1 | 2; // 1 = invocation (douʿā'), 2 = évocation (dhikr)

/**
 * Invocation / Évocation — table unifiée (fusion des ex-tables douaas + dhikrs).
 * `type_id` distingue une invocation (1) d'une évocation (2).
 */
export interface Invocation extends BaseText {
  type_id: InvocationType;
  commentaire: string | null;
}

/** Parole de savant (table `paroles`) */
export interface Parole extends BaseText {
  savant: string;
  slug?: string | null;  // segment d'URL de la page /paroles/:slug
  ecole?: string | null; // école du savant (dénormalisée) : Hanafi, Malikite...
}

/** Un scan de livre rattaché à une parole (table `parole_images`). */
export interface ParoleImage {
  id: number;
  image_url: string;
  legende: string | null;
  alt: string;
  source_livre: string | null;
  ordre: number;
}

/** Fiche parole complète (page /paroles/:slug) : parole + savant + référence + scans. */
export interface ParoleDetail {
  id: number;
  slug: string;
  sujet: string | null;
  texte_arabe: string | null;
  texte_francais: string | null;
  phonetique: string | null;
  explication: string | null;
  source_livre: string | null;
  page: string | null;
  ecole: string | null;
  savant: string | null;
  savant_slug: string | null;    // → /savants/:slug
  generation: string | null;     // badge de génération
  images: ParoleImage[];         // 0..N scans du livre (table parole_images)
}

/** Alias historique — `Parole` est le nom canonique. */
export type Savant = Parole;

/** Fiche savant (table `savants`) pour la page /savants */
export interface SavantInfo {
  id: number;
  nom: string;
  nom_arabe: string | null;
  slug: string;               // segment d'URL de la fiche savant
  ecole: string | null;       // nom de l'école (Hanafi, Malikite...)
  ecole_slug: string | null;  // segment d'URL de la page école
  naissance: string | null;   // ex « 150 H »
  deces: string | null;
  resume: string | null;      // phrase courte affichée sur la carte
  domaines: string[];         // Hadith, Fiqh, Aqida, Tafsir, Langue…
  nb_paroles: number;
  generation?: string | null; // sahabi | tabii | tabi_tabii | khalaf (Phase 12.6)
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
  narrateur_generation?: string | null;
  tag: string | null;
  recueils: string | null;
}

/** Infos légères d'un savant (mini-bio au survol). */
export interface SavantMini {
  nom: string;
  slug: string;
  ecole: string | null;
  resume: string | null;
}

/** Fiche savant détaillée (page /savants/:slug) : bio + paroles + hadiths jugés. */
export interface SavantDetail {
  savant: {
    id: number;
    nom: string;
    slug: string;
    nom_arabe: string | null;
    naissance: string | null;
    deces: string | null;
    biographie: string | null;
    ecole: string | null;
    ecole_slug: string | null;
    generation?: string | null; // Phase 12.6
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

// ==========================================
// Versets équivoques (Phase 12.4)
// ==========================================

/** Carte d'index d'un verset équivoque. */
export interface VersetEquivoqueCard {
  id: number;
  slug: string;
  theme: string;
  sourate: string;
  sourate_num: number | null;
  ayah: number | null;
  verset_arabe: string;
  verset_traduction: string | null;
  sens_juste: string | null;
}

/** Preuve rattachée à un verset (coranique libre, ou hadith/parole résolu). */
export interface VersetPreuve {
  id: number;
  type: 'coran' | 'hadith' | 'parole';
  ordre: number;
  contenu_libre: string | null;
  texte_arabe: string | null;
  texte_francais: string | null;
  savant: string | null;
  savant_slug: string | null;
  generation: string | null;
  ecole: string | null;
  sujet: string | null;
  degre: string | null;
  hadith_slug: string | null;
}

/** Scan de livre attaché à un verset. */
export interface VersetImage {
  id: number;
  image_url: string;
  legende: string | null;
  alt: string;
  source_livre: string | null;
  ordre: number;
}

/** Détail complet d'une fiche de verset équivoque. */
export interface VersetEquivoqueDetail {
  verset: {
    id: number;
    slug: string;
    theme: string;
    sourate: string;
    sourate_num: number | null;
    ayah: number | null;
    verset_arabe: string;
    verset_traduction: string | null;
    verset_phonetique: string | null;
    sens_juste: string | null;
    objection: string | null;
    reponse: string | null;
  };
  preuves: VersetPreuve[];
  images: VersetImage[];
  lies: { slug: string; theme: string; sourate: string; ayah: number | null }[];
}

// ==========================================
// Les 99 Noms d'Allah (Phase 12.5)
// ==========================================
export interface NomAllah {
  id: number;
  ordre: number | null;
  nom_arabe: string;
  translitteration: string | null;
  sens_fr: string | null;       // rempli par l'auteur
  explication: string | null;
  slug: string;
  a_relire?: boolean;
}

// ==========================================
// Les Attributs d'Allah (aṣ-ṣifāt) — Phase 13.6 (BDD)
// ==========================================
/**
 * Une preuve d'un attribut, table enfant.
 * - `type = 'verset' | 'hadith'` : preuve en clair (arabe/phonetique/signification/ref).
 * - `type = 'parole'` : référence une parole existante (`paroles`). Le back-end
 *   renseigne alors savant/savant_slug/generation/parole_slug et remplit
 *   arabe/signification/ref depuis la parole — SANS le scan (réservé à /paroles/:slug).
 */
export interface AttributCitation {
  id: number;
  type: 'verset' | 'hadith' | 'parole';
  arabe: string | null;
  phonetique: string | null;
  signification: string | null;  // sens FR (affiché en gras)
  ref: string | null;            // ex. « Sourate Al-Baqara, 282 »
  // Champs renseignés uniquement pour les preuves de type 'parole' :
  parole_slug?: string | null;   // → /paroles/:slug
  savant?: string | null;
  savant_slug?: string | null;   // → /savants/:slug
  generation?: string | null;    // badge de génération
}
export interface Attribut {
  id: number;
  ordre: number | null;
  slug: string;
  nom: string;                    // translittération (ex. Al-ʿIlm)
  gloss: string | null;          // glose FR (ex. La science)
  explication: string | null;    // exposé FR, rempli par l'auteur
  citations: AttributCitation[]; // 0..N preuves (versets et/ou hadiths)
}

/** Page d'exposé éditorial (table `exposes`) — contenu Markdown éditable en base. */
export interface Expose {
  slug: string;
  titre: string | null;
  contenu_md: string | null;
}
