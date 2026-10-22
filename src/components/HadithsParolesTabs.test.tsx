import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HadithsParolesTabs } from './HadithsParolesTabs';

const renderAt = (url: string, active: 'hadiths' | 'paroles') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <HadithsParolesTabs active={active} />
    </MemoryRouter>,
  );

describe('HadithsParolesTabs — toggle hadiths/paroles', () => {
  it('rend un tablist avec deux onglets', () => {
    renderAt('/hadiths', 'hadiths');
    expect(screen.getByRole('tablist', { name: 'Type de preuve' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('marque l’onglet actif via aria-selected', () => {
    renderAt('/paroles', 'paroles');
    expect(screen.getByRole('tab', { name: /Paroles/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Hadiths' })).toHaveAttribute('aria-selected', 'false');
  });

  it('conserve la recherche (?q) et le sujet (?sujet) d’un onglet à l’autre', () => {
    renderAt('/hadiths?q=patience&sujet=Foi', 'hadiths');
    const paroles = screen.getByRole('tab', { name: /Paroles/ }) as HTMLAnchorElement;
    expect(paroles.getAttribute('href')).toContain('q=patience');
    expect(paroles.getAttribute('href')).toContain('sujet=Foi');
  });
});
