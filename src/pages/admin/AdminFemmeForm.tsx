import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type FemmeFormData } from '../../services/AdminService';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const blank = { chapitre: '', matn: '', commentaire: '', texte_arabe: '', source: '', ordre: '0' };

export const AdminFemmeForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [chapitres, setChapitres] = useState<string[]>([]);
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    adminService.listFemmes().then((rows) => setChapitres([...new Set(rows.map((r) => r.chapitre))].sort())).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getFemmeForEdit(editId).then((d) => {
      if (!d) { setError('Segment introuvable.'); return; }
      setF({ chapitre: d.chapitre ?? '', matn: d.matn ?? '', commentaire: d.commentaire ?? '', texte_arabe: d.texte_arabe ?? '', source: d.source ?? '', ordre: String(d.ordre ?? 0) });
    }).catch(() => setError('Segment introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const canSave = useMemo(() => f.chapitre.trim().length > 0, [f.chapitre]);
  const buildPayload = (): FemmeFormData => ({ id: editId, ...f });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveFemme(buildPayload());
      setOk(true);
      if (andNew) { setF((p) => ({ ...blank, chapitre: p.chapitre })); window.scrollTo({ top: 0 }); setTimeout(() => setOk(false), 2500); }
      else { navigate(`/admin/femmes/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) { setError((e as Error).message || 'Erreur à l’enregistrement.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/femmes" className="hover:text-green-deep">La femme musulmane</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier le segment' : 'Nouveau segment'}</h1>
      <p className="text-muted text-sm mb-6">Un segment = une entrée dans un chapitre. Le texte arabe est enregistré tel quel (UTF-8).</p>

      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Classement</h2>
        <div className="grid sm:grid-cols-[1fr_120px] gap-3.5">
          <div><label className={label}>Chapitre <span className="text-red-600">*</span></label>
            <input className={field} list="femmes-chapitres" value={f.chapitre} onChange={set('chapitre')} placeholder="Ex. Le Ghousl" />
            <datalist id="femmes-chapitres">{chapitres.map((c) => <option key={c} value={c} />)}</datalist></div>
          <div><label className={label}>Ordre</label><input className={field} type="number" value={f.ordre} onChange={set('ordre')} /></div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Le segment</h2>
        <div className="mb-3.5"><label className={label}>Matn <span className="text-muted font-normal">(texte principal, Markdown)</span></label><textarea className={`${field} min-h-[140px]`} value={f.matn} onChange={set('matn')} /></div>
        <div className="mb-3.5"><label className={label}>Commentaire <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[90px]`} value={f.commentaire} onChange={set('commentaire')} /></div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-muted font-normal">(optionnel)</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-xl leading-loose text-right min-h-[70px]`} value={f.texte_arabe} onChange={set('texte_arabe')} /></div>
        <div><label className={label}>Source</label><input className={field} value={f.source} onChange={set('source')} /></div>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="femme" id={editId} label={f.chapitre} redirectTo="/admin/femmes" />}
          <Link to="/admin/femmes" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFemmeForm;
