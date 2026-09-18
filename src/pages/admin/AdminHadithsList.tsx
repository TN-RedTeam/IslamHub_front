import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Plus } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { CountBadge, Pagination, IdTag } from '../../components/admin/AdminListUI';
import type { Hadith } from '../../types';

const PAGE_SIZE = 50;

export const AdminHadithsList: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Hadith[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Toute nouvelle recherche repart de la première page.
  useEffect(() => { setPage(0); }, [q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      dataService.searchHadiths(q, null, { page, pageSize: PAGE_SIZE })
        .then((r) => { if (alive) { setItems((r.data ?? []) as Hadith[]); setTotal(r.count ?? 0); } })
        .catch(() => { if (alive) { setItems([]); setTotal(0); } })
        .finally(() => { if (alive) setLoading(false); });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q, page]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Hadiths</h1>
        <CountBadge n={total} />
        <Link to="/admin/hadiths/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors">
          <Plus className="w-4 h-4" /> Nouveau hadith
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un hadith…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-muted italic py-8">Aucun hadith.</p>
      ) : (
        <>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {items.map((h) => (
              <li key={h.id}>
                <Link to={`/admin/hadiths/${h.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <IdTag id={h.id} />
                  <span className="text-ink font-medium">{h.sujet || `Hadith #${h.id}`}</span>
                  {h.statut && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line">{h.statut}</span>}
                  <span className="ml-auto text-muted text-sm">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total ?? 0} onPage={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminHadithsList;
