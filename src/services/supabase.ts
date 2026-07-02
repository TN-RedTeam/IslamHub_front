import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Ne pas jeter d'exception ici : un throw au chargement du module tuerait
  // toute l'application, alors que DataService sait basculer sur les données
  // locales. On exporte un client "piège" dont tout accès échoue proprement,
  // ce qui déclenche les fallbacks try/catch de DataService.
  console.warn('Supabase credentials not configured. Falling back to local data.');
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy(
      {},
      {
        get() {
          throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing).');
        },
      }
    ) as SupabaseClient);

export default supabase;
