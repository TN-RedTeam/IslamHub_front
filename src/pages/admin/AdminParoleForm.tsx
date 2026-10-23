import React, { useEffect, useMemo, useState } from 'react';
import { uid } from '../../utils/uid';
import { SujetField } from '../../components/admin/SujetField';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { TagPicker } from '../../components/admin/TagPicker';
import { ScanUploadButton } from '../../components/admin/ScanUploadButton';
import { NameSelect } from '../../components/admin/NameSelect';
import { BlocEditor } from '../../components/admin/BlocEditor';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type SavantRow, type ParoleFormData, type ParoleImageInput, type DossierRefs } from '../../services/AdminService';
import { AR_TEMPLATE, caretBetween, normalizeBracketSpaces } from '../../utils/arabicTemplate';
import type { ThemeRef } from '../../types';

const NEW = '__new';
const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
type Img = { key: string; image_url: string; alt: string; legende: string; source_livre: string; source_livre_ar: string };
const emptyImg = (): Img => ({ key: uid(), image_url: '', alt: '', legende: '', source_livre: '', source_livre_ar: '' });

export const AdminParoleForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [savants, setSavants] = useState<SavantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [f, setF] = useState({ sujet: '', rubrique: '', intro: '', texte_arabe: AR_TEMPLATE.parole, texte_francais: '', phonetique: '', explication: '', source_livre: '', page: '', ecole: '', tag: '', commente_livre: '', sujet_en: '', sujet_ar: '', intro_en: '', intro_ar: '', texte_en: '', phonetique_en: '', explication_en: '', explication_ar: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [savant, setSavant] = useState('');           // savant_id (string) ou NEW
  const [newSavant, setNewSavant] = useState('');
  const [rapporteur, setRapporteur] = useState('');   // rapporteur_savant_id (string)
  // Commente un contenu : type (parole/hadith/verset) + id de la cible.
  const [commenteType, setCommenteType] = useState<'' | 'parole' | 'hadith' | 'verset'>('');
  const [commenteRef, setCommenteRef] = useState('');
  const [commenteFilter, setCommenteFilter] = useState('');
  const [refs, setRefs] = useState<DossierRefs>({ hadiths: [], paroles: [], versets: [] });
  const [images, setImages] = useState<Img[]>([]);
  const moveImg = (i: number, d: -1 | 1) => setImages((p) => { const j = i + d; if (j < 0 || j >= p.length) return p; const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  // Dialogue — suite de la parole (échange question/réponse…).
  type Seg = { intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string;
    intro_en: string; intro_ar: string; phonetique_en: string; texte_en: string; explication_en: string; explication_ar: string };
  const emptySeg = (): Seg => ({ intro: '', texte_arabe: '', phonetique: '', texte_francais: '', explication: '',
    intro_en: '', intro_ar: '', phonetique_en: '', texte_en: '', explication_en: '', explication_ar: '' });
  const [segments, setSegments] = useState<Seg[]>([]);
  const setSeg = (i: number, k: keyof Seg, v: string) => setSegments((p) => p.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const moveSeg = (i: number, d: -1 | 1) => setSegments((p) => { const j = i + d; if (j < 0 || j >= p.length) return p; const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const [derived, setDerived] = useState<ThemeRef[]>([]);
  const [tagVocab, setTagVocab] = useState<string[]>([]);
  useEffect(() => { adminService.tagsVocabulary().then(setTagVocab).catch(() => {}); }, []);

  useEffect(() => {
    adminService.listSavants().then(setSavants).catch(() => setError('Impossible de charger les savants.')).finally(() => setLoading(false));
    adminService.listDossierRefs().then(setRefs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getParoleForEdit(editId).then((p) => {
      if (!p) return;
      setF({ sujet: p.sujet ?? '', rubrique: p.rubrique ?? '', intro: p.intro ?? '', texte_arabe: p.texte_arabe ?? '', texte_francais: p.texte_francais ?? '', phonetique: p.phonetique ?? '', explication: p.explication ?? '', source_livre: p.source_livre ?? '', page: p.page ?? '', ecole: p.ecole ?? '', tag: p.tag ?? '', commente_livre: p.commente_livre ?? '', sujet_en: p.sujet_en ?? '', sujet_ar: p.sujet_ar ?? '', intro_en: p.intro_en ?? '', intro_ar: p.intro_ar ?? '', texte_en: p.texte_en ?? '', phonetique_en: p.phonetique_en ?? '', explication_en: p.explication_en ?? '', explication_ar: p.explication_ar ?? '' });
      setSavant(p.savant_id ? String(p.savant_id) : '');
      setRapporteur(p.rapporteur_savant_id ? String(p.rapporteur_savant_id) : '');
      const ct = p.commente_type ?? (p.commente_parole_id ? 'parole' : p.commente_hadith_id ? 'hadith' : p.commente_verset_id ? 'verset' : '');
      setCommenteType(ct as '' | 'parole' | 'hadith' | 'verset');
      setCommenteRef(ct === 'parole' ? String(p.commente_parole_id ?? '') : ct === 'hadith' ? String(p.commente_hadith_id ?? '') : ct === 'verset' ? String(p.commente_verset_id ?? '') : '');
      setImages(p.images.map((im) => ({ ...emptyImg(), image_url: im.image_url ?? '', alt: im.alt ?? '', legende: im.legende ?? '', source_livre: im.source_livre ?? '', source_livre_ar: im.source_livre_ar ?? '' })));
      setSegments((p.segments ?? []).map((s) => ({ intro: s.intro ?? '', texte_arabe: s.texte_arabe ?? '', phonetique: s.phonetique ?? '', texte_francais: s.texte_francais ?? '', explication: s.explication ?? '',
        intro_en: s.intro_en ?? '', intro_ar: s.intro_ar ?? '', phonetique_en: s.phonetique_en ?? '', texte_en: s.texte_en ?? '', explication_en: s.explication_en ?? '', explication_ar: s.explication_ar ?? '' })));
    }).catch(() => setError('Parole introuvable.'));
  }, [editId]);

  useEffect(() => {
    const t = setTimeout(() => { if (f.tag.trim()) adminService.themesForTag(f.tag).then(setDerived).catch(() => setDerived([])); else setDerived([]); }, 300);
    return () => clearTimeout(t);
  }, [f.tag]);

  const canSave = useMemo(() => f.sujet.trim() && f.texte_arabe.trim(), [f.sujet, f.texte_arabe]);

  const buildPayload = (): ParoleFormData => ({
    id: editId, ...f,
    texte_arabe: normalizeBracketSpaces(f.texte_arabe),
    savant_id: savant && savant !== NEW ? Number(savant) : null,
    new_savant: savant === NEW && newSavant.trim() ? { nom: newSavant.trim() } : null,
    rapporteur_savant_id: rapporteur ? Number(rapporteur) : null,
    commente_type: commenteType || null,
    commente_parole_id: commenteType === 'parole' && commenteRef ? Number(commenteRef) : null,
    commente_hadith_id: commenteType === 'hadith' && commenteRef ? Number(commenteRef) : null,
    commente_verset_id: commenteType === 'verset' && commenteRef ? Number(commenteRef) : null,
    images: images.filter((im) => im.image_url.trim()).map<ParoleImageInput>((im, i) => ({
      image_url: im.image_url.trim(), alt: im.alt.trim() || 'Scan du livre', legende: im.legende || null, source_livre: im.source_livre || null, source_livre_ar: im.source_livre_ar || null, ordre: i,
    })),
    segments: segments.filter((s) => s.texte_arabe.trim() || s.texte_francais.trim() || s.intro.trim() || s.explication.trim()),
  });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveParole(buildPayload());
      setOk(true);
      if (andNew) { setF({ sujet: '', rubrique: '', intro: '', texte_arabe: AR_TEMPLATE.parole, texte_francais: '', phonetique: '', explication: '', source_livre: '', page: '', ecole: '', tag: '', commente_livre: '', sujet_en: '', sujet_ar: '', intro_en: '', intro_ar: '', texte_en: '', phonetique_en: '', explication_en: '', explication_ar: '' }); setSavant(''); setNewSavant(''); setRapporteur(''); setCommenteType(''); setCommenteRef(''); setCommenteFilter(''); setImages([]); setSegments([]); setTimeout(() => setOk(false), 2500); }
      else { navigate(`/admin/paroles/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500); }
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/arabe_hash|duplicate|unique/i.test(msg) ? 'Ce texte arabe existe déjà (doublon détecté).' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/paroles" className="hover:text-ink">Paroles</Link> · {editId ? 'Modifier' : 'Nouvelle'}</p>
      <h1 className="font-display font-semibold text-ink text-3xl mt-1 mb-1">{editId ? 'Modifier la parole' : 'Nouvelle parole'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Parole */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">1 · La parole</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><SujetField className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. Allah existe sans endroit" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
          <div><label className={label}>Sujet — anglais</label><input className={field} value={f.sujet_en} onChange={set('sujet_en')} placeholder="Subject (EN)" /></div>
          <div><label className={label}>Sujet — arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic text-right`} value={f.sujet_ar} onChange={set('sujet_ar')} placeholder="الموضوع" /></div>
        </div>
        <div className="mb-3.5"><label className={label}>Rubrique / série <span className="text-muted font-normal">(optionnel)</span></label>
          <input className={field} value={f.rubrique} onChange={set('rubrique')} placeholder="Ex. Série sur la croyance" /></div>
        <div className="mb-3.5"><label className={label}>Intro / narration <span className="text-muted font-normal">(optionnel)</span></label>
          <input className={field} value={f.intro} onChange={set('intro')} placeholder="Narration de contexte avant le texte arabe…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
          <div><label className={label}>Intro — anglais</label><input className={field} value={f.intro_en} onChange={set('intro_en')} placeholder="Intro (EN)" /></div>
          <div><label className={label}>Intro — arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic text-right`} value={f.intro_ar} onChange={set('intro_ar')} placeholder="المقدمة" /></div>
        </div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} onFocus={caretBetween(AR_TEMPLATE.parole)} placeholder="Colle ici le texte arabe (vocalisé)…" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Phonétique — anglais</label><input className={field} value={f.phonetique_en} onChange={set('phonetique_en')} placeholder="Phonetic (EN)" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
          <div><label className={label}>Traduction anglaise</label><input className={field} value={f.texte_en} onChange={set('texte_en')} placeholder="English translation" /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Explication — anglais</label><textarea className={`${field} min-h-[70px]`} value={f.explication_en} onChange={set('explication_en')} placeholder="Explanation (EN)" /></div>
          <div><label className={label}>Explication — arabe</label><textarea dir="rtl" lang="ar" className={`${field} font-arabic text-right min-h-[70px]`} value={f.explication_ar} onChange={set('explication_ar')} placeholder="الشرح" /></div>
        </div>
      </section>

      {/* 2. Savant & référence */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">2 · Savant & référence</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div>
            <label className={label}>Savant (auteur de la parole)</label>
            {savant === NEW ? (
              <div className="flex gap-2">
                <input className={field} value={newSavant} onChange={(e) => setNewSavant(e.target.value)} placeholder="Nom du nouveau savant" autoFocus />
                <button type="button" onClick={() => { setSavant(''); setNewSavant(''); }} className="shrink-0 rounded-lg border border-line px-3 text-sm text-muted hover:text-ink">Annuler</button>
              </div>
            ) : (
              <NameSelect options={savants} value={savant ? Number(savant) : null}
                onChange={(id) => setSavant(id ? String(id) : '')}
                allowCreate createLabel="Nouveau savant" onCreate={(nom) => { setSavant(NEW); setNewSavant(nom); }}
                placeholder="Chercher un savant (nom, surnom…)" />
            )}
          </div>
          <div><label className={label}>École <span className="text-muted font-normal">(optionnel)</span></label><input className={field} value={f.ecole} onChange={set('ecole')} placeholder="Hanafi, Malikite…" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Livre source</label><input className={field} value={f.source_livre} onChange={set('source_livre')} placeholder="Ex. Al-Asmāʾ wa ṣ-Ṣifāt" /></div>
          <div><label className={label}>Page</label><input className={field} value={f.page} onChange={set('page')} placeholder="88" /></div>
        </div>
        <div className="mt-3.5">
          <label className={label}>Rapportée par <span className="text-muted font-normal">(si un autre savant la rapporte)</span></label>
          <NameSelect options={savants} value={rapporteur ? Number(rapporteur) : null}
            onChange={(id) => setRapporteur(id ? String(id) : '')}
            placeholder="Chercher un savant (nom, surnom…)" />
        </div>
        {/* Commente un contenu — parole, hadith ou verset du Coran */}
        <div className="mt-3.5 rounded-lg border border-line bg-ground/40 p-3.5">
          <label className={label}>Commente un contenu <span className="text-muted font-normal">(optionnel)</span></label>
          <p className="text-xs text-muted mb-2.5">Relie cette parole au contenu qu'elle commente : une autre <b>parole</b>, un <b>hadith</b> ou un <b>verset</b> du Coran.</p>
          <div className="grid sm:grid-cols-[200px_1fr] gap-2.5">
            <select className={field} value={commenteType}
              onChange={(e) => { setCommenteType(e.target.value as '' | 'parole' | 'hadith' | 'verset'); setCommenteRef(''); setCommenteFilter(''); }}>
              <option value="">— (aucun)</option>
              <option value="parole">Une parole</option>
              <option value="hadith">Un hadith</option>
              <option value="verset">Un verset du Coran</option>
            </select>
            {commenteType && (
              <input className={field} value={commenteFilter} onChange={(e) => setCommenteFilter(e.target.value)} placeholder="Filtrer par sujet…" />
            )}
          </div>
          {commenteType && (
            <select className={`${field} mt-2.5`} value={commenteRef} onChange={(e) => setCommenteRef(e.target.value)}>
              <option value="">— (choisir)</option>
              {(commenteType === 'parole' ? refs.paroles : commenteType === 'hadith' ? refs.hadiths : refs.versets)
                .filter((o) => !(commenteType === 'parole' && o.id === editId))
                .filter((o) => !commenteFilter.trim() || o.label.toLowerCase().includes(commenteFilter.trim().toLowerCase()))
                .map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          )}
        </div>
        <div className="mt-3.5">
          <label className={label}>Commente un livre <span className="text-muted font-normal">(titre du livre commenté, optionnel)</span></label>
          <input className={field} value={f.commente_livre} onChange={set('commente_livre')} placeholder="Ex. Al-Fiqh al-Akbar de Abou Hanifa" />
        </div>
      </section>

      {/* 3. Scans */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">3 · Scans du livre</h2>
        <p className="text-xs text-muted mb-4">0 à N scans. <b>Téléverse</b> directement l’image (WebP/JPEG/PNG, 5 Mo max) ou colle une URL publique. L’<b>alt</b> décrit ce que montre la page.</p>
        {images.map((im, i) => (
          <div key={im.key} className="rounded-lg border border-line p-3 mb-2.5">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-ink">Scan {i + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Monter">↑</button>
                <button type="button" onClick={() => moveImg(i, 1)} disabled={i === images.length - 1} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Descendre">↓</button>
                <button type="button" onClick={() => setImages((a) => a.filter((_, j) => j !== i))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div></div>
            {im.image_url && (
              <a href={im.image_url} target="_blank" rel="noopener noreferrer" className="block mb-2.5">
                <img src={im.image_url} alt={im.alt || 'Aperçu du scan'} loading="lazy"
                  className="max-h-40 rounded-lg border border-line object-contain bg-ground/40" />
              </a>
            )}
            <div className="mb-2.5"><label className={label}>Image <span className="text-red-600">*</span></label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input className={field} value={im.image_url} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, image_url: e.target.value } : x))} placeholder="Téléverse ou colle une URL https://…/references/….webp" />
                <ScanUploadButton onUploaded={(url) => setImages((a) => a.map((x, j) => j === i ? { ...x, image_url: url } : x))} />
              </div>
            </div>
            <div className="mb-2.5"><label className={label}>Alt (description)</label><input className={field} value={im.alt} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, alt: e.target.value } : x))} placeholder="Scan de la page 88 de … montrant …" /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Légende</label><input className={field} value={im.legende} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, legende: e.target.value } : x))} /></div>
              <div><label className={label}>Source (livre, p.)</label><input className={field} value={im.source_livre} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, source_livre: e.target.value } : x))} /></div>
            </div>
            <div className="mt-2.5"><label className={label}>Nom du livre en arabe <span className="text-muted font-normal">(optionnel)</span></label>
              <input dir="rtl" lang="ar" className={`${field} font-arabic text-lg text-right`} value={im.source_livre_ar} onChange={(e) => setImages((a) => a.map((x, j) => j === i ? { ...x, source_livre_ar: e.target.value } : x))} placeholder="اسم الكتاب بالعربية" /></div>
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setImages((a) => [...a, emptyImg()])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-glass-tint text-ink font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter un scan</button>
          <ScanUploadButton label="Téléverser un scan" onUploaded={(url) => setImages((a) => [...a, { ...emptyImg(), image_url: url }])} />
        </div>
      </section>

      {/* 4. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">4 · Thèmes & mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(séparés par des virgules)</span></label>
        <TagPicker
          suggestions={tagVocab}
          value={f.tag ? f.tag.split(',').map((s) => s.trim()).filter(Boolean) : []}
          onChange={(tags) => setF((p) => ({ ...p, tag: tags.join(', ') }))}
          placeholder="croyance, attributs…"
        />
        <div className="mt-3.5 rounded-lg border border-line bg-ground/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent font-semibold">Thèmes déduits</p>
          {derived.length === 0 ? <p className="text-sm text-muted mt-1">Aucun.</p> :
            <div className="flex flex-wrap gap-1.5 mt-2">{derived.map((t) => <span key={t.slug} className="text-xs bg-glass-tint text-accent border border-glass-border rounded-full px-2.5 py-0.5">{t.nom}</span>)}</div>}
        </div>
      </section>

      {/* 5. Dialogue — suite de la parole (optionnel) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">5 · Dialogue <span className="text-muted font-normal">(optionnel)</span></h2>
        <p className="text-xs text-muted mb-3.5">Pour une parole sous forme d'échange (question → réponse → précision…). Le texte principal ci-dessus est le <b>1er passage</b> ; ajoute ici les passages suivants, dans l'ordre. L'<b>intro</b> est la narration qui précède.</p>
        {segments.map((sg, i) => (
          <div key={i} className="rounded-lg border border-line bg-ground/40 p-3.5 mb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-semibold text-accent">Passage {i + 2}</span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => moveSeg(i, -1)} disabled={i === 0} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Monter">↑</button>
                <button type="button" onClick={() => moveSeg(i, 1)} disabled={i === segments.length - 1} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Descendre">↓</button>
                <button type="button" onClick={() => setSegments((p) => p.filter((_, j) => j !== i))} className="px-2 py-1 text-xs rounded border border-low/40 text-low hover:bg-low/10 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="mb-2.5"><label className={label}>Intro / narration <span className="text-muted font-normal">(optionnel)</span></label>
              <input className={field} value={sg.intro} onChange={(e) => setSeg(i, 'intro', e.target.value)} placeholder="Ex. On lui demanda :" /></div>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div><label className={label}>Intro — anglais</label><input className={field} value={sg.intro_en} onChange={(e) => setSeg(i, 'intro_en', e.target.value)} placeholder="Intro (EN)" /></div>
              <div><label className={label}>Intro — arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic text-right`} value={sg.intro_ar} onChange={(e) => setSeg(i, 'intro_ar', e.target.value)} /></div>
            </div>
            <div className="mb-2.5"><label className={label}>Texte arabe</label>
              <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[80px]`} value={sg.texte_arabe} onChange={(e) => setSeg(i, 'texte_arabe', e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div><label className={label}>Phonétique</label><input className={field} value={sg.phonetique} onChange={(e) => setSeg(i, 'phonetique', e.target.value)} /></div>
              <div><label className={label}>Phonétique — anglais</label><input className={field} value={sg.phonetique_en} onChange={(e) => setSeg(i, 'phonetique_en', e.target.value)} /></div>
              <div><label className={label}>Traduction</label><input className={field} value={sg.texte_francais} onChange={(e) => setSeg(i, 'texte_francais', e.target.value)} /></div>
              <div><label className={label}>Traduction — anglais</label><input className={field} value={sg.texte_en} onChange={(e) => setSeg(i, 'texte_en', e.target.value)} placeholder="English" /></div>
            </div>
            <div className="mb-2.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label>
              <textarea className={`${field} min-h-[60px]`} value={sg.explication} onChange={(e) => setSeg(i, 'explication', e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div><label className={label}>Explication — anglais</label><textarea className={`${field} min-h-[60px]`} value={sg.explication_en} onChange={(e) => setSeg(i, 'explication_en', e.target.value)} /></div>
              <div><label className={label}>Explication — arabe</label><textarea dir="rtl" lang="ar" className={`${field} font-arabic text-right min-h-[60px]`} value={sg.explication_ar} onChange={(e) => setSeg(i, 'explication_ar', e.target.value)} /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setSegments((p) => [...p, emptySeg()])} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink font-semibold px-3.5 py-2 text-sm hover:border-green">
          <Plus className="w-4 h-4" /> Ajouter un passage
        </button>
      </section>

      {/* 6. Corps composé — blocs ordonnés (parole tissée : narrations + versets + prose) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">6 · Corps composé <span className="text-muted font-normal">(optionnel)</span></h2>
        <p className="text-xs text-muted mb-3.5">Pour un contenu <b>tissé</b> (plusieurs paroles/hadiths/versets + prose dans un ordre précis). Chaque bloc est réordonnable : <b>Texte</b>, <b>Preuve</b> (cite un contenu existant ou saisie manuelle), <b>Commentaire</b>. S'affiche sur la fiche <b>après</b> la parole. Laisse vide pour une parole classique.</p>
        {editId
          ? <BlocEditor parentType="parole" parentId={editId} />
          : <p className="text-sm text-muted italic">Enregistre d'abord la parole, puis reviens l'éditer pour composer son corps.</p>}
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-ink text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="parole" id={editId} label={f.sujet} redirectTo="/admin/paroles" />}
          <Link to="/admin/paroles" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-ink font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminParoleForm;
