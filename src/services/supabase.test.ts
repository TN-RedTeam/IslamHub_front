import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured, supabase } from './supabase';

// Robustesse : le module NE DOIT PAS planter au chargement, que les variables
// d'environnement soient présentes (CI, prod) ou absentes (ce runner, app mal
// configurée). Le test couvre les deux cas sans dépendre de l'environnement :
//  • configuré   → vrai client Supabase (supabase.rpc est une fonction) ;
//  • non configuré → client « piège » dont tout accès lève une erreur
//    rattrapable, ce qui déclenche les fallbacks des appelants (pas d'écran blanc).
describe('client Supabase — contrat de configuration', () => {
  it('n’a pas jeté au chargement du module (import réussi)', () => {
    expect(supabase).toBeDefined();
  });

  it('expose un drapeau de configuration booléen', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('configuré → vrai client ; non configuré → piège qui lève à l’usage', () => {
    if (isSupabaseConfigured) {
      expect(typeof supabase.rpc).toBe('function');
    } else {
      expect(() => supabase.rpc).toThrow(/not configured/i);
    }
  });
});
