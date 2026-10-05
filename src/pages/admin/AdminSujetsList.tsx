import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, GitMerge, Trash2, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { adminService, type SujetOverviewRow, type ContentRef } from '../../services/AdminService';
import { CountBadge } from '../../components/admin/AdminListUI';
import { InlineSujetTagEditor } from '../../components/admin/InlineSujetTagEditor';

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const field = 'rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

export const AdminSujetsList: React.FC = () => {
  const [rows, setRows] = useState<SujetOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [contents, setContents] = useState<ContentRef[]>([]);
  const [cLoading, setCLoading] = useState(false);

  const openSujet = async (t: string) => {
    if (open === t) { setOpen(null); return; }
    setOpen(t); setContents([]); setCLoading(true);
    try { setContents(await adminService.sujetContents(t)); }
    catch { setContents([]); }
    finally { setCLoading(false); }
  };

  const load = () => adminService.sujetsOverview().then(setRows).catch(() => setRows([]));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const term = norm(q.trim());
    return term ? rows.filter((r) => norm(r.sujet).includes(term)) : rows;
  }, [rows, q]);

  const allSujets = useMemo(() => rows.map((r) => r.sujet), [rows]);
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
      const n = await adminService.mergeSujets(selected, tgt);
      setSel(new Set()); setTarget('');
      return selected.length > 1
        ? `${selected.length} sujets fusionnés dans « ${tgt} » (${n} fiches).`
        : `Renommé en « ${tgt} » (${n} fiches).`;
    });
  };
  const doDelete = () => {
    if (!selected.length) return;
    if (!window.confirm(`Vider le sujet de ${selected.length} groupe(s) de fiches ? (le sujet sera retiré)`)) return;
    run(async () => { const n = await adminService.mergeSujets(selected, ''); setSel(new Set()); return `Sujet vidé sur ${n} fiche(s).`; });
  };

  const Num: React.FC<{ n: number }> = ({ n }) => <span className={n ? 'text-ink tabular-nums' : 'text-muted/40 tabular-nums'}>{n || '·'}</span>;

  return (
    <div className="max-w-5xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-1.5">
        <h1 className="font-display font-semibold text-ink text-3xl">Sujets</h1>
        <CountBadge n={loading ? null : rows.length} />
      </div>
      <p className="text-sm text-muted mb-5">Le « sujet » (titre) de chaque fiche, tous contenus confondus. Coche des variantes pour les <b>fusionner</b> (ex. casse/accents) ou les vider ; l'action réécrit les fiches concernées.</p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative ml-auto">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input className={`${field} pl-9 w-64`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 rounded-lg border border-glass-border bg-glass-tint px-3 py-2.5">
          <span className="text-sm font-semibold text-ink">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
          <input list="sujets-vocab" className={`${field} w-72`} value={target} onChange={(e) => setTarget(e.target.value)} placeholder={selected.length > 1 ? 'Fusionner dans… (sujet cible)' : 'Renommer en…'} />
          <datalist id="sujets-vocab">{allSujets.map((t) => <option key={t} value={t} />)}</datalist>
          <button type="button" disabled={busy || !target.trim()} onClick={doMerge} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-deep text-white font-semibold px-3.5 py-2 text-sm hover:brightness-110 disabled:opacity-50"><GitMerge className="w-4 h-4" /> {selected.length > 1 ? 'Fusionner' : 'Renommer'}</button>
          <button type="button" disabled={busy} onClick={doDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-low/40 text-low font-semibold px-3.5 py-2 text-sm hover:bg-low/10 disabled:opacity-50"><Trash2 className="w-4 h-4" /> Vider</button>
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
                <th className="text-left font-semibold py-2.5">Sujet</th>
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
                <React.Fragment key={r.sujet}>
                  <tr className={`border-b border-glass-border/60 hover:bg-glass-tint/50 ${sel.has(r.sujet) ? 'bg-glass-tint' : ''}`}>
                    <td className="py-2 text-center"><input type="checkbox" className="w-4 h-4 accent-green" checked={sel.has(r.sujet)} onChange={() => toggle(r.sujet)} /></td>
                    <td className="py-2">
                      <button type="button" onClick={() => openSujet(r.sujet)} className="inline-flex items-center gap-1.5 text-left">
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 text-muted transition-transform ${open === r.sujet ? 'rotate-90' : ''}`} />
                        <span className="font-medium text-ink hover:text-accent">{r.sujet}</span>
                      </button>
                    </td>
                    <td className="text-right px-2 font-semibold"><Num n={r.total} /></td>
                    <td className="text-right px-2"><Num n={r.hadiths} /></td>
                    <td className="text-right px-2"><Num n={r.paroles} /></td>
                    <td className="text-right px-2"><Num n={r.coran} /></td>
                    <td className="text-right px-2"><Num n={r.invocations} /></td>
                    <td className="text-right px-2 pr-4"><Num n={r.fiqh} /></td>
                  </tr>
                  {open === r.sujet && (
                    <tr className="bg-glass-tint/40">
                      <td></td>
                      <td colSpan={7} className="py-2 pr-4">
                        {cLoading ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</span>
                        ) : contents.length === 0 ? (
                          <span className="text-sm text-muted italic">Aucun contenu.</span>
                        ) : (
                          <div className="grid gap-2.5 lg:grid-cols-2">
                            {contents.map((c, i) => (
                              <InlineSujetTagEditor
                                key={`${c.rubrique}-${c.id}`}
                                rubrique={c.rubrique} id={c.id}
                                sujet={c.sujet ?? c.titre} tag={c.tag ?? ''}
                                texteArabe={c.texte_arabe} texteFrancais={c.texte_francais}
                                onSaved={(ns, nt) => { setContents((prev) => prev.map((x, j) => j === i ? { ...x, sujet: ns, tag: nt } : x)); load(); }}
                              />
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted italic">Aucun sujet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSujetsList;
