import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type CoranFormData } from '../../services/AdminService';
import type { ThemeRef } from '../../types';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const blank = { sujet: '', sourate: '', texte_arabe: '', texte_francais: '', phonetique: '', explication: '', tag: '' };

export const AdminCoranForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [derived, setDerived] = useState<ThemeRef[]>([]);

  useEffect(() => {
    if (!editId) return;
    adminService.getCoranForEdit(editId).then((c) => {
      if (!c) { setError('Verset introuvable.'); return; }
      setF({ sujet: c.sujet ?? '', sourate: c.sourate ?? '', texte_arabe: c.texte_arabe ?? '', texte_francais: c.texte_francais ?? '', phonetique: c.phonetique ?? '', explication: c.explication ?? '', tag: c.tag ?? '' });
    }).catch(() => setError('Verset introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (f.tag.trim()) adminService.themesForTag(f.tag).then(setDerived).catch(() => setDerived([]));
      else setDerived([]);
    }, 300);
    return () => clearTimeout(t);
  }, [f.tag]);

  const canSave = useMemo(() => f.sujet.trim() && f.texte_arabe.trim(), [f.sujet, f.texte_arabe]);
  const buildPayload = (): CoranFormData => ({ id: editId, ...f });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveCoran(buildPayload());
      setOk(true);
      if (andNew) { setF(blank); setDerived([]); window.scrollTo({ top: 0 }); setTimeout(() => setOk(false), 2500); }
      else { navigate(`/admin/coran/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/arabe_hash|duplicate|unique/i.test(msg) ? 'Ce texte arabe existe déjà (doublon détecté).' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/coran" className="hover:text-green-deep">Coran (versets thématiques)</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier le verset' : 'Nouveau verset thématique'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Le verset */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Le verset</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><input className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. L’unicité d’Allah" /></div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} placeholder="Colle ici le verset (vocalisé)…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
      </section>

      {/* 2. Référence */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Référence</h2>
        <div><label className={label}>Sourate <span className="text-muted font-normal">(nom / réf. affichée)</span></label><input className={field} value={f.sourate} onChange={set('sourate')} placeholder="Ex. Al-Ikhlāṣ · 112" /></div>
      </section>

      {/* 3. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">3 · Thèmes & mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(séparés par des virgules)</span></label>
        <input className={field} value={f.tag} onChange={set('tag')} placeholder="unicité, tawhid" />
        <div className="mt-3.5 rounded-lg border border-line bg-ground/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold font-semibold">Thèmes déduits</p>
          {derived.length === 0 ? <p className="text-sm text-muted mt-1">Aucun.</p> :
            <div className="flex flex-wrap gap-1.5 mt-2">{derived.map((t) => <span key={t.slug} className="text-xs bg-gold-soft text-[#7a5a17] border border-[#e6d3a3] rounded-full px-2.5 py-0.5">{t.nom}</span>)}</div>}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/admin/coran" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCoranForm;
