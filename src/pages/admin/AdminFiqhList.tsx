import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { adminService, type FiqhRow } from '../../services/AdminService';
import { CountBadge, IdTag } from '../../components/admin/AdminListUI';

const ECOLES = ['Hanafi', 'Malikite', 'Shafii', 'Hanbalite'];

export const AdminFiqhList: React.FC = () => {
  const [items, setItems] = useState<FiqhRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [ecole, setEcole] = useState<string>('');

  useEffect(() => { adminService.listFiqh().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((r) =>
      (!ecole || r.ecole.toLowerCase() === ecole.toLowerCase()) &&
      (!s || `${r.chapitre} ${r.sujet ?? ''}`.toLowerCase().includes(s)));
  }, [items, q, ecole]);

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <h1 className="font-display font-semibold text-green-deep text-3xl">Fiqh</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/fiqh/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors"><Plus className="w-4 h-4" /> Nouveau point</Link>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        <button onClick={() => setEcole('')} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors ${!ecole ? 'bg-green text-white border-green' : 'bg-surface text-ink border-line hover:bg-green-soft'}`}>Toutes</button>
        {ECOLES.map((e) => (
          <button key={e} onClick={() => setEcole(e)} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors ${ecole === e ? 'bg-green text-white border-green' : 'bg-surface text-ink border-line hover:bg-green-soft'}`}>{e}</button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (chapitre, sujet…)" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        : filtered.length === 0 ? <p className="text-muted italic py-8">Aucun point.</p>
        : (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link to={`/admin/fiqh/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                  <IdTag id={r.id} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line shrink-0">{r.ecole}</span>
                  <span className="min-w-0">
                    <span className="text-ink font-medium block truncate">{r.sujet || r.chapitre}</span>
                    {r.sujet && <span className="text-muted text-[13px]">{r.chapitre}</span>}
                  </span>
                  <span className="ml-auto text-muted text-sm shrink-0">Modifier →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
};

export default AdminFiqhList;
