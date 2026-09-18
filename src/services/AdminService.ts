import { supabase } from './supabase';
import { slugify } from '../utils/slug';
import type { ThemeRef, RecitCategorie } from '../types';

export interface NarrateurRow { id: number; nom: string; generation: string | null; role: string | null; sexe: string | null; }
export interface RecueilRow { id: number; titre: string; savant_id: number | null; auteur: string | null; }
export interface SavantRow { id: number; nom: string; }

export interface HadithSourceInput {
  recueil_id?: number | null;
  new_recueil?: { titre: string; savant_id: number | null } | null;
  numero?: string | null;
  chapitre?: string | null;
}
export interface HadithFormData {
  id?: number | null;
  sujet: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string;
  degre_authenticite: string; type_hadith: string; juge_par: string;
  // Liaisons = source de vérité. On envoie les identifiants ; le texte rapporteur/narrateur
  // est régénéré côté base par un trigger (agrégation triée des noms).
  rapporteur_ids?: number[];
  narrateur_ids?: number[];
  new_narrateur?: { nom: string; generation: string; role: string; sexe: string } | null;
  tag: string;
  sources: HadithSourceInput[];
}
export interface HadithEditShape {
  id: number; sujet: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; degre_authenticite: string | null;
  type_hadith: string | null; juge_par: string | null; rapporteur: string | null; narrateur: string | null;
  rapporteur_ids: number[]; narrateur_ids: number[];
  tag: string | null; sources: { recueil_id: number; numero: string | null; chapitre: string | null }[];
}

class AdminService {
  async listNarrateurs(): Promise<NarrateurRow[]> {
    const { data, error } = await supabase.from('narrateurs').select('id,nom,generation,role,sexe').order('nom');
    if (error) throw error; return (data ?? []) as NarrateurRow[];
  }
  async listRecueils(): Promise<RecueilRow[]> {
    const { data, error } = await supabase.from('recueils').select('id,titre,savant_id,savants(nom)').order('titre');
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as number, titre: r.titre as string, savant_id: (r.savant_id as number) ?? null,
      auteur: (r.savants as { nom?: string } | null)?.nom ?? null,
    }));
  }
  async listSavants(): Promise<SavantRow[]> {
    const { data, error } = await supabase.from('savants').select('id,nom').order('nom');
    if (error) throw error; return (data ?? []) as SavantRow[];
  }
  async getHadithForEdit(id: number): Promise<HadithEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_hadith', { p_id: id });
    if (error) throw error; return (data ?? null) as HadithEditShape | null;
  }
  async themesForTag(tag: string): Promise<ThemeRef[]> {
    const { data, error } = await supabase.rpc('themes_for_tag', { p_tag: tag });
    if (error) throw error; return (data ?? []) as ThemeRef[];
  }
  async saveHadith(payload: HadithFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_hadith', { p: payload });
    if (error) throw error; return data as number;
  }
  async listRapporteurs(): Promise<string[]> {
    const { data, error } = await supabase.rpc('hadith_rubriques');
    if (error) throw error;
    return ((data as { rapporteurs?: string[] } | null)?.rapporteurs ?? []) as string[];
  }

  // ---- Paroles ----
  async getParoleForEdit(id: number): Promise<ParoleEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_parole', { p_id: id });
    if (error) throw error; return (data ?? null) as ParoleEditShape | null;
  }
  async saveParole(payload: ParoleFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_parole', { p: payload });
    if (error) throw error; return data as number;
  }

  // ---- Versets / hadiths équivoques ----
  async getVersetForEdit(id: number): Promise<VersetEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_verset_equivoque', { p_id: id });
    if (error) throw error; return (data ?? null) as VersetEditShape | null;
  }
  async saveVerset(payload: VersetFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_verset_equivoque', { p: payload });
    if (error) throw error; return data as number;
  }
  async listVersetRefs(): Promise<VersetRefs> {
    const { data, error } = await supabase.rpc('admin_list_verset_refs');
    if (error) throw error;
    const d = (data ?? {}) as Partial<VersetRefs>;
    return { hadiths: d.hadiths ?? [], paroles: d.paroles ?? [], versets: d.versets ?? [] };
  }
  async listVersets(): Promise<VersetListRow[]> {
    const { data, error } = await supabase
      .from('versets_equivoques')
      .select('id,slug,type,theme,sourate,ayah,published')
      .order('sourate_num', { nullsFirst: false }).order('ayah', { nullsFirst: false }).order('id');
    if (error) throw error; return (data ?? []) as VersetListRow[];
  }

  // ---- Coran thématique (table `coran`) ----
  async getCoranForEdit(id: number): Promise<CoranEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_coran', { p_id: id });
    if (error) throw error; return (data ?? null) as CoranEditShape | null;
  }
  async saveCoran(payload: CoranFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_coran', { p: payload });
    if (error) throw error; return data as number;
  }
  async listCorans(): Promise<CoranRow[]> {
    const { data, error } = await supabase.from('coran').select('id,sujet,sourate').order('sujet');
    if (error) throw error; return (data ?? []) as CoranRow[];
  }

  // ---- Exégèse : sourates -> versets -> exégèses ----
  async getSourateForEdit(id: number): Promise<SourateEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_sourate', { p_id: id });
    if (error) throw error; return (data ?? null) as SourateEditShape | null;
  }
  async saveSourate(payload: SourateFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_sourate', { p: payload });
    if (error) throw error; return data as number;
  }
  async listSourates(): Promise<SourateRow[]> {
    const { data, error } = await supabase.rpc('admin_list_sourates');
    if (error) throw error; return (data ?? []) as SourateRow[];
  }

  // ---- Invocations & Évocations (table `invocations`) ----
  async getInvocationForEdit(id: number): Promise<InvocationEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_invocation', { p_id: id });
    if (error) throw error; return (data ?? null) as InvocationEditShape | null;
  }
  async saveInvocation(payload: InvocationFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_invocation', { p: payload });
    if (error) throw error; return data as number;
  }
  async listInvocations(): Promise<InvocationRow[]> {
    const { data, error } = await supabase.from('invocations').select('id,type_id,sujet,tag').order('type_id').order('sujet');
    if (error) throw error; return (data ?? []) as InvocationRow[];
  }

  // ---- Savants (fiche complète) ----
  async getSavantForEdit(id: number): Promise<SavantEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_savant', { p_id: id });
    if (error) throw error; return (data ?? null) as SavantEditShape | null;
  }
  async saveSavant(payload: SavantFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_savant', { p: payload });
    if (error) throw error; return data as number;
  }
  async listSavantsFull(): Promise<SavantFullRow[]> {
    const { data, error } = await supabase.from('savants').select('id,nom,slug,generation,ecole_id').order('nom');
    if (error) throw error; return (data ?? []) as SavantFullRow[];
  }
  async listEcoles(): Promise<EcoleRow[]> {
    const { data, error } = await supabase.from('ecoles').select('id,nom').order('id');
    if (error) throw error; return (data ?? []) as EcoleRow[];
  }

  // ---- Dossiers thématiques ----
  async getDossierForEdit(id: number): Promise<DossierEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_dossier', { p_id: id });
    if (error) throw error; return (data ?? null) as DossierEditShape | null;
  }
  async saveDossier(payload: DossierFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_dossier', { p: payload });
    if (error) throw error; return data as number;
  }
  async listDossiers(): Promise<DossierListRow[]> {
    const { data, error } = await supabase.rpc('admin_list_dossiers');
    if (error) throw error; return (data ?? []) as DossierListRow[];
  }
  async listDossierRefs(): Promise<DossierRefs> {
    const { data, error } = await supabase.rpc('admin_list_dossier_refs');
    if (error) throw error;
    const d = (data ?? {}) as Partial<DossierRefs>;
    return { hadiths: d.hadiths ?? [], paroles: d.paroles ?? [], versets: d.versets ?? [] };
  }

  // ---- Exposés ----
  async getExposeForEdit(slug: string): Promise<ExposeEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_expose', { p_slug: slug });
    if (error) throw error; return (data ?? null) as ExposeEditShape | null;
  }
  async saveExpose(payload: ExposeFormData): Promise<string> {
    const { data, error } = await supabase.rpc('admin_save_expose', { p: payload });
    if (error) throw error; return data as string;
  }
  async listExposes(): Promise<ExposeListRow[]> {
    const { data, error } = await supabase.rpc('admin_list_exposes');
    if (error) throw error; return (data ?? []) as ExposeListRow[];
  }
  async listExposeRefs(): Promise<ExposeRefs> {
    const { data, error } = await supabase.rpc('admin_list_expose_refs');
    if (error) throw error;
    const d = (data ?? {}) as Partial<ExposeRefs>;
    return { hadiths: d.hadiths ?? [], paroles: d.paroles ?? [] };
  }

  // ---- Fiqh ----
  async getFiqhForEdit(id: number): Promise<FiqhEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_fiqh', { p_id: id });
    if (error) throw error; return (data ?? null) as FiqhEditShape | null;
  }
  async saveFiqh(payload: FiqhFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_fiqh', { p: payload });
    if (error) throw error; return data as number;
  }
  async listFiqh(): Promise<FiqhRow[]> {
    const { data, error } = await supabase.from('fiqh').select('id,ecole,chapitre,sujet,ordre').order('ecole').order('ordre');
    if (error) throw error; return (data ?? []) as FiqhRow[];
  }

  // ---- Femmes ----
  async getFemmeForEdit(id: number): Promise<FemmeEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_femme', { p_id: id });
    if (error) throw error; return (data ?? null) as FemmeEditShape | null;
  }
  async saveFemme(payload: FemmeFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_femme', { p: payload });
    if (error) throw error; return data as number;
  }
  async listFemmes(): Promise<FemmeRow[]> {
    const { data, error } = await supabase.from('femmes').select('id,chapitre,matn,ordre').order('ordre');
    if (error) throw error; return (data ?? []) as FemmeRow[];
  }

  // ---- Contenu composable (blocs, Phase 3) ----
  async getBlocsForEdit(parentType: string, parentId: string | number): Promise<BlocInput[]> {
    const { data, error } = await supabase.rpc('admin_get_blocs', { p_parent_type: parentType, p_parent_id: String(parentId) });
    if (error) throw error; return (data ?? []) as BlocInput[];
  }
  async saveBlocs(parentType: string, parentId: string | number, blocs: BlocInput[]): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_blocs', { p: { parent_type: parentType, parent_id: String(parentId), blocs } });
    if (error) throw error; return data as number;
  }

  // ---- Suppression admin (Phase 4.6) ----
  async entryDependencies(kind: DeletableKind, id: string | number): Promise<EntryDeps> {
    const { data, error } = await supabase.rpc('admin_entry_dependencies', { p_kind: kind, p_id: String(id) });
    if (error) throw error;
    return (data ?? { total: 0, refs: {} }) as EntryDeps;
  }
  async deleteEntry(kind: DeletableKind, id: string | number, force = false): Promise<void> {
    const { error } = await supabase.rpc('admin_delete_entry', { p: { kind, id: String(id), force } });
    if (error) throw error;
  }

  // ---- Recherche d'occurrences → correction (tout mot, toutes rubriques) ----
  async searchOccurrences(q: string, limit = 150): Promise<OccurrenceHit[]> {
    const { data, error } = await supabase.rpc('admin_search_occurrences', { q, p_limit: limit });
    if (error) throw error; return (data ?? []) as OccurrenceHit[];
  }
}

export interface OccurrenceHit { kind: string; ref: string; label: string | null; extrait: string | null; path: string; }

export interface ParoleImageInput { image_url: string; alt: string; legende?: string | null; source_livre?: string | null; ordre?: number | null; }
export interface ParoleFormData {
  id?: number | null;
  sujet: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string;
  source_livre: string; page: string; ecole: string; tag: string;
  savant_id?: number | null;
  new_savant?: { nom: string } | null;
  rapporteur_savant_id?: number | null;
  commente_parole_id?: number | null;
  images: ParoleImageInput[];
}
export interface ParoleEditShape {
  id: number; sujet: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; source_livre: string | null; page: string | null;
  ecole: string | null; savant_id: number | null; tag: string | null;
  rapporteur_savant_id: number | null; commente_parole_id: number | null;
  images: { image_url: string; alt: string | null; legende: string | null; source_livre: string | null; ordre: number | null }[];
}

export type VersetType = 'verset' | 'hadith';
export type PreuveType = 'coran' | 'hadith' | 'parole';
export interface RefOption { id: number; label: string; }
export interface VersetRefs { hadiths: RefOption[]; paroles: RefOption[]; versets: RefOption[]; }
export interface VersetPreuveInput { type: PreuveType; ref_id?: number | null; contenu_libre?: string | null; ordre?: number | null; }
export interface VersetImageInput { image_url: string; alt: string; legende?: string | null; source_livre?: string | null; ordre?: number | null; }
export interface VersetFormData {
  id?: number | null;
  slug?: string | null;
  type: VersetType; theme: string; sourate: string; sourate_num: string; ayah: string;
  verset_arabe: string; verset_traduction: string; verset_phonetique: string;
  sens_juste: string; objection: string; reponse: string;
  rapporteur: string; recueil: string; numero: string;
  published: boolean;
  preuves: VersetPreuveInput[];
  images: VersetImageInput[];
  lies: number[];
}
export interface VersetListRow { id: number; slug: string; type: VersetType; theme: string; sourate: string; ayah: number | null; published: boolean; }
export interface VersetEditShape {
  id: number; slug: string; type: VersetType; theme: string; sourate: string;
  sourate_num: number | null; ayah: number | null;
  verset_arabe: string; verset_traduction: string | null; verset_phonetique: string | null;
  sens_juste: string | null; objection: string | null; reponse: string | null;
  rapporteur: string | null; recueil: string | null; numero: string | null; published: boolean;
  preuves: VersetPreuveInput[];
  images: { image_url: string; alt: string | null; legende: string | null; source_livre: string | null; ordre: number | null }[];
  lies: number[];
}

// ---- Coran thématique ----
export interface CoranFormData {
  id?: number | null;
  sujet: string; sourate: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string; tag: string;
}
export interface CoranEditShape {
  id: number; sujet: string; sourate: string | null; texte_arabe: string;
  texte_francais: string | null; phonetique: string | null; explication: string | null; tag: string | null;
}
export interface CoranRow { id: number; sujet: string; sourate: string | null; }

// ---- Exégèse (sourates -> versets -> exégèses) ----
export interface ExegeseInput { texte: string; source?: string | null; ordre?: number | null; }
export interface VersetInput { numero: string; texte_arabe: string; texte_francais: string; phonetique: string; exegeses: ExegeseInput[]; }
export interface SourateFormData {
  id?: number | null;
  numero: string; nom: string; nom_arabe: string; slug?: string | null; revelation: string; nb_versets: string;
  versets: VersetInput[];
}
export interface SourateEditShape {
  id: number; numero: number; nom: string; nom_arabe: string | null; slug: string; revelation: string | null; nb_versets: number | null;
  versets: { numero: number; texte_arabe: string | null; texte_francais: string | null; phonetique: string | null;
             exegeses: { texte: string; source: string | null; ordre: number | null }[] }[];
}
export interface SourateRow { id: number; numero: number; nom: string; slug: string; nb_versets_saisis: number; }

// ---- Invocations & Évocations ----
export interface InvocationFormData {
  id?: number | null;
  type_id: number; sujet: string; texte_arabe: string; texte_francais: string;
  phonetique: string; explication: string; commentaire: string; tag: string;
}
export interface InvocationEditShape {
  id: number; type_id: number; sujet: string; texte_arabe: string;
  texte_francais: string | null; phonetique: string | null; explication: string | null;
  commentaire: string | null; tag: string | null;
}
export interface InvocationRow { id: number; type_id: number; sujet: string; tag: string | null; }

// ---- Savants (fiche complète) ----
export interface EcoleRow { id: number; nom: string; }
export interface SavantFormData {
  id?: number | null;
  nom: string; nom_arabe: string; slug?: string | null; ecole_id: number | null;
  generation: string; naissance: string; deces: string; resume: string; biographie: string;
  domaines: string[];
}
export interface SavantEditShape {
  id: number; nom: string; nom_arabe: string | null; slug: string | null; ecole_id: number | null;
  generation: string | null; naissance: string | null; deces: string | null;
  resume: string | null; biographie: string | null; domaines: string[] | null;
}
export interface SavantFullRow { id: number; nom: string; slug: string | null; generation: string | null; ecole_id: number | null; }

// ---- Dossiers thématiques ----
export type DossierPreuveType = 'hadith' | 'parole' | 'verset';
export interface DossierRefs { hadiths: RefOption[]; paroles: RefOption[]; versets: RefOption[]; }
export interface DossierPreuveInput { type: DossierPreuveType; ref_id: number | null; ordre?: number | null; }
export interface DossierImageInput { image_url: string; alt: string; legende?: string | null; source_livre?: string | null; ordre?: number | null; }
export interface DossierFormData {
  id?: number | null; slug?: string | null; h1: string; meta_title: string; meta_description: string;
  croyance_texte: string; objection_texte: string; reponse_texte: string; published: boolean;
  preuves: DossierPreuveInput[]; images: DossierImageInput[]; lies: number[];
}
export interface DossierEditShape {
  id: number; slug: string; h1: string; meta_title: string | null; meta_description: string | null;
  croyance_texte: string | null; objection_texte: string | null; reponse_texte: string | null; published: boolean;
  preuves: DossierPreuveInput[];
  images: { image_url: string; alt: string | null; legende: string | null; source_livre: string | null; ordre: number | null }[];
  lies: number[];
}
export interface DossierListRow { id: number; slug: string; h1: string; published: boolean; }

// ---- Exposés ----
export type CitationType = 'verset' | 'hadith' | 'parole';
export interface ExposeRefs { hadiths: RefOption[]; paroles: RefOption[]; }
export interface ExposeCitationInput {
  section: string; type: CitationType; ref_id: number | null;
  arabe: string; phonetique: string; signification: string; ref: string; accordeon: boolean; ordre?: number | null;
}
export interface ExposeFormData {
  slug?: string | null; titre: string; contenu_md: string;
  verset_arabe: string; verset_traduction: string; verset_phonetique: string; verset_ref: string;
  citations: ExposeCitationInput[];
}
export interface ExposeEditShape {
  slug: string; titre: string | null; contenu_md: string | null;
  verset_arabe: string | null; verset_traduction: string | null; verset_phonetique: string | null; verset_ref: string | null;
  citations: { section: number | null; type: CitationType; ref_id: number | null; arabe: string | null;
               phonetique: string | null; signification: string | null; ref: string | null; accordeon: boolean; ordre: number | null }[];
}
export interface ExposeListRow { slug: string; titre: string | null; }

// ---- Suppression admin (Phase 4.6) ----
export type DeletableKind =
  | 'hadith' | 'parole' | 'coran' | 'verset' | 'equivoque' | 'dossier' | 'expose'
  | 'recit' | 'invocation' | 'fiqh' | 'femme' | 'sourate' | 'savant';
export interface EntryDeps {
  total: number;
  refs: { articles?: number; equivoques?: number; dossiers?: number; exposes?: number; attributs?: number };
}

// ---- Contenu composable (blocs, Phase 3) ----
export type BlocType = 'texte' | 'commentaire' | 'preuve';
export type BlocCitationType = 'verset' | 'hadith' | 'parole';
export interface BlocInput {
  type: BlocType;
  ordre?: number;
  texte_md?: string | null;
  citation_type?: BlocCitationType | null;
  citation_id?: number | null;
  commentaire_md?: string | null;
}

// ---- Fiqh ----
export interface FiqhFormData {
  id?: number | null;
  ecole: string; chapitre: string; sujet: string; type: string; texte: string; texte_arabe: string; source: string; tag: string; ordre: string;
}
export interface FiqhEditShape {
  id: number; ecole: string; chapitre: string; sujet: string | null; type: string | null;
  texte: string | null; texte_arabe: string | null; source: string | null; tag: string; ordre: number;
}
export interface FiqhRow { id: number; ecole: string; chapitre: string; sujet: string | null; ordre: number; }

// ---- Femmes ----
export interface FemmeFormData {
  id?: number | null;
  chapitre: string; matn: string; commentaire: string; texte_arabe: string; source: string; ordre: string;
}
export interface FemmeEditShape {
  id: number; chapitre: string; matn: string | null; commentaire: string | null; texte_arabe: string | null; source: string | null; ordre: number;
}
export interface FemmeRow { id: number; chapitre: string; matn: string | null; ordre: number; }

export interface RecitRow { id: number; slug: string; categorie: RecitCategorie; titre: string; ordre: number; parent_recit_id: number | null; }
export interface RecitFull { id?: number; slug: string; categorie: RecitCategorie; titre: string; contenu_md: string | null; image_url: string | null; ordre: number; parent_recit_id?: number | null; }

class AdminRecits {
  async list(): Promise<RecitRow[]> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,ordre,parent_recit_id').order('categorie').order('ordre');
    if (error) throw error; return (data ?? []) as RecitRow[];
  }
  async get(id: number): Promise<RecitFull | null> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,contenu_md,image_url,ordre,parent_recit_id').eq('id', id).maybeSingle();
    if (error) throw error; return (data ?? null) as RecitFull | null;
  }
  async save(r: RecitFull): Promise<number> {
    const slug = (r.slug?.trim() || slugify(r.titre) || 'recit');
    const row = { slug, categorie: r.categorie, titre: r.titre.trim(), contenu_md: r.contenu_md || null, image_url: r.image_url || null, ordre: r.ordre ?? 0, parent_recit_id: r.parent_recit_id ?? null };
    if (r.id) {
      const { error } = await supabase.from('recits').update(row).eq('id', r.id); if (error) throw error; return r.id;
    }
    const { data, error } = await supabase.from('recits').insert(row).select('id').single();
    if (error) throw error; return (data as { id: number }).id;
  }
}
export const adminRecits = new AdminRecits();

export const adminService = new AdminService();
export default adminService;
