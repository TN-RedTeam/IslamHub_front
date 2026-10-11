import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, X, Plus, AlertTriangle, Check } from 'lucide-react';
import { adminService, type ThemeMapping } from '../../services/AdminService';

export const AdminThemesList: React.FC = () => {
  const [data, setData] = useState<ThemeMapping>({ themes: [], unmapped: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // clé de l'action en cours
  const [ok, setOk] = useState<string | null>(null);
  // thème choisi pour chaque tag non mappé
  const [pick, setPick] = useState<Record<string, string>>({});
  // saisie d'un nouveau tag par thème
  const [newTag, setNewTag] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    adminService.themesMapping()
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError((e as Error).message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 2000); };

  const add = async (tag: string, theme: string, key: string) => {
    if (!tag.trim() || !theme) return;
    setBusy(key); setError(null);
    try { await adminService.addThemeTag(tag.trim(), theme); flash('Correspondance ajoutée'); load(); }
    catch (e) { setError((e as Error).message || "Échec de l'ajout (la fonction SQL est-elle exécutée ?)"); }
    finally { setBusy(null); }
  };
  const remove = async (tag: string, theme: string) => {
    const key = `rm:${theme}:${tag}`;
    setBusy(key); setError(null);
    try { await adminService.removeThemeTag(tag, theme); flash('Correspondance retirée'); load(); }
    catch (e) { setError((e as Error).message || 'Échec du retrait.'); }
    finally { setBusy(null); }
  };

  const themeOptions = data.themes.map((t) => ({ slug: t.slug, nom: t.nom }));

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="font-display font-semibold text-ink text-3xl">Thèmes &amp; mapping</h1>
        {ok && <span className="inline-flex items-center gap-1 text-sm text-green"><Check className="w-4 h-4" /> {ok}</span>}
      </div>
      <p className="text-sm text-muted mb-5">
        Un thème est déduit d'un <b>tag</b> via ces correspondances. Associer un tag à un thème rattache aussi
        les contenus existants ; le retirer les délie (si aucun autre tag ne justifie le thème).
      </p>
      {error && <p className="mb-4 text-red-600 text-sm inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</p>}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : (
        <>
          {/* Tags sans thème */}
          <section className="rounded-card border border-line bg-surface p-5 mb-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-1">Tags sans thème <span className="text-muted font-normal">({data.unmapped.length})</span></h2>
            <p className="text-xs text-muted mb-3.5">Ces tags sont utilisés mais ne génèrent aucun thème. Associe-les.</p>
            {data.unmapped.length === 0 ? (
              <p className="text-sm text-muted italic">Tous les tags sont rattachés à un thème. 👍</p>
            ) : (
              <ul className="space-y-2">
                {data.unmapped.map((tag) => {
                  const key = `add:${tag}`;
                  return (
                    <li key={tag} className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-glass-tint text-ink border border-line text-[13px]">{tag}</span>
                      <span className="text-muted text-sm">→</span>
                      <select value={pick[tag] ?? ''} onChange={(e) => setPick((p) => ({ ...p, [tag]: e.target.value }))}
                        className="rounded-lg border border-line bg-surface text-ink px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green">
                        <option value="">— choisir un thème —</option>
                        {themeOptions.map((t) => <option key={t.slug} value={t.slug}>{t.nom}</option>)}
                      </select>
                      <button type="button" disabled={!pick[tag] || busy === key} onClick={() => add(tag, pick[tag], key)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50">
                        {busy === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Mapper
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Thèmes + leurs tags */}
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-3.5">Thèmes <span className="text-muted font-normal">({data.themes.length})</span></h2>
            <ul className="space-y-4">
              {data.themes.map((th) => {
                const addKey = `addto:${th.slug}`;
                return (
                  <li key={th.slug} className="rounded-lg border border-line p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-ink">{th.nom}</span>
                      {th.famille && <span className="text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-muted border border-line">{th.famille}</span>}
                      <span className="text-[11px] text-muted">· {th.tags.length} tag{th.tags.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {th.tags.length === 0 && <span className="text-sm text-muted italic">Aucun tag.</span>}
                      {th.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-glass-tint text-ink border border-green-line px-2.5 py-1 text-[13px]">
                          {tag}
                          <button type="button" disabled={busy === `rm:${th.slug}:${tag}`} onClick={() => remove(tag, th.slug)} className="text-ink/60 hover:text-red-600" aria-label={`Retirer ${tag}`}>
                            {busy === `rm:${th.slug}:${tag}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input value={newTag[th.slug] ?? ''} onChange={(e) => setNewTag((p) => ({ ...p, [th.slug]: e.target.value }))}
                        placeholder="ajouter un tag à ce thème…"
                        onKeyDown={(e) => { if (e.key === 'Enter') { add((newTag[th.slug] ?? ''), th.slug, addKey); setNewTag((p) => ({ ...p, [th.slug]: '' })); } }}
                        className="flex-1 min-w-0 rounded-lg border border-line bg-surface text-ink px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green" />
                      <button type="button" disabled={!(newTag[th.slug] ?? '').trim() || busy === addKey}
                        onClick={() => { add((newTag[th.slug] ?? ''), th.slug, addKey); setNewTag((p) => ({ ...p, [th.slug]: '' })); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-green-line bg-glass-tint text-ink px-3 py-1.5 text-sm font-semibold disabled:opacity-50">
                        {busy === addKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Ajouter
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminThemesList;
