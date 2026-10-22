import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const Boom = () => {
  throw new Error('crash');
};

afterEach(() => vi.restoreAllMocks());

describe('ErrorBoundary', () => {
  it('rend les enfants quand tout va bien', () => {
    render(
      <ErrorBoundary>
        <p>Contenu sain</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Contenu sain')).toBeInTheDocument();
  });

  it('affiche un repli (pas d’écran blanc) quand un enfant lève une erreur', () => {
    // componentDidCatch journalise via console.error : on le fait taire pour le test.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('respecte un fallback personnalisé', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>Repli sur mesure</p>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Repli sur mesure')).toBeInTheDocument();
  });
});
