import { supabase } from './supabase';
import type {
  Hadith,
  Coran,
  Dhikr,
  Douaa,
  Parole,
  Multimedia,
  MultimediaCategory,
  FiqhChapitre,
  FemmesChapitre,
  PaginatedResponse,
  PaginationParams,
} from '../types';

// ============================================================
// Path B : le front interroge Supabase DIRECTEMENT (via RPC).
// ============================================================

/** Compteurs renvoyés par getStats() (plusieurs alias de clés côté SQL). */
export interface SiteStats {
  hadiths: number;
  dhikrs: number;
  douaas: number;
  coran: number;
  versets: number;
  paroles: number;
  savants: number;
  multimedia: number;
  videos: number;
}

const LOAD_ALL: PaginationParams = { page: 0, pageSize: 1000 };

function sanitizeInput(value: string): string {
  return value.trim().slice(0, 300).replace(/[<>"']/g, '');
}

function shapeResult<T>(payload: unknown, page: number, pageSize: number) {
  const p = (payload ?? {}) as { total?: number; data?: T[] };
  const total = p.total ?? 0;
  const data = p.data ?? [];
  return {
    data,
    count: total,
    total,
    page,
    pageSize,
    hasMore: (page + 1) * pageSize < total,
  } as PaginatedResponse<T> & { total: number };
}

async function rpcSearch<T>(
  fn: string,
  q: string,
  filter: string | null,
  filterKey: 'tag_filter' | 'categorie_filter',
  params?: PaginationParams,
) {
  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 20;
  const args: Record<string, unknown> = {
    q: sanitizeInput(q),
    page_num: page,
    page_size: pageSize,
  };
  args[filterKey] = filter ? sanitizeInput(filter) : '';
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return shapeResult<T>(data, page, pageSize);
}

async function rpcTags(fn: string): Promise<string[]> {
  const { data, error } = await supabase.rpc(fn);
  if (error) throw error;
  return (data ?? []) as string[];
}

class DataService {
  // ================= Hadiths =================
  async getHadiths(params?: PaginationParams): Promise<PaginatedResponse<Hadith>> {
    return rpcSearch<Hadith>('search_hadiths', '', null, 'tag_filter', params ?? LOAD_ALL);
  }
  async searchHadiths(searchTerm: string, tag?: string | null, params?: PaginationParams): Promise<PaginatedResponse<Hadith>> {
    return rpcSearch<Hadith>('search_hadiths', searchTerm, tag ?? null, 'tag_filter', params ?? LOAD_ALL);
  }
  async getHadithTags(): Promise<string[]> {
    return rpcTags('tags_hadiths');
  }

  // ================= Coran =================
  async getCoran(params?: PaginationParams): Promise<PaginatedResponse<Coran>> {
    return rpcSearch<Coran>('search_coran', '', null, 'tag_filter', params ?? LOAD_ALL);
  }
  async searchCoran(searchTerm: string, tag?: string | null, params?: PaginationParams): Promise<PaginatedResponse<Coran>> {
    return rpcSearch<Coran>('search_coran', searchTerm, tag ?? null, 'tag_filter', params ?? LOAD_ALL);
  }
  async getCoranTags(): Promise<string[]> {
    return rpcTags('tags_coran');
  }

  // ================= Dhikrs =================
  async getDhikrs(params?: PaginationParams): Promise<PaginatedResponse<Dhikr>> {
    return rpcSearch<Dhikr>('search_dhikrs', '', null, 'tag_filter', params ?? LOAD_ALL);
  }
  async searchDhikrs(searchTerm: string, tag?: string | null, params?: PaginationParams): Promise<PaginatedResponse<Dhikr>> {
    return rpcSearch<Dhikr>('search_dhikrs', searchTerm, tag ?? null, 'tag_filter', params ?? LOAD_ALL);
  }
  async getDhikrTags(): Promise<string[]> {
    return rpcTags('tags_dhikrs');
  }

  // ================= Douaas =================
  async getDouaas(params?: PaginationParams): Promise<PaginatedResponse<Douaa>> {
    return rpcSearch<Douaa>('search_douaas', '', null, 'tag_filter', params ?? LOAD_ALL);
  }
  async searchDouaas(searchTerm: string, tag?: string | null, params?: PaginationParams): Promise<PaginatedResponse<Douaa>> {
    return rpcSearch<Douaa>('search_douaas', searchTerm, tag ?? null, 'tag_filter', params ?? LOAD_ALL);
  }
  async getDouaaTags(): Promise<string[]> {
    return rpcTags('tags_douaas');
  }

  // ================= Paroles =================
  async getParoles(params?: PaginationParams): Promise<PaginatedResponse<Parole>> {
    return rpcSearch<Parole>('search_paroles', '', null, 'tag_filter', params ?? LOAD_ALL);
  }
  async searchParoles(searchTerm: string, tag?: string | null, params?: PaginationParams): Promise<PaginatedResponse<Parole>> {
    return rpcSearch<Parole>('search_paroles', searchTerm, tag ?? null, 'tag_filter', params ?? LOAD_ALL);
  }
  async getParoleTags(): Promise<string[]> {
    return rpcTags('tags_paroles');
  }
  async getParoleNames(): Promise<string[]> {
    return rpcTags('names_paroles');
  }

  // ================= Multimedia =================
  async searchMultimedia(
    searchTerm: string,
    categorie?: string | null,
    params?: PaginationParams,
  ): Promise<{ data: Multimedia[]; total: number; page: number; pageSize: number }> {
    const res = await rpcSearch<Multimedia>('search_multimedia', searchTerm, categorie ?? null, 'categorie_filter', params ?? LOAD_ALL);
    return { data: res.data, total: res.total, page: res.page, pageSize: res.pageSize };
  }
  async getMultimediaCategories(): Promise<MultimediaCategory[]> {
    const { data, error } = await supabase.rpc('categories_multimedia');
    if (error) throw error;
    return (data ?? []) as MultimediaCategory[];
  }

  // ================= Fiqh / Madhaheb =================
  async getFiqhByEcole(ecole: string): Promise<FiqhChapitre[]> {
    const { data, error } = await supabase.rpc('fiqh_by_ecole', { ecole_param: ecole });
    if (error) throw error;
    return (data ?? []) as FiqhChapitre[];
  }

  // ================= Femmes (matn + commentaire) =================
  async getFemmes(): Promise<FemmesChapitre[]> {
    const { data, error } = await supabase.rpc('femmes_all');
    if (error) throw error;
    return (data ?? []) as FemmesChapitre[];
  }

  // ================= Accueil (Home) =================
  async getStats(): Promise<SiteStats> {
    const { data, error } = await supabase.rpc('site_stats');
    if (error) throw error;
    return (data ?? {}) as SiteStats;
  }
  async getDailyHadith(day: number): Promise<Hadith | null> {
    const { data, error } = await supabase.rpc('daily_hadith', { day });
    if (error) throw error;
    return (data ?? null) as Hadith | null;
  }
  async getDailyDouaa(day: number): Promise<Douaa | null> {
    const { data, error } = await supabase.rpc('daily_douaa', { day });
    if (error) throw error;
    return (data ?? null) as Douaa | null;
  }
  async getDailyCoran(day: number): Promise<Coran | null> {
    const { data, error } = await supabase.rpc('daily_coran', { day });
    if (error) throw error;
    return (data ?? null) as Coran | null;
  }

  // ================= Utilitaires =================
  async testApiConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('tags_hadiths');
      return !error;
    } catch {
      return false;
    }
  }
}

export const dataService = new DataService();
export default dataService;
