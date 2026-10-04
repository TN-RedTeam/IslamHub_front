import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Search, GitMerge, Trash2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type TagOverviewRow } from '../../services/AdminService';
import { CountBadge } from '../../components/admin/AdminListUI';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const field = 'rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

export const AdminTagsList: React.FC = () => {
  const [rows, setRows] = useState<TagOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState('');
  const [newTag, setNewTag] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = () => adminService.tagsOverview().then(setRows).catch(() => setRows([]));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const term = norm(q.trim());
    return term ? rows.filter((r) => norm(r.tag).includes(term)) : rows;
  }, [rows, q]);

  const allTags = useMemo(() => rows.map((r) => r.tag), [rows]);
  const toggle = (t: string) => setSel((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const selected = [...sel];

  const run = async (fn: () => Promise<string>) => {
    setBusy(true); setErr(null); setMsg(null);
    try { setMsg(await fn()); await load(); }
    catch (e) { setErr((e as Error).message || 'Erreur.'); }
    finally { setBusy(false); }
  };

  const doMerge = () => {
    const tgt = target.trim();
    if (!selected.length || !tgt) return;
    run(async () => {
      const n = await adminService.mergeTags(selected, tgt);
      setSel(new Set()); setTarget('');
      return selected.length > 1
        ? `${selected.length} tags fusionnés dans « ${tgt} » (${n} fiches mises à jour).`
        : `Renommé en « ${tgt} » (${n} fiches mises à jour).`;
    });
  };
  const doDelete = () => {
    if (!selected.length) return;
    if (!window.confirm(`Supprimer ${selected.length} tag(s) de toutes les fiches ? (irréversible)`)) return;
    run(async () => { const n = await adminService.mergeTags(selected, ''); setSel(new Set()); return `${selected.length} tag(s) supprimé(s) (${n} fiches).`; });
  };
  const doAdd = () => {
    const nom = newTag.trim();
    if (!nom) return;
    run(async () => { await adminService.addTag(nom); setNewTag(''); return `Tag « ${nom} » ajouté au vocabulaire.`; });
  };

  const Num: React.FC<{ n: number }> = ({ n }) => <span className={n ? 'text-ink tabular-nums' : 'text-muted/40 tabular-nums'}>{n || '·'}</span>;

  return (
    <div className="max-w-5xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-1.5">
        <h1 className="font-display font-semibold text-ink text-3xl">Tags &amp; mots-clés</h1>
        <CountBadge n={loading ? null : rows.length} />
      </div>
      <p className="text-sm text-muted mb-5">Tout le vocabulaire en un coup d'œil. Coche des tags pour les <b>fusionner</b> (uniformiser les doublons) ou les supprimer ; l'action réécrit toutes les fiches concernées.</p>

      {/* Ajouter au vocabulaire */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input className={`${field} w-56`} value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') doAdd(); }} placeholder="Nouveau tag (ex. savants)" />
        <button type="button" disabled={busy || !newTag.trim()} onClick={doAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-deep text-white font-semibold px-3.5 py-2 text-sm hover:brightness-110 disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter</button>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${field} pl-9 w-64`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" />
        </div>
      </div>

      {/* Barre d'action sur la sélection */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 rounded-lg border border-glass-border bg-glass-tint px-3 py-2.5">
          <span className="text-sm font-semibold text-ink">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
          <input list="tags-vocab" className={`${field} w-56`} value={target} onChange={(e) => setTarget(e.target.value)} placeholder={selected.length > 1 ? 'Fusionner dans… (tag cible)' : 'Renommer en…'} />
          <datalist id="tags-vocab">{allTags.map((t) => <option key={t} value={t} />)}</datalist>
          <button type="button" disabled={busy || !target.trim()} onClick={doMerge} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-deep text-white font-semibold px-3.5 py-2 text-sm hover:brightness-110 disabled:opacity-50"><GitMerge className="w-4 h-4" /> {selected.length > 1 ? 'Fusionner' : 'Renommer'}</button>
          <button type="button" disabled={busy} onClick={doDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-low/40 text-low font-semibold px-3.5 py-2 text-sm hover:bg-low/10 disabled:opacity-50"><Trash2 className="w-4 h-4" /> Supprimer</button>
          <button type="button" onClick={() => setSel(new Set())} className="text-muted text-sm px-2">Annuler</button>
        </div>
      )}

      {(msg || err) && (
        <p className={`mb-3 inline-flex items-center gap-1.5 text-sm ${err ? 'text-low' : 'text-accent'}`}>
          {err ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}{err || msg}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : (
        <div className="rounded-card border border-glass-border bg-glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.08em] text-muted border-b border-glass-border">
                <th className="w-9 py-2.5"></th>
                <th className="text-left font-semibold py-2.5">Tag</th>
                <th className="text-right font-semibold px-2">Total</th>
                <th className="text-right font-semibold px-2">Hadiths</th>
                <th className="text-right font-semibold px-2">Paroles</th>
                <th className="text-right font-semibold px-2">Coran</th>
                <th className="text-right font-semibold px-2">Invoc.</th>
                <th className="text-right font-semibold px-2 pr-4">Fiqh</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.tag} className={`border-b border-glass-border/60 hover:bg-glass-tint/50 ${sel.has(r.tag) ? 'bg-glass-tint' : ''}`}>
                  <td className="py-2 text-center"><input type="checkbox" className="w-4 h-4 accent-green" checked={sel.has(r.tag)} onChange={() => toggle(r.tag)} /></td>
                  <td className="py-2">
                    <span className="font-medium text-ink">{r.tag}</span>
                    {r.total === 0 && <span className="ml-2 text-[10px] font-semibold text-muted bg-glass-tint border border-glass-border rounded-full px-1.5 py-0.5">vocabulaire</span>}
                  </td>
                  <td className="text-right px-2 font-semibold"><Num n={r.total} /></td>
                  <td className="text-right px-2"><Num n={r.hadiths} /></td>
                  <td className="text-right px-2"><Num n={r.paroles} /></td>
                  <td className="text-right px-2"><Num n={r.coran} /></td>
                  <td className="text-right px-2"><Num n={r.invocations} /></td>
                  <td className="text-right px-2 pr-4"><Num n={r.fiqh} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted italic">Aucun tag.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTagsList;
