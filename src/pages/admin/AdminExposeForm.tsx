import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import {
  adminService, type ExposeFormData, type CitationType, type ExposeRefs, type ExposeCitationInput,
} from '../../services/AdminService';
import { slugify } from '../../utils/slug';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const rid = () => Math.random().toString(36).slice(2);
type Cit = { key: string; section: string; type: CitationType; ref_id: string; arabe: string; phonetique: string; signification: string; ref: string; accordeon: boolean };
const emptyCit = (): Cit => ({ key: rid(), section: '', type: 'verset', ref_id: '', arabe: '', phonetique: '', signification: '', ref: '', accordeon: false });
const move = <T,>(a: T[], i: number, d: -1 | 1): T[] => { const j = i + d; if (j < 0 || j >= a.length) return a; const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
const blank = { titre: '', contenu_md: '', verset_arabe: '', verset_traduction: '', verset_phonetique: '', verset_ref: '' };

export const AdminExposeForm: React.FC = () => {
  const { slug: routeSlug } = useParams();
  const editSlug = routeSlug && routeSlug !== 'nouveau' ? routeSlug : null;
  const navigate = useNavigate();

  const [refs, setRefs] = useState<ExposeRefs>({ hadiths: [], paroles: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editSlug));

  const [f, setF] = useState(blank);
  const [slug, setSlug] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [cits, setCits] = useState<Cit[]>([]);

  useEffect(() => {
    adminService.listExposeRefs().then(setRefs).catch(() => setRefs({ hadiths: [], paroles: [] })).finally(() => { if (!editSlug) setLoading(false); });
  }, [editSlug]);

  useEffect(() => {
    if (!editSlug) return;
    adminService.getExposeForEdit(editSlug).then((e) => {
      if (!e) { setError('Exposé introuvable.'); return; }
      setSlug(e.slug); setSlugTouched(true);
      setF({ titre: e.titre ?? '', contenu_md: e.contenu_md ?? '', verset_arabe: e.verset_arabe ?? '', verset_traduction: e.verset_traduction ?? '', verset_phonetique: e.verset_phonetique ?? '', verset_ref: e.verset_ref ?? '' });
      setCits(e.citations.map((c) => ({ key: rid(), section: c.section != null ? String(c.section) : '', type: c.type, ref_id: c.ref_id != null ? String(c.ref_id) : '', arabe: c.arabe ?? '', phonetique: c.phonetique ?? '', signification: c.signification ?? '', ref: c.ref ?? '', accordeon: !!c.accordeon })));
    }).catch(() => setError('Exposé introuvable.')).finally(() => setLoading(false));
  }, [editSlug]);

  const autoSlug = editSlug ? slug : (slugTouched ? slug : slugify(f.titre));
  const canSave = useMemo(() => f.titre.trim().length > 0, [f.titre]);
  const patchCit = (i: number, patch: Partial<Cit>) => setCits((a) => a.map((c, j) => j === i ? { ...c, ...patch } : c));

  const buildPayload = (): ExposeFormData => ({
    slug: autoSlug || null, titre: f.titre.trim(), contenu_md: f.contenu_md,
    verset_arabe: f.verset_arabe, verset_traduction: f.verset_traduction, verset_phonetique: f.verset_phonetique, verset_ref: f.verset_ref,
    citations: cits
      .filter((c) => c.ref_id || c.arabe.trim() || c.signification.trim())
      .map<ExposeCitationInput>((c, i) => ({
        section: c.section, type: c.type,
        ref_id: c.type !== 'verset' && c.ref_id ? Number(c.ref_id) : null,
        arabe: c.arabe, phonetique: c.phonetique, signification: c.signification, ref: c.ref, accordeon: c.accordeon, ordre: i,
      })),
  });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const savedSlug = await adminService.saveExpose(buildPayload());
      setOk(true); navigate(`/admin/exposes/${savedSlug}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) { setError((e as Error).message || 'Erreur à l’enregistrement.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/exposes" className="hover:text-green-deep">Exposés</Link> · {editSlug ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editSlug ? 'Modifier l’exposé' : 'Nouvel exposé'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Page */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · La page</h2>
        <div className="mb-3.5"><label className={label}>Titre <span className="text-red-600">*</span></label><input className={field} value={f.titre} onChange={set('titre')} placeholder="Ex. La science en Islam" /></div>
        <div><label className={label}>Slug (URL) {editSlug ? <span className="text-muted font-normal">— non modifiable (clé de la page)</span> : <span className="text-muted font-normal">— depuis le titre</span>}</label>
          <input className={`${field} ${editSlug ? 'opacity-60' : ''}`} value={autoSlug} readOnly={Boolean(editSlug)}
            onChange={(e) => { if (!editSlug) { setSlugTouched(true); setSlug(e.target.value); } }} placeholder="la-science" /></div>
      </section>

      {/* 2. Verset d'en-tête */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">2 · Verset d’en-tête <span className="text-muted font-normal text-sm">(optionnel)</span></h2>
        <p className="text-xs text-muted mb-4">Affiché en tête de l’exposé.</p>
        <div className="mb-3.5"><label className={label}>Texte arabe</label><textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[70px]`} value={f.verset_arabe} onChange={set('verset_arabe')} /></div>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <div><label className={label}>Traduction</label><input className={field} value={f.verset_traduction} onChange={set('verset_traduction')} /></div>
          <div><label className={label}>Phonétique</label><input className={field} value={f.verset_phonetique} onChange={set('verset_phonetique')} /></div>
          <div><label className={label}>Référence</label><input className={field} value={f.verset_ref} onChange={set('verset_ref')} placeholder="Ṭā-Hā · 114" /></div>
        </div>
      </section>

      {/* 3. Contenu */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">3 · Contenu <span className="text-muted font-normal text-sm">(Markdown)</span></h2>
        <textarea className={`${field} min-h-[260px]`} value={f.contenu_md} onChange={set('contenu_md')} placeholder="Le corps de l’exposé, en Markdown…" />
      </section>

      {/* 4. Citations */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">4 · Citations</h2>
        <p className="text-xs text-muted mb-4">Verset / hadith / parole. Pour un hadith ou une parole, choisis la référence <b>ou</b> saisis le texte à la main. La <b>section</b> regroupe les citations ; « accordéon » les replie.</p>
        {cits.map((c, i) => (
          <div key={c.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-green-deep">Citation {i + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => setCits((a) => move(a, i, -1))} disabled={i === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCits((a) => move(a, i, 1))} disabled={i === cits.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setCits((a) => a.filter((_, j) => j !== i))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5 mb-2.5">
              <div><label className={label}>Type</label>
                <select className={field} value={c.type} onChange={(e) => patchCit(i, { type: e.target.value as CitationType, ref_id: '' })}>
                  <option value="verset">Verset</option>
                  <option value="hadith">Hadith</option>
                  <option value="parole">Parole</option>
                </select></div>
              <div><label className={label}>Section <span className="text-muted font-normal">(n°)</span></label><input className={field} type="number" value={c.section} onChange={(e) => patchCit(i, { section: e.target.value })} /></div>
              <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer text-sm text-ink"><input type="checkbox" checked={c.accordeon} onChange={(e) => patchCit(i, { accordeon: e.target.checked })} className="w-4 h-4 accent-green" /> Accordéon</label></div>
            </div>
            {c.type !== 'verset' && (
              <div className="mb-2.5"><label className={label}>Référence en base <span className="text-muted font-normal">(optionnel — sinon saisir ci-dessous)</span></label>
                <select className={field} value={c.ref_id} onChange={(e) => patchCit(i, { ref_id: e.target.value })}>
                  <option value="">— (texte manuel)</option>
                  {(c.type === 'hadith' ? refs.hadiths : refs.paroles).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select></div>
            )}
            <div className="mb-2.5"><label className={label}>Texte arabe {c.type === 'verset' ? '' : <span className="text-muted font-normal">(laisser vide si référence choisie)</span>}</label>
              <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-xl leading-loose text-right min-h-[60px]`} value={c.arabe} onChange={(e) => patchCit(i, { arabe: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Signification</label><input className={field} value={c.signification} onChange={(e) => patchCit(i, { signification: e.target.value })} /></div>
              <div><label className={label}>Phonétique</label><input className={field} value={c.phonetique} onChange={(e) => patchCit(i, { phonetique: e.target.value })} /></div>
            </div>
            <div className="mt-2.5"><label className={label}>Référence (texte)</label><input className={field} value={c.ref} onChange={(e) => patchCit(i, { ref: e.target.value })} placeholder="Sourate · verset, ou recueil…" /></div>
          </div>
        ))}
        <button type="button" onClick={() => setCits((a) => [...a, emptyCit()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter une citation</button>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editSlug && <DeleteEntryButton kind="expose" id={editSlug} label={f.titre} redirectTo="/admin/exposes" />}
          <Link to="/admin/exposes" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !canSave} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExposeForm;
