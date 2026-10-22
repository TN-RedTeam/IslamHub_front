import { describe, it, expect } from 'vitest';
import { dayOfYear } from './daily';

describe('dayOfYear — base de la rotation déterministe', () => {
  it('1er janvier → 1', () => {
    expect(dayOfYear(new Date(2026, 0, 1, 12, 0, 0))).toBe(1);
  });
  it('31 décembre (année non bissextile) → 365', () => {
    expect(dayOfYear(new Date(2025, 11, 31, 12, 0, 0))).toBe(365);
  });
  it('29 février (année bissextile) existe → 60', () => {
    expect(dayOfYear(new Date(2024, 1, 29, 12, 0, 0))).toBe(60);
  });
  it('déterministe : même date → même valeur (stable dans la journée)', () => {
    const matin = dayOfYear(new Date(2026, 5, 15, 1, 0, 0));
    const soir = dayOfYear(new Date(2026, 5, 15, 23, 0, 0));
    expect(matin).toBe(soir);
  });
  it('change au passage de minuit', () => {
    const j = dayOfYear(new Date(2026, 5, 15, 23, 59, 0));
    const j1 = dayOfYear(new Date(2026, 5, 16, 0, 1, 0));
    expect(j1).toBe(j + 1);
  });
});
