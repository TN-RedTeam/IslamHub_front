import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { adminRecits } from '../../services/AdminService';
import { slugify } from '../../utils/slug';
import type { RecitCategorie } from '../../types';

const label = 'block text-[13px] font-semibold text-ink mb-1.5';
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

export const AdminRecitForm: React.FC = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [f, setF] = useState<{ titre: string; categorie: RecitCategorie; slug: string; contenu_md: string; image_url: string; ordre: string }>(
    { titre: '', categorie: 'prophetes', slug: '', contenu_md: '', image_url: '', ordre: '0' });

  useEffect(() => {
    if (!editId) return;
    adminRecits.get(editId).then((r) => {
      if (!r) { setError('Récit introuvable.'); return; }
      setF({ titre: r.titre, categorie: r.categorie, slug: r.slug, contenu_md: r.contenu_md ?? '', image_url: r.image_url ?? '', ordre: String(r.ordre ?? 0) });
      setSlugTouched(true);
    }).catch(() => setError('Récit introuvable.')).finally(() => setLoading(false));
  }, [editId]);

  const autoSlug = slugTouched ? f.slug : slugify(f.titre);

  const save = async () => {
    setBusy(true); setError(null); setOk(false);
    try {
      const newId = await adminRecits.save({ id: editId ?? undefined, titre: f.titre, categorie: f.categorie, slug: autoSlug, contenu_md: f.contenu_md, image_url: f.image_url, ordre: Number(f.ordre) || 0 });
      setOk(true); navigate(`/admin/recits/${newId}`, { replace: true }); setTimeout(() => setOk(false), 2500);
    } catch (e) {
      const msg = (e as Error).message || 'Erreur.';
      setError(/duplicate|unique/i.test(msg) ? 'Ce slug existe déjà — change-le.' : msg);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;

  return (
    <div className="max-w-3xl px-6 py-8 pb-28">
      <p className="text-xs text-muted"><Link to="/admin/recits" className="hover:text-green-deep">Récits</Link> · {editId ? 'Modifier' : 'Nouveau'}</p>
      <h1 className="font-display font-semibold text-green-deep text-3xl mt-1 mb-6">{editId ? 'Modifier le récit' : 'Nouveau récit'}</h1>

      <section className="rounded-card border border-line bg-surface p-5 space-y-3.5">
        <div><label className={label}>Titre <span className="text-red-600">*</span></label><input className={field} value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} placeholder="Ex. Le prophète Adam" /></div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className={label}>Catégorie</label>
            <select className={field} value={f.categorie} onChange={(e) => setF({ ...f, categorie: e.target.value as RecitCategorie })}>
              <option value="prophetes">Histoires des Prophètes</option>
              <option value="vertueux">Vies des vertueux</option>
              <option value="histoires du passe">Histoires du passé</option>
            </select></div>
          <div><label className={label}>Ordre</label><input className={field} type="number" value={f.ordre} onChange={(e) => setF({ ...f, ordre: e.target.value })} /></div>
        </div>
        <div><label className={label}>Slug (URL) <span className="text-muted font-normal">— généré depuis le titre</span></label>
          <input className={field} value={autoSlug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} placeholder="adam" /></div>
        <div><label className={label}>Image (URL, optionnel)</label><input className={field} value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} placeholder="https://…/references/….webp" /></div>
        <div><label className={label}>Contenu <span className="text-muted font-normal">(Markdown)</span></label><textarea className={`${field} min-h-[220px]`} value={f.contenu_md} onChange={(e) => setF({ ...f, contenu_md: e.target.value })} placeholder="Le récit, en Markdown…" /></div>
      </section>

      <div className="fixed bottom-0 left-0 md:left-[230px] right-0 flex items-center gap-3 px-6 py-3.5 bg-ivory/95 backdrop-blur border-t border-line">
        {ok && <span className="inline-flex items-center gap-1.5 text-green-deep text-sm font-medium"><Check className="w-4 h-4" /> Enregistré</span>}
        {error && <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</span>}
        <div className="ml-auto flex items-center gap-2.5">
          <Link to="/admin/recits" className="text-muted text-sm px-3 py-2">Annuler</Link>
          <button disabled={busy || !f.titre.trim()} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-green text-white font-semibold px-5 py-2.5 hover:bg-green-deep transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRecitForm;
