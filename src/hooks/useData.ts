/**
 * Hooks personnalisés pour l'accès aux données
 *
 * Ces hooks utilisent le DataService et gèrent automatiquement
 * le chargement, les erreurs et le state.
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/DataService';
import type {
  Hadith,
  Coran,
  Dhikr,
  Douaa,
  Savant,
  PaginationParams
} from '../types';

// ==========================================
// Hook générique pour les données
// ==========================================

interface UseDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  tags: string[];
  totalCount: number;
  hasMore: boolean;
  search: (term: string, tag?: string | null) => void;
  loadMore: () => void;
  refresh: () => void;
}

// ==========================================
// Hook pour les Hadiths
// ==========================================

export function useHadiths(pageSize = 50): UseDataResult<Hadith> {
  const [data, setData] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    dataService.getHadithTags().then(setTags).catch(() => setTags([]));
  }, []);

  const fetchData = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const params: PaginationParams = { page: currentPage, pageSize };

      const result = searchTerm || selectedTag
        ? await dataService.searchHadiths(searchTerm, selectedTag, params)
        : await dataService.getHadiths(params);

      if (reset) {
        setData(result.data);
        setPage(0);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedTag]);

  useEffect(() => {
    fetchData(true);
  }, [searchTerm, selectedTag]);

  const search = useCallback((term: string, tag?: string | null) => {
    setSearchTerm(term);
    setSelectedTag(tag ?? null);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  }, [isLoading, hasMore, fetchData]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, tags, totalCount, hasMore, search, loadMore, refresh };
}

// ==========================================
// Hook pour le Coran
// ==========================================

export function useCoran(pageSize = 50): UseDataResult<Coran> {
  const [data, setData] = useState<Coran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    dataService.getCoranTags().then(setTags).catch(() => setTags([]));
  }, []);

  const fetchData = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const params: PaginationParams = { page: currentPage, pageSize };

      const result = searchTerm || selectedTag
        ? await dataService.searchCoran(searchTerm, selectedTag, params)
        : await dataService.getCoran(params);

      if (reset) {
        setData(result.data);
        setPage(0);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedTag]);

  useEffect(() => {
    fetchData(true);
  }, [searchTerm, selectedTag]);

  const search = useCallback((term: string, tag?: string | null) => {
    setSearchTerm(term);
    setSelectedTag(tag ?? null);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  }, [isLoading, hasMore, fetchData]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, tags, totalCount, hasMore, search, loadMore, refresh };
}

// ==========================================
// Hook pour les Dhikrs
// ==========================================

export function useDhikrs(pageSize = 50): UseDataResult<Dhikr> {
  const [data, setData] = useState<Dhikr[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    dataService.getDhikrTags().then(setTags).catch(() => setTags([]));
  }, []);

  const fetchData = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const params: PaginationParams = { page: currentPage, pageSize };

      const result = searchTerm || selectedTag
        ? await dataService.searchDhikrs(searchTerm, selectedTag, params)
        : await dataService.getDhikrs(params);

      if (reset) {
        setData(result.data);
        setPage(0);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedTag]);

  useEffect(() => {
    fetchData(true);
  }, [searchTerm, selectedTag]);

  const search = useCallback((term: string, tag?: string | null) => {
    setSearchTerm(term);
    setSelectedTag(tag ?? null);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  }, [isLoading, hasMore, fetchData]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, tags, totalCount, hasMore, search, loadMore, refresh };
}

// ==========================================
// Hook pour les Douaas
// ==========================================

export function useDouaas(pageSize = 50): UseDataResult<Douaa> {
  const [data, setData] = useState<Douaa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    dataService.getDouaaTags().then(setTags).catch(() => setTags([]));
  }, []);

  const fetchData = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const params: PaginationParams = { page: currentPage, pageSize };

      const result = searchTerm || selectedTag
        ? await dataService.searchDouaas(searchTerm, selectedTag, params)
        : await dataService.getDouaas(params);

      if (reset) {
        setData(result.data);
        setPage(0);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedTag]);

  useEffect(() => {
    fetchData(true);
  }, [searchTerm, selectedTag]);

  const search = useCallback((term: string, tag?: string | null) => {
    setSearchTerm(term);
    setSelectedTag(tag ?? null);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  }, [isLoading, hasMore, fetchData]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, tags, totalCount, hasMore, search, loadMore, refresh };
}

// ==========================================
// Hook pour les Savants
// ==========================================

interface UseSavantsResult extends UseDataResult<Savant> {
  savantNames: string[];
}

export function useSavants(pageSize = 50): UseSavantsResult {
  const [data, setData] = useState<Savant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [savantNames, setSavantNames] = useState<string[]>([]);

  useEffect(() => {
    dataService.getSavantTags().then(setTags).catch(() => setTags([]));
    dataService.getSavantNames().then(setSavantNames).catch(() => setSavantNames([]));
  }, []);

  const fetchData = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const params: PaginationParams = { page: currentPage, pageSize };

      const result = searchTerm || selectedTag
        ? await dataService.searchSavants(searchTerm, selectedTag, params)
        : await dataService.getSavants(params);

      if (reset) {
        setData(result.data);
        setPage(0);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedTag]);

  useEffect(() => {
    fetchData(true);
  }, [searchTerm, selectedTag]);

  const search = useCallback((term: string, tag?: string | null) => {
    setSearchTerm(term);
    setSelectedTag(tag ?? null);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchData(false);
    }
  }, [isLoading, hasMore, fetchData]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, tags, totalCount, hasMore, search, loadMore, refresh, savantNames };
}
