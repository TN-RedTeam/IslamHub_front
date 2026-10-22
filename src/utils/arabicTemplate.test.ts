import { describe, it, expect } from 'vitest';
import { AR_TEMPLATE, TRAD_TEMPLATE, normalizeBracketSpaces } from './arabicTemplate';

const NNBSP = ' '; // espace fine insécable

describe('AR_TEMPLATE — gabarits de ponctuation', () => {
  it('coran : parenthèses coraniques ﴿ ﴾ avec espaces fines insécables', () => {
    expect(AR_TEMPLATE.coran).toBe(`﴿${NNBSP}${NNBSP}﴾`);
  });
  it('hadith : guillemets français « » ; parole : chevrons simples ‹ ›', () => {
    expect(AR_TEMPLATE.hadith).toBe(`«${NNBSP}${NNBSP}»`);
    expect(AR_TEMPLATE.parole).toBe(`‹${NNBSP}${NNBSP}›`);
  });
  it('aucune espace ordinaire (U+0020) ni insécable large (U+00A0) dans les gabarits', () => {
    for (const tpl of Object.values(AR_TEMPLATE)) {
      expect(tpl).not.toContain(' ');
      expect(tpl).not.toContain(' ');
    }
  });
  it('gabarit de traduction contient « ce qui signifie » et des espaces fines', () => {
    expect(TRAD_TEMPLATE).toContain('ce qui signifie');
    expect(TRAD_TEMPLATE).toContain(NNBSP);
  });
});

describe('normalizeBracketSpaces — normalise l’espace autour des signes', () => {
  it('remplace les espaces ordinaires adjacentes par une espace fine insécable', () => {
    expect(normalizeBracketSpaces('﴿ texte ﴾')).toBe(`﴿${NNBSP}texte${NNBSP}﴾`);
    expect(normalizeBracketSpaces('« dit »')).toBe(`«${NNBSP}dit${NNBSP}»`);
    expect(normalizeBracketSpaces('‹ mot ›')).toBe(`‹${NNBSP}mot${NNBSP}›`);
  });
  it('réduit les espaces multiples (U+00A0 inclus) à une seule espace fine', () => {
    expect(normalizeBracketSpaces('﴿   texte  ﴾')).toBe(`﴿${NNBSP}texte${NNBSP}﴾`);
  });
  it('idempotent : une chaîne déjà normalisée est inchangée', () => {
    const once = normalizeBracketSpaces('﴿ texte ﴾');
    expect(normalizeBracketSpaces(once)).toBe(once);
  });
  it('chaîne vide → chaîne vide', () => {
    expect(normalizeBracketSpaces('')).toBe('');
  });
});
