import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, ArrowUp, ArrowDown, CornerDownRight } from 'lucide-react';
import { adminRecits, type RecitRow } from '../../services/AdminService';
import { CountBadge, IdTag } from '../../components/admin/AdminListUI';

// Ordre d'affichage des catégories + libellés (comme sur le site).
const CAT_ORDER = ['prophetes', 'vertueux', 'histoires du passe'] as const;
const CAT_LABEL: Record<string, string> = {
  prophetes: 'Histoires des Prophètes',
  vertueux: 'Vies des vertueux',
  'histoires du passe': 'Histoires du passé',
};

const byOrdre = (a: RecitRow, b: RecitRow) => (a.ordre - b.ordre) || (a.id - b.id);

export const AdminRecitsList: React.FC = () => {
  const [items, setItems] = useState<RecitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => adminRecits.list().then(setItems).catch(() => setItems([]));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  // Catégories présentes, dans l'ordre voulu (puis toute autre catégorie éventuelle).
  const cats = useMemo(() => {
    const present = Array.from(new Set(items.map((r) => r.categorie)));
    const known = CAT_ORDER.filter((c) => present.includes(c));
    const extra = present.filter((c) => !CAT_ORDER.includes(c as typeof CAT_ORDER[number]));
    return [...known, ...extra];
  }, [items]);

  // Réordonne un groupe de frères/sœurs (mêmes catégorie + parent) : réassigne
  // un ordre séquentiel 0..n et persiste les lignes modifiées, puis recharge.
  const move = async (siblings: RecitRow[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (busy || j < 0 || j >= siblings.length) return;
    const arr = [...siblings];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setBusy(true);
    try {
      await Promise.all(arr.map((s, i) => (s.ordre !== i ? adminRecits.setOrdre(s.id, i) : null)).filter(Boolean) as Promise<void>[]);
      await load();
    } catch { /* silencieux : la liste reste inchangée */ }
    finally { setBusy(false); }
  };

  const Row: React.FC<{ r: RecitRow; siblings: RecitRow[]; index: number; child?: boolean }> = ({ r, siblings, index, child }) => (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${child ? 'pl-9' : ''}`}>
      {child && <CornerDownRight className="w-3.5 h-3.5 text-muted shrink-0 -ml-5" aria-hidden />}
      <span className="flex flex-col items-center gap-0.5 shrink-0">
        <button type="button" aria-label="Monter" disabled={busy || index === 0} onClick={() => move(siblings, index, -1)} className="text-muted hover:text-accent disabled:opacity-25"><ArrowUp className="w-4 h-4" /></button>
        <button type="button" aria-label="Descendre" disabled={busy || index === siblings.length - 1} onClick={() => move(siblings, index, 1)} className="text-muted hover:text-accent disabled:opacity-25"><ArrowDown className="w-4 h-4" /></button>
      </span>
      <span className="text-[10px] font-mono text-muted tabular-nums w-6 text-center shrink-0" title="Ordre">{r.ordre}</span>
      <IdTag id={r.id} />
      <Link to={`/admin/recits/${r.id}`} className="min-w-0 flex-1 font-medium text-ink truncate hover:text-accent">{r.titre}</Link>
      <Link to={`/admin/recits/${r.id}`} className="ml-auto text-muted text-sm shrink-0 hover:text-accent">Modifier →</Link>
    </div>
  );

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="font-display font-semibold text-ink text-3xl">Récits</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/recits/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent-deep text-white font-semibold px-4 py-2 hover:brightness-110 transition"><Plus className="w-4 h-4" /> Nouveau récit</Link>
      </div>
      <p className="text-sm text-muted mb-5">Groupés par catégorie ; les sous-textes d'un prophète sont imbriqués sous lui. Les flèches règlent l'ordre d'affichage.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-muted italic py-8">Aucun récit.</p>
      ) : (
        <div className="space-y-7">
          {cats.map((cat) => {
            const all = items.filter((r) => r.categorie === cat);
            const tops = all.filter((r) => r.parent_recit_id == null).sort(byOrdre);
            const kidsOf = (pid: number) => all.filter((r) => r.parent_recit_id === pid).sort(byOrdre);
            return (
              <section key={cat}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <h2 className="font-display font-semibold text-ink text-lg">{CAT_LABEL[cat] ?? cat}</h2>
                  <span className="text-[11px] font-semibold text-accent bg-glass-tint border border-glass-border rounded-full px-2 py-0.5 tabular-nums">{all.length}</span>
                </div>
                <div className="rounded-card border border-glass-border bg-glass overflow-hidden divide-y divide-glass-border">
                  {tops.map((t, i) => {
                    const kids = kidsOf(t.id);
                    return (
                      <div key={t.id}>
                        <Row r={t} siblings={tops} index={i} />
                        {kids.length > 0 && (
                          <div className="border-t border-glass-border bg-glass-tint/40 divide-y divide-glass-border">
                            {kids.map((k, ki) => <Row key={k.id} r={k} siblings={kids} index={ki} child />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRecitsList;
