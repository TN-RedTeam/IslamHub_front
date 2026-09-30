import React from 'react';
import { Link } from 'react-router-dom';

interface Crumb { label: string; to?: string; }

/**
 * En-tête de page « Nuit Teal » : eyebrow menthe optionnel, titre Manrope
 * (ink), sous-titre discret, fil d'Ariane. Pas de bandeau — fond de page teal.
 */
export const PageHeader: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode; // actions éventuelles à droite
}> = ({ eyebrow, title, subtitle, crumbs, children }) => (
  <header>
    <div className="max-w-5xl mx-auto px-5 pt-7 pb-2">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2 flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {c.to ? <Link to={c.to} className="hover:text-accent">{c.label}</Link> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent mb-1.5">{eyebrow}</p>}
          <h1 className="font-display font-extrabold tracking-[-0.01em] text-ink" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{title}</h1>
          {subtitle && <p className="text-muted mt-1.5 max-w-2xl">{subtitle}</p>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  </header>
);

export default PageHeader;
