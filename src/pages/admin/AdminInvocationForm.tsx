import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type InvocationFormData } from '../../services/AdminService';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const blank = { type_id: 1, sujet: '', texte_arabe: '', texte_francais: '', phonetique: '', explication: '', commentaire: '', tag: '' };

export const AdminInvocationForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (!editId) return;
    adminService.getInvocationForEdit(editId).then((d) => {
      if (!d) { setError('Élément introuvable.'); return; }
      setF({ type_id: d.type_id ?? 1, sujet: d.sujet ?? '', texte_arabe: d.texte_arabe ?? '', texte_francais: d.texte_francais ?? '', phonetique: d.phonetique ?? '', explication: d.explication ?? '', commentaire: d.commentaire ?? '', tag: d.tag ?? '' });
    }).catch(() => setError('Élément introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const canSave = useMemo(() => f.sujet.trim() && f.texte_arabe.trim(), [f.sujet, f.texte_arabe]);
  const buildPayload = (): InvocationFormData => ({ id: editId, ...f });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveInvocation(buildPayload());
      setOk(true);
      if (andNew) { setF({ ...blank, type_id: f.type_id }); window.scrollTo({ top: 0 }); setTimeout(() => setOk(false), 2500); }
      else { navigate(`/admin/invocations/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) { setError((e as Error).message || 'Erreur à l’enregistrement.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/invocations" className="hover:text-green-deep">Invocations & Évocations</Link> · {editId ? 'Modifier' : 'Nouvelle'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier' : 'Nouvelle invocation / évocation'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Nature</h2>
        <div className="flex gap-2">
          {[{ v: 1, l: 'Invocation (duʿāʾ)' }, { v: 2, l: 'Évocation (dhikr)' }].map((t) => (
            <button key={t.v} type="button" onClick={() => setF((p) => ({ ...p, type_id: t.v }))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                f.type_id === t.v ? 'bg-green text-white border-green' : 'bg-surface text-ink border-line hover:bg-green-soft'}`}>
              {t.l}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Le texte</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><input className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. Invocation du matin" /></div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} placeholder="Colle ici le texte arabe (vocalisé)…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
        <div className="mt-3.5"><label className={label}>Commentaire <span className="text-muted font-normal">(mérite, moment, nombre de répétitions…)</span></label><textarea className={`${field} min-h-[60px]`} value={f.commentaire} onChange={set('commentaire')} /></div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">3 · Mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(séparés par des virgules)</span></label>
        <input className={field} value={f.tag} onChange={set('tag')} placeholder="matin, protection" />
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="invocation" id={editId} label={f.sujet} redirectTo="/admin/invocations" />}
          <Link to="/admin/invocations" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvocationForm;
