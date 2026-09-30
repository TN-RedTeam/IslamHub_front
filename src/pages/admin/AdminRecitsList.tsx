import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, ArrowUp, ArrowDown, ScrollText, BookMarked, Pencil } from 'lucide-react';
import { adminRecits, type RecitRow } from '../../services/AdminService';
import { CountBadge, IdTag } from '../../components/admin/AdminListUI';
import type { RecitCategorie } from '../../types';

// Mêmes sections que sur le site public.
const SECTIONS: { categorie: RecitCategorie; titre: string; sous_titre: string }[] = [
  { categorie: 'prophetes', titre: 'Histoires des Prophètes', sous_titre: 'Qiṣaṣ al-anbiyāʾ' },
  { categorie: 'vertueux', titre: 'Vies des vertueux', sous_titre: 'Awliyāʾ et pieux prédécesseurs' },
  { categorie: 'histoires du passe', titre: 'Histoires du passé', sous_titre: 'Récits et leçons d’autrefois' },
];

const byOrdre = (a: RecitRow, b: RecitRow) => (a.ordre - b.ordre) || (a.id - b.id);

const Brouillon: React.FC = () => (
  <span className="text-[10px] font-semibold text-warn bg-warn/10 border border-warn/40 rounded-full px-1.5 py-0.5 shrink-0">Brouillon</span>
);

export const AdminRecitsList: React.FC = () => {
  const [items, setItems] = useState<RecitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => adminRecits.list().then(setItems).catch(() => setItems([]));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  // Catégories dans l'ordre du site, puis toute catégorie éventuelle non prévue.
  const cats = useMemo(() => {
    const present = Array.from(new Set(items.map((r) => r.categorie)));
    const known = SECTIONS.map((s) => s.categorie).filter((c) => present.includes(c));
    const extra = present.filter((c) => !SECTIONS.some((s) => s.categorie === c));
    return [...known, ...extra];
  }, [items]);

  // Réordonne un groupe de frères/sœurs : ordre séquentiel 0..n, persiste, recharge.
  const move = async (siblings: RecitRow[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (busy || j < 0 || j >= siblings.length) return;
    const arr = [...siblings];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setBusy(true);
    try {
      await Promise.all(arr.map((s, i) => (s.ordre !== i ? adminRecits.setOrdre(s.id, i) : null)).filter(Boolean) as Promise<void>[]);
      await load();
    } catch { /* la liste reste inchangée */ }
    finally { setBusy(false); }
  };

  // Flèches ↑/↓ réutilisables (parent ou sous-texte).
  const Arrows: React.FC<{ siblings: RecitRow[]; index: number; className?: string }> = ({ siblings, index, className = '' }) => (
    <span className={`flex items-center gap-0.5 ${className}`}>
      <button type="button" aria-label="Monter" disabled={busy || index === 0} onClick={() => move(siblings, index, -1)} className="grid place-items-center w-6 h-6 rounded-md bg-glass border border-glass-border text-muted hover:text-accent disabled:opacity-25"><ArrowUp className="w-3.5 h-3.5" /></button>
      <button type="button" aria-label="Descendre" disabled={busy || index === siblings.length - 1} onClick={() => move(siblings, index, 1)} className="grid place-items-center w-6 h-6 rounded-md bg-glass border border-glass-border text-muted hover:text-accent disabled:opacity-25"><ArrowDown className="w-3.5 h-3.5" /></button>
    </span>
  );

  return (
    <div className="max-w-5xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-1.5">
        <h1 className="font-display font-semibold text-ink text-3xl">Récits</h1>
        <CountBadge n={loading ? null : items.length} />
        <Link to="/admin/recits/nouveau" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-accent-deep text-white font-semibold px-4 py-2 hover:brightness-110 transition"><Plus className="w-4 h-4" /> Nouveau récit</Link>
      </div>
      <p className="text-sm text-muted mb-6">Présentés comme sur le site, par catégorie. Les sous-textes d'un prophète sont repliés sous sa carte ; les flèches règlent l'ordre.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-muted italic py-8">Aucun récit.</p>
      ) : (
        <div className="space-y-11">
          {cats.map((cat, ci) => {
            const meta = SECTIONS.find((s) => s.categorie === cat);
            const all = items.filter((r) => r.categorie === cat);
            const tops = all.filter((r) => r.parent_recit_id == null).sort(byOrdre);
            const kidsOf = (pid: number) => all.filter((r) => r.parent_recit_id === pid).sort(byOrdre);
            return (
              <section key={cat}>
                <div className="flex items-baseline gap-2.5 mb-4">
                  {ci === 0 ? <ScrollText className="h-5 w-5 text-accent shrink-0" aria-hidden /> : <BookMarked className="h-5 w-5 text-accent shrink-0" aria-hidden />}
                  <h2 className="font-display font-bold text-2xl text-ink">{meta?.titre ?? cat}</h2>
                  {meta && <span className="text-sm text-muted">— {meta.sous_titre}</span>}
                  <span className="ml-1 text-[11px] font-semibold text-accent bg-glass-tint border border-glass-border rounded-full px-2 py-0.5 tabular-nums">{all.length}</span>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                  {tops.map((t, i) => {
                    const kids = kidsOf(t.id);
                    return (
                      <div key={t.id} className="group relative flex flex-col overflow-hidden rounded-card border border-glass-border bg-glass shadow-glass">
                        {/* Ordre (coin haut-droit) */}
                        <Arrows siblings={tops} index={i} className="absolute top-2 right-2 z-10" />

                        <Link to={`/admin/recits/${t.id}`} className="block">
                          {t.image_url ? (
                            <div className="aspect-[16/9] overflow-hidden bg-glass-tint">
                              <img src={t.image_url} alt={t.titre} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="aspect-[16/9] grid place-items-center bg-glass-tint text-accent/40"><ScrollText className="w-8 h-8" /></div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-1"><IdTag id={t.id} />{!t.published && <Brouillon />}{kids.length > 0 && <span className="text-[11px] text-muted">· {kids.length} sous-texte{kids.length > 1 ? 's' : ''}</span>}</div>
                            <h3 className="font-display font-bold text-ink leading-snug group-hover:text-accent">{t.titre}</h3>
                          </div>
                        </Link>

                        {kids.length > 0 && (
                          <details className="border-t border-glass-border">
                            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden px-4 py-2 text-[13px] font-semibold text-accent hover:bg-glass-tint">Sous-textes ({kids.length})</summary>
                            <ul className="px-3 pb-2 divide-y divide-glass-border">
                              {kids.map((k, ki) => (
                                <li key={k.id} className="flex items-center gap-2 py-1.5">
                                  <Arrows siblings={kids} index={ki} />
                                  <IdTag id={k.id} />
                                  <Link to={`/admin/recits/${k.id}`} className="min-w-0 flex-1 text-[13.5px] text-ink truncate hover:text-accent">{k.titre}</Link>
                                  {!k.published && <Brouillon />}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}

                        <Link to={`/admin/recits/${t.id}`} className="mt-auto flex items-center justify-center gap-1.5 border-t border-glass-border px-4 py-2 text-[13px] font-semibold text-muted hover:text-accent hover:bg-glass-tint"><Pencil className="w-3.5 h-3.5" /> Modifier</Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRecitsList;
