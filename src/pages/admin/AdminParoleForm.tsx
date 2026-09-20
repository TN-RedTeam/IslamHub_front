import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type SavantRow, type ParoleFormData, type ParoleImageInput, type RefOption } from '../../services/AdminService';
import { AR_TEMPLATE, caretBetween, normalizeBracketSpaces } from '../../utils/arabicTemplate';
import type { ThemeRef } from '../../types';

const NEW = '__new';
const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
type Img = { key: string; image_url: string; alt: string; legende: string; source_livre: string };
const emptyImg = (): Img => ({ key: Math.random().toString(36).slice(2), image_url: '', alt: '', legende: '', source_livre: '' });

export const AdminParoleForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [savants, setSavants] = useState<SavantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [f, setF] = useState({ sujet: '', texte_arabe: AR_TEMPLATE.parole, texte_francais: '', phonetique: '', explication: '', source_livre: '', page: '', ecole: '', tag: '', commente_livre: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [savant, setSavant] = useState('');           // savant_id (string) ou NEW
  const [newSavant, setNewSavant] = useState('');
  const [rapporteur, setRapporteur] = useState('');   // rapporteur_savant_id (string)
  const [commente, setCommente] = useState('');       // commente_parole_id (string)
  const [paroles, setParoles] = useState<RefOption[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [derived, setDerived] = useState<ThemeRef[]>([]);

  useEffect(() => {
    adminService.listSavants().then(setSavants).catch(() => setError('Impossible de charger les savants.')).finally(() => setLoading(false));
    adminService.listDossierRefs().then((r) => setParoles(r.paroles)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getParoleForEdit(editId).then((p) => {
      if (!p) return;
      setF({ sujet: p.sujet ?? '', texte_arabe: p.texte_arabe ?? '', texte_francais: p.texte_francais ?? '', phonetique: p.phonetique ?? '', explication: p.explication ?? '', source_livre: p.source_livre ?? '', page: p.page ?? '', ecole: p.ecole ?? '', tag: p.tag ?? '', commente_livre: p.commente_livre ?? '' });
      setSavant(p.savant_id ? String(p.savant_id) : '');
      setRapporteur(p.rapporteur_savant_id ? String(p.rapporteur_savant_id) : '');
      setCommente(p.commente_parole_id ? String(p.commente_parole_id) : '');
      setImages(p.images.map((im) => ({ ...emptyImg(), image_url: im.image_url ?? '', alt: im.alt ?? '', legende: im.legende ?? '', source_livre: im.source_livre ?? '' })));
    }).catch(() => setError('Parole introuvable.'));
  }, [editId]);

  useEffect(() => {
    const t = setTimeout(() => { f.tag.trim() ? adminService.themesForTag(f.tag).then(setDerived).catch(() => setDerived([])) : setDerived([]); }, 300);
    return () => clearTimeout(t);
  }, [f.tag]);

  const canSave = useMemo(() => f.sujet.trim() && f.texte_arabe.trim(), [f.sujet, f.texte_arabe]);

  const buildPayload = (): ParoleFormData => ({
    id: editId, ...f,
    texte_arabe: normalizeBracketSpaces(f.texte_arabe),
    savant_id: savant && savant !== NEW ? Number(savant) : null,
    new_savant: savant === NEW && newSavant.trim() ? { nom: newSavant.trim() } : null,
    rapporteur_savant_id: rapporteur ? Number(rapporteur) : null,
    commente_parole_id: commente ? Number(commente) : null,
    images: images.filter((im) => im.image_url.trim()).map<ParoleImageInput>((im, i) => ({
      image_url: im.image_url.trim(), alt: im.alt.trim() || 'Scan du livre', legende: im.legende || null, source_livre: im.source_livre || null, ordre: i,
    })),
  });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveParole(buildPayload());
      setOk(true);
      if (andNew) { setF({ sujet: '', texte_arabe: AR_TEMPLATE.parole, texte_francais: '', phonetique: '', explication: '', source_livre: '', page: '', ecole: '', tag: '', commente_livre: '' }); setSavant(''); setNewSavant(''); setRapporteur(''); setCommente(''); setImages([]); setTimeout(() => setOk(false), 2500); }
      else { navigate(`/admin/paroles/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/arabe_hash|duplicate|unique/i.test(msg) ? 'Ce texte arabe existe déjà (doublon détecté).' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/paroles" className="hover:text-green-deep">Paroles</Link> · {editId ? 'Modifier' : 'Nouvelle'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier la parole' : 'Nouvelle parole'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Parole */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · La parole</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><input className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. Allah existe sans endroit" /></div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} onFocus={caretBetween(AR_TEMPLATE.parole)} placeholder="Colle ici le texte arabe (vocalisé)…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
      </section>

      {/* 2. Savant & référence */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Savant & référence</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div>
            <label className={label}>Savant (auteur de la parole)</label>
            <select className={field} value={savant} onChange={(e) => setSavant(e.target.value)}>
              <option value="">—</option>
              {savants.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              <option value={NEW}>＋ Nouveau savant…</option>
            </select>
            {savant === NEW && <input className={`${field} mt-2`} value={newSavant} onChange={(e) => setNewSavant(e.target.value)} placeholder="Nom du nouveau savant" />}
          </div>
          <div><label className={label}>École <span className="text-muted font-normal">(optionnel)</span></label><input className={field} value={f.ecole} onChange={set('ecole')} placeholder="Hanafi, Malikite…" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Livre source</label><input className={field} value={f.source_livre} onChange={set('source_livre')} placeholder="Ex. Al-Asmāʾ wa ṣ-Ṣifāt" /></div>
          <div><label className={label}>Page</label><input className={field} value={f.page} onChange={set('page')} placeholder="88" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Rapportée par <span className="text-muted font-normal">(si un autre savant la rapporte)</span></label>
            <select className={field} value={rapporteur} onChange={(e) => setRapporteur(e.target.value)}>
              <option value="">— (personne)</option>
              {savants.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select></div>
          <div><label className={label}>Commente une parole <span className="text-muted font-normal">(optionnel)</span></label>
            <select className={field} value={commente} onChange={(e) => setCommente(e.target.value)}>
              <option value="">— (aucune)</option>
              {paroles.filter((o) => o.id !== editId).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select></div>
        </div>
        <div className="mt-3.5">
          <label className={label}>Commente un livre <span className="text-muted font-normal">(titre du livre commenté, optionnel)</span></label>
          <input className={field} value={f.commente_livre} onChange={set('commente_livre')} placeholder="Ex. Al-Fiqh al-Akbar de Abou Hanifa" />
        </div>
      </section>

      {/* 3. Scans */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">3 · Scans du livre</h2>
        <p className="text-xs text-muted mb-4">0 à N scans. Colle l’URL publique (bucket Storage <code>references</code>). L’<b>alt</b> décrit ce que montre la page.</p>
        {images.map((im, i) => (
          <div key={im.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-green-deep">Scan {i + 1}</span>
              <button type="button" onClick={() => setImages((a) => a.filter((_, j) => j !== i))} className="ml-auto text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button></div>
            <div className="mb-2.5"><label className={label}>URL de l’image <span className="text-red-600">*</span></label><input className={field} value={im.image_url} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, image_url: e.target.value } : x))} placeholder="https://…/references/….webp" /></div>
            <div className="mb-2.5"><label className={label}>Alt (description)</label><input className={field} value={im.alt} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} placeholder="Scan de la page 88 de … montrant …" /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Légende</label><input className={field} value={im.legende} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, legende: e.target.value } : x))} /></div>
              <div><label className={label}>Source (livre, p.)</label><input className={field} value={im.source_livre} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, source_livre: e.target.value } : x))} /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setImages((a) => [...a, emptyImg()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter un scan</button>
      </section>

      {/* 4. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">4 · Thèmes & mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(séparés par des virgules)</span></label>
        <input className={field} value={f.tag} onChange={set('tag')} placeholder="croyance, attributs" />
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
          {editId && <DeleteEntryButton kind="parole" id={editId} label={f.sujet} redirectTo="/admin/paroles" />}
          <Link to="/admin/paroles" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminParoleForm;
