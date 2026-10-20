import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale, stripLocale } from '../lib/router';
import { LOCALES, type Locale } from '../i18n';

/**
 * Métadonnées MULTILINGUES par page (Phase 15.6) : og:locale, canonical
 * localisé et balises hreflang alternate (fr/en/ar + x-default→fr).
 * Le <title>, la description, og:title/description et le JSON-LD par page sont
 * gérés par le hook useSeo (src/hooks/useSeo.ts) — SeoHead ne les touche pas
 * pour ne pas écraser ce que les pages posent. canonical/hreflang sont (re)créés
 * à chaque navigation. Côté prérendu/SSG, le HTML est enrichi côté client (que
 * Google exécute) puis figé par le snapshot.
 */
const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_AR' };

export const SeoHead: React.FC = () => {
  const locale = useLocale();
  const { pathname } = useLocation();

  useEffect(() => {
    const basePath = stripLocale(pathname);

    // URLs absolues par langue (structure du déploiement web : base + /langue + chemin).
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    const urlFor = (l: string) => `${origin}${base}/${l}${basePath === '/' ? '' : basePath}`;

    // SeoHead ne gère QUE le multilingue : og:locale + canonical localisé +
    // hreflang. Le <title>, la description, og:title/description et le JSON-LD
    // par page restent gérés par le hook useSeo (src/hooks/useSeo.ts) — sinon
    // SeoHead (parent, effet exécuté après) écraserait le titre posé par la page.
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
  }, [locale, pathname]);

  return null;
};

export default SeoHead;
