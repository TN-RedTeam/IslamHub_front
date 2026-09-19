import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { adminService, type SourateFormData, type VersetInput, type ExegeseInput } from '../../services/AdminService';
import { AR_TEMPLATE, caretBetween } from '../../utils/arabicTemplate';
import { slugify } from '../../utils/slug';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const rid = () => Math.random().toString(36).slice(2);

type Exeg = { key: string; texte: string; source: string; verset_fin: string };
type Verset = { key: string; numero: string; texte_arabe: string; texte_francais: string; phonetique: string; exegeses: Exeg[] };
const emptyExeg = (): Exeg => ({ key: rid(), texte: '', source: '', verset_fin: '' });
const emptyVerset = (numero = ''): Verset => ({ key: rid(), numero, texte_arabe: AR_TEMPLATE.coran, texte_francais: '', phonetique: '', exegeses: [] });
const blank = { numero: '', nom: '', nom_arabe: '', slug: '', revelation: '', nb_versets: '', introduction_md: '', ordre_revelation: '' };

const move = <T,>(a: T[], i: number, dir: -1 | 1): T[] => {
  const j = i + dir; if (j < 0 || j >= a.length) return a;
  const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b;
};

export const AdminSourateForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editId));

  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [versets, setVersets] = useState<Verset[]>([]);
  const [savantNames, setSavantNames] = useState<string[]>([]);
  // nom de savant (minuscule) → titre de son tafsir (recueil type « tafsir »).
  const [tafsirBySavant, setTafsirBySavant] = useState<Map<string, string>>(new Map());

  // Noms de savants → autocomplétion du champ « Source » des exégèses ;
  // tafsirs → association automatique du titre quand on choisit l'auteur.
  useEffect(() => {
    adminService.listSavants().then((s) => setSavantNames(s.map((x) => x.nom))).catch(() => {});
    adminService.listTafsirsBySavant()
      .then((rows) => setTafsirBySavant(new Map(rows.map((r) => [r.nom.trim().toLowerCase(), r.titre]))))
      .catch(() => {});
  }, []);

  // Saisie de la source : si la valeur correspond à un savant ayant un tafsir,
  // on associe automatiquement le titre (« Savant — Titre du tafsir »).
  const setSource = (vi: number, ei: number, val: string) => {
    const t = tafsirBySavant.get(val.trim().toLowerCase());
    patchExeg(vi, ei, { source: t ? `${val.trim()} — ${t}` : val });
  };

  useEffect(() => {
    if (!editId) return;
    adminService.getSourateForEdit(editId).then((s) => {
      if (!s) { setError('Sourate introuvable.'); return; }
      setF({ numero: String(s.numero ?? ''), nom: s.nom ?? '', nom_arabe: s.nom_arabe ?? '', slug: s.slug ?? '', revelation: s.revelation ?? '', nb_versets: s.nb_versets != null ? String(s.nb_versets) : '', introduction_md: s.introduction_md ?? '', ordre_revelation: s.ordre_revelation != null ? String(s.ordre_revelation) : '' });
      setVersets((s.versets ?? []).map((v) => ({
        key: rid(), numero: String(v.numero ?? ''), texte_arabe: v.texte_arabe ?? '', texte_francais: v.texte_francais ?? '', phonetique: v.phonetique ?? '',
        exegeses: (v.exegeses ?? []).map((e) => ({ key: rid(), texte: e.texte ?? '', source: e.source ?? '', verset_fin: e.verset_fin != null ? String(e.verset_fin) : '' })),
      })));
    }).catch(() => setError('Sourate introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const autoSlug = slugTouched ? f.slug : slugify(f.nom);
  const canSave = useMemo(() => f.numero.trim() && f.nom.trim(), [f.numero, f.nom]);

  // --- mutations versets ---
  const patchVerset = (i: number, patch: Partial<Verset>) => setVersets((a) => a.map((v, j) => j === i ? { ...v, ...patch } : v));
  const patchExeg = (vi: number, ei: number, patch: Partial<Exeg>) =>
    setVersets((a) => a.map((v, j) => j === vi ? { ...v, exegeses: v.exegeses.map((e, k) => k === ei ? { ...e, ...patch } : e) } : v));

  const buildPayload = (): SourateFormData => ({
    id: editId, numero: f.numero, nom: f.nom.trim(), nom_arabe: f.nom_arabe, slug: autoSlug, revelation: f.revelation, nb_versets: f.nb_versets,
    introduction_md: f.introduction_md, ordre_revelation: f.ordre_revelation,
    versets: versets
      .filter((v) => v.numero.trim())
      .map<VersetInput>((v) => ({
        numero: v.numero, texte_arabe: v.texte_arabe, texte_francais: v.texte_francais, phonetique: v.phonetique,
        exegeses: v.exegeses.filter((e) => e.texte.trim()).map<ExegeseInput>((e, k) => ({ texte: e.texte.trim(), source: e.source.trim() || null, ordre: k, verset_fin: e.verset_fin.trim() ? Number(e.verset_fin) : null })),
      })),
  });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveSourate(buildPayload());
      setOk(true); navigate(`/admin/sourates/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/sourates_numero_key/i.test(msg) ? 'Ce numéro de sourate existe déjà.'
        : /duplicate|unique|slug/i.test(msg) ? 'Ce slug existe déjà — modifie-le.' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      {/* Autocomplétion « Source » des exégèses : noms de savants (table savants) */}
      <datalist id="exeg-savants">{savantNames.map((n) => <option key={n} value={n} />)}</datalist>
      <p className="text-xs text-muted"><Link to="/admin/sourates" className="hover:text-green-deep">Coran — exégèse</Link> · {editId ? 'Modifier' : 'Nouvelle'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier la sourate' : 'Nouvelle sourate'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. La sourate */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · La sourate</h2>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <div><label className={label}>N° <span className="text-red-600">*</span></label><input className={field} type="number" value={f.numero} onChange={set('numero')} placeholder="112" /></div>
          <div className="sm:col-span-2"><label className={label}>Nom <span className="text-red-600">*</span></label><input className={field} value={f.nom} onChange={set('nom')} placeholder="Al-Ikhlāṣ" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Nom arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic text-xl text-right`} value={f.nom_arabe} onChange={set('nom_arabe')} placeholder="الإخلاص" /></div>
          <div><label className={label}>Révélation</label>
            <input className={field} list="revelation-list" value={f.revelation} onChange={set('revelation')} placeholder="Mecquoise / Médinoise" />
            <datalist id="revelation-list"><option value="Mecquoise" /><option value="Médinoise" /></datalist>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3.5 mt-3.5">
          <div><label className={label}>Nb de versets <span className="text-muted font-normal">(total)</span></label><input className={field} type="number" value={f.nb_versets} onChange={set('nb_versets')} placeholder="4" /></div>
          <div><label className={label}>Ordre de révélation <span className="text-muted font-normal">(optionnel)</span></label><input className={field} type="number" value={f.ordre_revelation} onChange={set('ordre_revelation')} placeholder="81" /></div>
          <div><label className={label}>Slug (URL) <span className="text-muted font-normal">— depuis le nom</span></label>
            <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF((p) => ({ ...p, slug: e.target.value })); }} placeholder="al-ikhlas" /></div>
        </div>
        <div className="mt-3.5">
          <label className={label}>Introduction de la sourate <span className="text-muted font-normal">(Markdown — contexte, période, thème ; masquée si vide)</span></label>
          <textarea className={`${field} min-h-[90px]`} value={f.introduction_md} onChange={set('introduction_md')} placeholder="Sourate mecquoise centrée sur…" />
        </div>
      </section>

      {/* 2. Versets + exégèses */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">2 · Versets & exégèses</h2>
        <p className="text-xs text-muted mb-4">Ajoute les versets à commenter (pas nécessairement toute la sourate). Sous chaque verset, une ou plusieurs exégèses (texte + source).</p>

        {versets.map((v, vi) => (
          <div key={v.key} className="rounded-lg border border-line bg-ground/30 p-3.5 mb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-green-deep">Verset {v.numero || vi + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => setVersets((a) => move(a, vi, -1))} disabled={vi === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => setVersets((a) => move(a, vi, 1))} disabled={vi === versets.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => setVersets((a) => a.filter((_, j) => j !== vi))} className="text-red-600" aria-label="Retirer le verset"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-[90px_1fr] gap-2.5">
              <div><label className={label}>N° <span className="text-red-600">*</span></label><input className={field} type="number" value={v.numero} onChange={(e) => patchVerset(vi, { numero: e.target.value })} /></div>
              <div><label className={label}>Texte arabe</label><textarea dir="rtl" lang="ar" className={`${field} font-arabic text-xl leading-loose text-right min-h-[64px]`} value={v.texte_arabe} onChange={(e) => patchVerset(vi, { texte_arabe: e.target.value })} onFocus={caretBetween(AR_TEMPLATE.coran)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
              <div><label className={label}>Traduction</label><input className={field} value={v.texte_francais} onChange={(e) => patchVerset(vi, { texte_francais: e.target.value })} /></div>
              <div><label className={label}>Phonétique</label><input className={field} value={v.phonetique} onChange={(e) => patchVerset(vi, { phonetique: e.target.value })} /></div>
            </div>

            {/* Exégèses du verset */}
            <div className="mt-3 pl-3 border-l-2 border-green-line">
              <p className="text-[11px] uppercase tracking-[0.12em] text-gold font-semibold mb-2">Exégèses</p>
              {v.exegeses.map((ex, ei) => (
                <div key={ex.key} className="rounded-lg border border-line bg-surface p-2.5 mb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[12px] font-semibold text-muted">#{ei + 1}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <button type="button" onClick={() => patchVerset(vi, { exegeses: move(v.exegeses, ei, -1) })} disabled={ei === 0} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Monter"><ArrowUp className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => patchVerset(vi, { exegeses: move(v.exegeses, ei, 1) })} disabled={ei === v.exegeses.length - 1} className="text-muted disabled:opacity-30 hover:text-green-deep" aria-label="Descendre"><ArrowDown className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => patchVerset(vi, { exegeses: v.exegeses.filter((_, k) => k !== ei) })} className="text-red-600" aria-label="Retirer l'exégèse"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <textarea className={`${field} min-h-[60px]`} value={ex.texte} onChange={(e) => patchExeg(vi, ei, { texte: e.target.value })} placeholder="Le commentaire (Markdown)…" />
                  <input className={`${field} mt-2`} list="exeg-savants" value={ex.source} onChange={(e) => setSource(vi, ei, e.target.value)} placeholder="Source — choisir un savant ou saisir (Ibn Kathīr, Al-Ṭabarī…)" />
                  <p className="text-[11px] text-muted mt-1">Choisir un savant qui a un tafsir associe automatiquement le titre de son tafsir.</p>
                </div>
              ))}
              <button type="button" onClick={() => patchVerset(vi, { exegeses: [...v.exegeses, emptyExeg()] })} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3 py-1.5 text-[13px]"><Plus className="w-3.5 h-3.5" /> Ajouter une exégèse</button>
            </div>
          </div>
        ))}

        <button type="button" onClick={() => setVersets((a) => [...a, emptyVerset(String(a.length + 1))])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter un verset</button>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="sourate" id={editId} label={f.nom} redirectTo="/admin/sourates" />}
          <Link to="/admin/sourates" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !canSave} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSourateForm;
