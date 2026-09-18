import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { adminService, type SourateRow } from '../../services/AdminService';
import { CountBadge } from '../../components/admin/AdminListUI';

export const AdminSouratesList: React.FC = () => {
  const [items, setItems] = useState<SourateRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.listSourates().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Coran — exégèse (sourates)</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/sourates/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouvelle sourate</Link>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : items.length === 0 ? <p className="text-muted italic py-8">Aucune sourate.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {items.map((s) => (
              <li key={s.id}>
                <Link to={`/admin/sourates/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="w-9 h-9 rounded-full bg-green-soft text-green-deep grid place-items-center text-sm font-display font-semibold shrink-0">{s.numero}</span>
                  <span className="text-ink font-medium">{s.nom}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-ground text-muted border border-line">{s.nb_versets_saisis} verset{s.nb_versets_saisis > 1 ? 's' : ''} saisi{s.nb_versets_saisis > 1 ? 's' : ''}</span>
                  <span className="ml-auto text-muted text-sm">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminSouratesList;
