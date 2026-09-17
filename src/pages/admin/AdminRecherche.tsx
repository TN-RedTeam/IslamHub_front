import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Pencil } from 'lucide-react';
import { adminService, type OccurrenceHit } from '../../services/AdminService';

/**
 * Recherche & correction (admin) — trouve toutes les occurrences d'un mot / nom
 * dans tous les contenus (insensible à la casse et aux accents) et renvoie vers
 * le formulaire d'édition, pour homogénéiser les graphies
 * (ex. « Al-Boukhari » vs « Al-Bukhari »).
 */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Surligne (best-effort, insensible casse/accents) les occurrences du terme.
function highlight(text: string, term: string): React.ReactNode {
  const t = term.trim();
  if (!t) return text;
  const nt = norm(t), nText = norm(text);
  const out: React.ReactNode[] = [];
  let i = 0, k = 0;
  while (i < text.length) {
    const idx = nText.indexOf(nt, i);
    if (idx === -1) { out.push(text.slice(i)); break; }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(<mark key={k++} className="bg-gold-soft text-[#5a4210] rounded px-0.5">{text.slice(idx, idx + t.length)}</mark>);
    i = idx + t.length;
  }
  return out;
}

export const AdminRecherche: React.FC = () => {
  const [input, setInput] = useState('');
  const [hits, setHits] = useState<OccurrenceHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    const term = input.trim();
    if (term.length < 2) { setHits([]); setSearched(false); return; }
    setLoading(true);
    timer.current = window.setTimeout(() => {
      adminService.searchOccurrences(term)
        .then((r) => { setHits(r); setSearched(true); })
        .catch(() => setHits([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => window.clearTimeout(timer.current);
  }, [input]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <h1 className="font-display font-semibold text-green-deep text-3xl">Recherche & correction</h1>
      <p className="text-muted mt-2 max-w-[68ch]">Trouve un mot ou un nom (ex. une graphie de savant) dans tous les contenus, puis clique pour ouvrir la fiche et corriger. Insensible à la casse et aux accents.</p>

      <div className="relative my-5">
        <Search className="w-5 h-5 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          autoFocus value={input} onChange={(e) => setInput(e.target.value)} type="search"
          aria-label="Rechercher un mot dans les contenus"
          placeholder="Ex. « Boukhari », « Al-Bukhari », « istighfar »…"
          className="w-full rounded-panel border border-line bg-surface pl-12 pr-4 py-3.5 text-[16px] text-ink focus:outline-none focus:ring-2 focus:ring-green"
        />
        {loading && <Loader2 className="w-5 h-5 text-green animate-spin absolute right-4 top-1/2 -translate-y-1/2" />}
      </div>

      {input.trim().length < 2 ? (
        <p className="text-muted italic py-8 text-center">Tape au moins 2 caractères.</p>
      ) : searched && hits.length === 0 && !loading ? (
        <p className="text-muted py-8 text-center">Aucune occurrence de « {input.trim()} ».</p>
      ) : (
        <>
          {hits.length > 0 && <p className="text-sm text-muted mb-3">{hits.length} occurrence{hits.length > 1 ? 's' : ''}</p>}
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {hits.map((h, i) => (
              <li key={`${h.path}-${i}`}>
                <Link to={h.path} className="flex gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide text-green-deep bg-green-soft border border-green-line rounded-full px-2 py-0.5 h-fit shrink-0">{h.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink truncate">{h.label || h.ref}</span>
                    {h.extrait && <span className="block text-[13.5px] text-muted mt-0.5 line-clamp-2">{highlight(h.extrait, input)}</span>}
                  </span>
                  <Pencil className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminRecherche;
