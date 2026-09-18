import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { BlocEditor } from '../../components/admin/BlocEditor';
import { TagPicker } from '../../components/admin/TagPicker';
import {
  adminService,
  type VersetFormData, type VersetType, type PreuveType,
  type VersetRefs, type VersetPreuveInput, type VersetImageInput,
} from '../../services/AdminService';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

type Preuve = { key: string; type: PreuveType; ref_id: string; contenu_libre: string };
type Img = { key: string; image_url: string; alt: string; legende: string; source_livre: string };
const rid = () => Math.random().toString(36).slice(2);
const emptyPreuve = (): Preuve => ({ key: rid(), type: 'coran', ref_id: '', contenu_libre: '' });
const emptyImg = (): Img => ({ key: rid(), image_url: '', alt: '', legende: '', source_livre: '' });

const blankForm = {
  type: 'verset' as VersetType, theme: '', sourate: '', sourate_num: '', ayah: '',
  verset_arabe: '', verset_traduction: '', verset_phonetique: '',
  sens_juste: '', objection: '', reponse: '',
  recueil: '', numero: '', slug: '', published: false,
};

// Le champ texte `rapporteur` stocke un ou plusieurs noms séparés par une virgule.
const splitRapporteurs = (s: string | null | undefined) =>
  (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);

export const AdminEquivoqueForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [refs, setRefs] = useState<VersetRefs>({ hadiths: [], paroles: [], versets: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [f, setF] = useState(blankForm);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [lies, setLies] = useState<number[]>([]);
  const [lieToAdd, setLieToAdd] = useState('');
  const [rapporteurs, setRapporteurs] = useState<string[]>([]);
  const [savantNames, setSavantNames] = useState<string[]>([]);

  useEffect(() => {
    adminService.listVersetRefs()
      .then(setRefs)
      .catch(() => setError('Impossible de charger les listes (hadiths / paroles).'))
      .finally(() => { if (!editId) setLoading(false); });
  }, [editId]);

  // Noms de savants → suggestions pour le sélecteur de rapporteurs (graphies homogènes).
  useEffect(() => {
    adminService.listSavants().then((s) => setSavantNames(s.map((x) => x.nom))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getVersetForEdit(editId).then((v) => {
      if (!v) { setError('Élément introuvable.'); return; }
      setF({
        type: v.type, theme: v.theme ?? '', sourate: v.sourate ?? '',
        sourate_num: v.sourate_num != null ? String(v.sourate_num) : '',
        ayah: v.ayah != null ? String(v.ayah) : '',
        verset_arabe: v.verset_arabe ?? '', verset_traduction: v.verset_traduction ?? '', verset_phonetique: v.verset_phonetique ?? '',
        sens_juste: v.sens_juste ?? '', objection: v.objection ?? '', reponse: v.reponse ?? '',
        recueil: v.recueil ?? '', numero: v.numero ?? '', slug: v.slug ?? '', published: !!v.published,
      });
      setRapporteurs(splitRapporteurs(v.rapporteur));
      setPreuves(v.preuves.map((p) => ({ key: rid(), type: p.type, ref_id: p.ref_id != null ? String(p.ref_id) : '', contenu_libre: p.contenu_libre ?? '' })));
      setImages(v.images.map((im) => ({ ...emptyImg(), image_url: im.image_url ?? '', alt: im.alt ?? '', legende: im.legende ?? '', source_livre: im.source_livre ?? '' })));
      setLies(v.lies ?? []);
    }).catch(() => setError('Élément introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const isHadith = f.type === 'hadith';
  const canSave = useMemo(() => f.theme.trim() && f.verset_arabe.trim(), [f.theme, f.verset_arabe]);

  const optionsFor = (t: PreuveType) => (t === 'hadith' ? refs.hadiths : t === 'parole' ? refs.paroles : []);
  const liesOptions = refs.versets.filter((v) => v.id !== editId && !lies.includes(v.id));
  const labelForVerset = (vid: number) => refs.versets.find((v) => v.id === vid)?.label ?? `#${vid}`;

  const movePreuve = (i: number, dir: -1 | 1) => setPreuves((a) => {
    const j = i + dir; if (j < 0 || j >= a.length) return a;
    const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b;
  });

  const buildPayload = (): VersetFormData => ({
    id: editId,
    slug: f.slug || null,
    type: f.type, theme: f.theme.trim(),
    sourate: isHadith ? f.sourate.trim() : f.sourate.trim(),
    sourate_num: isHadith ? '' : f.sourate_num,
    ayah: isHadith ? '' : f.ayah,
    verset_arabe: f.verset_arabe, verset_traduction: f.verset_traduction, verset_phonetique: f.verset_phonetique,
    sens_juste: f.sens_juste, objection: f.objection, reponse: f.reponse,
    rapporteur: isHadith ? rapporteurs.join(', ') : '', recueil: isHadith ? f.recueil : '', numero: isHadith ? f.numero : '',
    published: f.published,
    preuves: preuves
      .filter((p) => (p.type === 'coran' ? p.contenu_libre.trim() : p.ref_id))
      .map<VersetPreuveInput>((p, i) => ({
        type: p.type,
        ref_id: p.type === 'coran' ? null : Number(p.ref_id) || null,
        contenu_libre: p.type === 'coran' ? p.contenu_libre.trim() : null,
        ordre: i,
      })),
    images: images.filter((im) => im.image_url.trim()).map<VersetImageInput>((im, i) => ({
      image_url: im.image_url.trim(), alt: im.alt.trim() || 'Scan du livre', legende: im.legende || null, source_livre: im.source_livre || null, ordre: i,
    })),
    lies,
  });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveVerset(buildPayload());
      setOk(true);
      if (andNew) {
        setF(blankForm); setPreuves([]); setImages([]); setLies([]); setLieToAdd(''); setRapporteurs([]);
        window.scrollTo({ top: 0 }); setTimeout(() => setOk(false), 2500);
      } else { navigate(`/admin/equivoques/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/duplicate|unique/i.test(msg) ? 'Ce slug existe déjà — modifie-le.' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/equivoques" className="hover:text-green-deep">Versets / hadiths équivoques</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier l’équivoque' : 'Nouvelle équivoque'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Nature & thème */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Nature & thème</h2>
        <div className="flex gap-2 mb-3.5">
          {(['verset', 'hadith'] as VersetType[]).map((t) => (
            <button key={t} type="button" onClick={() => setF((p) => ({ ...p, type: t }))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                f.type === t ? 'bg-green text-white border-green' : 'bg-surface text-ink border-line hover:bg-green-soft'}`}>
              {t === 'verset' ? 'Verset équivoque' : 'Hadith équivoque'}
            </button>
          ))}
        </div>
        <div><label className={label}>Thème <span className="text-red-600">*</span></label>
          <input className={field} value={f.theme} onChange={set('theme')} placeholder="Ex. L’istiwāʾ sur le Trône" /></div>
      </section>

      {/* 2. Le texte */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Le texte {isHadith ? 'du hadith' : 'du verset'}</h2>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.verset_arabe} onChange={set('verset_arabe')} placeholder="Colle ici le texte arabe (vocalisé)…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Traduction française</label><input className={field} value={f.verset_traduction} onChange={set('verset_traduction')} /></div>
          <div><label className={label}>Phonétique</label><input className={field} value={f.verset_phonetique} onChange={set('verset_phonetique')} /></div>
        </div>

        {isHadith ? (
          <div className="grid sm:grid-cols-3 gap-3.5 mt-3.5">
            <div><label className={label}>Rapporteur(s)</label><TagPicker suggestions={savantNames} value={rapporteurs} onChange={setRapporteurs} placeholder="Al-Bukhārī…" /></div>
            <div><label className={label}>Recueil</label><input className={field} value={f.recueil} onChange={set('recueil')} placeholder="Ṣaḥīḥ al-Bukhārī" /></div>
            <div><label className={label}>Numéro</label><input className={field} value={f.numero} onChange={set('numero')} placeholder="7405" /></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3.5 mt-3.5">
            <div><label className={label}>Sourate <span className="text-red-600">*</span></label><input className={field} value={f.sourate} onChange={set('sourate')} placeholder="Ṭā-Hā" /></div>
            <div><label className={label}>N° sourate</label><input className={field} type="number" value={f.sourate_num} onChange={set('sourate_num')} placeholder="20" /></div>
            <div><label className={label}>Verset (ayah)</label><input className={field} type="number" value={f.ayah} onChange={set('ayah')} placeholder="5" /></div>
          </div>
        )}
      </section>

      {/* 3. L'analyse */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">3 · L’analyse <span className="text-muted font-normal text-sm">(ancien format — Markdown)</span></h2>
        <p className="text-xs text-muted mb-4">Champs historiques (sens juste / objection / réponse). <b>Dès qu’un article composable existe (section 8), c’est lui qui s’affiche</b> et ces champs sont ignorés. Compose plutôt en blocs ci-dessous.</p>
        <div className="mb-3.5"><label className={label}>Le sens juste</label><textarea className={`${field} min-h-[90px]`} value={f.sens_juste} onChange={set('sens_juste')} placeholder="Le sens correct, sourcé…" /></div>
        <div className="mb-3.5"><label className={label}>L’interprétation erronée (objection)</label><textarea className={`${field} min-h-[70px]`} value={f.objection} onChange={set('objection')} placeholder="L’objection type, formulée de manière impersonnelle…" /></div>
        <div><label className={label}>La réponse</label><textarea className={`${field} min-h-[90px]`} value={f.reponse} onChange={set('reponse')} placeholder="La réfutation sourcée…" /></div>
      </section>

      {/* 4. Preuves */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">4 · Preuves</h2>
        <p className="text-xs text-muted mb-4">Coran (texte libre), ou un hadith / une parole déjà en base. L’ordre d’affichage suit la liste.</p>
        {preuves.map((p, i) => (
          <div key={p.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-green-deep">Preuve {i + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => movePreuve(i, -1)} disabled={i === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => movePreuve(i, 1)} disabled={i === preuves.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setPreuves((a) => a.filter((_, j) => j !== i))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-[160px_1fr] gap-2.5">
              <div><label className={label}>Type</label>
                <select className={field} value={p.type} onChange={(e) => setPreuves((a) => a.map((x, j) => j === i ? { ...x, type: e.target.value as PreuveType, ref_id: '' } : x))}>
                  <option value="coran">Coran</option>
                  <option value="hadith">Hadith</option>
                  <option value="parole">Parole de savant</option>
                </select></div>
              {p.type === 'coran' ? (
                <div><label className={label}>Texte arabe (verset + réf.)</label>
                  <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-xl leading-loose text-right min-h-[70px]`} value={p.contenu_libre} onChange={(e) => setPreuves((a) => a.map((x, j) => j === i ? { ...x, contenu_libre: e.target.value } : x))} /></div>
              ) : (
                <div><label className={label}>{p.type === 'hadith' ? 'Choisir le hadith' : 'Choisir la parole'}</label>
                  <select className={field} value={p.ref_id} onChange={(e) => setPreuves((a) => a.map((x, j) => j === i ? { ...x, ref_id: e.target.value } : x))}>
                    <option value="">—</option>
                    {optionsFor(p.type).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select></div>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setPreuves((a) => [...a, emptyPreuve()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter une preuve</button>
      </section>

      {/* 5. Scans */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">5 · Scans du livre</h2>
        <p className="text-xs text-muted mb-4">0 à N scans. Colle l’URL publique (bucket Storage <code>references</code>).</p>
        {images.map((im, i) => (
          <div key={im.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-green-deep">Scan {i + 1}</span>
              <button type="button" onClick={() => setImages((a) => a.filter((_, j) => j !== i))} className="ml-auto text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button></div>
            <div className="mb-2.5"><label className={label}>URL de l’image <span className="text-red-600">*</span></label><input className={field} value={im.image_url} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, image_url: e.target.value } : x))} placeholder="https://…/references/….webp" /></div>
            <div className="mb-2.5"><label className={label}>Alt (description)</label><input className={field} value={im.alt} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} placeholder="Scan de la page … montrant …" /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Légende</label><input className={field} value={im.legende} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, legende: e.target.value } : x))} /></div>
              <div><label className={label}>Source (livre, p.)</label><input className={field} value={im.source_livre} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, source_livre: e.target.value } : x))} /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setImages((a) => [...a, emptyImg()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter un scan</button>
      </section>

      {/* 6. Voir aussi */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">6 · Voir aussi</h2>
        <p className="text-xs text-muted mb-4">Autres équivoques liées, affichées en bas de la fiche.</p>
        {lies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {lies.map((vid) => (
              <span key={vid} className="inline-flex items-center gap-1.5 text-[13px] text-green-deep bg-green-soft border border-green-line px-3 py-1 rounded-full">
                {labelForVerset(vid)}
                <button type="button" onClick={() => setLies((a) => a.filter((x) => x !== vid))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {/* 7. Publication */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={f.published} onChange={(e) => setF((p) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-green" />
          <span className="text-[15px] text-ink font-medium">Publié <span className="text-muted font-normal">— visible sur le site public</span></span>
        </label>
      </section>

      {/* 8. Contenu composable (blocs) — disponible une fois l'entrée créée */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">8 · Article composable <span className="text-muted font-normal text-sm">(blocs)</span></h2>
        <p className="text-xs text-muted mb-4">Compose l’article en blocs Texte / Commentaire / Preuve. Les preuves référencent une source existante (jamais recopiée).</p>
        {editId
          ? <BlocEditor parentType="equivoque" parentId={editId} />
          : <p className="text-sm text-muted italic">Enregistre d’abord l’entrée, puis reviens ici pour composer l’article.</p>}
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="equivoque" id={editId} label={f.theme} redirectTo="/admin/equivoques" />}
          <Link to="/admin/equivoques" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEquivoqueForm;
