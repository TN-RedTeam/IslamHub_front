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
const ROLES: { v: string; l: string }[] = [
  { v: '', l: '— aucun' },
  { v: 'calife_rachidoun', l: 'Calife bien-guidé' },
  { v: 'epouse_prophete', l: 'Mère des croyants' },
];
const blank = { nom: '', nom_arabe: '', slug: '', ecole_id: '', generation: '', naissance: '', deces: '', resume: '', biographie: '', domaines: '', role: '' };

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
      <p className="text-xs text-muted"><Link to="/admin/savants" className="hover:text-green-deep">Savants</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-1">{editId ? 'Modifier la fiche savant' : 'Nouvelle fiche savant'}</h1>
      <p className="text-muted text-sm mb-6">Le nom arabe collé ici est enregistré tel quel (UTF-8).</p>

      {/* 1. Identité */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">1 · Identité</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Nom <span className="text-red-600">*</span></label><input className={field} value={f.nom} onChange={set('nom')} placeholder="Al-Imām Al-Shāfiʿī" /></div>
          <div><label className={label}>Nom arabe</label><input dir="rtl" lang="ar" className={`${field} font-arabic-name text-xl text-right`} value={f.nom_arabe} onChange={set('nom_arabe')} placeholder="الإمام الشافعي" /></div>
        </div>
        <div className="mt-3.5"><label className={label}>Slug (URL) <span className="text-muted font-normal">— généré depuis le nom</span></label>
          <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF((p) => ({ ...p, slug: e.target.value })); }} placeholder="al-shafii" /></div>
      </section>

      {/* 2. Repères */}
      <section className="rounded-card border border-line bg-surface p-5 mb-4">
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">2 · Repères</h2>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <div><label className={label}>École (madhhab)</label>
            <select className={field} value={f.ecole_id} onChange={set('ecole_id')}>
              <option value="">—</option>
              {ecoles.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select></div>
          <div><label className={label}>Génération</label>
            <select className={field} value={f.generation} onChange={set('generation')}>
              {GENERATIONS.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
            </select></div>
          <div><label className={label}>Rôle honorifique <span className="text-muted font-normal">(Compagnons)</span></label>
            <select className={field} value={f.role} onChange={set('role')}>
              {ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
            <p className="text-xs text-muted mt-1">Classe la fiche dans « Compagnons » sur le site. Choisis la génération <b>Compagnon</b> pour qu'elle y apparaisse même sans rôle.</p>
          </div>
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
        <h2 className="font-display font-semibold text-green-deep text-lg mb-4">3 · Biographie</h2>
        <div className="mb-3.5"><label className={label}>Résumé <span className="text-muted font-normal">(1-2 phrases, affiché en tête de fiche)</span></label>
          <textarea className={`${field} min-h-[60px]`} value={f.resume} onChange={set('resume')} /></div>
        <div><label className={label}>Biographie complète <span className="text-muted font-normal">(Markdown)</span></label>
          <textarea className={`${field} min-h-[220px]`} value={f.biographie} onChange={set('biographie')} placeholder="La biographie, en Markdown…" /></div>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
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
