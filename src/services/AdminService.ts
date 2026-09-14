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
  degre_authenticite: string; type_hadith: string; juge_par: string; rapporteur: string;
  narrateur: string;
  new_narrateur?: { nom: string; generation: string; role: string; sexe: string } | null;
  tag: string;
  sources: HadithSourceInput[];
}
export interface HadithEditShape {
  id: number; sujet: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; degre_authenticite: string | null;
  type_hadith: string | null; juge_par: string | null; rapporteur: string | null; narrateur: string | null;
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
}

export interface ParoleImageInput { image_url: string; alt: string; legende?: string | null; source_livre?: string | null; ordre?: number | null; }
export interface ParoleFormData {
  id?: number | null;
  sujet: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string;
  source_livre: string; page: string; ecole: string; tag: string;
  savant_id?: number | null;
  new_savant?: { nom: string } | null;
  images: ParoleImageInput[];
}
export interface ParoleEditShape {
  id: number; sujet: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; source_livre: string | null; page: string | null;
  ecole: string | null; savant_id: number | null; tag: string | null;
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

export interface RecitRow { id: number; slug: string; categorie: RecitCategorie; titre: string; ordre: number; }
export interface RecitFull { id?: number; slug: string; categorie: RecitCategorie; titre: string; contenu_md: string | null; image_url: string | null; ordre: number; }

class AdminRecits {
  async list(): Promise<RecitRow[]> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,ordre').order('categorie').order('ordre');
    if (error) throw error; return (data ?? []) as RecitRow[];
  }
  async get(id: number): Promise<RecitFull | null> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,contenu_md,image_url,ordre').eq('id', id).maybeSingle();
    if (error) throw error; return (data ?? null) as RecitFull | null;
  }
  async save(r: RecitFull): Promise<number> {
    const slug = (r.slug?.trim() || slugify(r.titre) || 'recit');
    const row = { slug, categorie: r.categorie, titre: r.titre.trim(), contenu_md: r.contenu_md || null, image_url: r.image_url || null, ordre: r.ordre ?? 0 };
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
