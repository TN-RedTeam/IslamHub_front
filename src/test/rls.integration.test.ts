import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Test de sécurité RLS (OWASP A01) — s'exécute UNIQUEMENT si les identifiants
// Supabase sont fournis (env VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
// En local sans secrets, il est ignoré (skip) pour ne pas casser `npm test`.
// En CI, on injecte les secrets pour qu'il tourne réellement.
const url = process.env.VITE_SUPABASE_URL ?? '';
const anon = process.env.VITE_SUPABASE_ANON_KEY ?? '';
const run = Boolean(url && anon);

describe.skipIf(!run)('RLS — le rôle anonyme ne peut pas écrire', () => {
  let anonClient: SupabaseClient;
  beforeAll(() => { anonClient = createClient(url, anon); });

  it('peut LIRE le contenu public (hadiths)', async () => {
    const { error } = await anonClient.from('hadiths').select('id').limit(1);
    expect(error).toBeNull();
  });

  it('ne peut PAS insérer directement dans une table de contenu', async () => {
    const { error } = await anonClient.from('hadiths').insert({ texte_arabe: '__RLS_TEST__', sujet: '__RLS_TEST__' });
    expect(error).not.toBeNull();
  });

  it('ne peut PAS appeler admin_save_hadith (garde is_admin)', async () => {
    const { error } = await anonClient.rpc('admin_save_hadith', { p: { sujet: '__RLS_TEST__', texte_arabe: '__RLS_TEST__' } });
    expect(error).not.toBeNull();
  });

  it('ne peut PAS appeler un RPC admin de liste réservé (admin_list_dossiers)', async () => {
    const { error } = await anonClient.rpc('admin_list_dossiers');
    expect(error).not.toBeNull();
  });
});
