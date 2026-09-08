import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/DataService';
import { slugify } from '../utils/slug';
import type { SavantInfo } from '../types';

// Cache partagé des savants (chargé une seule fois pour toute la session).
let cache: Map<string, SavantInfo> | null = null;
let inflight: Promise<Map<string, SavantInfo>> | null = null;
function loadSavantsMap(): Promise<Map<string, SavantInfo>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = dataService.getSavants()
      .then((list) => {
        cache = new Map(list.map((s) => [s.slug, s]));
        return cache;
      })
      .catch(() => {
        cache = new Map();
        return cache;
      });
  }
  return inflight;
}

/**
 * Nom de savant cliquable (→ /savants/:slug) avec mini-bio au survol/focus :
 * nom + école + début de biographie + lien « biographie complète ».
 * Le popover est en position `fixed` pour ne pas être coupé par les cartes
 * en `overflow-hidden`.
 */
export const SavantHover: React.FC<{ nom: string; className?: string }> = ({ nom, className }) => {
  const slug = slugify(nom);
  const [info, setInfo] = useState<SavantInfo | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let alive = true;
    loadSavantsMap().then((m) => { if (alive) setInfo(m.get(slug) ?? null); });
    return () => { alive = false; };
  }, [slug]);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 300) });
  };
  const hide = () => setPos(null);

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Link
        to={`/savants/${slug}`}
        onClick={(e) => e.stopPropagation()}
        className={className ?? 'text-emerald-700 dark:text-emerald-300 hover:underline'}
      >
        {nom}
      </Link>

      {pos && info && (
        <span
          role="tooltip"
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          className="z-[60] block w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 shadow-xl p-3 text-left"
        >
          <span className="block font-bold text-emerald-900 dark:text-emerald-200 font-amiri">{info.nom}</span>
          {info.ecole && <span className="block text-xs text-emerald-600 dark:text-emerald-400 mb-1">{info.ecole}</span>}
          {info.resume && (
            <span className="block text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{info.resume}</span>
          )}
          <Link to={`/savants/${slug}`} onClick={(e) => e.stopPropagation()} className="block mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            Biographie complète →
          </Link>
        </span>
      )}
    </span>
  );
};

export default SavantHover;
