import { describe, it, expect } from 'vitest';
import { formatHijriFr, HIJRI_MONTHS_FR, type HijriMoment } from './hijri';

const stub = (date: number, month: number, year: number): HijriMoment => ({
  iDate: () => date,
  iMonth: () => month,
  iYear: () => year,
});

describe('HIJRI_MONTHS_FR', () => {
  it('contient exactement 12 mois', () => {
    expect(HIJRI_MONTHS_FR).toHaveLength(12);
  });
  it('index 0 = Mouharram, index 11 = Dhou al-hijja', () => {
    expect(HIJRI_MONTHS_FR[0]).toBe('Mouharram');
    expect(HIJRI_MONTHS_FR[11]).toBe('Dhou al-hijja');
  });
});

describe('formatHijriFr — jour mois année', () => {
  it('assemble le jour, le mois translittéré et l’année', () => {
    expect(formatHijriFr(stub(10, 8, 1447))).toBe('10 Ramadân 1447');
  });
  it('premier mois (Mouharram)', () => {
    expect(formatHijriFr(stub(1, 0, 1448))).toBe('1 Mouharram 1448');
  });
  it('dernier mois (Dhou al-hijja)', () => {
    expect(formatHijriFr(stub(29, 11, 1446))).toBe('29 Dhou al-hijja 1446');
  });
});
