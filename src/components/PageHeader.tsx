import React, { useEffect } from 'react';
import { Link, useLocale } from '../lib/router';

interface Crumb {
  label: string;
  to?: string;
}

/**
 * En-tête de page « Nuit Teal » : eyebrow menthe optionnel, titre Manrope
 * (ink), sous-titre discret, fil d'Ariane. Pas de bandeau — fond de page teal.
 *
 * SEO : émet aussi un JSON-LD BreadcrumbList à partir de `crumbs` (données
 * structurées Google) — une seule source pour le visuel ET le balisage.
 */
export const PageHeader: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode; // actions éventuelles à droite
}> = ({ eyebrow, title, subtitle, crumbs, children }) => {
  const locale = useLocale();
  const crumbsKey = JSON.stringify(crumbs ?? []);
  useEffect(() => {
    const id = 'seo-jsonld-breadcrumb';
    const parsed: Crumb[] = JSON.parse(crumbsKey);
    if (parsed.length === 0) {
      document.getElementById(id)?.remove();
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const abs = (to?: string) =>
      to ? `${origin}${base}/${locale}${to === '/' ? '' : to}` : origin + window.location.pathname;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: parsed.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        item: abs(c.to),
      })),
    };
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [crumbsKey, locale]);

  return (
    <header>
      <div className="max-w-5xl mx-auto px-5 pt-7 pb-2">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2 flex flex-wrap items-center gap-1.5">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link to={c.to} className="hover:text-accent">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent mb-1.5">{eyebrow}</p>}
            <h1
              className="font-display font-extrabold tracking-[-0.01em] text-ink"
              style={{ fontSize: 'clamp(26px,4vw,38px)' }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-muted mt-1.5 max-w-2xl">{subtitle}</p>}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
