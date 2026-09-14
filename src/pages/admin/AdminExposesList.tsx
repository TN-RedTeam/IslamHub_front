import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { adminService, type ExposeListRow } from '../../services/AdminService';

export const AdminExposesList: React.FC = () => {
  const [items, setItems] = useState<ExposeListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { adminService.listExposes().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((e) => `${e.titre ?? ''} ${e.slug}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Exposés</h1>
        <Link to="/admin/exposes/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouvel exposé</Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (titre, slug…)" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun exposé.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((e) => (
              <li key={e.slug}>
                <Link to={`/admin/exposes/${e.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="text-ink font-medium min-w-0 truncate">{e.titre || e.slug}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-ground text-muted border border-line shrink-0">{e.slug}</span>
                  <span className="ml-auto text-muted text-sm shrink-0">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminExposesList;
