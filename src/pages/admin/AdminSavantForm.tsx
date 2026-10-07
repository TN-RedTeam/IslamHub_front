import React, { useEffect, useMemo, useState } from 'react';
import { DeleteEntryButton } from '../../components/admin/DeleteEntryButton';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { adminService, type EcoleRow, type SavantFormData } from '../../services/AdminService';
import { slugify } from '../../utils/slug';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

const GENERATIONS: { v: string; l: string }[] = [
  { v: '', l: '—' },
  { v: 'sahabi', l: 'Compagnon (Ṣaḥābī)' },
  { v: 'salaf', l: 'Salaf' },
  { v: 'tabii', l: 'Successeur (Tābiʿī)' },
  { v: 'tabi_tabii', l: 'Successeur des successeurs' },
  { v: 'khalaf', l: 'Khalaf (postérieur)' },
];
// Rang honorifique affiché sur le site (section). Pilote (generation, role).
type Rang = 'calife' | 'mere' | 'compagnon' | 'salaf' | 'autre';
const RANGS: { v: Rang; l: string }[] = [
  { v: 'calife', l: '👑 Calife bien-guidé' },
  { v: 'mere', l: '⭐ Mère des croyants' },
  { v: 'compagnon', l: '👥 Compagnon' },
  { v: 'salaf', l: '📖 Salaf (prédécesseur)' },
  { v: 'autre', l: '🎓 Autre savant' },
];
const SALAF_GENS = ['salaf', 'tabii', 'tabi_tabii'];
// (generation, role) -> rang affiché
const rangFrom = (generation: string, role: string): Rang =>
  role === 'calife_rachidoun' ? 'calife'
    : role === 'epouse_prophete' ? 'mere'
      : generation === 'sahabi' ? 'compagnon'
        : SALAF_GENS.includes(generation) ? 'salaf'
          : 'autre';
// rang choisi -> (generation, role) ; conserve la précision de génération si compatible
const applyRang = (r: Rang, gen: string): { generation: string; role: string } => {
  switch (r) {
    case 'calife': return { generation: 'sahabi', role: 'calife_rachidoun' };
    case 'mere': return { generation: 'sahabi', role: 'epouse_prophete' };
    case 'compagnon': return { generation: 'sahabi', role: '' };
    case 'salaf': return { generation: SALAF_GENS.includes(gen) ? gen : 'salaf', role: '' };
    default: return { generation: gen === 'khalaf' ? 'khalaf' : '', role: '' };
  }
};
// Profil : savant (science propre), narrateur (transmetteur), ou les deux.
const PROFILS = [
  { v: 'savant', l: 'Savant (science propre)' },
  { v: 'narrateur', l: 'Narrateur (transmetteur)' },
  { v: 'les_deux', l: 'Les deux' },
];
const profilFrom = (s: boolean, n: boolean) => (s && n ? 'les_deux' : n ? 'narrateur' : 'savant');

const blank = { nom: '', nom_arabe: '', slug: '', ecole_id: '', generation: '', naissance: '', deces: '', resume: '', biographie: '', domaines: '', role: '', est_savant: true, est_narrateur: false, publiee: true };

export const AdminSavantForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();

  const [ecoles, setEcoles] = useState<EcoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(editId));
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setRang = (e: React.ChangeEvent<HTMLSelectElement>) => setF((p) => ({ ...p, ...applyRang(e.target.value as Rang, p.generation) }));
  const setProfil = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setF((p) => ({ ...p, est_savant: v === 'savant' || v === 'les_deux', est_narrateur: v === 'narrateur' || v === 'les_deux' }));
  };

  useEffect(() => {
    adminService.listEcoles().then(setEcoles).catch(() => setEcoles([])).finally(() => { if (!editId) setLoading(false); });
  }, [editId]);

  useEffect(() => {
    if (!editId) return;
    adminService.getSavantForEdit(editId).then((s) => {
      if (!s) { setError('Savant introuvable.'); return; }
      setF({
        nom: s.nom ?? '', nom_arabe: s.nom_arabe ?? '', slug: s.slug ?? '', ecole_id: s.ecole_id != null ? String(s.ecole_id) : '',
        generation: s.generation ?? '', naissance: s.naissance ?? '', deces: s.deces ?? '', resume: s.resume ?? '', biographie: s.biographie ?? '',
        domaines: (s.domaines ?? []).join(', '), role: s.role ?? '',
        est_savant: !!s.est_savant, est_narrateur: !!s.est_narrateur, publiee: s.publiee ?? true,
      });
    }).catch(() => setError('Savant introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const autoSlug = slugTouched ? f.slug : slugify(f.nom);
  const canSave = useMemo(() => f.nom.trim().length > 0, [f.nom]);

  const buildPayload = (): SavantFormData => ({
    id: editId, nom: f.nom.trim(), nom_arabe: f.nom_arabe, slug: autoSlug,
    ecole_id: f.ecole_id ? Number(f.ecole_id) : null, generation: f.generation,
    naissance: f.naissance, deces: f.deces, resume: f.resume, biographie: f.biographie,
    domaines: f.domaines.split(',').map((d) => d.trim()).filter(Boolean), role: f.role,
    est_savant: f.est_savant, est_narrateur: f.est_narrateur, publiee: f.publiee,
  });

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminService.saveSavant(buildPayload());
      setOk(true); navigate(`/admin/savants/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur à l’enregistrement.';
      setError(/savants_nom_key|duplicate|unique/i.test(msg) ? 'Un savant porte déjà ce nom.' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/savants" className="hover:text-ink">Savants</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-ink text-3xl mt-1 mb-1">{editId ? 'Modifier la fiche savant' : 'Nouvelle fiche savant'}</h1>
      <p className="text-muted text-sm mb-6">Le nom arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Identité */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">1 · Identité</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Nom <span className="text-red-600">*</span></label><input className={field} value={f.nom} onChange={set('nom')} placeholder="Al-Imām Al-Shāfiʿī" /></div>
          <div><label className={label}>Nom arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic-name text-xl text-right`} value={f.nom_arabe} onChange={set('nom_arabe')} placeholder="الإمام الشافعي" /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Slug (URL) <span className="text-muted font-normal">— généré depuis le nom</span></label>
          <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF((p) => ({ ...p, slug: e.target.value })); }} placeholder="al-shafii" /></div>
        <label className="mt-3.5 flex items-start gap-2.5 cursor-pointer rounded-lg border border-line bg-ground/40 p-3">
          <input type="checkbox" checked={f.publiee} onChange={(e) => setF((p) => ({ ...p, publiee: e.target.checked }))} className="w-4 h-4 accent-green mt-0.5" />
          <span className="text-[13px] text-ink"><b>Publier la fiche</b> dans « Biographies » <span className="text-muted">— décoche pour masquer la carte tant que la bio n'est pas prête. Le nom reste affiché dans l'attribution des hadiths.</span></span>
        </label>
      </section>

      {/* 2. Repères */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">2 · Repères</h2>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <div><label className={label}>École (madhhab)</label>
            <select className={field} value={f.ecole_id} onChange={set('ecole_id')}>
              <option value="">—</option>
              {ecoles.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select></div>
          <div><label className={label}>Rang <span className="text-muted font-normal">(section sur le site)</span></label>
            <select className={field} value={rangFrom(f.generation, f.role)} onChange={setRang}>
              {RANGS.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
            <p className="text-xs text-muted mt-1">Détermine la section où la fiche apparaît dans « Savants », par ordre de mérite.</p>
          </div>
          <div><label className={label}>Génération <span className="text-muted font-normal">(précision)</span></label>
            <select className={field} value={f.generation} onChange={set('generation')}>
              {GENERATIONS.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
            </select>
            <p className="text-xs text-muted mt-1">Affine l'époque (badge). Ex. Salaf → Successeur (Tābiʿī).</p>
          </div>
        </div>
        <div className="mt-3.5"><label className={label}>Profil</label>
          <select className={field} value={profilFrom(f.est_savant, f.est_narrateur)} onChange={setProfil}>
            {PROFILS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
          <p className="text-xs text-muted mt-1">« Narrateur » = transmetteur de hadiths (la plupart des compagnons) ; « Savant » = a une science propre (paroles). Les califes/compagnons qui ont aussi des paroles (Ali, Abou Bakr, Omar, Aïcha…) sont « Les deux ».</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
          <div><label className={label}>Naissance</label><input className={field} value={f.naissance} onChange={set('naissance')} placeholder="150 H / 767" /></div>
          <div><label className={label}>Décès</label><input className={field} value={f.deces} onChange={set('deces')} placeholder="204 H / 820" /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Domaines <span className="text-muted font-normal">(séparés par des virgules)</span></label>
          <input className={field} value={f.domaines} onChange={set('domaines')} placeholder="Fiqh, Hadith, Usul al-fiqh" /></div>
      </section>

      {/* 3. Biographie */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">3 · Biographie</h2>
        <div className="mb-3.5"><label className={label}>Résumé <span className="text-muted font-normal">(1-2 phrases, affiché en tête de fiche)</span></label>
          <textarea className={`${field} min-h-[60px]`} value={f.resume} onChange={set('resume')} /></div>
        <div><label className={label}>Biographie complète <span className="text-muted font-normal">(Markdown)</span></label>
          <textarea className={`${field} min-h-[220px]`} value={f.biographie} onChange={set('biographie')} placeholder="La biographie, en Markdown…" /></div>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-ink text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          {editId && <DeleteEntryButton kind="savant" id={editId} label={f.nom} redirectTo="/admin/savants" />}
          <Link to="/admin/savants" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !canSave} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSavantForm;
