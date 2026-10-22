import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured, supabase } from './supabase';

// Robustesse : sans variables d'environnement (cas de ce runner, et de l'app
// hors-ligne mal configurée), le module NE DOIT PAS planter au chargement.
// Il exporte un client « piège » dont tout accès lève une erreur rattrapable,
// ce qui déclenche les fallbacks try/catch des appelants plutôt qu'un écran blanc.
describe('client Supabase — dégradation sans configuration', () => {
  it('se déclare non configuré quand les variables manquent', () => {
    expect(isSupabaseConfigured).toBe(false);
  });

  it('n’a pas jeté au chargement du module (import réussi)', () => {
    expect(supabase).toBeDefined();
  });

  it('lève proprement à l’usage (piège) au lieu de planter silencieusement', () => {
    expect(() => supabase.rpc).toThrow(/not configured/i);
  });
});
