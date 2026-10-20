import { supabase } from './supabase';
import { slugify } from '../utils/slug';
import type { ThemeRef, RecitCategorie } from '../types';

export interface NarrateurRow { id: number; nom: string; generation: string | null; role: string | null; sexe: string | null; }
export interface RecueilRow { id: number; titre: string; savant_id: number | null; auteur: string | null; }
export interface SavantRow { id: number; nom: string; }

// Statut de traduction d'une entrée (Phase 15.7).
export interface TranslationVersion { exists: boolean; id: number | null; publiee: boolean; }
export interface TranslationStatus {
  translation_group: string;
  fr: TranslationVersion;
  en: TranslationVersion;
  ar: TranslationVersion;
}

export interface HadithSourceInput {
  recueil_id?: number | null;
  new_recueil?: { titre: string; savant_id: number | null } | null;
  numero?: string | null;
  chapitre?: string | null;
}
export interface HadithFormData {
  id?: number | null;
  sujet: string; rubrique: string; intro: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string;
  degre_authenticite: string; type_hadith: string; juge_par: string;
  // Liaisons = source de vérité. On envoie les identifiants ; le texte rapporteur/narrateur
  // est régénéré côté base par un trigger (agrégation triée des noms).
  rapporteur_ids?: number[];
  narrateur_ids?: number[];
  new_narrateur?: { nom: string; generation: string; role: string; sexe: string } | null;
  tag: string;
  sources: HadithSourceInput[];
  is_equivoque?: boolean; // marque aussi le hadith dans « Versets et hadiths équivoques »
  // Aussi une invocation/évocation : type (1=invocation, 2=évocation, null=non) + commentaire + moments.
  invocation_type?: number | null;
  invocation_commentaire?: string;
  invocation_moments?: string;
  segments?: HadithSegmentInput[]; // suite du hadith en dialogue
  variants?: HadithVariantInput[]; // autres versions du même hadith
}
export interface HadithSegmentInput {
  intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string;
  variant_index?: number | null; // position 1-based de la variante à laquelle ce dialogue est rattaché (null = matn principal)
}
export type DuplicateKind = 'hadith' | 'parole' | 'invocation';
export interface DuplicatePair {
  a_id: number; b_id: number; sim: number;
  a_sujet: string | null; b_sujet: string | null;
  a_meta: string | null; b_meta: string | null; // rubrique (hadith) | savant (parole) | type (invocation)
  a_arabe: string | null; b_arabe: string | null;
  a_trad: string | null; b_trad: string | null;
  a_src: number; b_src: number;
  a_refs: number; b_refs: number; // nb de contenus (dossier/exposé/équivoque/attribut) qui citent la fiche
}
export interface HadithVariantInput {
  titre: string; intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string; source: string;
}
export interface HadithEditShape {
  id: number; sujet: string | null; rubrique: string | null; intro: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; degre_authenticite: string | null;
  type_hadith: string | null; juge_par: string | null; rapporteur: string | null; narrateur: string | null;
  rapporteur_ids: number[]; narrateur_ids: number[];
  is_equivoque: boolean; equivoque_id: number | null; equivoque_slug: string | null;
  invocation_type: number | null; invocation_commentaire: string | null; invocation_moments: string | null;
  tag: string | null; sources: { recueil_id: number; numero: string | null; chapitre: string | null }[];
  segments: { variant_id: number | null; intro: string | null; texte_arabe: string | null; phonetique: string | null; texte_francais: string | null; explication: string | null }[];
  variants: { id: number; titre: string | null; intro: string | null; texte_arabe: string | null; phonetique: string | null; texte_francais: string | null; explication: string | null; source: string | null }[];
}
export interface HadithExtraRow {
  id: number; sujet: string | null; statut: string | null; tag: string | null;
  texte_arabe: string | null; texte_francais: string | null; n_seg: number; n_var: number;
}
export interface RecueilDupItem { id: number; titre: string; auteur: string | null; usages: number; }
export interface RecueilDupGroup { cle: string; n: number; items: RecueilDupItem[]; }

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
  /** Tafsirs (recueils de type « tafsir ») → titre par nom de savant auteur. */
  async listTafsirsBySavant(): Promise<{ nom: string; titre: string }[]> {
    const { data, error } = await supabase.from('recueils').select('titre,type,savants(nom)').ilike('type', 'tafsir');
    if (error) throw error;
    return (data ?? [])
      .map((r: Record<string, unknown>) => ({ nom: (r.savants as { nom?: string } | null)?.nom ?? '', titre: r.titre as string }))
      .filter((x) => x.nom && x.titre);
  }
  async getHadithForEdit(id: number): Promise<HadithEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_hadith', { p_id: id });
    if (error) throw error; return (data ?? null) as HadithEditShape | null;
  }
  /** Rubriques (séries) existantes, pour le sélecteur du formulaire hadith. */
  async listRubriques(): Promise<string[]> {
    const { data, error } = await supabase.rpc('rubriques_hadiths');
    if (error) throw error; return (data ?? []) as string[];
  }
  /** Groupes d'ouvrages (recueils) en doublon. */
  async recueilsDoublons(): Promise<RecueilDupGroup[]> {
    const { data, error } = await supabase.rpc('admin_recueils_doublons');
    if (error) throw error; return (data ?? []) as RecueilDupGroup[];
  }
  /** Fusionne des recueils doublons dans un recueil gardé. */
  async recueilMerge(keep: number, drop: number[]): Promise<{ moved: number; deleted: number }> {
    const { data, error } = await supabase.rpc('admin_recueil_merge', { p_keep: keep, p_drop: drop });
    if (error) throw error;
    const d = (data ?? {}) as { moved?: number; deleted?: number };
    return { moved: d.moved ?? 0, deleted: d.deleted ?? 0 };
  }
  /** Hadiths ayant un dialogue (segments) et/ou des variantes. */
  async hadithsExtras(mode: 'dialogue' | 'variante' | 'both' | 'any' | 'sans_source' | 'sans_arabe', q = ''): Promise<{ total: number; data: HadithExtraRow[] }> {
    const { data, error } = await supabase.rpc('admin_hadiths_extras', { p_mode: mode, p_q: q });
    if (error) throw error;
    const d = (data ?? {}) as { total?: number; data?: HadithExtraRow[] };
    return { total: d.total ?? 0, data: d.data ?? [] };
  }
  /** Thèmes + leurs tags + tags utilisés sans thème (page « Thèmes & mapping »). */
  async themesMapping(): Promise<ThemeMapping> {
    const { data, error } = await supabase.rpc('admin_themes_mapping');
    if (error) throw error;
    const d = (data ?? {}) as Partial<ThemeMapping>;
    return { themes: d.themes ?? [], unmapped: d.unmapped ?? [] };
  }
  async addThemeTag(tag: string, themeSlug: string): Promise<void> {
    const { error } = await supabase.rpc('admin_theme_tag_add', { p_tag: tag, p_theme: themeSlug });
    if (error) throw error;
  }
  async removeThemeTag(tag: string, themeSlug: string): Promise<void> {
    const { error } = await supabase.rpc('admin_theme_tag_remove', { p_tag: tag, p_theme: themeSlug });
    if (error) throw error;
  }
  /** Créer (slug absent → généré) ou modifier (slug présent) un thème. Renvoie le slug. */
  async saveTheme(payload: { slug?: string | null; nom: string; famille: string; ordre?: number | null }): Promise<string> {
    const { data, error } = await supabase.rpc('admin_theme_save', { p: payload });
    if (error) throw error; return data as string;
  }
  async deleteTheme(slug: string): Promise<void> {
    const { error } = await supabase.rpc('admin_theme_delete', { p_slug: slug });
    if (error) throw error;
  }
  /** Aperçu des contenus (hadiths/paroles/versets/invocations) portant un tag — avant mapping. */
  async tagContentsPreview(tag: string, limit = 40): Promise<TagContent[]> {
    const { data, error } = await supabase.rpc('admin_tag_preview', { p_tag: tag, p_limit: limit });
    if (error) throw error; return (data ?? []) as TagContent[];
  }
  /** Paires de contenus proches (détection de doublons par similarité). */
  async listDuplicates(kind: DuplicateKind, min = 0.6, limit = 100): Promise<DuplicatePair[]> {
    const fn = kind === 'parole' ? 'parole_doublons_potentiels'
      : kind === 'invocation' ? 'invocation_doublons_potentiels'
      : 'hadith_doublons_potentiels';
    const { data, error } = await supabase.rpc(fn, { p_min: min, p_limit: limit });
    if (error) throw error; return (data ?? []) as DuplicatePair[];
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

  // ---- Traductions (Phase 15.7) ----
  /** Crée la version EN (reliée) ou AR (reliée) d'une entrée ; renvoie son id. */
  async addTranslation(kind: string, sourceId: number, locale: 'en' | 'ar'): Promise<number> {
    const { data, error } = await supabase.rpc('admin_add_translation', { p_kind: kind, p_source_id: sourceId, p_locale: locale });
    if (error) throw error; return data as number;
  }
  /** Statut de traduction d'un groupe (FR ✓ · EN — · AR —). */
  async translationStatus(kind: string, sourceId: number): Promise<TranslationStatus> {
    const { data, error } = await supabase.rpc('admin_translation_status', { p_kind: kind, p_source_id: sourceId });
    if (error) throw error; return data as TranslationStatus;
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
    const { data, error } = await supabase.from('invocations').select('id,type_id,sujet,tag,moments').order('type_id').order('sujet');
    if (error) throw error; return (data ?? []) as InvocationRow[];
  }

  // ---- Moments de la journée (table `moments`) ----
  async listMoments(): Promise<MomentRow[]> {
    const { data, error } = await supabase.from('moments').select('id,key,label,ordre,actif').order('ordre').order('id');
    if (error) throw error; return (data ?? []) as MomentRow[];
  }
  async addMoment(label: string): Promise<MomentRow> {
    const { data, error } = await supabase.rpc('admin_add_moment', { p_label: label });
    if (error) throw error; return data as MomentRow;
  }
  async deleteMoment(id: number): Promise<void> {
    const { error } = await supabase.rpc('admin_delete_moment', { p_id: id });
    if (error) throw error;
  }
  async reorderMoments(ids: number[]): Promise<void> {
    const { error } = await supabase.rpc('admin_reorder_moments', { p_ids: ids });
    if (error) throw error;
  }
  async renameMoment(id: number, label: string): Promise<void> {
    const { error } = await supabase.rpc('admin_rename_moment', { p_id: id, p_label: label });
    if (error) throw error;
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
    const { data, error } = await supabase.from('savants').select('id,nom,slug,generation,ecole_id,publiee').order('nom');
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
  // Vidéos (multimedia) — rattachement à un dossier (13.4 « Pour approfondir »).
  async listMultimedia(): Promise<MultimediaRow[]> {
    const { data, error } = await supabase.from('multimedia').select('id,titre,savant,categorie,dossier_id').order('titre');
    if (error) throw error; return (data ?? []) as MultimediaRow[];
  }
  async setDossierVideos(dossierId: number, videoIds: number[]): Promise<void> {
    const { error } = await supabase.rpc('admin_set_dossier_videos', { p_dossier_id: dossierId, p_video_ids: videoIds });
    if (error) throw error;
  }
  /** Met CE dossier en vedette sur l'accueil (retire la vedette des autres). id=0 pour tout retirer. */
  async setHomeVedette(dossierId: number): Promise<void> {
    const { error } = await supabase.rpc('admin_set_home_vedette', { p_id: dossierId });
    if (error) throw error;
  }
  async listDossierRefs(): Promise<DossierRefs> {
    const { data, error } = await supabase.rpc('admin_list_dossier_refs');
    if (error) throw error;
    const d = (data ?? {}) as Partial<DossierRefs>;
    return { hadiths: d.hadiths ?? [], paroles: d.paroles ?? [], versets: d.versets ?? [] };
  }

  // ---- Questions fréquentes ----
  async listQuestions(): Promise<QuestionAdminRow[]> {
    const { data, error } = await supabase.rpc('admin_list_questions');
    if (error) throw error; return (data ?? []) as QuestionAdminRow[];
  }
  async getQuestionForEdit(id: number): Promise<QuestionEditShape | null> {
    const { data, error } = await supabase.rpc('admin_get_question', { p_id: id });
    if (error) throw error; return (data ?? null) as QuestionEditShape | null;
  }
  async saveQuestion(payload: QuestionFormData): Promise<number> {
    const { data, error } = await supabase.rpc('admin_save_question', { p: payload });
    if (error) throw error; return data as number;
  }
  async deleteQuestion(id: number): Promise<void> {
    const { error } = await supabase.rpc('admin_delete_question', { p_id: id });
    if (error) throw error;
  }
  /** Tous les thèmes (slug + libellé) pour le sélecteur multi-thèmes des questions. */
  async listAllThemes(): Promise<{ slug: string; nom: string }[]> {
    const { data, error } = await supabase.from('themes').select('slug,nom').order('ordre');
    if (error) throw error; return (data ?? []) as { slug: string; nom: string }[];
  }

  // ---- Traduction de la taxonomie (thèmes & tags) ----
  async listTaxonomyI18n(): Promise<TaxonomyI18n> {
    const { data, error } = await supabase.rpc('admin_taxonomy_i18n');
    if (error) throw error;
    const d = (data ?? {}) as Partial<TaxonomyI18n>;
    return { themes: d.themes ?? [], tags: d.tags ?? [] };
  }
  async setTaxonomyLabel(kind: 'theme' | 'tag', key: string, locale: 'en' | 'ar', nom: string): Promise<void> {
    const { error } = await supabase.rpc('admin_set_taxonomy_label', { p_kind: kind, p_key: key, p_locale: locale, p_nom: nom });
    if (error) throw error;
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

  // ---- Tags & mots-clés (gestionnaire) ----
  async tagsOverview(): Promise<TagOverviewRow[]> {
    const { data, error } = await supabase.rpc('admin_tags_overview');
    if (error) throw error; return (data ?? []) as TagOverviewRow[];
  }
  async tagsVocabulary(): Promise<string[]> {
    const { data, error } = await supabase.rpc('admin_tags_vocabulary');
    if (error) throw error; return (data ?? []) as string[];
  }
  /** Fusionne/renomme : réécrit `sources` → `target` partout (+ vocabulaire). */
  async mergeTags(sources: string[], target: string): Promise<number> {
    const { data, error } = await supabase.rpc('admin_merge_tags', { p_sources: sources, p_target: target });
    if (error) throw error; return (data as number) ?? 0;
  }
  /** Supprime un tag partout. */
  async deleteTag(token: string): Promise<number> {
    return this.mergeTags([token], '');
  }
  /** Ajoute un tag au vocabulaire (sans le rattacher). */
  async addTag(nom: string): Promise<void> {
    const { error } = await supabase.rpc('admin_add_tag', { p_nom: nom });
    if (error) throw error;
  }
  /** Contenus rattachés à un tag (drill-down). */
  async tagContents(tag: string): Promise<ContentRef[]> {
    const { data, error } = await supabase.rpc('admin_tag_contents', { p_tag: tag });
    if (error) throw error; return (data ?? []) as ContentRef[];
  }

  // ---- Sujets (gestionnaire) ----
  async sujetsOverview(): Promise<SujetOverviewRow[]> {
    const { data, error } = await supabase.rpc('admin_sujets_overview');
    if (error) throw error; return (data ?? []) as SujetOverviewRow[];
  }
  async sujetsVocabulary(): Promise<string[]> {
    const { data, error } = await supabase.rpc('admin_sujets_vocabulary');
    if (error) throw error; return (data ?? []) as string[];
  }
  async mergeSujets(sources: string[], target: string): Promise<number> {
    const { data, error } = await supabase.rpc('admin_merge_sujets', { p_sources: sources, p_target: target });
    if (error) throw error; return (data as number) ?? 0;
  }
  async deleteSujet(token: string): Promise<number> {
    return this.mergeSujets([token], '');
  }
  /** Contenus portant un sujet donné (drill-down). */
  async sujetContents(sujet: string): Promise<ContentRef[]> {
    const { data, error } = await supabase.rpc('admin_sujet_contents', { p_sujet: sujet });
    if (error) throw error; return (data ?? []) as ContentRef[];
  }

  /** Édition inline du sujet + tag d'une fiche (toutes rubriques), resynchronise les thèmes. */
  async updateSujetTag(rubrique: string, id: number, sujet: string, tag: string): Promise<void> {
    const { error } = await supabase.rpc('admin_update_sujet_tag', { p_rubrique: rubrique, p_id: id, p_sujet: sujet, p_tag: tag });
    if (error) throw error;
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
  /** Détail des contenus qui référencent cette entrée (titre + lien admin). */
  async entryReferences(kind: DeletableKind, id: string | number): Promise<EntryReference[]> {
    const { data, error } = await supabase.rpc('admin_entry_references', { p_kind: kind, p_id: String(id) });
    if (error) throw error; return (data ?? []) as EntryReference[];
  }

  /**
   * Téléverse un scan (image) dans le bucket Storage `references` et renvoie
   * son URL publique. Accès réservé à l'admin (policy storage). Formats :
   * WebP / JPEG / PNG, 5 Mo max.
   */
  async uploadScan(file: File, prefix = 'scans'): Promise<string> {
    const okTypes = ['image/webp', 'image/jpeg', 'image/png'];
    if (!okTypes.includes(file.type)) throw new Error('Format accepté : WebP, JPEG ou PNG.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image trop lourde (max 5 Mo).');
    const ext = (file.name.split('.').pop() || 'webp').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp';
    const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('references')
      .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
    if (error) throw new Error(error.message || 'Échec du téléversement.');
    return supabase.storage.from('references').getPublicUrl(path).data.publicUrl;
  }

  // ---- Recherche d'occurrences → correction (tout mot, toutes rubriques) ----
  async searchOccurrences(q: string, limit = 150): Promise<OccurrenceHit[]> {
    const { data, error } = await supabase.rpc('admin_search_occurrences', { q, p_limit: limit });
    if (error) throw error; return (data ?? []) as OccurrenceHit[];
  }
  /** Remplacer un terme dans tout le site. apply=false → prévisualisation (comptage). */
  async globalReplace(find: string, replace: string, apply: boolean, wholeWord: boolean): Promise<GlobalReplaceResult> {
    const { data, error } = await supabase.rpc('admin_global_replace', { p_find: find, p_replace: replace, p_apply: apply, p_whole_word: wholeWord });
    if (error) throw error; return data as GlobalReplaceResult;
  }
  /** Lots de remplacements annulables (sauvegardes). */
  async replaceBatches(limit = 20): Promise<ReplaceBatch[]> {
    const { data, error } = await supabase.rpc('admin_replace_batches', { p_limit: limit });
    if (error) throw error; return (data ?? []) as ReplaceBatch[];
  }
  /** Annuler un remplacement (restaure les valeurs sauvegardées). */
  async restoreReplace(batch: string): Promise<number> {
    const { data, error } = await supabase.rpc('admin_replace_restore', { p_batch: batch });
    if (error) throw error; return ((data ?? {}) as { restored?: number }).restored ?? 0;
  }
}

export interface OccurrenceHit { kind: string; ref: string; label: string | null; extrait: string | null; path: string; }
export interface GlobalReplaceDetail { rubrique: string; champ: string; fiches: number; }
export interface GlobalReplaceResult { applied: boolean; whole_word: boolean; find: string; replace: string; total: number; details: GlobalReplaceDetail[]; batch: string | null; }
export interface ReplaceBatch { batch: string; find: string; replace: string; created_at: string; cells: number; }

export interface ParoleImageInput { image_url: string; alt: string; legende?: string | null; source_livre?: string | null; source_livre_ar?: string | null; ordre?: number | null; }
export interface ParoleSegmentInput {
  intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string;
}
export interface ParoleFormData {
  id?: number | null;
  sujet: string; rubrique: string; intro: string; texte_arabe: string; texte_francais: string; phonetique: string; explication: string;
  // Traductions côté à côte (modèle colonnes par langue). AR : sujet/explication/intro.
  sujet_en: string; sujet_ar: string; intro_en: string; intro_ar: string;
  texte_en: string; phonetique_en: string; explication_en: string; explication_ar: string;
  source_livre: string; page: string; ecole: string; tag: string;
  savant_id?: number | null;
  new_savant?: { nom: string } | null;
  rapporteur_savant_id?: number | null;
  // Commentaire d'un autre contenu : le type pilote lequel des 3 id est rempli.
  commente_type?: 'parole' | 'hadith' | 'verset' | null;
  commente_parole_id?: number | null;
  commente_hadith_id?: number | null;
  commente_verset_id?: number | null;
  commente_livre: string;
  images: ParoleImageInput[];
  segments?: ParoleSegmentInput[]; // suite de la parole en dialogue
}
export interface ParoleEditShape {
  id: number; sujet: string | null; rubrique: string | null; intro: string | null; texte_arabe: string | null; texte_francais: string | null;
  phonetique: string | null; explication: string | null; source_livre: string | null; page: string | null;
  sujet_en: string | null; sujet_ar: string | null; intro_en: string | null; intro_ar: string | null;
  texte_en: string | null; phonetique_en: string | null; explication_en: string | null; explication_ar: string | null;
  ecole: string | null; savant_id: number | null; tag: string | null;
  rapporteur_savant_id: number | null;
  commente_type: 'parole' | 'hadith' | 'verset' | null;
  commente_parole_id: number | null; commente_hadith_id: number | null; commente_verset_id: number | null; commente_livre: string | null;
  images: { image_url: string; alt: string | null; legende: string | null; source_livre: string | null; source_livre_ar: string | null; ordre: number | null }[];
  segments: { intro: string | null; texte_arabe: string | null; phonetique: string | null; texte_francais: string | null; explication: string | null }[];
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
  is_equivoque?: boolean; // marque aussi le verset dans « Versets et hadiths équivoques »
}
export interface CoranEditShape {
  id: number; sujet: string; sourate: string | null; texte_arabe: string;
  texte_francais: string | null; phonetique: string | null; explication: string | null; tag: string | null;
  is_equivoque: boolean; equivoque_id: number | null; equivoque_slug: string | null;
}
export interface CoranRow { id: number; sujet: string; sourate: string | null; }

// ---- Exégèse (sourates -> versets -> exégèses) ----
export interface ExegeseInput { texte: string; source?: string | null; ordre?: number | null; verset_fin?: number | null; }
export interface VersetInput { numero: string; texte_arabe: string; texte_francais: string; phonetique: string; exegeses: ExegeseInput[]; }
export interface SourateFormData {
  id?: number | null;
  numero: string; nom: string; nom_arabe: string; slug?: string | null; revelation: string; nb_versets: string;
  introduction_md: string; ordre_revelation: string;
  versets: VersetInput[];
}
export interface SourateEditShape {
  id: number; numero: number; nom: string; nom_arabe: string | null; slug: string; revelation: string | null; nb_versets: number | null;
  introduction_md: string | null; ordre_revelation: number | null;
  versets: { numero: number; texte_arabe: string | null; texte_francais: string | null; phonetique: string | null;
             exegeses: { texte: string; source: string | null; ordre: number | null; verset_fin: number | null }[] }[];
}
export interface SourateRow { id: number; numero: number; nom: string; slug: string; nb_versets_saisis: number; }

// ---- Invocations & Évocations ----
export interface InvocationFormData {
  id?: number | null;
  type_id: number; sujet: string; texte_arabe: string; texte_francais: string;
  phonetique: string; explication: string; commentaire: string; tag: string; moments: string;
}
export interface InvocationEditShape {
  id: number; type_id: number; sujet: string; texte_arabe: string;
  texte_francais: string | null; phonetique: string | null; explication: string | null;
  commentaire: string | null; tag: string | null; moments: string | null;
}
export interface InvocationRow { id: number; type_id: number; sujet: string; tag: string | null; moments: string | null; }
export interface MomentRow { id: number; key: string; label: string; ordre: number; actif: boolean; }

// ---- Savants (fiche complète) ----
export interface EcoleRow { id: number; nom: string; }
export interface SavantFormData {
  id?: number | null;
  nom: string; nom_arabe: string; slug?: string | null; ecole_id: number | null;
  generation: string; naissance: string; deces: string; resume: string; biographie: string;
  domaines: string[];
  role: string; // '' | 'calife_rachidoun' | 'epouse_prophete'
  est_savant: boolean; est_narrateur: boolean;
  publiee: boolean; // Phase 10 : visible en carte dans le hub Biographies
}
export interface SavantEditShape {
  id: number; nom: string; nom_arabe: string | null; slug: string | null; ecole_id: number | null;
  generation: string | null; naissance: string | null; deces: string | null;
  resume: string | null; biographie: string | null; domaines: string[] | null;
  role: string | null; est_savant: boolean | null; est_narrateur: boolean | null;
  publiee: boolean | null;
}
export interface SavantFullRow { id: number; nom: string; slug: string | null; generation: string | null; ecole_id: number | null; publiee: boolean | null; }

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
  croyance_texte: string | null; objection_texte: string | null; reponse_texte: string | null; published: boolean; vedette?: boolean;
  preuves: DossierPreuveInput[];
  images: { image_url: string; alt: string | null; legende: string | null; source_livre: string | null; ordre: number | null }[];
  video_ids: number[];
  lies: number[];
}
export interface DossierListRow { id: number; slug: string; h1: string; published: boolean; }

// ---- Questions fréquentes ----
export interface QuestionAdminRow { id: number; question: string; slug: string; publiee: boolean; ordre: number; locale: string; n_blocs: number; }
export interface QuestionEditShape {
  id: number; question: string; slug: string; reponse_courte: string | null;
  variantes: string[]; publiee: boolean; ordre: number; locale: string; translation_group: string;
  theme_slugs: string[]; dossier_ids: number[];
}
export interface QuestionFormData {
  id?: number | null; question: string; slug: string; reponse_courte: string | null;
  variantes: string[]; publiee: boolean; ordre: number;
  theme_slugs: string[]; dossier_ids: number[];
}

// ---- Traduction de la taxonomie ----
export interface TaxonomyThemeI18n { slug: string; fr: string; famille: string; en: string | null; ar: string | null; }
export interface TaxonomyTagI18n { id: number; fr: string; en: string | null; ar: string | null; }
export interface TaxonomyI18n { themes: TaxonomyThemeI18n[]; tags: TaxonomyTagI18n[]; }
export interface MultimediaRow { id: number; titre: string; savant: string | null; categorie: string | null; dossier_id: number | null; }

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
  published: boolean;
  citations: ExposeCitationInput[];
}
export interface ExposeEditShape {
  slug: string; titre: string | null; contenu_md: string | null;
  verset_arabe: string | null; verset_traduction: string | null; verset_phonetique: string | null; verset_ref: string | null;
  published?: boolean;
  citations: { section: number | null; type: CitationType; ref_id: number | null; arabe: string | null;
               phonetique: string | null; signification: string | null; ref: string | null; accordeon: boolean; ordre: number | null }[];
}
export interface ExposeListRow { slug: string; titre: string | null; published?: boolean; }

/** Ligne de la vue d'ensemble des tags (gestionnaire admin). */
export interface TagOverviewRow {
  tag: string;
  total: number;
  hadiths: number; paroles: number; coran: number; invocations: number; fiqh: number;
  in_vocab: boolean;
}

/** Ligne de la vue d'ensemble des sujets (valeur unique par fiche). */
export interface SujetOverviewRow {
  sujet: string;
  total: number;
  hadiths: number; paroles: number; coran: number; invocations: number; fiqh: number;
}

/** Contenu rattaché à un tag / sujet (drill-down admin) — aperçu + édition inline. */
export interface ContentRef {
  rubrique: string; id: number; titre: string;
  sujet?: string | null; tag?: string | null;
  texte_arabe?: string | null; texte_francais?: string | null;
}

// ---- Suppression admin (Phase 4.6) ----
export type DeletableKind =
  | 'hadith' | 'parole' | 'coran' | 'verset' | 'equivoque' | 'dossier' | 'expose'
  | 'recit' | 'invocation' | 'fiqh' | 'femme' | 'sourate' | 'savant';
export interface EntryDeps {
  total: number;
  refs: { articles?: number; equivoques?: number; dossiers?: number; exposes?: number; attributs?: number };
}
export interface EntryReference {
  categorie: string;      // « Dossier (preuve) », « Exposé (citation) »…
  titre: string;          // titre du contenu référent
  path: string | null;    // lien d'édition admin (null si non éditable)
}
export interface ThemeMappingRow { slug: string; nom: string; famille: string | null; ordre: number | null; tags: string[]; }
export interface ThemeMapping { themes: ThemeMappingRow[]; unmapped: string[]; }
export interface TagContent { kind: string; id: number; sujet: string | null; extrait: string | null; path: string; }

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
  // Preuve « saisie libre » (source absente de la base) : texte tapé à la main.
  libre_arabe?: string | null;
  libre_traduction?: string | null;
  libre_ref?: string | null;
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
  categorie?: string; cat_ordre?: string;
}
export interface FemmeEditShape {
  id: number; chapitre: string; matn: string | null; commentaire: string | null; texte_arabe: string | null; source: string | null; ordre: number;
  categorie?: string | null; cat_ordre?: number | null;
}
export interface FemmeRow { id: number; chapitre: string; matn: string | null; ordre: number; }

export interface RecitRow { id: number; slug: string; categorie: RecitCategorie; titre: string; ordre: number; parent_recit_id: number | null; image_url: string | null; published: boolean; }
export interface RecitFull { id?: number; slug: string; categorie: RecitCategorie; titre: string; contenu_md: string | null; image_url: string | null; ordre: number; parent_recit_id?: number | null; published?: boolean; }

class AdminRecits {
  async list(): Promise<RecitRow[]> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,ordre,parent_recit_id,image_url,published').order('categorie').order('ordre');
    if (error) throw error; return (data ?? []) as RecitRow[];
  }
  async get(id: number): Promise<RecitFull | null> {
    const { data, error } = await supabase.from('recits').select('id,slug,categorie,titre,contenu_md,image_url,ordre,parent_recit_id,published').eq('id', id).maybeSingle();
    if (error) throw error; return (data ?? null) as RecitFull | null;
  }
  async save(r: RecitFull): Promise<number> {
    const slug = (r.slug?.trim() || slugify(r.titre) || 'recit');
    const row = { slug, categorie: r.categorie, titre: r.titre.trim(), contenu_md: r.contenu_md || null, image_url: r.image_url || null, ordre: r.ordre ?? 0, parent_recit_id: r.parent_recit_id ?? null, published: r.published ?? true };
    if (r.id) {
      const { error } = await supabase.from('recits').update(row).eq('id', r.id); if (error) throw error; return r.id;
    }
    const { data, error } = await supabase.from('recits').insert(row).select('id').single();
    if (error) throw error; return (data as { id: number }).id;
  }
  /** Fixe l'ordre d'un récit (réordonnancement depuis la liste admin). */
  async setOrdre(id: number, ordre: number): Promise<void> {
    const { error } = await supabase.from('recits').update({ ordre }).eq('id', id);
    if (error) throw error;
  }
}
export const adminRecits = new AdminRecits();

export const adminService = new AdminService();
export default adminService;
