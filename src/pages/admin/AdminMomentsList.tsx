import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Check, AlertTriangle } from 'lucide-react';
import { adminService, type MomentRow } from '../../services/AdminService';

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

/**
 * Gestion des « moments de la journée » : ajouter, renommer, réordonner,
 * supprimer. L'ordre pilote l'affichage du panneau « Au fil de la journée ».
 */
export const AdminMomentsList: React.FC = () => {
  const [rows, setRows] = useState<MomentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 2000); };

  useEffect(() => {
    adminService.listMoments().then(setRows).catch(() => setError('Chargement impossible.')).finally(() => setLoading(false));
  }, []);

  const persistOrder = async (next: MomentRow[]) => {
    setRows(next);
    try { await adminService.reorderMoments(next.map((m) => m.id)); } catch (e) { setError((e as Error).message || 'Réordonnancement impossible.'); }
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= rows.length) return;
    const next = [...rows]; [next[i], next[j]] = [next[j], next[i]];
    persistOrder(next);
  };

  const rename = async (id: number, label: string) => {
    const lbl = label.trim(); if (!lbl) return;
    try { await adminService.renameMoment(id, lbl); flash('Renommé'); } catch (e) { setError((e as Error).message || 'Renommage impossible.'); }
  };

  const remove = async (m: MomentRow) => {
    if (!window.confirm(`Supprimer le moment « ${m.label} » ? Les invocations déjà rattachées ne seront plus regroupées sous ce moment.`)) return;
    try { await adminService.deleteMoment(m.id); setRows((p) => p.filter((x) => x.id !== m.id)); flash('Supprimé'); }
    catch (e) { setError((e as Error).message || 'Suppression impossible.'); }
  };

  const add = async () => {
    const lbl = newLabel.trim(); if (!lbl) return;
    setBusy(true); setError(null);
    try {
      const row = await adminService.addMoment(lbl);
      setRows((p) => (p.some((x) => x.id === row.id) ? p.map((x) => (x.id === row.id ? row : x)) : [...p, row]));
      setNewLabel(''); flash('Ajouté');
    } catch (e) { setError((e as Error).message || 'Ajout impossible.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl px-6 py-8 pb-24">
      <p className="text-xs text-muted"><Link to="/admin/invocations" className="hover:text-ink">Invocations & Évocations</Link> · Moments de la journée</p>
      <h1 className="font-display font-semibold text-ink text-3xl mt-1 mb-1">Moments de la journée</h1>
      <p className="text-muted text-sm mb-6">Ajoute, renomme, <b>réordonne</b> (↑/↓) ou supprime les moments. L'ordre défini ici est celui du panneau «&nbsp;Au fil de la journée&nbsp;» (du réveil au coucher).</p>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div> : (
        <>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line overflow-hidden mb-4">
            {rows.map((m, i) => (
              <li key={m.id} className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted disabled:opacity-30 hover:text-ink" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-muted disabled:opacity-30 hover:text-ink" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <span className="text-[11px] text-muted tabular-nums w-6 text-right shrink-0">{i + 1}</span>
                <input
                  className={`${field} flex-1`}
                  defaultValue={m.label}
                  onBlur={(e) => { if (e.target.value.trim() && e.target.value.trim() !== m.label) rename(m.id, e.target.value); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                />
                <code className="text-[11px] text-muted bg-glass-tint rounded px-1.5 py-0.5 shrink-0 hidden sm:inline">{m.key}</code>
                <button type="button" onClick={() => remove(m)} className="text-red-600 shrink-0 p-1" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
            {rows.length === 0 && <li className="px-4 py-6 text-muted italic">Aucun moment. Ajoute-en un ci-dessous.</li>}
          </ul>

          <div className="flex items-center gap-2">
            <input className={field} value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder="Nouveau moment (ex. Avant l'étude, En cas de peur…)" />
            <button type="button" onClick={add} disabled={busy || !newLabel.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ajouter
            </button>
          </div>

          <div className="mt-4 h-5">
            {ok && <span className="inline-flex items-center gap-1.5 text-ink text-sm font-medium"><Check className="w-4 h-4" /> {ok}</span>}
            {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMomentsList;
