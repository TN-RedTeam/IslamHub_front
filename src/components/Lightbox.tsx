import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface LightboxImage {
  image_url: string;
  alt: string;
  legende?: string | null;
  source_livre?: string | null;
  source_livre_ar?: string | null;
}

/** Visionneuse plein écran, fermable au clic sur le fond et à la touche Échap. */
export const Lightbox: React.FC<{ image: LightboxImage | null; onClose: () => void }> = ({ image, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!image) return;
    // Mémorise l'élément déclencheur pour y rendre le focus à la fermeture.
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Piège de focus : Tab/Maj+Tab reste à l'intérieur de la boîte de dialogue.
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="w-6 h-6" />
      </button>
      <figure
        className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={image.image_url} alt={image.alt} className="max-h-[80vh] w-auto rounded-lg object-contain" />
        {(image.legende || image.source_livre || image.source_livre_ar) && (
          <figcaption className="text-center text-sm text-white/80">
            {image.legende}
            {image.source_livre && <span className="block text-white/60 text-xs mt-0.5">{image.source_livre}</span>}
            {image.source_livre_ar && (
              <span dir="rtl" lang="ar" className="block font-arabic text-base text-white/90 mt-1">
                {image.source_livre_ar}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
};

export default Lightbox;
