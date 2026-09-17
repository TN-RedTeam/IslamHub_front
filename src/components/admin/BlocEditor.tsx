import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Check, AlertTriangle, FileText, MessageSquare, BookOpen, Search } from 'lucide-react';
import {
  adminService, type BlocInput, type BlocType, type BlocCitationType, type DossierRefs, type RefOption,
} from '../../services/AdminService';

/**
 * Éditeur de contenu composable (Phase 3.3) — réutilisable pour n'importe quel
 * parent (equivoque, expose, attribut, recit…). Gère une liste ordonnée de
 * blocs Texte / Commentaire / Preuve et l'enregistre via admin_save_blocs.
 * Un bloc Preuve ne retape rien : il référence un verset/hadith/parole existant.
 */
const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const rid = () => Math.random().toString(36).slice(2);

type Row = { key: string; type: BlocType; texte_md: string; citation_type: BlocCitationType; citation_id: string; commentaire_md: string; filter: string };
const empty = (type: BlocType): Row => ({ key: rid(), type, texte_md: '', citation_type: 'hadith', citation_id: '', commentaire_md: '', filter: '' });

const CIT_LABEL: Record<BlocCitationType, string> = { verset: 'Verset (Coran)', hadith: 'Hadith', parole: 'Parole de savant' };

export const BlocEditor: React.FC<{ parentType: string; parentId: string | number }> = ({ parentType, parentId }) => {
  const [refs, setRefs] = useState<DossierRefs>({ hadiths: [], paroles: [], versets: [] });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminService.listDossierRefs(), adminService.getBlocsForEdit(parentType, parentId)])
      .then(([r, blocs]) => {
        setRefs(r);
        setRows((blocs ?? []).map((b: BlocInput) => ({
          key: rid(), type: b.type,
          texte_md: b.texte_md ?? '',
          citation_type: (b.citation_type ?? 'hadith') as BlocCitationType,
          citation_id: b.citation_id != null ? String(b.citation_id) : '',
          commentaire_md: b.commentaire_md ?? '', filter: '',
        })));
      })
      .catch(() => setError('Impossible de charger les blocs.'))
      .finally(() => setLoading(false));
  }, [parentType, parentId]);

  const optionsFor = (t: BlocCitationType): RefOption[] => (t === 'hadith' ? refs.hadiths : t === 'parole' ? refs.paroles : refs.versets);
  const patch = (i: number, p: Partial<Row>) => setRows((a) => a.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const move = (i: number, d: -1 | 1) => setRows((a) => { const j = i + d; if (j < 0 || j >= a.length) return a; const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const blocs: BlocInput[] = rows
        .filter((r) => (r.type === 'preuve' ? r.citation_id : r.texte_md.trim()))
        .map((r) => r.type === 'preuve'
          ? { type: 'preuve', citation_type: r.citation_type, citation_id: Number(r.citation_id) || null, commentaire_md: r.commentaire_md.trim() || null }
          : { type: r.type, texte_md: r.texte_md });
      await adminService.saveBlocs(parentType, parentId, blocs);
      setOk(true); setTimeout(() => setOk(false), 2500);
    } catch (e) { setError((e as Error).message || 'Erreur à l’enregistrement des blocs.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-10"><Loader2 className="w-7 h-7 text-green animate-spin" /></div>;

  return (
    <div>
      {rows.length === 0 && <p className="text-muted text-sm italic mb-3">Aucun bloc. Ajoute un premier bloc ci-dessous.</p>}

      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={r.key} className={`rounded-lg border p-3 ${r.type === 'preuve' ? 'border-gold bg-gold-soft' : r.type === 'commentaire' ? 'border-[#9db8d6] bg-[#eef4fb]' : 'border-line bg-surface'}`}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                {r.type === 'texte' ? <FileText className="w-4 h-4 text-green" /> : r.type === 'commentaire' ? <MessageSquare className="w-4 h-4 text-[#2c5a7a]" /> : <BookOpen className="w-4 h-4 text-[#7a5a17]" />}
                Bloc {i + 1} · {r.type === 'texte' ? 'Texte' : r.type === 'commentaire' ? 'Commentaire' : 'Preuve'}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setRows((a) => a.filter((_, j) => j !== i))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>

            {r.type !== 'preuve' ? (
              <textarea className={`${field} min-h-[90px]`} value={r.texte_md} onChange={(e) => patch(i, { texte_md: e.target.value })}
                placeholder={r.type === 'texte' ? 'Texte de l’article (Markdown : ## titre, **gras**, listes…)' : 'Note / commentaire libre (Markdown)…'} />
            ) : (
              <div className="space-y-2.5">
                <div className="grid sm:grid-cols-[180px_1fr] gap-2.5">
                  <div><label className={label}>Type de source</label>
                    <select className={field} value={r.citation_type} onChange={(e) => patch(i, { citation_type: e.target.value as BlocCitationType, citation_id: '' })}>
                      {(Object.keys(CIT_LABEL) as BlocCitationType[]).map((t) => <option key={t} value={t}>{CIT_LABEL[t]}</option>)}
                    </select></div>
                  <div><label className={label}>Rechercher</label>
                    <div className="relative"><Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input className={`${field} pl-9`} value={r.filter} onChange={(e) => patch(i, { filter: e.target.value })} placeholder="Filtrer par sujet…" /></div>
                  </div>
                </div>
                <div><label className={label}>Choisir la source <span className="text-red-600">*</span></label>
                  <select className={field} value={r.citation_id} onChange={(e) => patch(i, { citation_id: e.target.value })}>
                    <option value="">—</option>
                    {optionsFor(r.citation_type)
                      .filter((o) => !r.filter.trim() || o.label.toLowerCase().includes(r.filter.trim().toLowerCase()))
                      .map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select></div>
                <div><label className={label}>Commentaire de la preuve <span className="text-muted font-normal">(optionnel, Markdown)</span></label>
                  <textarea className={`${field} min-h-[60px]`} value={r.commentaire_md} onChange={(e) => patch(i, { commentaire_md: e.target.value })} placeholder="Pourquoi cette preuve, ce qu’elle établit…" /></div>
                <p className="text-[12px] text-muted italic">La preuve n’est pas recopiée : le texte, la référence et les scans sont lus depuis la source à l’affichage.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <button type="button" onClick={() => setRows((a) => [...a, empty('texte')])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3 py-1.5 text-sm"><Plus className="w-4 h-4" /> Texte</button>
        <button type="button" onClick={() => setRows((a) => [...a, empty('commentaire')])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#9db8d6] bg-[#eef4fb] text-[#2c5a7a] font-semibold px-3 py-1.5 text-sm"><Plus className="w-4 h-4" /> Commentaire</button>
        <button type="button" onClick={() => setRows((a) => [...a, empty('preuve')])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gold bg-gold-soft text-[#7a5a17] font-semibold px-3 py-1.5 text-sm"><Plus className="w-4 h-4" /> Preuve</button>

        <div className="ml-auto flex items-center gap-2.5">
          {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Blocs enregistrés</span>}
          {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
          <button type="button" disabled={busy} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-4 py-2 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer les blocs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlocEditor;
