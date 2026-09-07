// Slugify côté client, aligné sur la génération SQL (unaccent + minuscules +
// non-alphanumérique → tirets). Sert à lier un nom de savant vers /savants/:slug.
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
