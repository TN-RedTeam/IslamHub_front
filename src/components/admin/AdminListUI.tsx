import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Petit badge de comptage affiché à côté du titre d'une liste admin :
 * indique combien d'entrées existent dans la rubrique. `n = null` pendant
 * le chargement (affiche « … »).
 */
/**
 * Pastille d'identifiant affichée en tête de chaque ligne de liste admin.
 * Uniquement côté admin : permet de repérer/retrouver une entrée par son id
 * (ex. pour saisir directement /admin/hadiths/94).
 */
export const IdTag: React.FC<{ id: string | number }> = ({ id }) => (
  <span
    className="shrink-0 text-[11px] font-mono text-muted bg-ground border border-line rounded px-1.5 py-0.5 tabular-nums"
    title="Identifiant (admin)"
  >
    #{id}
  </span>
);

export const CountBadge: React.FC<{ n: number | null }> = ({ n }) => (
  <span
    className="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-green-soft text-green-deep border border-green-line px-2.5 py-0.5 text-[13px] font-semibold tabular-nums"
    aria-label={n == null ? 'Chargement du nombre d’entrées' : `${n} entrée(s)`}
    title={n == null ? undefined : `${n} entrée(s)`}
  >
    {n == null ? '…' : n}
  </span>
);

/**
 * Barre de pagination Précédent / Suivant pour les listes servies page par page.
 * Ne s'affiche que si le total dépasse une page.
 */
export const Pagination: React.FC<{
  page: number; pageSize: number; total: number; onPage: (p: number) => void;
}> = ({ page, pageSize, total, onPage }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const btn = 'inline-flex items-center gap-1 rounded-lg border border-line bg-surface text-ink font-medium px-3 py-2 text-sm hover:bg-green-soft disabled:opacity-40 disabled:hover:bg-surface transition-colors';
  return (
    <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
      <span className="text-sm text-muted">{total} résultats · page {page + 1} / {pages}</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)} className={btn}>
          <ChevronLeft className="w-4 h-4" /> Précédent
        </button>
        <button type="button" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)} className={btn}>
          Suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
