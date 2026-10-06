import { useEffect } from 'react';

const SITE_NAME = 'IslamHub';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/** Injecte (ou met à jour / retire) un bloc JSON-LD spécifique à la page. */
function setJsonLd(data: object | object[] | undefined) {
  const id = 'seo-jsonld-page';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Balises SEO par page : <title>, meta description, canonical, Open Graph,
 * et données structurées JSON-LD optionnelles.
 * Client-side (Google exécute le JS). Utile aussi pour le partage social.
 */
export function useSeo(opts: {
  title?: string;
  description?: string;
  image?: string; // URL absolue pour og:image (sinon : valeur par défaut d'index.html)
  type?: string;  // og:type — 'website' (défaut) | 'article'
  jsonLd?: object | object[];
}): void {
  const { title, description, image, type, jsonLd } = opts;
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    if (title) upsertMeta('property', 'og:title', `${title} | ${SITE_NAME}`);
    if (description) {
      const d = description.replace(/\s+/g, ' ').trim().slice(0, 300);
      upsertMeta('name', 'description', d);
      upsertMeta('property', 'og:description', d);
    }
    if (image) upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:type', type ?? 'website');
    const url = window.location.href;
    upsertMeta('property', 'og:url', url);
    setCanonical(url);
    setJsonLd(jsonLd);
    return () => {
      document.title = SITE_NAME;
      setJsonLd(undefined);
    };
  }, [title, description, image, type, jsonLd]);
}
