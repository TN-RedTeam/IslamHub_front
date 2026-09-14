import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { adminRecits, type RecitRow } from '../../services/AdminService';

const CAT: Record<string, string> = { prophetes: 'Histoires des Prophètes', vertueux: 'Vies des vertueux' };

export const AdminRecitsList: React.FC = () => {
  const [items, setItems] = useState<RecitRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminRecits.list().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Récits</h1>
        <Link to="/admin/recits/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouveau récit</Link>
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : items.length === 0 ? <p className="text-muted italic py-8">Aucun récit.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {items.map((r) => (
              <li key={r.id}>
                <Link to={`/admin/recits/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className="text-ink font-medium">{r.titre}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line">{CAT[r.categorie] ?? r.categorie}</span>
                  <span className="ml-auto text-muted text-sm">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminRecitsList;
