import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';

/**
 * Lecteur "documentation" réutilisable (fiqh, femmes...).
 *
 * Principe (Phase 7.1) : à l'arrivée, on affiche TOUJOURS la vue d'ensemble
 * (liste des sujets + recherche) — jamais un cours ouvert d'office. Choisir un
 * sujet ouvre le cours en pleine page, avec « ← Retour à la liste » et un fil
 * d'Ariane. Le sujet ouvert est mémorisé dans l'URL (?sujet=…) : partageable,
 * bouton retour du navigateur fonctionnel. Mobile-first (une seule colonne).
 * Le contenu de chaque sujet est fourni par l'appelant (prop `content`).
 */
export interface ReaderItem {
  key: string;
  title: string;
  search: string;
  content: React.ReactNode;
}
export interface ReaderSection {
  chapitre?: string;
  items: ReaderItem[];
}

export const DocReader: React.FC<{
  sections: ReaderSection[];
  searchPlaceholder?: string;
  emptyLabel?: string;
  title?: string; // libellé de la rubrique (fil d'Ariane), ex. « La femme musulmane »
}> = ({ sections, searchPlaceholder = 'Rechercher un sujet…', emptyLabel = "Aucun contenu pour l'instant.", title }) => {
  const flat = useMemo(
    () => sections.flatMap((s) => s.items.map((it) => ({ ...it, chapitre: s.chapitre }))),
    [sections],
  );
  const total = flat.length;

  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('sujet') ?? '';
  const [query, setQuery] = useState('');

  const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const q = norm(query.trim());
  const matches = (it: ReaderItem) => !q || norm(it.title).includes(q) || norm(it.search).includes(q);

  const current = selected ? flat.find((it) => it.key === selected) ?? null : null;

  const open = (key: string) => {
    setSearchParams((prev) => { const p = new URLSearchParams(prev); p.set('sujet', key); return p; });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };
  const back = () => {
    setSearchParams((prev) => { const p = new URLSearchParams(prev); p.delete('sujet'); return p; });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  if (total === 0) {
    return <p className="text-center text-muted py-10">{emptyLabel}</p>;
  }

  // ---------- Vue COURS (un sujet ouvert) ----------
  if (current) {
    return (
      <div className="max-w-[74ch] mx-auto">
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-ink mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2 flex items-center gap-1.5 flex-wrap">
          {title && <><span>{title}</span><ChevronRight className="w-3 h-3" /></>}
          {current.chapitre && <><span>{current.chapitre}</span><ChevronRight className="w-3 h-3" /></>}
          <span className="text-green">{current.title}</span>
        </nav>
        <article className="bg-glass rounded-card border border-line shadow-sm px-5 sm:px-8 py-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink font-display leading-tight mb-6">
            {current.title}
          </h1>
          <div>{current.content}</div>
        </article>
        <button
          type="button"
          onClick={back}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-ink mt-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
      </div>
    );
  }

  // ---------- Vue LISTE (atterrissage) ----------
  const visibleSections = sections
    .map((s) => ({ ...s, items: s.items.filter(matches) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Rechercher un sujet"
          className="w-full pl-10 pr-4 py-3 rounded-xl text-[15px] bg-glass border border-line text-ink focus:ring-2 focus:ring-green focus:border-transparent"
        />
      </div>
      <p className="text-sm text-muted mb-3">
        <span className="font-bold text-green">{visibleSections.reduce((n, s) => n + s.items.length, 0)}</span> sujet{total > 1 ? 's' : ''}
      </p>

      {visibleSections.length === 0 ? (
        <p className="text-center text-muted py-12">Aucun sujet ne correspond.</p>
      ) : (
        <div className="space-y-6">
          {visibleSections.map((s, si) => (
            <section key={s.chapitre ?? `sec-${si}`}>
              {s.chapitre && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" />
                  <h2 className="font-display font-bold text-ink">{s.chapitre}</h2>
                  <span className="text-xs text-muted font-medium">{s.items.length}</span>
                </div>
              )}
              <ul className="rounded-card border border-line bg-glass overflow-hidden divide-y divide-line">
                {s.items.map((it) => (
                  <li key={it.key}>
                    <button
                      type="button"
                      onClick={() => open(it.key)}
                      className="w-full flex items-center gap-3 text-left px-4 py-3.5 min-h-[44px] hover:bg-glass-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                    >
                      <BookOpen className="w-4 h-4 text-accent shrink-0" />
                      <span className="flex-1 text-[15px] font-medium text-ink">{it.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocReader;
