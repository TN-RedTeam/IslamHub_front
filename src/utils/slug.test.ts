import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('met en minuscules et remplace les espaces par des tirets', () => {
    expect(slugify('La Purification')).toBe('la-purification');
  });
  it('retire les accents (NFD)', () => {
    expect(slugify('Été à Paris')).toBe('ete-a-paris');
  });
  it('réduit les séparateurs multiples et coupe ceux en bord', () => {
    expect(slugify('  ---Trim!!!Me---  ')).toBe('trim-me');
  });
  it('gère une chaîne sans caractère alphanumérique', () => {
    expect(slugify('***')).toBe('');
  });
  it('conserve les chiffres', () => {
    expect(slugify('Sourate 112')).toBe('sourate-112');
  });
});
