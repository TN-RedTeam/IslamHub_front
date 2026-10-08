import React, { useEffect, useMemo, useState } from 'react';
import { SujetField } from '../../components/admin/SujetField';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { TagPicker } from '../../components/admin/TagPicker';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle, X } from 'lucide-react';
import { adminService, type NarrateurRow, type RecueilRow, type SavantRow, type HadithFormData, type HadithSourceInput } from '../../services/AdminService';
import { AR_TEMPLATE, caretBetween, normalizeBracketSpaces } from '../../utils/arabicTemplate';
import type { ThemeRef } from '../../types';

const DEGRES = ['Sahih', 'Hassan', "Da'if"];
const TYPES = ["Marfou'", 'Qoudoussy', 'Mawqouf'];
const GENERATIONS = ['sahabi', 'tabii', 'tabi_tabii', 'khalaf'];
const ROLES = [{ v: '', l: '— aucun' }, { v: 'epouse_prophete', l: 'Mère des croyants' }, { v: 'calife_rachidoun', l: 'Calife bien-guidé' }];

const NEW = '__new';
type Src = { key: string; recueil_id: string; new_titre: string; new_savant: string; numero: string; chapitre: string };
const emptySrc = (): Src => ({ key: Math.random().toString(36).slice(2), recueil_id: '', new_titre: '', new_savant: '', numero: '', chapitre: '' });

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

/**
 * Sélecteur multiple avec recherche : on choisit des entités (savants, narrateurs)
 * une par une, affichées ensuite sous forme de puces retirables. La valeur sortante
 * est un tableau d'identifiants — c'est ce qu'attend `admin_save_hadith`.
 */
const MultiPicker: React.FC<{
  options: { id: number; nom: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}> = ({ options, selected, onChange, placeholder }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o.nom])), [options]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return options
      .filter((o) => !selected.includes(o.id) && (!needle || o.nom.toLowerCase().includes(needle)))
      .slice(0, 40);
  }, [options, selected, q]);
  const add = (id: number) => { onChange([...selected, id]); setQ(''); };
  const remove = (id: number) => onChange(selected.filter((x) => x !== id));
  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-glass-tint text-ink border border-green-line px-2.5 py-1 text-[13px]">
              {byId.get(id) ?? `#${id}`}
              <button type="button" onClick={() => remove(id)} className="text-ink/70 hover:text-red-600" aria-label="Retirer"><X className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className={field}
          value={q}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-line bg-surface shadow-lg py-1">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(o.id)}
                className="block w-full text-left px-3.5 py-2 text-[14px] text-ink hover:bg-glass-tint"
              >
                {o.nom}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminHadithForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [narrateurs, setNarrateurs] = useState<NarrateurRow[]>([]);
  const [recueils, setRecueils] = useState<RecueilRow[]>([]);
  const [savants, setSavants] = useState<SavantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Champs
  const [f, setF] = useState({
    sujet: '', intro: '', texte_arabe: AR_TEMPLATE.hadith, texte_francais: '', phonetique: '', explication: '',
    degre_authenticite: 'Sahih', type_hadith: '', juge_par: '', tag: '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  // Rapporteurs (savants) & narrateurs (Compagnons) : listes d'identifiants.
  const [rapporteurIds, setRapporteurIds] = useState<number[]>([]);
  const [narrateurIds, setNarrateurIds] = useState<number[]>([]);
  const [addingNarr, setAddingNarr] = useState(false);
  const [newNarr, setNewNarr] = useState({ nom: '', generation: 'sahabi', role: '', sexe: 'm' });
  const [sources, setSources] = useState<Src[]>([emptySrc()]);
  const [derived, setDerived] = useState<ThemeRef[]>([]);
  const [tagVocab, setTagVocab] = useState<string[]>([]);
  useEffect(() => { adminService.tagsVocabulary().then(setTagVocab).catch(() => {}); }, []);
  const [isEquivoque, setIsEquivoque] = useState(false);
  const [equivoqueId, setEquivoqueId] = useState<number | null>(null);
  // Segments de dialogue (suite du hadith).
  type Seg = { intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string };
  const emptySeg = (): Seg => ({ intro: '', texte_arabe: '', phonetique: '', texte_francais: '', explication: '' });
  const [segments, setSegments] = useState<Seg[]>([]);
  const setSeg = (i: number, k: keyof Seg, v: string) => setSegments((p) => p.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const moveSeg = (i: number, d: -1 | 1) => setSegments((p) => {
    const j = i + d; if (j < 0 || j >= p.length) return p;
    const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });
  // Variantes (autres versions du même hadith).
  type Var = { intro: string; texte_arabe: string; phonetique: string; texte_francais: string; explication: string; source: string };
  const emptyVar = (): Var => ({ intro: '', texte_arabe: '', phonetique: '', texte_francais: '', explication: '', source: '' });
  const [variants, setVariants] = useState<Var[]>([]);
  const setVar = (i: number, k: keyof Var, v: string) => setVariants((p) => p.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const moveVar = (i: number, d: -1 | 1) => setVariants((p) => {
    const j = i + d; if (j < 0 || j >= p.length) return p;
    const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  useEffect(() => {
    Promise.all([adminService.listNarrateurs(), adminService.listRecueils(), adminService.listSavants()])
      .then(([n, r, s]) => { setNarrateurs(n); setRecueils(r); setSavants(s); })
      .catch(() => setError("Impossible de charger les référentiels."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getHadithForEdit(editId).then((h) => {
      if (!h) return;
      setF({
        sujet: h.sujet ?? '', intro: h.intro ?? '', texte_arabe: h.texte_arabe ?? '', texte_francais: h.texte_francais ?? '',
        phonetique: h.phonetique ?? '', explication: h.explication ?? '', degre_authenticite: h.degre_authenticite ?? '',
        type_hadith: h.type_hadith ?? '', juge_par: h.juge_par ?? '', tag: h.tag ?? '',
      });
      setRapporteurIds(h.rapporteur_ids ?? []);
      setNarrateurIds(h.narrateur_ids ?? []);
      setIsEquivoque(!!h.is_equivoque);
      setEquivoqueId(h.equivoque_id ?? null);
      setSegments((h.segments ?? []).map((s) => ({
        intro: s.intro ?? '', texte_arabe: s.texte_arabe ?? '', phonetique: s.phonetique ?? '',
        texte_francais: s.texte_francais ?? '', explication: s.explication ?? '',
      })));
      setVariants((h.variants ?? []).map((v) => ({
        intro: v.intro ?? '', texte_arabe: v.texte_arabe ?? '', phonetique: v.phonetique ?? '',
        texte_francais: v.texte_francais ?? '', explication: v.explication ?? '', source: v.source ?? '',
      })));
      setSources(h.sources.length ? h.sources.map((s) => ({ ...emptySrc(), recueil_id: String(s.recueil_id), numero: s.numero ?? '', chapitre: s.chapitre ?? '' })) : [emptySrc()]);
    }).catch(() => setError("Hadith introuvable."));
  }, [editId]);

  // Aperçu des thèmes déduits (débounce).
  useEffect(() => {
    const t = setTimeout(() => {
      if (!f.tag.trim()) { setDerived([]); return; }
      adminService.themesForTag(f.tag).then(setDerived).catch(() => setDerived([]));
    }, 300);
    return () => clearTimeout(t);
  }, [f.tag]);

  const recueilLabel = (r: RecueilRow) => `${r.auteur ? r.auteur + ' — ' : ''}${r.titre}`;
  // Texte arabe non obligatoire : on exige le sujet + au moins un contenu
  // (arabe, traduction ou intro) pour éviter une fiche totalement vide.
  const canSave = useMemo(
    () => !!(f.sujet.trim() && (f.texte_arabe.trim() || f.texte_francais.trim() || f.intro.trim())),
    [f.sujet, f.texte_arabe, f.texte_francais, f.intro],
  );

  const buildPayload = (): HadithFormData => ({
    id: editId,
    ...f,
    texte_arabe: normalizeBracketSpaces(f.texte_arabe),
    rapporteur_ids: rapporteurIds,
    narrateur_ids: narrateurIds,
    is_equivoque: isEquivoque,
    segments: segments.filter((s) => s.texte_arabe.trim() || s.texte_francais.trim() || s.intro.trim() || s.explication.trim()),
    variants: variants.filter((v) => v.texte_arabe.trim() || v.texte_francais.trim() || v.intro.trim() || v.explication.trim() || v.source.trim()),
    new_narrateur: addingNarr && newNarr.nom.trim() ? newNarr : null,
    sources: sources.map<HadithSourceInput>((s) => s.recueil_id === NEW
      ? { new_recueil: { titre: s.new_titre.trim(), savant_id: s.new_savant ? Number(s.new_savant) : null }, numero: s.numero || null, chapitre: s.chapitre || null }
      : { recueil_id: s.recueil_id ? Number(s.recueil_id) : null, numero: s.numero || null, chapitre: s.chapitre || null },
    ).filter((s) => s.recueil_id || (s.new_recueil && s.new_recueil.titre)),
  });

  const save = async (andNew: boolean) => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveHadith(buildPayload());
      setOk(true);
      if (andNew) {
        setF({ sujet: '', intro: '', texte_arabe: AR_TEMPLATE.hadith, texte_francais: '', phonetique: '', explication: '', degre_authenticite: 'Sahih', type_hadith: '', juge_par: '', tag: '' });
        setRapporteurIds([]); setNarrateurIds([]); setAddingNarr(false); setNewNarr({ nom: '', generation: 'sahabi', role: '', sexe: 'm' });
        setIsEquivoque(false); setEquivoqueId(null); setSegments([]); setVariants([]);
        setSources([emptySrc()]); setTimeout(() => setOk(false), 2500);
      } else {
        navigate(`/admin/hadiths/${newId}`, { replace: true });
        setTimeout(() => setOk(false), 2500);
      }
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/arabe_hash|duplicate|unique/i.test(msg) ? 'Ce texte arabe existe déjà (doublon détecté).' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/hadiths" className="hover:text-ink">Hadiths</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-ink text-3xl mt-1 mb-1">{editId ? 'Modifier le hadith' : 'Nouveau hadith'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8, aucune transformation).</p>

      {/* 1. Texte */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">1 · Le texte</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><SujetField className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. Allah existe sans endroit" /></div>
        <div className="mb-3.5"><label className={label}>Intro / narration <span className="text-muted font-normal">(optionnel)</span></label>
          <textarea className={`${field} min-h-[60px]`} value={f.intro} onChange={set('intro')} placeholder="Narration de contexte avant le texte arabe. Ex. « Le Prophète demanda à ses compagnons : »" />
          <p className="text-xs text-muted mt-1">Pour un hadith sous forme de dialogue : le propos qui introduit le texte arabe ci-dessous.</p>
        </div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-muted font-normal">(optionnel)</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} onFocus={caretBetween(AR_TEMPLATE.hadith)} placeholder="Colle ici le texte arabe (vocalisé)…" />
          <p className="text-xs text-muted mt-1">Unicité vérifiée automatiquement quand renseigné (pas de doublon). Laisse vide si non pertinent.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
      </section>

      {/* 2. Authenticité */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">2 · Authenticité & type</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Degré d’authenticité</label>
            <select className={field} value={f.degre_authenticite} onChange={set('degre_authenticite')}><option value="">—</option>{DEGRES.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className={label}>Type</label>
            <select className={field} value={f.type_hadith} onChange={set('type_hadith')}><option value="">—</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        </div>
        <div className="mt-3.5"><label className={label}>Jugé authentique par <span className="text-muted font-normal">(noms séparés par des virgules)</span></label><input className={field} value={f.juge_par} onChange={set('juge_par')} placeholder="Al-Bukhari, Ibn Hibban" /></div>
      </section>

      {/* 3. Narrateurs & rapporteurs */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">3 · Narrateurs & rapporteurs</h2>
        <p className="text-xs text-muted mb-4">Un hadith peut être rapporté par plusieurs savants et remonter à plusieurs Compagnons. Ajoute-les un par un&nbsp;: chacun devient filtrable individuellement sur le site.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Rapporteurs <span className="text-muted font-normal">(savants)</span></label>
            <MultiPicker options={savants} selected={rapporteurIds} onChange={setRapporteurIds} placeholder="Chercher un savant (ex. Al-Bukhari)…" />
          </div>
          <div>
            <label className={label}>Narrateurs <span className="text-muted font-normal">(Compagnons)</span></label>
            <MultiPicker options={narrateurs} selected={narrateurIds} onChange={setNarrateurIds} placeholder="Chercher un Compagnon…" />
            {!addingNarr ? (
              <button type="button" onClick={() => setAddingNarr(true)} className="mt-2 inline-flex items-center gap-1.5 text-ink font-semibold text-[13px] hover:underline">
                <Plus className="w-3.5 h-3.5" /> Nouveau narrateur
              </button>
            ) : (
              <div className="mt-3 grid gap-2.5 rounded-lg border border-dashed border-green-line bg-glass-tint/40 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-ink">Nouveau narrateur</p>
                  <button type="button" onClick={() => { setAddingNarr(false); setNewNarr({ nom: '', generation: 'sahabi', role: '', sexe: 'm' }); }} className="text-muted hover:text-red-600" aria-label="Annuler"><X className="w-4 h-4" /></button>
                </div>
                <div><label className={label}>Nom</label><input className={field} value={newNarr.nom} onChange={(e) => setNewNarr({ ...newNarr, nom: e.target.value })} placeholder="Ex. Anas ibn Malik" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div><label className={label}>Génération</label><select className={field} value={newNarr.generation} onChange={(e) => setNewNarr({ ...newNarr, generation: e.target.value })}>{GENERATIONS.map((g) => <option key={g}>{g}</option>)}</select></div>
                  <div><label className={label}>Rôle</label><select className={field} value={newNarr.role} onChange={(e) => setNewNarr({ ...newNarr, role: e.target.value })}>{ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
                  <div><label className={label}>Sexe</label><select className={field} value={newNarr.sexe} onChange={(e) => setNewNarr({ ...newNarr, sexe: e.target.value })}><option value="m">Homme</option><option value="f">Femme</option></select></div>
                </div>
                <p className="text-[12px] text-muted">Il sera créé puis ajouté aux narrateurs de ce hadith à l’enregistrement.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Sources */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">4 · Sources</h2>
        <p className="text-xs text-muted mb-4">Un hadith → un ou plusieurs ouvrages. L’affichage regroupe par auteur (ordre par décès).</p>
        {sources.map((s, i) => (
          <div key={s.key} className="grid grid-cols-[1fr_84px_1fr_auto] gap-2.5 items-end mb-2.5">
            <div>
              {i === 0 && <label className={label}>Ouvrage</label>}
              <select className={field} value={s.recueil_id} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, recueil_id: e.target.value } : x))}>
                <option value="">—</option>
                {recueils.map((r) => <option key={r.id} value={r.id}>{recueilLabel(r)}</option>)}
                <option value={NEW}>＋ Nouvel ouvrage…</option>
              </select>
            </div>
            <div>{i === 0 && <label className={label}>N°</label>}<input className={field} value={s.numero} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, numero: e.target.value } : x))} placeholder="3191" /></div>
            <div>{i === 0 && <label className={label}>Chapitre</label>}<input className={field} value={s.chapitre} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, chapitre: e.target.value } : x))} placeholder="(optionnel)" /></div>
            <button type="button" onClick={() => setSources((arr) => arr.length > 1 ? arr.filter((_, j) => j !== i) : arr)} className="h-[42px] w-[42px] grid place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
            {s.recueil_id === NEW && (
              <div className="col-span-4 grid sm:grid-cols-2 gap-2.5 rounded-lg border border-dashed border-green-line bg-glass-tint/40 p-3">
                <div><label className={label}>Titre du nouvel ouvrage</label><input className={field} value={s.new_titre} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, new_titre: e.target.value } : x))} placeholder="Ex. As-Sounan al-Koubra" /></div>
                <div><label className={label}>Auteur</label><select className={field} value={s.new_savant} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, new_savant: e.target.value } : x))}><option value="">—</option>{savants.map((sv) => <option key={sv.id} value={sv.id}>{sv.nom}</option>)}</select></div>
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setSources((arr) => [...arr, emptySrc()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-glass-tint text-ink font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter une source</button>
      </section>

      {/* 5. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">5 · Thèmes & mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(choisis dans la liste ou tape + Entrée — les thèmes se déduisent automatiquement)</span></label>
        <TagPicker
          suggestions={tagVocab}
          value={f.tag ? f.tag.split(',').map((s) => s.trim()).filter(Boolean) : []}
          onChange={(tags) => setF((p) => ({ ...p, tag: tags.join(', ') }))}
          placeholder="exemption, croyance…"
        />
        <div className="mt-3.5 rounded-lg border border-line bg-ground/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-accent font-semibold">Thèmes déduits</p>
          {derived.length === 0 ? (
            <p className="text-sm text-muted mt-1">Aucun (ajoute des tags reconnus, ou complète le mapping dans « Thèmes & mapping »).</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">{derived.map((t) => <span key={t.slug} className="text-xs bg-glass-tint text-accent border border-glass-border rounded-full px-2.5 py-0.5">{t.nom}</span>)}</div>
          )}
        </div>
      </section>

      {/* Dialogue — suite du hadith (optionnel) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">Dialogue — suite du hadith <span className="text-muted font-normal">(optionnel)</span></h2>
        <p className="text-xs text-muted mb-3.5">Pour un hadith sous forme d'échange (question → réponse → précision…). Le texte principal ci-dessus est le <b>1er passage</b> ; ajoute ici les passages suivants, dans l'ordre. L'<b>intro</b> est la narration qui précède (ex. «&nbsp;Les compagnons ont répondu&nbsp;:&nbsp;»).</p>

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
              <input className={field} value={sg.intro} onChange={(e) => setSeg(i, 'intro', e.target.value)} placeholder="Ex. Les compagnons ont répondu :" /></div>
            <div className="mb-2.5"><label className={label}>Texte arabe</label>
              <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[80px]`} value={sg.texte_arabe} onChange={(e) => setSeg(i, 'texte_arabe', e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div><label className={label}>Phonétique</label><input className={field} value={sg.phonetique} onChange={(e) => setSeg(i, 'phonetique', e.target.value)} /></div>
              <div><label className={label}>Traduction</label><input className={field} value={sg.texte_francais} onChange={(e) => setSeg(i, 'texte_francais', e.target.value)} /></div>
            </div>
            <div><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label>
              <textarea className={`${field} min-h-[60px]`} value={sg.explication} onChange={(e) => setSeg(i, 'explication', e.target.value)} /></div>
          </div>
        ))}

        <button type="button" onClick={() => setSegments((p) => [...p, emptySeg()])} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink font-semibold px-3.5 py-2 text-sm hover:border-green">
          <Plus className="w-4 h-4" /> Ajouter un passage
        </button>
      </section>

      {/* Variantes — autres versions du même hadith (optionnel) */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">Variantes <span className="text-muted font-normal">(optionnel)</span></h2>
        <p className="text-xs text-muted mb-3.5">Autre(s) version(s) du <b>même</b> hadith (wording ou narration différente). Chaque variante est affichée à part sur la fiche, sous «&nbsp;Autre version&nbsp;». L'<b>intro</b> introduit la variante (ex. «&nbsp;Dans une version rapportée par Mouslim&nbsp;:&nbsp;»), la <b>source</b> en précise la référence.</p>

        {variants.map((vr, i) => (
          <div key={i} className="rounded-lg border border-line bg-ground/40 p-3.5 mb-3">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-semibold text-accent">Variante {i + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => moveVar(i, -1)} disabled={i === 0} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Monter">↑</button>
                <button type="button" onClick={() => moveVar(i, 1)} disabled={i === variants.length - 1} className="px-2 py-1 text-xs rounded border border-line text-muted hover:text-ink disabled:opacity-40" aria-label="Descendre">↓</button>
                <button type="button" onClick={() => setVariants((p) => p.filter((_, j) => j !== i))} className="px-2 py-1 text-xs rounded border border-low/40 text-low hover:bg-low/10 inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="mb-2.5"><label className={label}>Intro / narration <span className="text-muted font-normal">(optionnel)</span></label>
              <input className={field} value={vr.intro} onChange={(e) => setVar(i, 'intro', e.target.value)} placeholder="Ex. Dans une version rapportée par Mouslim :" /></div>
            <div className="mb-2.5"><label className={label}>Texte arabe</label>
              <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[80px]`} value={vr.texte_arabe} onChange={(e) => setVar(i, 'texte_arabe', e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-2.5 mb-2.5">
              <div><label className={label}>Phonétique</label><input className={field} value={vr.phonetique} onChange={(e) => setVar(i, 'phonetique', e.target.value)} /></div>
              <div><label className={label}>Traduction</label><input className={field} value={vr.texte_francais} onChange={(e) => setVar(i, 'texte_francais', e.target.value)} /></div>
            </div>
            <div className="mb-2.5"><label className={label}>Source <span className="text-muted font-normal">(référence de cette variante)</span></label>
              <input className={field} value={vr.source} onChange={(e) => setVar(i, 'source', e.target.value)} placeholder="Ex. Sahih Mouslim, n° 2564" /></div>
            <div><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label>
              <textarea className={`${field} min-h-[60px]`} value={vr.explication} onChange={(e) => setVar(i, 'explication', e.target.value)} /></div>
          </div>
        ))}

        <button type="button" onClick={() => setVariants((p) => [...p, emptyVar()])} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface text-ink font-semibold px-3.5 py-2 text-sm hover:border-green">
          <Plus className="w-4 h-4" /> Ajouter une variante
        </button>
      </section>

      {/* 6. Texte équivoque */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-1">6 · Texte équivoque</h2>
        <p className="text-xs text-muted mb-3.5">Coche si ce hadith prête à confusion sur Allah&nbsp;: il apparaîtra <b>aussi</b> dans « Versets et hadiths équivoques », où tu saisis les arguments (sens juste, objection, réponse, blocs). Ces arguments seront alors visibles depuis la fiche du hadith.</p>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={isEquivoque} onChange={(e) => setIsEquivoque(e.target.checked)} className="w-4 h-4 accent-green" />
          <span className="text-[15px] text-ink font-medium">Ce hadith est équivoque</span>
        </label>
        {isEquivoque && editId && equivoqueId && (
          <Link to={`/admin/equivoques/${equivoqueId}`} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-green-line bg-glass-tint text-ink font-semibold px-3.5 py-2 text-sm hover:border-green transition-colors">
            Ajouter / éditer les arguments dans Équivoques →
          </Link>
        )}
        {isEquivoque && editId && !equivoqueId && (
          <p className="text-xs text-muted mt-3">Enregistre pour créer la fiche équivoque liée, puis reviens ici pour saisir les arguments.</p>
        )}
      </section>

      {/* Barre d'enregistrement */}
      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-ink text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="hadith" id={editId} label={f.sujet} redirectTo="/admin/hadiths" />}
          <Link to="/admin/hadiths" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-ink font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHadithForm;
