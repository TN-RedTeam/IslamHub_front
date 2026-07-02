/**
 * DataService - Service unifié pour la gestion des données
 *
 * Supporte 3 modes de données:
 * 1. 'supabase' - Connexion directe à Supabase (recommandé)
 * 2. 'express'  - Via le backend Express (fallback si Supabase saturé)
 * 3. 'local'    - Données JSON locales (fallback ultime)
 */

import type {
  Hadith,
  Coran,
  Dhikr,
  Douaa,
  Savant,
  Multimedia,
  MultimediaCategory,
  PaginatedResponse,
  PaginationParams,
  BaseText
} from '../types';

import { supabase } from './supabase';
import api from './api';

// Import des données JSON locales (fallback ultime)
import hadithsData from '../data/hadith.json';
import coranData from '../data/coran.json';
import dhikrData from '../data/dhikr.json';
import douaaData from '../data/douaa.json';
import paroleData from '../data/parole.json';

// ==========================================
// Configuration du mode de données
// ==========================================

type DataSourceMode = 'supabase' | 'express' | 'local';

function detectDataSource(): DataSourceMode {
  const envMode = import.meta.env.VITE_DATA_SOURCE as DataSourceMode | undefined;

  if (envMode && ['supabase', 'express', 'local'].includes(envMode)) {
    return envMode;
  }

  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return 'supabase';
  }

  if (import.meta.env.VITE_API_URL) {
    return 'express';
  }

  return 'local';
}

let currentDataSource = detectDataSource();

// ==========================================
// Fonctions utilitaires
// ==========================================

function extractTags<T extends { tag?: string | null }>(items: T[]): string[] {
  const tagsSet = new Set<string>();
  items.forEach(item => {
    if (item.tag) {
      item.tag.split(',').forEach(t => tagsSet.add(t.trim()));
    }
  });
  return Array.from(tagsSet).sort();
}

function filterBySearch<T extends BaseText>(items: T[], searchTerm: string): T[] {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    item.sujet?.toLowerCase().includes(term) ||
    item.texte_arabe?.toLowerCase().includes(term) ||
    item.texte_francais?.toLowerCase().includes(term) ||
    item.explication?.toLowerCase().includes(term) ||
    item.tag?.toLowerCase().includes(term)
  );
}

function filterByTag<T extends BaseText>(items: T[], tag: string | null): T[] {
  if (!tag) return items;
  return items.filter(item =>
    item.tag?.toLowerCase().includes(tag.toLowerCase())
  );
}

function paginate<T>(items: T[], params: PaginationParams): PaginatedResponse<T> {
  const { page, pageSize } = params;
  const start = page * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  return {
    data,
    count: items.length,
    page,
    pageSize,
    hasMore: end < items.length
  };
}

function defaultPaginatedResponse<T>(data: T[]): PaginatedResponse<T> {
  return {
    data,
    count: data.length,
    page: 0,
    pageSize: data.length,
    hasMore: false
  };
}

// ==========================================
// DataService Class
// ==========================================

class DataService {
  private cache: {
    hadiths: Hadith[] | null;
    coran: Coran[] | null;
    dhikrs: Dhikr[] | null;
    douaas: Douaa[] | null;
    savants: Savant[] | null;
  } = {
    hadiths: null,
    coran: null,
    dhikrs: null,
    douaas: null,
    savants: null
  };

  // ==========================================
  // Configuration
  // ==========================================

  setDataSource(mode: DataSourceMode): void {
    currentDataSource = mode;
    this.clearCache();
    console.log(`DataService: switched to ${mode} mode`);
  }

  getDataSource(): DataSourceMode {
    return currentDataSource;
  }

  isUsingSupabase(): boolean {
    return currentDataSource === 'supabase';
  }

  isUsingExpress(): boolean {
    return currentDataSource === 'express';
  }

  isUsingLocal(): boolean {
    return currentDataSource === 'local';
  }

  clearCache(): void {
    this.cache = {
      hadiths: null,
      coran: null,
      dhikrs: null,
      douaas: null,
      savants: null
    };
  }

  // ==========================================
  // Statistiques & contenu du jour (page d'accueil)
  // ==========================================

  /**
   * Compte les lignes d'une table sans télécharger les données
   * (`head: true` → réponse vide, seul le header de count est renvoyé).
   */
  private async countTable(table: string): Promise<number> {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  /**
   * Statistiques du site pour la page d'accueil.
   * En mode supabase : 6 requêtes count "head" (aucune donnée transférée),
   * au lieu de télécharger les tables entières.
   */
  async getStats(): Promise<{
    hadiths: number;
    savants: number;
    douaas: number;
    dhikrs: number;
    videos: number;
    coran: number;
  }> {
    if (currentDataSource === 'supabase') {
      try {
        const [hadiths, savants, douaas, dhikrs, videos, coran] = await Promise.all([
          this.countTable('hadith'),
          this.countTable('parole'),
          this.countTable('douaa'),
          this.countTable('dhikr'),
          this.countTable('multimedia'),
          this.countTable('coran'),
        ]);
        return { hadiths, savants, douaas, dhikrs, videos, coran };
      } catch (err) {
        console.error('Supabase stats error, falling back to local:', err);
      }
    }

    // Fallback local / express : les JSON embarqués suffisent pour les compteurs
    return {
      hadiths: (hadithsData as Hadith[]).length,
      savants: (paroleData as Savant[]).length,
      douaas: (douaaData as Douaa[]).length,
      dhikrs: (dhikrData as Dhikr[]).length,
      videos: 0,
      coran: (coranData as Coran[]).length,
    };
  }

  /**
   * Récupère UNE seule ligne à un index donné (item du jour) au lieu de
   * télécharger toute la table. `index` est ramené dans [0, count) modulo count.
   */
  private async getItemAt<T>(table: string, index: number, localData: T[]): Promise<T | null> {
    if (currentDataSource === 'supabase') {
      try {
        const count = await this.countTable(table);
        if (count === 0) return null;
        const offset = ((index % count) + count) % count;
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('id')
          .range(offset, offset);
        if (error) throw error;
        return (data && data[0] as T) || null;
      } catch (err) {
        console.error(`Supabase getItemAt(${table}) error, falling back to local:`, err);
      }
    }

    if (localData.length === 0) return null;
    return localData[((index % localData.length) + localData.length) % localData.length];
  }

  async getDailyHadith(dayIndex: number): Promise<Hadith | null> {
    return this.getItemAt<Hadith>('hadith', dayIndex, hadithsData as Hadith[]);
  }

  async getDailyCoran(dayIndex: number): Promise<Coran | null> {
    return this.getItemAt<Coran>('coran', dayIndex, coranData as Coran[]);
  }

  async getDailyDouaa(dayIndex: number): Promise<Douaa | null> {
    return this.getItemAt<Douaa>('douaa', dayIndex, douaaData as Douaa[]);
  }

  // ==========================================
  // Hadiths
  // ==========================================

  async getHadiths(params?: PaginationParams): Promise<PaginatedResponse<Hadith>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('hadith')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('id');

        if (error) throw error;

        return {
          data: data as Hadith[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error, falling back to local:', err);
        return this.getHadithsLocal(params);
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/hadith', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Hadith>;
      } catch (err) {
        console.error('Express error, falling back to local:', err);
        return this.getHadithsLocal(params);
      }
    }

    return this.getHadithsLocal(params);
  }

  private getHadithsLocal(params?: PaginationParams): PaginatedResponse<Hadith> {
    if (!this.cache.hadiths) {
      this.cache.hadiths = hadithsData as Hadith[];
    }
    if (params) {
      return paginate(this.cache.hadiths, params);
    }
    return defaultPaginatedResponse(this.cache.hadiths);
  }

  async searchHadiths(
    searchTerm: string,
    tag?: string | null,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Hadith>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase' && searchTerm.trim()) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('hadith')
          .select('*', { count: 'exact' })
          .or(`sujet.ilike.%${searchTerm}%,texte_arabe.ilike.%${searchTerm}%,texte_francais.ilike.%${searchTerm}%`);

        if (tag) {
          query = query.ilike('tag', `%${tag}%`);
        }

        const { data, count, error } = await query.range(from, to).order('id');
        if (error) throw error;

        return {
          data: data as Hadith[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase search error:', err);
      }
    }

    const all = await this.getHadiths();
    let filtered = filterBySearch(all.data, searchTerm);
    filtered = filterByTag(filtered, tag ?? null);

    if (params) {
      return paginate(filtered, params);
    }
    return defaultPaginatedResponse(filtered);
  }

  async getHadithTags(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('hadith').select('tag');
        if (error) throw error;
        return extractTags(data as { tag?: string }[]);
      } catch (err) {
        console.error('Error fetching hadith tags:', err);
      }
    }

    if (!this.cache.hadiths) {
      this.cache.hadiths = hadithsData as Hadith[];
    }
    return extractTags(this.cache.hadiths);
  }

  // ==========================================
  // Coran
  // ==========================================

  async getCoran(params?: PaginationParams): Promise<PaginatedResponse<Coran>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('coran')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('id');

        if (error) throw error;

        return {
          data: data as Coran[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error:', err);
        return this.getCoranLocal(params);
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/coran', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Coran>;
      } catch (err) {
        console.error('Express error:', err);
        return this.getCoranLocal(params);
      }
    }

    return this.getCoranLocal(params);
  }

  private getCoranLocal(params?: PaginationParams): PaginatedResponse<Coran> {
    if (!this.cache.coran) {
      this.cache.coran = coranData as Coran[];
    }
    if (params) {
      return paginate(this.cache.coran, params);
    }
    return defaultPaginatedResponse(this.cache.coran);
  }

  async searchCoran(
    searchTerm: string,
    tag?: string | null,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Coran>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase' && searchTerm.trim()) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('coran')
          .select('*', { count: 'exact' })
          .or(`sujet.ilike.%${searchTerm}%,texte_arabe.ilike.%${searchTerm}%,texte_francais.ilike.%${searchTerm}%,sourate.ilike.%${searchTerm}%`);

        if (tag) {
          query = query.ilike('tag', `%${tag}%`);
        }

        const { data, count, error } = await query.range(from, to).order('id');
        if (error) throw error;

        return {
          data: data as Coran[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase search error:', err);
      }
    }

    const all = await this.getCoran();
    let filtered = filterBySearch(all.data, searchTerm);
    filtered = filterByTag(filtered, tag ?? null);

    if (params) {
      return paginate(filtered, params);
    }
    return defaultPaginatedResponse(filtered);
  }

  async getCoranTags(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('coran').select('tag');
        if (error) throw error;
        return extractTags(data as { tag?: string }[]);
      } catch (err) {
        console.error('Error fetching coran tags:', err);
      }
    }

    if (!this.cache.coran) {
      this.cache.coran = coranData as Coran[];
    }
    return extractTags(this.cache.coran);
  }

  // ==========================================
  // Dhikrs
  // ==========================================

  async getDhikrs(params?: PaginationParams): Promise<PaginatedResponse<Dhikr>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('dhikr')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('id');

        if (error) throw error;

        return {
          data: data as Dhikr[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error:', err);
        return this.getDhikrsLocal(params);
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/dhikr', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Dhikr>;
      } catch (err) {
        console.error('Express error:', err);
        return this.getDhikrsLocal(params);
      }
    }

    return this.getDhikrsLocal(params);
  }

  private getDhikrsLocal(params?: PaginationParams): PaginatedResponse<Dhikr> {
    if (!this.cache.dhikrs) {
      this.cache.dhikrs = dhikrData as Dhikr[];
    }
    if (params) {
      return paginate(this.cache.dhikrs, params);
    }
    return defaultPaginatedResponse(this.cache.dhikrs);
  }

  async searchDhikrs(
    searchTerm: string,
    tag?: string | null,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Dhikr>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase' && searchTerm.trim()) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('dhikr')
          .select('*', { count: 'exact' })
          .or(`sujet.ilike.%${searchTerm}%,texte_arabe.ilike.%${searchTerm}%,texte_francais.ilike.%${searchTerm}%`);

        if (tag) {
          query = query.ilike('tag', `%${tag}%`);
        }

        const { data, count, error } = await query.range(from, to).order('id');
        if (error) throw error;

        return {
          data: data as Dhikr[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase search error:', err);
      }
    }

    const all = await this.getDhikrs();
    let filtered = filterBySearch(all.data, searchTerm);
    filtered = filterByTag(filtered, tag ?? null);

    if (params) {
      return paginate(filtered, params);
    }
    return defaultPaginatedResponse(filtered);
  }

  async getDhikrTags(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('dhikr').select('tag');
        if (error) throw error;
        return extractTags(data as { tag?: string }[]);
      } catch (err) {
        console.error('Error fetching dhikr tags:', err);
      }
    }

    if (!this.cache.dhikrs) {
      this.cache.dhikrs = dhikrData as Dhikr[];
    }
    return extractTags(this.cache.dhikrs);
  }

  // ==========================================
  // Douaas
  // ==========================================

  async getDouaas(params?: PaginationParams): Promise<PaginatedResponse<Douaa>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('douaa')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('id');

        if (error) throw error;

        return {
          data: data as Douaa[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error:', err);
        return this.getDouaasLocal(params);
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/douaa', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Douaa>;
      } catch (err) {
        console.error('Express error:', err);
        return this.getDouaasLocal(params);
      }
    }

    return this.getDouaasLocal(params);
  }

  private getDouaasLocal(params?: PaginationParams): PaginatedResponse<Douaa> {
    if (!this.cache.douaas) {
      this.cache.douaas = douaaData as Douaa[];
    }
    if (params) {
      return paginate(this.cache.douaas, params);
    }
    return defaultPaginatedResponse(this.cache.douaas);
  }

  async searchDouaas(
    searchTerm: string,
    tag?: string | null,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Douaa>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase' && searchTerm.trim()) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('douaa')
          .select('*', { count: 'exact' })
          .or(`sujet.ilike.%${searchTerm}%,texte_arabe.ilike.%${searchTerm}%,texte_francais.ilike.%${searchTerm}%`);

        if (tag) {
          query = query.ilike('tag', `%${tag}%`);
        }

        const { data, count, error } = await query.range(from, to).order('id');
        if (error) throw error;

        return {
          data: data as Douaa[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase search error:', err);
      }
    }

    const all = await this.getDouaas();
    let filtered = filterBySearch(all.data, searchTerm);
    filtered = filterByTag(filtered, tag ?? null);

    if (params) {
      return paginate(filtered, params);
    }
    return defaultPaginatedResponse(filtered);
  }

  async getDouaaTags(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('douaa').select('tag');
        if (error) throw error;
        return extractTags(data as { tag?: string }[]);
      } catch (err) {
        console.error('Error fetching douaa tags:', err);
      }
    }

    if (!this.cache.douaas) {
      this.cache.douaas = douaaData as Douaa[];
    }
    return extractTags(this.cache.douaas);
  }

  // ==========================================
  // Savants (parole table in Supabase)
  // ==========================================

  async getSavants(params?: PaginationParams): Promise<PaginatedResponse<Savant>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('parole')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('id');

        if (error) throw error;

        return {
          data: data as Savant[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error:', err);
        return this.getSavantsLocal(params);
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/parole', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Savant>;
      } catch (err) {
        console.error('Express error:', err);
        return this.getSavantsLocal(params);
      }
    }

    return this.getSavantsLocal(params);
  }

  private getSavantsLocal(params?: PaginationParams): PaginatedResponse<Savant> {
    if (!this.cache.savants) {
      this.cache.savants = paroleData as Savant[];
    }
    if (params) {
      return paginate(this.cache.savants, params);
    }
    return defaultPaginatedResponse(this.cache.savants);
  }

  async searchSavants(
    searchTerm: string,
    tag?: string | null,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Savant>> {
    const { page = 0, pageSize = 20 } = params || {};

    if (currentDataSource === 'supabase' && searchTerm.trim()) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('parole')
          .select('*', { count: 'exact' })
          .or(`sujet.ilike.%${searchTerm}%,savant.ilike.%${searchTerm}%,texte_arabe.ilike.%${searchTerm}%,texte_francais.ilike.%${searchTerm}%`);

        if (tag) {
          query = query.ilike('tag', `%${tag}%`);
        }

        const { data, count, error } = await query.range(from, to).order('id');
        if (error) throw error;

        return {
          data: data as Savant[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase search error:', err);
      }
    }

    const all = await this.getSavants();
    let filtered = filterBySearch(all.data, searchTerm);
    filtered = filterByTag(filtered, tag ?? null);

    if (params) {
      return paginate(filtered, params);
    }
    return defaultPaginatedResponse(filtered);
  }

  async getSavantTags(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('parole').select('tag');
        if (error) throw error;
        return extractTags(data as { tag?: string }[]);
      } catch (err) {
        console.error('Error fetching savant tags:', err);
      }
    }

    if (!this.cache.savants) {
      this.cache.savants = paroleData as Savant[];
    }
    return extractTags(this.cache.savants);
  }

  async getSavantNames(): Promise<string[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase.from('parole').select('savant');
        if (error) throw error;
        const names = new Set<string>();
        (data as { savant?: string }[]).forEach(s => {
          if (s.savant) names.add(s.savant);
        });
        return Array.from(names).sort();
      } catch (err) {
        console.error('Error fetching savant names:', err);
      }
    }

    if (!this.cache.savants) {
      this.cache.savants = paroleData as Savant[];
    }
    const names = new Set<string>();
    this.cache.savants.forEach(s => {
      if (s.savant) names.add(s.savant);
    });
    return Array.from(names).sort();
  }

  // ==========================================
  // Multimedia
  // ==========================================

  async getMultimediaCategories(): Promise<MultimediaCategory[]> {
    if (currentDataSource === 'supabase') {
      try {
        const { data, error } = await supabase
          .from('multimedia')
          .select('categorie');

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data as { categorie: string }[]).forEach(item => {
          counts[item.categorie] = (counts[item.categorie] || 0) + 1;
        });

        return Object.entries(counts)
          .map(([categorie, count]) => ({ categorie, count }))
          .sort((a, b) => b.count - a.count);
      } catch (err) {
        console.error('Error fetching multimedia categories:', err);
        return [];
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/multimedia/categories');
        return response.data as MultimediaCategory[];
      } catch (err) {
        console.error('Error fetching multimedia categories:', err);
        return [];
      }
    }

    return [];
  }

  async searchMultimedia(
    searchTerm: string,
    categorie: string | null,
    params?: PaginationParams
  ): Promise<{ data: Multimedia[]; total: number }> {
    const { page = 0, pageSize = 12 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('multimedia')
          .select('*', { count: 'exact' });

        if (searchTerm.trim()) {
          query = query.or(`titre.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,savant.ilike.%${searchTerm}%`);
        }

        if (categorie) {
          query = query.eq('categorie', categorie);
        }

        const { data, count, error } = await query
          .range(from, to)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          data: data as Multimedia[],
          total: count || 0
        };
      } catch (err) {
        console.error('Supabase multimedia search error:', err);
        return { data: [], total: 0 };
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/multimedia/search', {
          params: { q: searchTerm, categorie, page, pageSize }
        });
        return response.data as { data: Multimedia[]; total: number };
      } catch (err) {
        console.error('Express multimedia search error:', err);
        return { data: [], total: 0 };
      }
    }

    return { data: [], total: 0 };
  }

  async getMultimedia(params?: PaginationParams): Promise<PaginatedResponse<Multimedia>> {
    const { page = 0, pageSize = 12 } = params || {};

    if (currentDataSource === 'supabase') {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('multimedia')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          data: data as Multimedia[],
          count: count || 0,
          page,
          pageSize,
          hasMore: (from + pageSize) < (count || 0)
        };
      } catch (err) {
        console.error('Supabase error:', err);
        return { data: [], count: 0, page: 0, pageSize, hasMore: false };
      }
    }

    if (currentDataSource === 'express') {
      try {
        const response = await api.get('/multimedia', { params: { page, pageSize } });
        return response.data as PaginatedResponse<Multimedia>;
      } catch (err) {
        console.error('Express error:', err);
        return { data: [], count: 0, page: 0, pageSize, hasMore: false };
      }
    }

    return { data: [], count: 0, page: 0, pageSize, hasMore: false };
  }
}

export const dataService = new DataService();
export default dataService;
