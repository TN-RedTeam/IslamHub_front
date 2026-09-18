import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { adminService, type CoranRow } from '../../services/AdminService';
import { CountBadge } from '../../components/admin/AdminListUI';

export const AdminCoranList: React.FC = () => {
  const [items, setItems] = useState<CoranRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { adminService.listCorans().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => `${c.sujet} ${c.sourate ?? ''}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Coran — versets thématiques</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/coran/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouveau</Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (sujet, sourate…)" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun verset.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((c) => (
              <li key={c.id}>
                <Link to={`/admin/coran/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="text-ink font-medium">{c.sujet}</span>
                  {c.sourate && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line">{c.sourate}</span>}
                  <span className="ml-auto text-muted text-sm">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminCoranList;
