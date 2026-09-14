import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import {
  adminService, type DossierFormData, type DossierPreuveType, type DossierRefs,
  type DossierPreuveInput, type DossierImageInput,
} from '../../services/AdminService';
import { slugify } from '../../utils/slug';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const rid = () => Math.random().toString(36).slice(2);
type Preuve = { key: string; type: DossierPreuveType; ref_id: string };
type Img = { key: string; image_url: string; alt: string; legende: string; source_livre: string };
const emptyPreuve = (): Preuve => ({ key: rid(), type: 'hadith', ref_id: '' });
const emptyImg = (): Img => ({ key: rid(), image_url: '', alt: '', legende: '', source_livre: '' });
const move = <T,>(a: T[], i: number, d: -1 | 1): T[] => { const j = i + d; if (j < 0 || j >= a.length) return a; const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; };
const blank = { h1: '', slug: '', meta_title: '', meta_description: '', croyance_texte: '', objection_texte: '', reponse_texte: '', published: false };

export const AdminDossierForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [refs, setRefs] = useState<DossierRefs>({ hadiths: [], paroles: [], versets: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editId));

  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [lies, setLies] = useState<number[]>([]);
  const [lieToAdd, setLieToAdd] = useState('');
  const [allDossiers, setAllDossiers] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    Promise.all([adminService.listDossierRefs(), adminService.listDossiers()])
      .then(([r, list]) => { setRefs(r); setAllDossiers(list.map((d) => ({ id: d.id, label: d.h1 }))); })
      .catch(() => setError('Impossible de charger les listes.'))
      .finally(() => { if (!editId) setLoading(false); });
  }, [editId]);

  useEffect(() => {
    if (!editId) return;
    adminService.getDossierForEdit(editId).then((d) => {
      if (!d) { setError('Dossier introuvable.'); return; }
      setF({ h1: d.h1 ?? '', slug: d.slug ?? '', meta_title: d.meta_title ?? '', meta_description: d.meta_description ?? '', croyance_texte: d.croyance_texte ?? '', objection_texte: d.objection_texte ?? '', reponse_texte: d.reponse_texte ?? '', published: !!d.published });
      setPreuves(d.preuves.map((p) => ({ key: rid(), type: p.type, ref_id: p.ref_id != null ? String(p.ref_id) : '' })));
      setImages(d.images.map((im) => ({ ...emptyImg(), image_url: im.image_url ?? '', alt: im.alt ?? '', legende: im.legende ?? '', source_livre: im.source_livre ?? '' })));
      setLies(d.lies ?? []);
    }).catch(() => setError('Dossier introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const autoSlug = slugTouched ? f.slug : slugify(f.h1);
  const canSave = useMemo(() => f.h1.trim().length > 0, [f.h1]);
  const optionsFor = (t: DossierPreuveType) => (t === 'hadith' ? refs.hadiths : t === 'parole' ? refs.paroles : refs.versets);
  const liesOptions = allDossiers.filter((d) => d.id !== editId && !lies.includes(d.id));
  const labelForDossier = (did: number) => allDossiers.find((d) => d.id === did)?.label ?? `#${did}`;

  const buildPayload = (): DossierFormData => ({
    id: editId, slug: autoSlug, h1: f.h1.trim(), meta_title: f.meta_title, meta_description: f.meta_description,
    croyance_texte: f.croyance_texte, objection_texte: f.objection_texte, reponse_texte: f.reponse_texte, published: f.published,
    preuves: preuves.filter((p) => p.ref_id).map<DossierPreuveInput>((p, i) => ({ type: p.type, ref_id: Number(p.ref_id) || null, ordre: i })),
    images: images.filter((im) => im.image_url.trim()).map<DossierImageInput>((im, i) => ({ image_url: im.image_url.trim(), alt: im.alt.trim() || 'Scan du livre', legende: im.legende || null, source_livre: im.source_livre || null, ordre: i })),
    lies,
  });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveDossier(buildPayload());
      setOk(true); navigate(`/admin/dossiers/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur.';
      setError(/duplicate|unique|slug/i.test(msg) ? 'Ce slug existe déjà — modifie-le.' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/dossiers" className="hover:text-green-deep">Dossiers thématiques</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-6">{editId ? 'Modifier le dossier' : 'Nouveau dossier'}</h1>

      {/* 1. En-tête & SEO */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · En-tête & SEO</h2>
        <div className="mb-3.5"><label className={label}>Titre (H1) <span className="text-red-600">*</span></label><input className={field} value={f.h1} onChange={set('h1')} placeholder="Ex. Le tawhid et ses catégories" /></div>
        <div className="mb-3.5"><label className={label}>Slug (URL) <span className="text-muted font-normal">— depuis le titre</span></label>
          <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF((p) => ({ ...p, slug: e.target.value })); }} placeholder="le-tawhid" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Meta title <span className="text-muted font-normal">(SEO)</span></label><input className={field} value={f.meta_title} onChange={set('meta_title')} /></div>
          <div><label className={label}>Meta description <span className="text-muted font-normal">(SEO)</span></label><input className={field} value={f.meta_description} onChange={set('meta_description')} /></div>
        </div>
      </section>

      {/* 2. Contenu */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">2 · Contenu <span className="text-muted font-normal text-sm">(Markdown)</span></h2>
        <p className="text-xs text-muted mb-4">Les sections vides ne s’affichent pas.</p>
        <div className="mb-3.5"><label className={label}>La croyance</label><textarea className={`${field} min-h-[90px]`} value={f.croyance_texte} onChange={set('croyance_texte')} placeholder="L’exposé de la croyance correcte…" /></div>
        <div className="mb-3.5"><label className={label}>L’objection</label><textarea className={`${field} min-h-[70px]`} value={f.objection_texte} onChange={set('objection_texte')} /></div>
        <div><label className={label}>La réponse</label><textarea className={`${field} min-h-[90px]`} value={f.reponse_texte} onChange={set('reponse_texte')} /></div>
      </section>

      {/* 3. Preuves */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">3 · Preuves</h2>
        <p className="text-xs text-muted mb-4">Hadith, parole de savant ou verset thématique déjà en base.</p>
        {preuves.map((p, i) => (
          <div key={p.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-green-deep">Preuve {i + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => setPreuves((a) => move(a, i, -1))} disabled={i === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => setPreuves((a) => move(a, i, 1))} disabled={i === preuves.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setPreuves((a) => a.filter((_, j) => j !== i))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-[160px_1fr] gap-2.5">
              <div><label className={label}>Type</label>
                <select className={field} value={p.type} onChange={(e) => setPreuves((a) => a.map((x, j) => j === i ? { ...x, type: e.target.value as DossierPreuveType, ref_id: '' } : x))}>
                  <option value="hadith">Hadith</option>
                  <option value="parole">Parole de savant</option>
                  <option value="verset">Verset (thématique)</option>
                </select></div>
              <div><label className={label}>Choisir</label>
                <select className={field} value={p.ref_id} onChange={(e) => setPreuves((a) => a.map((x, j) => j === i ? { ...x, ref_id: e.target.value } : x))}>
                  <option value="">—</option>
                  {optionsFor(p.type).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setPreuves((a) => [...a, emptyPreuve()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter une preuve</button>
      </section>

      {/* 4. Scans */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">4 · Scans</h2>
        <p className="text-xs text-muted mb-4">0 à N images (bucket <code>references</code>).</p>
        {images.map((im, i) => (
          <div key={im.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-green-deep">Scan {i + 1}</span>
              <button type="button" onClick={() => setImages((a) => a.filter((_, j) => j !== i))} className="ml-auto text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button></div>
            <div className="mb-2.5"><label className={label}>URL de l’image <span className="text-red-600">*</span></label><input className={field} value={im.image_url} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, image_url: e.target.value } : x))} placeholder="https://…/references/….webp" /></div>
            <div className="mb-2.5"><label className={label}>Alt (description)</label><input className={field} value={im.alt} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Légende</label><input className={field} value={im.legende} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, legende: e.target.value } : x))} /></div>
              <div><label className={label}>Source (livre, p.)</label><input className={field} value={im.source_livre} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, source_livre: e.target.value } : x))} /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setImages((a) => [...a, emptyImg()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter un scan</button>
      </section>

      {/* 5. Voir aussi */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">5 · Dossiers liés</h2>
        <p className="text-xs text-muted mb-4">Affichés en bas du dossier.</p>
        {lies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {lies.map((did) => (
              <span key={did} className="inline-flex items-center gap-1.5 text-[13px] text-green-deep bg-green-soft border border-green-line px-3 py-1 rounded-full">
                {labelForDossier(did)}
                <button type="button" onClick={() => setLies((a) => a.filter((x) => x !== did))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <select className={field} value={lieToAdd} onChange={(e) => setLieToAdd(e.target.value)}>
            <option value="">— Ajouter un lien…</option>
            {liesOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <button type="button" disabled={!lieToAdd} onClick={() => { setLies((a) => [...a, Number(lieToAdd)]); setLieToAdd(''); }} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-green-soft text-green-deep border border-green-line font-semibold px-3.5 py-2 text-sm disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </section>

      {/* 6. Publication */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={f.published} onChange={(e) => setF((p) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-green" />
          <span className="text-[15px] text-ink font-medium">Publié <span className="text-muted font-normal">— visible sur le site public</span></span>
        </label>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/admin/dossiers" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !canSave} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDossierForm;
