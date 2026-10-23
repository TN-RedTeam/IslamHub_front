import { describe, it, expect } from 'vitest';
import { reportedQuestionTitle } from './questionTitle';

describe('reportedQuestionTitle — forme rapportée (Règle A)', () => {
  it('met une question nue en forme rapportée (1re lettre en minuscule)', () => {
    expect(reportedQuestionTitle('Où est Allah ?')).toBe('Réponse à ceux qui demandent : où est Allah ?');
  });

  it('conserve la phrase réellement cherchée à l’intérieur (SEO)', () => {
    const out = reportedQuestionTitle('Allah est-il partout ?');
    expect(out.startsWith('Réponse à ceux qui demandent :')).toBe(true);
    // La majuscule de « Allah » (nom sacré en tête) est préservée.
    expect(out).toContain('Allah est-il partout ?');
  });

  it('préserve la majuscule d’un nom sacré en tête (Allah/Dieu)', () => {
    expect(reportedQuestionTitle('Allah a-t-il une forme ?')).toBe(
      'Réponse à ceux qui demandent : Allah a-t-il une forme ?',
    );
    // Les interrogatifs, eux, passent en minuscule.
    expect(reportedQuestionTitle('Comment comprendre l’istiwāʾ ?')).toBe(
      'Réponse à ceux qui demandent : comment comprendre l’istiwāʾ ?',
    );
  });

  it('laisse intact un libellé déjà en forme rapportée (pas de double préfixe)', () => {
    const deja = 'Réponse à ceux qui disent qu’Allah est partout';
    expect(reportedQuestionTitle(deja)).toBe(deja);
    expect(reportedQuestionTitle('Pour ceux qui disent qu’Allah a un corps')).toBe(
      'Pour ceux qui disent qu’Allah a un corps',
    );
  });

  it('chaîne vide → chaîne vide', () => {
    expect(reportedQuestionTitle('')).toBe('');
    expect(reportedQuestionTitle('   ')).toBe('');
  });
});
