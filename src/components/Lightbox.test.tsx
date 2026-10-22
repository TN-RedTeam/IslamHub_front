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
});
