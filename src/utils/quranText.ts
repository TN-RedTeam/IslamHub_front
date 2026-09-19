/**
 * Texte coranique complet (riwāyah Ḥafṣ ʿan ʿĀṣim, script ʿUthmānī) —
 * muṣḥaf de Médine. Source : King Fahd Glorious Qur'an Printing Complex
 * (qurancomplex.gov.sa), via l'édition « ara-quranuthmanihaf » de fawazahmed0
 * quran-api. Décomptes de versets vérifiés (6236 versets, 114 sourates).
 *
 * Bundlé en local (public/data/quran-uthmani.json) → disponible hors-ligne.
 * Chargé une seule fois puis mis en cache mémoire ; « Lire la sourate entière »
 * lit ce texte, indépendamment des versets saisis pour l'exégèse.
 */
type QuranData = Record<string, string[]>;

let cache: QuranData | null = null;
let inflight: Promise<QuranData> | null = null;

async function load(): Promise<QuranData> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch(`${import.meta.env.BASE_URL}data/quran-uthmani.json`)
      .then((r) => { if (!r.ok) throw new Error('quran-text'); return r.json(); })
      .then((d: QuranData) => { cache = d; return d; })
      .catch((e) => { inflight = null; throw e; });
  }
  return inflight;
}

/** Versets (texte arabe) d'une sourate, index 0 = verset 1. [] si indisponible. */
export async function loadSuraText(numero: number): Promise<string[]> {
  try {
    const d = await load();
    return d[String(numero)] ?? [];
  } catch {
    return [];
  }
}
