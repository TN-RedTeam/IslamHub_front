import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lightbox, type LightboxImage } from './Lightbox';

const img: LightboxImage = { image_url: 'https://x/scan.jpg', alt: 'Page du livre', source_livre: 'Sahih al-Bukhari' };

describe('Lightbox', () => {
  it('ne rend rien quand image est null', () => {
    const { container } = render(<Lightbox image={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('rend une boîte de dialogue modale avec l’image et son alt', () => {
    render(<Lightbox image={img} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Page du livre');
    expect(screen.getByRole('img', { name: 'Page du livre' })).toBeInTheDocument();
  });

  it('donne le focus au bouton Fermer à l’ouverture', () => {
    render(<Lightbox image={img} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fermer' })).toHaveFocus();
  });

  it('ferme à la touche Échap', () => {
    const onClose = vi.fn();
    render(<Lightbox image={img} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ferme au clic sur le fond mais pas au clic sur l’image', () => {
    const onClose = vi.fn();
    render(<Lightbox image={img} onClose={onClose} />);
    fireEvent.click(screen.getByRole('img', { name: 'Page du livre' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('piège de focus : Tab garde le focus dans la boîte de dialogue', () => {
    render(<Lightbox image={img} onClose={() => {}} />);
    const close = screen.getByRole('button', { name: 'Fermer' });
    expect(close).toHaveFocus();
    // Seul le bouton Fermer est focusable → Tab et Maj+Tab y restent.
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
  });

  it('rend le focus à l’élément déclencheur à la fermeture', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Ouvrir';
    document.body.appendChild(opener);
    opener.focus();
    expect(opener).toHaveFocus();

    const { rerender } = render(<Lightbox image={img} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fermer' })).toHaveFocus();
    // Fermeture : image passe à null → le focus revient au déclencheur.
    rerender(<Lightbox image={null} onClose={() => {}} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
