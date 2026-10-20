import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale, stripLocale } from '../lib/router';
import { LOCALES, type Locale } from '../i18n';

/**
 * Métadonnées SEO par page ET par langue (Phase 15.6) — sans dépendance.
 * Met à jour <title>, meta description, canonical, Open Graph (og:locale par
 * langue) et les balises hreflang alternate (fr/en/ar + x-default→fr).
 * Les meta statiques de index.html sont mises à jour sur place (upsert) pour
 * éviter les doublons ; canonical/hreflang (absents du HTML) sont (re)créés à
 * chaque navigation.
 *
 * SSR/prérendu : non requis pour le rendu client ; une étape SSG (prérendu par
 * langue) reste un chantier séparé — ici le HTML est enrichi côté client, ce que
 * Google exécute.
 */
const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_AR' };

function prettifySegment(path: string): string {
  const seg = path.replace(/^\/+/, '').split('/')[0];
  if (!seg) return '';
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

export const SeoHead: React.FC = () => {
  const locale = useLocale();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const brand = t('brand.name');
    const tagline = t('seo.tagline');
    const basePath = stripLocale(pathname);
    const section = prettifySegment(basePath);
    const title = basePath === '/' || !section ? `${brand} — ${tagline}` : `${section} — ${brand}`;
    const description = tagline;

    // URLs absolues par langue (structure du déploiement web : base + /langue + chemin).
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const urlFor = (l: string) => `${origin}${base}/${l}${basePath === '/' ? '' : basePath}`;

    document.title = title;

    // Upsert d'une meta (met à jour la version statique de index.html si présente).
    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('data-seo', '');
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', urlFor(locale));
    upsertMeta('property', 'og:locale', OG_LOCALE[locale]);

    // Liens gérés (canonical + hreflang) : on repart propre à chaque navigation.
    document.head.querySelectorAll('link[data-seo]').forEach((e) => e.remove());
    const addLink = (rel: string, href: string, hreflang?: string) => {
      const el = document.createElement('link');
      el.setAttribute('rel', rel);
      el.setAttribute('href', href);
      if (hreflang) el.setAttribute('hreflang', hreflang);
      el.setAttribute('data-seo', '');
      document.head.appendChild(el);
    };
    addLink('canonical', urlFor(locale));
    LOCALES.forEach((l) => addLink('alternate', urlFor(l), l));
    addLink('alternate', urlFor('fr'), 'x-default');
  }, [locale, pathname, t]);

  return null;
};

export default SeoHead;
