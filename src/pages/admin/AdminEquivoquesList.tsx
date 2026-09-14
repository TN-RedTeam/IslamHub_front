import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { adminService, type VersetListRow } from '../../services/AdminService';

export const AdminEquivoquesList: React.FC = () => {
  const [items, setItems] = useState<VersetListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { adminService.listVersets().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((v) => `${v.theme} ${v.sourate} ${v.slug}`.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Versets / hadiths équivoques</h1>
        <Link to="/admin/equivoques/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouveau</Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (thème, sourate…)" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun élément.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((v) => (
              <li key={v.id}>
                <Link to={`/admin/equivoques/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <span className={`text-[10.5px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                    v.type === 'hadith' ? 'bg-gold-soft text-[#7a5a17] border-[#e6d3a3]' : 'bg-green-soft text-green-deep border-green-line'
                  }`}>{v.type === 'hadith' ? 'Hadith' : 'Verset'}</span>
                  <span className="min-w-0">
                    <span className="text-ink font-medium block truncate">{v.theme}</span>
                    <span className="text-muted text-[13px]">{v.sourate}{v.ayah != null ? ` · ${v.ayah}` : ''}</span>
                  </span>
                  {!v.published && <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-ground text-muted border border-line">brouillon</span>}
                  <span className="ml-auto text-muted text-sm shrink-0">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminEquivoquesList;
