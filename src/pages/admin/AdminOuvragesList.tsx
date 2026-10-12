import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Check, Merge } from 'lucide-react';
import { adminService, type RecueilDupGroup } from '../../services/AdminService';

export const AdminOuvragesList: React.FC = () => {
  const [groups, setGroups] = useState<RecueilDupGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keep, setKeep] = useState<Record<string, number>>({}); // cle -> id gardé
  const [busy, setBusy] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.recueilsDoublons()
      .then((g) => {
        setGroups(g);
        // défaut : garder le plus utilisé (1er, déjà trié par usages desc)
        setKeep(Object.fromEntries(g.map((x) => [x.cle, x.items[0]?.id])));
        setError(null);
      })
      .catch((e) => setError((e as Error).message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const merge = async (g: RecueilDupGroup) => {
    const keepId = keep[g.cle];
    if (!keepId) return;
    const drop = g.items.map((i) => i.id).filter((id) => id !== keepId);
    setBusy(g.cle); setError(null);
    try {
      const r = await adminService.recueilMerge(keepId, drop);
      setOk(`Fusionné : ${drop.length} doublon(s) supprimé(s), ${r.moved} liaison(s) repointée(s).`);
      setTimeout(() => setOk(null), 3000);
      load();
    } catch (e) {
      setError((e as Error).message || 'Échec de la fusion (la fonction SQL admin_recueil_merge est-elle exécutée ?).');
    } finally { setBusy(null); }
  };

  return (
    <div className="max-w-3xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="font-display font-semibold text-ink text-3xl">Ouvrages — doublons</h1>
        {ok && <span className="inline-flex items-center gap-1 text-sm text-green"><Check className="w-4 h-4" /> {ok}</span>}
      </div>
      <p className="text-sm text-muted mb-5">
        Recueils au même titre (accents/casse ignorés). Choisis celui à <b>garder</b> ; les autres sont fusionnés
        dedans (leurs liaisons de hadiths sont repointées, puis les doublons supprimés).
      </p>
      {error && <p className="mb-4 text-red-600 text-sm inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : groups.length === 0 ? (
        <p className="text-muted italic py-8">Aucun doublon d'ouvrage. 👍</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((g) => (
            <li key={g.cle} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-semibold text-ink">{g.items[0]?.titre}</span>
                <span className="text-[12px] text-muted">· {g.n} exemplaires</span>
                <button type="button" disabled={busy === g.cle} onClick={() => merge(g)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-3.5 py-2 text-sm hover:bg-green-deep disabled:opacity-50">
                  {busy === g.cle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />} Fusionner
                </button>
              </div>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-2.5 text-[14px]">
                    <input type="radio" name={`keep-${g.cle}`} checked={keep[g.cle] === it.id}
                      onChange={() => setKeep((k) => ({ ...k, [g.cle]: it.id }))} className="accent-green" />
                    <span className="font-mono text-[11px] text-muted">#{it.id}</span>
                    <span className="text-ink">{it.titre}</span>
                    {it.auteur && <span className="text-muted">· {it.auteur}</span>}
                    <span className="ml-auto text-[12px] text-muted">{it.usages} usage{it.usages > 1 ? 's' : ''}</span>
                    {keep[g.cle] === it.id && <span className="text-[11px] text-green font-semibold">à garder</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminOuvragesList;
