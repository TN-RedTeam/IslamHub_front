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

/**
 * Balises SEO par page : <title>, meta description, canonical, Open Graph.
 * Client-side (Google exécute le JS). Utile aussi pour le partage social.
 */
export function useSeo(opts: { title?: string; description?: string }): void {
  const { title, description } = opts;
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    if (title) upsertMeta('property', 'og:title', `${title} | ${SITE_NAME}`);
    if (description) {
      const d = description.replace(/\s+/g, ' ').trim().slice(0, 300);
      upsertMeta('name', 'description', d);
      upsertMeta('property', 'og:description', d);
    }
    const url = window.location.href;
    upsertMeta('property', 'og:url', url);
    setCanonical(url);
    return () => { document.title = SITE_NAME; };
  }, [title, description]);
}
