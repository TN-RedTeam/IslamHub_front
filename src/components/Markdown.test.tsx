import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from './Markdown';

// Régression sécurité (OWASP A03) : le contenu Markdown est saisi par l'admin,
// mais on garantit que react-markdown (sans rehype-raw) N'INJECTE PAS de HTML brut.
describe('Markdown — sûreté du rendu', () => {
  it('n’exécute pas de <script> injecté dans le Markdown', () => {
    const { container } = render(<Markdown>{'Bonjour <script>window.__pwned=1</script> fin'}</Markdown>);
    expect(container.querySelector('script')).toBeNull();
    // @ts-expect-error — flag de test hypothétique
    expect(window.__pwned).toBeUndefined();
  });

  it('ne rend pas d’attribut onerror via une balise <img> brute', () => {
    const { container } = render(<Markdown>{'<img src=x onerror="window.__pwned=2">'}</Markdown>);
    const img = container.querySelector('img');
    // Soit aucune balise img (HTML échappé), soit sans handler onerror.
    expect(img?.getAttribute('onerror') ?? null).toBeNull();
  });

  it('neutralise les liens javascript:', () => {
    const { container } = render(<Markdown>{'[clic](javascript:window.__pwned=3)'}</Markdown>);
    const a = container.querySelector('a');
    expect(a?.getAttribute('href') ?? '').not.toContain('javascript:');
  });

  it('rend le Markdown normal (gras)', () => {
    const { container } = render(<Markdown>{'Un mot **important**'}</Markdown>);
    expect(container.querySelector('strong')?.textContent).toBe('important');
  });
});
