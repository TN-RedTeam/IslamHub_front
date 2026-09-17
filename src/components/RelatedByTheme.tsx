import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Quote, BookOpen } from 'lucide-react';
import { dataService } from '../services/DataService';
import type { RelatedItem } from '../types';

/**
 * « Sur le même thème » (Phase 4.7) — contenus liés automatiquement par thème
 * partagé (plus aucune sélection manuelle). S'efface s'il n'y a rien à montrer.
 */
const ICON = { hadith: Book, parole: Quote, verset: BookOpen } as const;

function hrefFor(r: RelatedItem): string {
  if (r.kind === 'hadith') return `/hadiths/${r.id}/${r.slug ?? ''}`;
  if (r.kind === 'parole') return r.slug ? `/paroles/${r.slug}` : '/savants/paroles';
  return '/coran';
}
const KIND_LABEL = { hadith: 'Hadith', parole: 'Parole', verset: 'Verset' } as const;

export const RelatedByTheme: React.FC<{ kind: 'hadith' | 'parole' | 'verset'; id: number; className?: string }> = ({ kind, id, className }) => {
  const [items, setItems] = useState<RelatedItem[]>([]);

  useEffect(() => {
    let alive = true;
    dataService.getRelatedByTheme(kind, id).then((r) => { if (alive) setItems(r); }).catch(() => {});
    return () => { alive = false; };
  }, [kind, id]);

  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="related-h">
      <p id="related-h" className="text-[11px] uppercase tracking-[0.16em] text-gold font-semibold mb-3">Sur le même thème</p>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {items.map((r) => {
          const Icon = ICON[r.kind];
          return (
            <li key={`${r.kind}-${r.id}`}>
              <Link to={hrefFor(r)} className="flex items-center gap-2.5 rounded-card border border-line bg-surface px-3.5 py-2.5 hover:border-green transition-colors">
                <span className="w-8 h-8 rounded-lg bg-green-soft text-green grid place-items-center shrink-0"><Icon className="w-4 h-4" /></span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wide text-muted">{KIND_LABEL[r.kind]}</span>
                  <span className="block text-[14px] text-ink font-medium truncate">{r.sujet || r.savant || r.sourate || 'Voir'}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RelatedByTheme;
