import { describe, it, expect } from 'vitest';
import { normalizeName, scoreName, rankNames } from './nameSearch';

describe('normalizeName — forme tolérante', () => {
  it('retire diacritiques, article et met en minuscules', () => {
    expect(normalizeName('Al-Bukhārī')).toBe('bukhari');
  });
  it('retire les titres honorifiques et les marques hamza/ʿayn', () => {
    expect(normalizeName('Imam Ash-Shāfiʿī')).toBe('shafii');
  });
  it('chaîne vide ou non pertinente → vide', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName('  al-  ')).toBe('');
  });
});

describe('scoreName — pertinence nom ↔ requête', () => {
  it('correspondance exacte → score maximal', () => {
    expect(scoreName('Al-Bukhari', 'bukhari')).toBe(1000);
  });
  it('requête vide → tout afficher (score positif)', () => {
    expect(scoreName('Muslim', '')).toBeGreaterThan(0);
  });
  it('variante de translittération (Bukhari ↔ Boukhariyy) → score positif', () => {
    expect(scoreName('Al-Bukhari', 'Boukhariyy')).toBeGreaterThan(0);
  });
  it('préfixe d’un mot → score élevé', () => {
    expect(scoreName('Ibn Taymiyya', 'taym')).toBeGreaterThan(0);
  });
  it('nom sans rapport → 0', () => {
    expect(scoreName('Muslim', 'bukhari')).toBe(0);
  });
});

describe('rankNames — filtre + tri par pertinence', () => {
  it('ne garde que les correspondances et les trie par score décroissant', () => {
    const out = rankNames(
      [{ nom: 'Muslim' }, { nom: 'Al-Bukhari' }, { nom: 'Boukhariyy' }],
      'bukhari'
    );
    expect(out.map((o) => o.nom)).toEqual(['Al-Bukhari', 'Boukhariyy']);
  });
  it('respecte la limite', () => {
    const opts = Array.from({ length: 50 }, (_, i) => ({ nom: `Sufyan ${i}` }));
    expect(rankNames(opts, 'sufyan', 5)).toHaveLength(5);
  });
});
