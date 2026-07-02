/**
 * Client API pour le backend Express
 * Utilisé en mode 'express' comme fallback si Supabase n'est pas disponible
 *
 * Basé sur fetch natif (signature compatible axios : `api.get(url, { params })`
 * renvoie `{ data }`) pour éviter d'embarquer axios dans le bundle.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 10000;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  params?: QueryParams;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path.replace(/^\//, ''), BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return { data: (await response.json()) as T, status: response.status };
  } finally {
    clearTimeout(timer);
  }
}

const api = { get };

export default api;
