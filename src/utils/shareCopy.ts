// Copier / Partager — helpers partagés.
//
// Objectif : que « Copier » ET « Partager » embarquent le CONTENU (texte arabe,
// traduction, source…) ET le lien de la page, et pas seulement l'URL.

/** Copie un texte dans le presse-papiers. Retourne true si réussi. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Assemble le contenu + le lien en un seul bloc copiable. */
export function withLink(text: string, url?: string): string {
  const link = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  return [text.trim(), link].filter(Boolean).join('\n\n');
}

/**
 * Partage natif (téléphone) en incluant le CONTENU et le lien ; à défaut
 * (navigateur sans Web Share, ex. desktop), copie « contenu + lien ».
 * Retourne 'shared' | 'copied' | 'cancelled' pour piloter un éventuel retour visuel.
 */
export async function shareContent(opts: {
  title: string;
  text?: string;
  url?: string;
}): Promise<'shared' | 'copied' | 'cancelled'> {
  const url = opts.url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const text = (opts.text ?? '').trim();
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      // On passe title + text + url : les apps (WhatsApp, etc.) composent un
      // message avec le contenu ET le lien, au lieu d'un lien nu.
      await navigator.share({ title: opts.title, text: text || undefined, url });
      return 'shared';
    }
    const ok = await copyToClipboard(withLink(text, url));
    return ok ? 'copied' : 'cancelled';
  } catch {
    // L'utilisateur a annulé la feuille de partage, ou permission refusée.
    return 'cancelled';
  }
}
