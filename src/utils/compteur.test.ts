import { describe, it, expect } from 'vitest';
import { compteur, compteurs } from './compteur';

describe('compteur — accord singulier/pluriel', () => {
  it('0 et 1 → singulier', () => {
    expect(compteur(0, 'verset')).toBe('0 verset');
    expect(compteur(1, 'hadith')).toBe('1 hadith');
  });
  it('≥ 2 → pluriel', () => {
    expect(compteur(2, 'hadith')).toBe('2 hadiths');
    expect(compteur(11, 'verset')).toBe('11 versets');
  });
  it('libellés composés (fiqh)', () => {
    expect(compteur(1, 'fiqh')).toBe('1 point de fiqh');
    expect(compteur(3, 'fiqh')).toBe('3 points de fiqh');
  });
  it('accents conservés dans le libellé', () => {
    expect(compteur(2, 'evocation')).toBe('2 évocations');
    expect(compteur(1, 'recit')).toBe('1 récit');
  });
});

describe('compteurs — assemblage en masquant les zéros', () => {
  it('masque les compteurs à 0 et joint avec le séparateur par défaut', () => {
    expect(
      compteurs([
        { n: 11, type: 'verset' },
        { n: 0, type: 'parole' },
        { n: 18, type: 'hadith' },
      ]),
    ).toBe('11 versets · 18 hadiths');
  });
  it('séparateur personnalisable', () => {
    expect(
      compteurs(
        [
          { n: 1, type: 'sourate' },
          { n: 2, type: 'theme' },
        ],
        ' — ',
      ),
    ).toBe('1 sourate — 2 thèmes');
  });
  it('tout à 0 → chaîne vide', () => {
    expect(
      compteurs([
        { n: 0, type: 'verset' },
        { n: 0, type: 'hadith' },
      ]),
    ).toBe('');
  });
});
