import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, Sunrise, SlidersHorizontal } from 'lucide-react';
import { adminService, type InvocationRow } from '../../services/AdminService';
import { CountBadge, IdTag } from '../../components/admin/AdminListUI';

type MomentFilter = 'all' | 'with' | 'without';
const hasMoments = (i: InvocationRow) => Boolean((i.moments ?? '').trim());

export const AdminInvocationsList: React.FC = () => {
  const [items, setItems] = useState<InvocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [momentFilter, setMomentFilter] = useState<MomentFilter>('all');

  useEffect(() => { adminService.listInvocations().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const withCount = useMemo(() => items.filter(hasMoments).length, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((i) => {
      if (momentFilter === 'with' && !hasMoments(i)) return false;
      if (momentFilter === 'without' && hasMoments(i)) return false;
      if (!s) return true;
      return String(i.id) === s.replace(/^#/, '') || `${i.sujet} ${i.tag ?? ''}`.toLowerCase().includes(s);
    });
  }, [items, q, momentFilter]);

  const FILTERS: { v: MomentFilter; label: string }[] = [
    { v: 'all', label: `Tous (${items.length})` },
    { v: 'with', label: `Avec moments (${withCount})` },
    { v: 'without', label: `Sans moments (${items.length - withCount})` },
  ];

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-ink text-3xl">Invocations & Évocations</h1>
        <CountBadge n={loading ? null : items.length} />
        <div className="ml-auto flex items-center gap-2">
          <Link to="/admin/invocations/moments" className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink font-semibold px-3.5 py-2 hover:border-green transition-colors"><SlidersHorizontal className="w-4 h-4" /> Gérer les moments</Link>
          <Link to="/admin/invocations/nouveau" className="inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouvelle</Link>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (sujet, tag…)" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {/* Filtre : moments de la journée */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {FILTERS.map((ff) => (
          <button key={ff.v} type="button" onClick={() => setMomentFilter(ff.v)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              momentFilter === ff.v ? 'bg-accent-deep text-white border-accent-deep' : 'bg-glass-tint text-ink border-line hover:border-green'}`}>
            {ff.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun élément.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((i) => (
              <li key={i.id}>
                <Link to={`/admin/invocations/${i.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-glass-tint transition-colors">
                  <IdTag id={i.id} />
                  <span className={`text-[10.5px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                    i.type_id === 2 ? 'bg-glass-tint text-accent border-glass-border' : 'bg-glass-tint text-ink border-green-line'
                  }`}>{i.type_id === 2 ? 'Évocation' : 'Invocation'}</span>
                  <span className="text-ink font-medium min-w-0 truncate">{i.sujet}</span>
                  {hasMoments(i) && (
                    <span title="Rattachée à un ou plusieurs moments de la journée" className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-accent-deep bg-glass-tint border border-green-line rounded-full px-2 py-0.5 shrink-0">
                      <Sunrise className="w-3 h-3" /> Moments
                    </span>
                  )}
                  <span className="ml-auto text-muted text-sm shrink-0">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminInvocationsList;
