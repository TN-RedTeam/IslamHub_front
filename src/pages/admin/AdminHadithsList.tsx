import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Plus, ChevronRight, MessageSquare, GitFork } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { adminService } from '../../services/AdminService';
import { CountBadge, Pagination, IdTag } from '../../components/admin/AdminListUI';
import { InlineSujetTagEditor } from '../../components/admin/InlineSujetTagEditor';
import type { Hadith } from '../../types';

const PAGE_SIZE = 50;
type Mode = 'all' | 'dialogue' | 'variante' | 'both' | 'sans_source' | 'sans_arabe' | 'sans_phonetique';
type Row = Hadith & { n_seg?: number; n_var?: number };

const FILTERS: { v: Mode; label: string }[] = [
  { v: 'all', label: 'Tous' },
  { v: 'dialogue', label: 'Avec dialogue' },
  { v: 'variante', label: 'Avec variante' },
  { v: 'both', label: 'Les deux' },
  { v: 'sans_source', label: 'Sans source' },
  { v: 'sans_arabe', label: 'Sans arabe' },
  { v: 'sans_phonetique', label: 'Sans phonétique' },
];

export const AdminHadithsList: React.FC = () => {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('all');
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  // Toute nouvelle recherche / changement de filtre repart de la première page.
  useEffect(() => { setPage(0); }, [q, mode]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      const req = mode === 'all'
        ? dataService.searchHadiths(q, null, { page, pageSize: PAGE_SIZE }).then((r) => ({ data: (r.data ?? []) as Row[], total: r.count ?? 0 }))
        : adminService.hadithsExtras(mode, q).then((r) => ({ data: r.data as unknown as Row[], total: r.total }));
      req
        .then((r) => { if (alive) { setItems(r.data); setTotal(r.total); } })
        .catch(() => { if (alive) { setItems([]); setTotal(0); } })
        .finally(() => { if (alive) setLoading(false); });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q, page, mode]);

  const extraBadges = (h: Row) => (
    <>
      {(h.n_seg ?? 0) > 0 && <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line shrink-0"><MessageSquare className="w-3 h-3" /> {h.n_seg}</span>}
      {(h.n_var ?? 0) > 0 && <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line shrink-0"><GitFork className="w-3 h-3" /> {h.n_var}</span>}
    </>
  );

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-ink text-3xl">Hadiths</h1>
        <CountBadge n={total} />
        <Link to="/admin/hadiths/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors">
          <Plus className="w-4 h-4" /> Nouveau hadith
        </Link>
      </div>

      {/* Filtre dialogue / variante */}
      <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 mb-4" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.v} role="tab" aria-selected={mode === f.v} onClick={() => setMode(f.v)}
            className={`px-3.5 py-2 text-[13.5px] rounded-md transition-colors ${mode === f.v ? 'bg-accent-deep text-white font-medium' : 'text-ink hover:bg-glass-tint'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un hadith…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-muted italic py-8">{mode === 'all' ? 'Aucun hadith.' : 'Aucun hadith pour ce filtre.'}</p>
      ) : (
        <>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {items.map((h) => (
              <li key={h.id}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-glass-tint transition-colors">
                  <button type="button" onClick={() => toggle(h.id)} className="inline-flex items-center gap-2 flex-1 min-w-0 text-left" aria-expanded={open.has(h.id)}>
                    <ChevronRight className={`w-4 h-4 shrink-0 text-muted transition-transform ${open.has(h.id) ? 'rotate-90' : ''}`} />
                    <IdTag id={h.id} />
                    <span className="text-ink font-medium truncate">{h.sujet || `Hadith #${h.id}`}</span>
                    {h.statut && <span className="text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line shrink-0">{h.statut}</span>}
                    {extraBadges(h)}
                  </button>
                  <Link to={`/admin/hadiths/${h.id}`} className="ml-auto text-muted text-sm hover:text-accent shrink-0">Modifier →</Link>
                </div>
                {open.has(h.id) && (
                  <div className="px-4 pb-3 pt-1 bg-glass-tint/40">
                    <InlineSujetTagEditor
                      rubrique="hadiths" id={h.id}
                      sujet={h.sujet} tag={h.tag}
                      texteArabe={h.texte_arabe} texteFrancais={h.texte_francais}
                      onSaved={(ns, nt) => setItems((prev) => prev.map((x) => x.id === h.id ? { ...x, sujet: ns, tag: nt } : x))}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {mode === 'all' && <Pagination page={page} pageSize={PAGE_SIZE} total={total ?? 0} onPage={setPage} />}
          {mode !== 'all' && <p className="text-xs text-muted mt-3"><MessageSquare className="w-3 h-3 inline" /> = passages de dialogue · <GitFork className="w-3 h-3 inline" /> = variantes</p>}
        </>
      )}
    </div>
  );
};

export default AdminHadithsList;
