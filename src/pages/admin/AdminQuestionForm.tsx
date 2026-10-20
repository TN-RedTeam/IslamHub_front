import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { BlocEditor } from '../../components/admin/BlocEditor';
import { TranslationPanel } from '../../components/admin/TranslationPanel';
import { adminService, type QuestionFormData } from '../../services/AdminService';
import { slugify } from '../../utils/slug';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const blank = { question: '', slug: '', reponse_courte: '', variantes: '', ordre: 0, publiee: false };

export const AdminQuestionForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editId));

  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [themeSlugs, setThemeSlugs] = useState<string[]>([]);
  const [dossierIds, setDossierIds] = useState<number[]>([]);
  const [allThemes, setAllThemes] = useState<{ slug: string; nom: string }[]>([]);
  const [allDossiers, setAllDossiers] = useState<{ id: number; label: string }[]>([]);
  const [themeToAdd, setThemeToAdd] = useState('');
  const [dossierToAdd, setDossierToAdd] = useState('');

  useEffect(() => {
    Promise.all([adminService.listAllThemes(), adminService.listDossiers()])
      .then(([themes, dossiers]) => { setAllThemes(themes); setAllDossiers(dossiers.map((d) => ({ id: d.id, label: d.h1 }))); })
      .catch(() => setError('Impossible de charger les thèmes / dossiers.'));
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getQuestionForEdit(editId).then((d) => {
      if (!d) { setError('Question introuvable.'); return; }
      setF({ question: d.question ?? '', slug: d.slug ?? '', reponse_courte: d.reponse_courte ?? '', variantes: (d.variantes ?? []).join('\n'), ordre: d.ordre ?? 0, publiee: !!d.publiee });
      setThemeSlugs(d.theme_slugs ?? []);
      setDossierIds(d.dossier_ids ?? []);
    }).catch(() => setError('Question introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const autoSlug = slugTouched ? f.slug : slugify(f.question);
  const canSave = useMemo(() => f.question.trim().length > 0 && autoSlug.trim().length > 0, [f.question, autoSlug]);
  const themeOptions = allThemes.filter((t) => !themeSlugs.includes(t.slug));
  const dossierOptions = allDossiers.filter((d) => !dossierIds.includes(d.id));
  const themeNom = (slug: string) => allThemes.find((t) => t.slug === slug)?.nom ?? slug;
  const dossierLabel = (did: number) => allDossiers.find((d) => d.id === did)?.label ?? `#${did}`;

  const buildPayload = (): QuestionFormData => ({
    id: editId, question: f.question.trim(), slug: autoSlug.trim(), reponse_courte: f.reponse_courte.trim() || null,
    variantes: f.variantes.split('\n').map((v) => v.trim()).filter(Boolean),
    publiee: f.publiee, ordre: Number(f.ordre) || 0, theme_slugs: themeSlugs, dossier_ids: dossierIds,
  });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveQuestion(buildPayload());
      setOk(true); navigate(`/admin/questions/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur.';
      setError(/duplicate|unique|slug/i.test(msg) ? 'Ce slug existe déjà — modifie-le.' : msg);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!editId || !window.confirm('Supprimer définitivement cette question (et ses blocs) ?')) return;
    setDeleting(true); setError(null);
    try { await adminService.deleteQuestion(editId); navigate('/admin/questions', { replace: true }); }
    catch (e) { setError((e as Error).message || 'Suppression impossible.'); setDeleting(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/questions" className="hover:text-ink">Questions fréquentes</Link> · {editId ? 'Modifier' : 'Nouvelle'}</p>
      {editId ? <TranslationPanel kind="question" id={editId} editPathBase="/admin/questions" /> : null}
      <h1 className="font-display font-semibold text-ink text-3xl mt-1 mb-6">{editId ? 'Modifier la question' : 'Nouvelle question'}</h1>

      {/* 1. Question & SEO */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">1 · Question & réponse courte</h2>
        <div className="mb-3.5"><label className={label}>Question (= titre & meta title) <span className="text-red-600">*</span></label>
          <input className={field} value={f.question} onChange={set('question')} placeholder="Ex. Où est Allah ?" /></div>
        <div className="mb-3.5"><label className={label}>Slug (URL) <span className="text-muted font-normal">— depuis la question</span></label>
          <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF((p) => ({ ...p, slug: e.target.value })); }} placeholder="ou-est-allah" /></div>
        <div className="mb-3.5"><label className={label}>Réponse courte <span className="text-muted font-normal">(encart + meta description, 2–4 phrases)</span></label>
          <textarea className={`${field} min-h-[90px]`} value={f.reponse_courte} onChange={set('reponse_courte')} placeholder="L’essentiel, clair et sourcé…" /></div>
        <div><label className={label}>Aussi demandé / variantes <span className="text-muted font-normal">(une par ligne — SEO & recherche interne)</span></label>
          <textarea className={`${field} min-h-[70px]`} value={f.variantes} onChange={set('variantes')} placeholder={'Allah est-il au ciel ?\nAllah est-il partout ?'} /></div>
      </section>

      {/* 2. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">2 · Thèmes</h2>
        <p className="text-xs text-muted mb-4">Servent au regroupement de la liste et au maillage interne.</p>
        {themeSlugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {themeSlugs.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-[13px] text-ink bg-glass-tint border border-green-line px-3 py-1 rounded-full">
                {themeNom(s)}
                <button type="button" onClick={() => setThemeSlugs((a) => a.filter((x) => x !== s))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <select className={field} value={themeToAdd} onChange={(e) => setThemeToAdd(e.target.value)}>
            <option value="">— Ajouter un thème…</option>
            {themeOptions.map((o) => <option key={o.slug} value={o.slug}>{o.nom}</option>)}
          </select>
          <button type="button" disabled={!themeToAdd} onClick={() => { setThemeSlugs((a) => [...a, themeToAdd]); setThemeToAdd(''); }} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-glass-tint text-ink border border-green-line font-semibold px-3.5 py-2 text-sm disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </section>

      {/* 3. Pour approfondir (dossiers) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">3 · Pour approfondir <span className="text-muted font-normal">(dossiers liés)</span></h2>
        <p className="text-xs text-muted mb-4">Affichés en bas de la réponse.</p>
        {dossierIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {dossierIds.map((did) => (
              <span key={did} className="inline-flex items-center gap-1.5 text-[13px] text-ink bg-glass-tint border border-green-line px-3 py-1 rounded-full">
                {dossierLabel(did)}
                <button type="button" onClick={() => setDossierIds((a) => a.filter((x) => x !== did))} className="text-red-600" aria-label="Retirer"><Trash2 className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <select className={field} value={dossierToAdd} onChange={(e) => setDossierToAdd(e.target.value)}>
            <option value="">— Ajouter un dossier…</option>
            {dossierOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <button type="button" disabled={!dossierToAdd} onClick={() => { setDossierIds((a) => [...a, Number(dossierToAdd)]); setDossierToAdd(''); }} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-glass-tint text-ink border border-green-line font-semibold px-3.5 py-2 text-sm disabled:opacity-50"><Plus className="w-4 h-4" /> Ajouter</button>
        </div>
      </section>

      {/* 4. Publication */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <div className="grid sm:grid-cols-[1fr_120px] gap-3.5 items-end">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={f.publiee} onChange={(e) => setF((p) => ({ ...p, publiee: e.target.checked }))} className="w-4 h-4 accent-green" />
            <span className="text-[15px] text-ink font-medium">Publiée <span className="text-muted font-normal">— ne publier qu’une réponse rédigée</span></span>
          </label>
          <div><label className={label}>Ordre</label><input type="number" className={field} value={f.ordre} onChange={set('ordre')} /></div>
        </div>
      </section>

      {/* 5. Développement sourcé (blocs composables) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">5 · Développement sourcé <span className="text-muted font-normal text-sm">(blocs)</span></h2>
        <p className="text-xs text-muted mb-4">Texte, preuve (verset / hadith / parole) et commentaire — mêmes blocs que les dossiers.</p>
        {editId
          ? <BlocEditor parentType="question" parentId={editId} />
          : <p className="text-sm text-muted italic">Enregistre d’abord la question, puis reviens ici pour composer la réponse détaillée.</p>}
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-ink text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && (
            <button type="button" disabled={deleting} onClick={remove} className="inline-flex items-center gap-1.5 text-red-600 text-sm px-3 py-2 disabled:opacity-50">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Supprimer
            </button>
          )}
          <Link to="/admin/questions" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !canSave} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionForm;
