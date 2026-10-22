import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyQuote } from './DailyQuote';

describe('DailyQuote', () => {
  it('affiche le texte et l’auteur', () => {
    render(<DailyQuote quote={{ text: 'La patience est lumière.', author: 'Un savant', source: 'Sahih' }} />);
    expect(screen.getByText('La patience est lumière.')).toBeInTheDocument();
    expect(screen.getByText('Un savant')).toBeInTheDocument();
    expect(screen.getByText('Sahih')).toBeInTheDocument();
  });
  it('masque la source quand elle est absente', () => {
    render(<DailyQuote quote={{ text: 'Texte', author: 'Auteur', source: '' }} />);
    expect(screen.getByText('Auteur')).toBeInTheDocument();
    // Aucune ligne de source affichée
    expect(screen.queryByText('Sahih')).not.toBeInTheDocument();
  });
});
