import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, X, Loader, RotateCcw, Plus, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BaseText, PaginatedResponse, PaginationParams } from '../types';

// ============================================================
// Page de collection générique (Hadiths, Paroles, Dhikrs, Douaas).
// Un seul composant => cartes + recherche + filtres 100 % cohérents.
// ============================================================

export interface CollectionFields<T> {
  author?: (i: T) => string | null | undefined;   // rapporteur / savant
  authorLabel?: string;                            // "Rapporteur", "Savant"...
  author2?: (i: T) => string | null | undefined;  // narrateur (modal)
  author2Label?: string;
  badge?: (i: T) => string | null | undefined;    // statut (authenticité)
  commentaire?: (i: T) => string | null | undefined;
}

export interface CollectionConfig<T extends BaseText> {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  searchPlaceholder: string;
  footerQuote?: string;
  footerSource?: string;
  load: (p: PaginationParams) => Promise<PaginatedResponse<T>>;
  search: (term: string, tag: string | null, p: PaginationParams) => Promise<PaginatedResponse<T>>;
  getTags: () => Promise<string[]>;
  fields?: CollectionFields<T>;
  tasbih?: boolean;            // affiche un compteur (dhikrs)
  noun?: [string, string];     // singulier/pluriel pour "X résultats"
}

const PAGE: PaginationParams = { page: 0, pageSize: 1000 };
const splitTags = (t: string | null | undefined) =>
  (t ?? '').split(',').map((x) => x.trim()).filter(Boolean);

/* ---------------- Compteur de tasbih (dhikrs) ---------------- */
const Tasbih: React.FC = () => {
  const [n, setN] = useState(0);
  return (
    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl px-4 py-3">
      <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Compteur</span>
      <button
        type="button"
        onClick={() => setN((v) => Math.max(0, v - 1))}
        aria-label="Diminuer"
        className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-[2.5rem] text-center text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{n}</span>
      <button
        type="button"
        onClick={() => setN((v) => v + 1)}
        aria-label="Augmenter"
        className="w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => setN(0)}
        aria-label="Réinitialiser le compteur"
        className="ml-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-1"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ---------------- Carte uniforme ---------------- */
function ItemCard<T extends BaseText>({ item, cfg, onOpen, onTag }: {
  item: T; cfg: CollectionConfig<T>; onOpen: () => void; onTag: (t: string) => void;
}) {
  const author = cfg.fields?.author?.(item);
  const badge = cfg.fields?.badge?.(item);
  const tags = splitTags(item.tag);
  return (
    <m.article
      layout
      whileHover={{ y: -3 }}
      onClick={onOpen}
      className="cursor-pointer h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 font-amiri leading-snug">
          {item.sujet}
        </h3>
        {badge && (
          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            {badge}
          </span>
        )}
      </div>

      {author && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 italic mb-3">
          {cfg.fields?.authorLabel ? `${cfg.fields.authorLabel} : ` : ''}{author}
        </p>
      )}

      {item.texte_arabe && (
        <p lang="ar" dir="rtl" className="text-2xl font-amiri leading-loose text-gray-900 dark:text-white text-right line-clamp-3">
          {item.texte_arabe}
        </p>
      )}

      {item.texte_francais && (
        <p className="mt-3 pl-3 border-l-2 border-amber-300 dark:border-emerald-700 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {item.texte_francais}
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={(e) => { e.stopPropagation(); onTag(t); }}
              className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <span className="mt-auto pt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">Lire →</span>
    </m.article>
  );
}

/* ---------------- Modal détail ---------------- */
function DetailModal<T extends BaseText>({ item, cfg, onClose }: {
  item: T; cfg: CollectionConfig<T>; onClose: () => void;
}) {
  const author = cfg.fields?.author?.(item);
  const author2 = cfg.fields?.author2?.(item);
  const badge = cfg.fields?.badge?.(item);
  const commentaire = cfg.fields?.commentaire?.(item);
  const tags = splitTags(item.tag);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <m.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <m.div
        initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>

        <div className="pr-8 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 font-amiri">{item.sujet}</h2>
            {badge && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">{badge}</span>
            )}
          </div>
          {author && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
              {cfg.fields?.authorLabel ? `${cfg.fields.authorLabel} : ` : ''}{author}
            </p>
          )}
          {author2 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {cfg.fields?.author2Label ? `${cfg.fields.author2Label} : ` : ''}{author2}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {item.texte_arabe && (
            <p lang="ar" dir="rtl" className="text-3xl font-amiri leading-loose text-gray-900 dark:text-white text-right">
              {item.texte_arabe}
            </p>
          )}
          {item.phonétique && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Phonétique</p>
              <p className="text-gray-700 dark:text-gray-200 italic">{item.phonétique}</p>
            </div>
          )}
          {item.texte_francais && (
            <div className="pl-4 border-l-4 border-emerald-500">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Traduction</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.texte_francais}</p>
            </div>
          )}
          {item.explication && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-1">Explication</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.explication}</p>
            </div>
          )}
          {commentaire && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">Commentaire</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{commentaire}</p>
            </div>
          )}
          {cfg.tasbih && <Tasbih />}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </m.div>
    </m.div>
  );
}

/* ---------------- Page ---------------- */
export function CollectionPage<T extends BaseText>(cfg: CollectionConfig<T>) {
  const [all, setAll] = useState<T[]>([]);
  const [items, setItems] = useState<T[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [term, setTerm] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<T | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const [sing, plur] = cfg.noun ?? ['résultat', 'résultats'];

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await cfg.load(PAGE);
      setAll(res.data); setItems(res.data);
    } catch {
      setError('Erreur lors du chargement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAll();
    cfg.getTags().then((t) => setTags([...new Set(t)].sort((a, b) => a.localeCompare(b)))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!term.trim() && !tag) { setItems(all); return; }
      setSearching(true);
      try {
        const res = await cfg.search(term, tag, PAGE);
        setItems(res.data);
      } catch {
        // repli local (insensible casse/accents)
        const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const q = norm(term.trim());
        setItems(all.filter((it) => {
          const okTag = !tag || splitTags(it.tag).map((x) => x.toLowerCase()).includes(tag.toLowerCase());
          const hay = norm(`${it.sujet} ${it.texte_francais ?? ''} ${it.explication ?? ''} ${it.tag}`);
          return okTag && (!q || hay.includes(q));
        }));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, tag, all]);

  const reset = () => { setTerm(''); setTag(null); };
  const Icon = cfg.icon;
  const activeFilter = term.trim() || tag;
  const topTags = useMemo(() => tags.slice(0, 14), [tags]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      <header className="relative py-16 sm:py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Icon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-amiri">{cfg.title}</h1>
          <p className="text-lg sm:text-xl text-emerald-200 max-w-3xl mx-auto">{cfg.subtitle}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 -mt-10 relative z-10">
        {/* Recherche + filtres */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 mb-8 sticky top-20 z-20 border border-emerald-100 dark:border-emerald-900">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label={cfg.searchPlaceholder}
              placeholder={cfg.searchPlaceholder}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searching && <Loader className="w-5 h-5 text-emerald-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
          </div>

          {topTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTag(null)}
                className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${!tag ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                Tout
              </button>
              {topTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t === tag ? null : t)}
                  className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${t === tag ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {activeFilter && (
            <div className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2 text-sm">
              <span className="text-emerald-800 dark:text-emerald-200">
                {items.length} {items.length > 1 ? plur : sing}
                {tag && <> · thème <b>{tag}</b></>}
                {term.trim() && <> · « {term.trim()} »</>}
              </span>
              <button onClick={reset} aria-label="Réinitialiser" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Résultats */}
        <section className="pb-16">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-emerald-700 dark:text-emerald-300 font-amiri text-lg">Chargement…</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button onClick={loadAll} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Réessayer</button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun résultat</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Essayez d'autres mots-clés.</p>
              <button onClick={reset} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Réinitialiser</button>
            </div>
          ) : (
            <>
              {!activeFilter && (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6">
                  {items.length} {items.length > 1 ? plur : sing}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((it) => (
                  <ItemCard key={it.id} item={it} cfg={cfg} onOpen={() => setOpen(it)} onTag={(t) => { setTag(t); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {cfg.footerQuote && (
        <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-emerald-300 mb-2 font-amiri text-xl">{cfg.footerQuote}</p>
            {cfg.footerSource && <p className="text-emerald-200 text-sm">{cfg.footerSource}</p>}
          </div>
        </footer>
      )}

      <AnimatePresence>
        {open && <DetailModal item={open} cfg={cfg} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default CollectionPage;
