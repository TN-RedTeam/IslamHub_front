import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { adminService, type SavantFullRow, type EcoleRow } from '../../services/AdminService';
import { CountBadge } from '../../components/admin/AdminListUI';

const GEN_LABEL: Record<string, string> = {
  sahabi: 'Compagnon', salaf: 'Salaf', tabii: 'Tābiʿī', tabi_tabii: 'Tābiʿ al-tābiʿīn', khalaf: 'Khalaf',
};

export const AdminSavantsList: React.FC = () => {
  const [items, setItems] = useState<SavantFullRow[]>([]);
  const [ecoles, setEcoles] = useState<EcoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([adminService.listSavantsFull(), adminService.listEcoles()])
      .then(([s, e]) => { setItems(s); setEcoles(e); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const ecoleName = (eid: number | null) => ecoles.find((e) => e.id === eid)?.nom ?? null;
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => x.nom.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Savants</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/savants/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouvelle fiche</Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un savant…" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun savant.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((s) => (
              <li key={s.id}>
                <Link to={`/admin/savants/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="text-ink font-medium min-w-0 truncate">{s.nom}</span>
                  {ecoleName(s.ecole_id) && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line shrink-0">{ecoleName(s.ecole_id)}</span>}
                  {s.generation && GEN_LABEL[s.generation] && <span className="text-[11px] px-2 py-0.5 rounded-full bg-ground text-muted border border-line shrink-0">{GEN_LABEL[s.generation]}</span>}
                  <span className="ml-auto text-muted text-sm shrink-0">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminSavantsList;
