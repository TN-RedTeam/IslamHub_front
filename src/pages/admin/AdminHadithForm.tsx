import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type NarrateurRow, type RecueilRow, type SavantRow, type HadithFormData, type HadithSourceInput } from '../../services/AdminService';
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

export const AdminHadithForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [narrateurs, setNarrateurs] = useState<NarrateurRow[]>([]);
  const [recueils, setRecueils] = useState<RecueilRow[]>([]);
  const [savants, setSavants] = useState<SavantRow[]>([]);
  const [rapporteurs, setRapporteurs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Champs
  const [f, setF] = useState({
    sujet: '', texte_arabe: '', texte_francais: '', phonetique: '', explication: '',
    degre_authenticite: 'Sahih', type_hadith: '', juge_par: '', rapporteur: '', tag: '',
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const [narr, setNarr] = useState('');                 // nom sélectionné, ou NEW
  const [newNarr, setNewNarr] = useState({ nom: '', generation: 'sahabi', role: '', sexe: 'm' });
  const [sources, setSources] = useState<Src[]>([emptySrc()]);
  const [derived, setDerived] = useState<ThemeRef[]>([]);

  useEffect(() => {
    Promise.all([adminService.listNarrateurs(), adminService.listRecueils(), adminService.listSavants(), adminService.listRapporteurs()])
      .then(([n, r, s, rap]) => { setNarrateurs(n); setRecueils(r); setSavants(s); setRapporteurs(rap); })
      .catch(() => setError("Impossible de charger les référentiels."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editId) return;
    adminService.getHadithForEdit(editId).then((h) => {
      if (!h) return;
      setF({
        sujet: h.sujet ?? '', texte_arabe: h.texte_arabe ?? '', texte_francais: h.texte_francais ?? '',
        phonetique: h.phonetique ?? '', explication: h.explication ?? '', degre_authenticite: h.degre_authenticite ?? '',
        type_hadith: h.type_hadith ?? '', juge_par: h.juge_par ?? '', rapporteur: h.rapporteur ?? '', tag: h.tag ?? '',
      });
      setNarr(h.narrateur ?? '');
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
  const canSave = useMemo(() => f.sujet.trim() && f.texte_arabe.trim(), [f.sujet, f.texte_arabe]);

  const buildPayload = (): HadithFormData => ({
    id: editId,
    ...f,
    narrateur: narr === NEW ? newNarr.nom : narr,
    new_narrateur: narr === NEW && newNarr.nom.trim() ? newNarr : null,
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
        setF({ sujet: '', texte_arabe: '', texte_francais: '', phonetique: '', explication: '', degre_authenticite: 'Sahih', type_hadith: '', juge_par: '', rapporteur: '', tag: '' });
        setNarr(''); setSources([emptySrc()]); setTimeout(() => setOk(false), 2500);
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
      <p className="text-xs text-muted"><Link to="/admin/hadiths" className="hover:text-green-deep">Hadiths</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier le hadith' : 'Nouveau hadith'}</h1>
      <p className="text-muted text-sm mb-6">Le texte arabe collé ici est enregistré tel quel (UTF-8, aucune transformation).</p>

      {/* 1. Texte */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Le texte</h2>
        <div className="mb-3.5"><label className={label}>Sujet <span className="text-red-600">*</span></label><input className={field} value={f.sujet} onChange={set('sujet')} placeholder="Ex. Allah existe sans endroit" /></div>
        <div className="mb-3.5"><label className={label}>Texte arabe <span className="text-red-600">*</span></label>
          <textarea dir="rtl" lang="ar" className={`${field} font-arabic text-2xl leading-loose text-right min-h-[90px]`} value={f.texte_arabe} onChange={set('texte_arabe')} placeholder="Colle ici le texte arabe (vocalisé)…" />
          <p className="text-xs text-muted mt-1">Unicité vérifiée automatiquement (pas de doublon).</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Phonétique</label><input className={field} value={f.phonetique} onChange={set('phonetique')} /></div>
          <div><label className={label}>Traduction française</label><input className={field} value={f.texte_francais} onChange={set('texte_francais')} /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Explication <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[70px]`} value={f.explication} onChange={set('explication')} /></div>
      </section>

      {/* 2. Authenticité */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Authenticité & type</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Degré d’authenticité</label>
            <select className={field} value={f.degre_authenticite} onChange={set('degre_authenticite')}><option value="">—</option>{DEGRES.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className={label}>Type</label>
            <select className={field} value={f.type_hadith} onChange={set('type_hadith')}><option value="">—</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        </div>
        <div className="mt-3.5"><label className={label}>Jugé authentique par <span className="text-muted font-normal">(noms séparés par des virgules)</span></label><input className={field} value={f.juge_par} onChange={set('juge_par')} placeholder="Al-Bukhari, Ibn Hibban" /></div>
      </section>

      {/* 3. Narrateur & rapporteur */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">3 · Narrateur & rapporteur</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div>
            <label className={label}>Narrateur <span className="text-muted font-normal">(le Compagnon)</span></label>
            <select className={field} value={narr} onChange={(e) => setNarr(e.target.value)}>
              <option value="">—</option>
              {narrateurs.map((n) => <option key={n.id} value={n.nom}>{n.nom}</option>)}
              <option value={NEW}>＋ Nouveau narrateur…</option>
            </select>
          </div>
          <div>
            <label className={label}>Rapporteur <span className="text-muted font-normal">(liste + saisie libre)</span></label>
            <input className={field} list="rapporteurs-list" value={f.rapporteur} onChange={set('rapporteur')} placeholder="Al-Bukhari" />
            <datalist id="rapporteurs-list">{rapporteurs.map((r) => <option key={r} value={r} />)}</datalist>
          </div>
        </div>
        {narr === NEW && (
          <div className="mt-3.5 grid sm:grid-cols-2 gap-3.5 rounded-lg border border-dashed border-green-line bg-green-soft/40 p-3.5">
            <div><label className={label}>Nom du narrateur</label><input className={field} value={newNarr.nom} onChange={(e) => setNewNarr({ ...newNarr, nom: e.target.value })} placeholder="Ex. Anas ibn Malik" /></div>
            <div><label className={label}>Génération</label><select className={field} value={newNarr.generation} onChange={(e) => setNewNarr({ ...newNarr, generation: e.target.value })}>{GENERATIONS.map((g) => <option key={g}>{g}</option>)}</select></div>
            <div><label className={label}>Rôle (badge)</label><select className={field} value={newNarr.role} onChange={(e) => setNewNarr({ ...newNarr, role: e.target.value })}>{ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
            <div><label className={label}>Sexe (honorifique)</label><select className={field} value={newNarr.sexe} onChange={(e) => setNewNarr({ ...newNarr, sexe: e.target.value })}><option value="m">Homme</option><option value="f">Femme</option></select></div>
          </div>
        )}
      </section>

      {/* 4. Sources */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-1">4 · Sources</h2>
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
              <div className="col-span-4 grid sm:grid-cols-2 gap-2.5 rounded-lg border border-dashed border-green-line bg-green-soft/40 p-3">
                <div><label className={label}>Titre du nouvel ouvrage</label><input className={field} value={s.new_titre} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, new_titre: e.target.value } : x))} placeholder="Ex. As-Sounan al-Koubra" /></div>
                <div><label className={label}>Auteur</label><select className={field} value={s.new_savant} onChange={(e) => setSources((arr) => arr.map((x, j) => j === i ? { ...x, new_savant: e.target.value } : x))}><option value="">—</option>{savants.map((sv) => <option key={sv.id} value={sv.id}>{sv.nom}</option>)}</select></div>
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setSources((arr) => [...arr, emptySrc()])} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-line bg-green-soft text-green-deep font-semibold px-3.5 py-2 text-sm"><Plus className="w-4 h-4" /> Ajouter une source</button>
      </section>

      {/* 5. Thèmes */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">5 · Thèmes & mots-clés</h2>
        <label className={label}>Tags <span className="text-muted font-normal">(séparés par des virgules — les thèmes se déduisent automatiquement)</span></label>
        <input className={field} value={f.tag} onChange={set('tag')} placeholder="exemption, croyance" />
        <div className="mt-3.5 rounded-lg border border-line bg-ground/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold font-semibold">Thèmes déduits</p>
          {derived.length === 0 ? (
            <p className="text-sm text-muted mt-1">Aucun (ajoute des tags reconnus, ou complète le mapping dans « Thèmes & mapping »).</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">{derived.map((t) => <span key={t.slug} className="text-xs bg-gold-soft text-[#7a5a17] border border-[#e6d3a3] rounded-full px-2.5 py-0.5">{t.nom}</span>)}</div>
          )}
        </div>
      </section>

      {/* Barre d'enregistrement */}
      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/admin/hadiths" className="text-muted text-sm px-3 py-2">Annuler</Link>
          {!editId && <button disabled={busy || !canSave} onClick={() => save(true)} className="rounded-lg border border-line bg-surface text-green-deep font-semibold px-4 py-2.5 disabled:opacity-50">Enregistrer & nouveau</button>}
          <button disabled={busy || !canSave} onClick={() => save(false)} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHadithForm;
