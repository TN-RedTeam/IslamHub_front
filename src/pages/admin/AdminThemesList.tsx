import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Loader2, X, Plus, AlertTriangle, Check, Pencil, Trash2, Eye, ExternalLink, ChevronDown } from 'lucide-react';
import { adminService, type ThemeMapping, type ThemeMappingRow, type TagContent } from '../../services/AdminService';

const KIND_LABEL: Record<string, string> = { hadith: 'Hadith', parole: 'Parole', verset: 'Verset', invocation: 'Invocation' };

const fieldCls = 'rounded-lg border border-line bg-surface text-ink px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green';

export const AdminThemesList: React.FC = () => {
  const [data, setData] = useState<ThemeMapping>({ themes: [], unmapped: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState<Record<string, string>>({});

  // Création d'un thème
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ nom: '', famille: '', ordre: '' });
  // Édition d'un thème (slug en cours)
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nom: '', famille: '', ordre: '' });
  // Suppression (slug à confirmer)
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  // Aperçu des contenus d'un tag non mappé
  const [openTag, setOpenTag] = useState<string | null>(null);
  const [tagContent, setTagContent] = useState<Record<string, TagContent[]>>({});
  const [loadingTag, setLoadingTag] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    if (openTag === tag) { setOpenTag(null); return; }
    setOpenTag(tag);
    if (!tagContent[tag]) {
      setLoadingTag(tag);
      adminService.tagContents(tag).then((c) => setTagContent((p) => ({ ...p, [tag]: c }))).catch(() => setTagContent((p) => ({ ...p, [tag]: [] }))).finally(() => setLoadingTag(null));
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    adminService.themesMapping()
      .then((d) => { setData(d); setError(null); })
      .catch((e) => setError((e as Error).message || 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => { setOk(msg); setTimeout(() => setOk(null), 2000); };
  const familles = useMemo(() => {
    const extra = data.themes.map((t) => t.famille).filter((f): f is string => !!f);
    return Array.from(new Set(['adoration', 'comportement', 'croyance', 'prophete', ...extra]));
  }, [data.themes]);

  const run = async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(key); setError(null);
    try { await fn(); flash(okMsg); load(); return true; }
    catch (e) { setError((e as Error).message || 'Échec (la fonction SQL est-elle exécutée ?).'); return false; }
    finally { setBusy(null); }
  };

  const addTag = (tag: string, theme: string, key: string) => {
    if (!tag.trim() || !theme) return;
    run(key, () => adminService.addThemeTag(tag.trim(), theme), 'Tag rattaché');
  };
  const removeTag = (tag: string, theme: string) => run(`rm:${theme}:${tag}`, () => adminService.removeThemeTag(tag, theme), 'Tag retiré');

  const createTheme = async () => {
    if (!createForm.nom.trim()) return;
    const okDone = await run('create', () => adminService.saveTheme({ nom: createForm.nom.trim(), famille: createForm.famille.trim() || 'croyance', ordre: createForm.ordre ? Number(createForm.ordre) : null }), 'Thème créé');
    if (okDone) { setCreating(false); setCreateForm({ nom: '', famille: '', ordre: '' }); }
  };
  const startEdit = (t: ThemeMappingRow) => { setEditSlug(t.slug); setEditForm({ nom: t.nom, famille: t.famille ?? '', ordre: t.ordre != null ? String(t.ordre) : '' }); };
  const saveEdit = async (slug: string) => {
    if (!editForm.nom.trim()) return;
    const okDone = await run(`edit:${slug}`, () => adminService.saveTheme({ slug, nom: editForm.nom.trim(), famille: editForm.famille.trim() || 'croyance', ordre: editForm.ordre ? Number(editForm.ordre) : null }), 'Thème modifié');
    if (okDone) setEditSlug(null);
  };
  const doDelete = async (slug: string) => { const okDone = await run(`del:${slug}`, () => adminService.deleteTheme(slug), 'Thème supprimé'); if (okDone) setConfirmDel(null); };

  return (
    <div className="max-w-4xl px-6 py-8">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <h1 className="font-display font-semibold text-ink text-3xl">Thèmes &amp; mapping</h1>
        {ok && <span className="inline-flex items-center gap-1 text-sm text-green"><Check className="w-4 h-4" /> {ok}</span>}
        <button type="button" onClick={() => setCreating((v) => !v)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-4 py-2 text-sm hover:bg-green-deep">
          <Plus className="w-4 h-4" /> Nouveau thème
        </button>
      </div>
      <p className="text-sm text-muted mb-4">
        Un thème est déduit d'un <b>tag</b> via ces correspondances. Associer/retirer un tag met à jour les contenus existants.
      </p>
      {error && <p className="mb-4 text-red-600 text-sm inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</p>}

      {/* Création */}
      {creating && (
        <section className="rounded-card border border-green-line bg-glass-tint/40 p-4 mb-6">
          <div className="grid sm:grid-cols-[1fr_180px_90px_auto] gap-2.5 items-end">
            <div><label className="block text-[12px] text-muted mb-1">Nom <span className="text-red-600">*</span></label>
              <input className={`${fieldCls} w-full`} value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} placeholder="Ex. Les péchés de la langue" /></div>
            <div><label className="block text-[12px] text-muted mb-1">Famille</label>
              <input className={`${fieldCls} w-full`} list="familles-list" value={createForm.famille} onChange={(e) => setCreateForm({ ...createForm, famille: e.target.value })} placeholder="croyance" /></div>
            <div><label className="block text-[12px] text-muted mb-1">Ordre</label>
              <input type="number" className={`${fieldCls} w-full`} value={createForm.ordre} onChange={(e) => setCreateForm({ ...createForm, ordre: e.target.value })} placeholder="auto" /></div>
            <button type="button" disabled={!createForm.nom.trim() || busy === 'create'} onClick={createTheme}
              className="inline-flex items-center gap-1 rounded-lg bg-green text-white px-3.5 py-2 text-sm font-semibold disabled:opacity-50">
              {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Créer
            </button>
          </div>
          <p className="text-[12px] text-muted mt-2">Le <b>slug</b> (identifiant d'URL) est généré automatiquement et n'est pas modifiable ensuite.</p>
        </section>
      )}
      <datalist id="familles-list">{familles.map((f) => <option key={f} value={f} />)}</datalist>

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
                  const open = openTag === tag;
                  const items = tagContent[tag];
                  return (
                    <li key={tag}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button type="button" onClick={() => toggleTag(tag)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-glass-tint text-ink border border-line text-[13px] hover:border-green"
                          title="Voir les contenus portant ce tag">
                          <Eye className="w-3.5 h-3.5 text-muted" /> {tag}
                          <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                        <span className="text-muted text-sm">→</span>
                        <select value={pick[tag] ?? ''} onChange={(e) => setPick((p) => ({ ...p, [tag]: e.target.value }))} className={fieldCls}>
                          <option value="">— choisir un thème —</option>
                          {data.themes.map((t) => <option key={t.slug} value={t.slug}>{t.nom}</option>)}
                        </select>
                        <button type="button" disabled={!pick[tag] || busy === key} onClick={() => addTag(tag, pick[tag], key)}
                          className="inline-flex items-center gap-1 rounded-lg bg-green text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50">
                          {busy === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Mapper
                        </button>
                      </div>
                      {open && (
                        <div className="mt-2 ml-1 pl-3 border-l-2 border-green-line">
                          {loadingTag === tag ? (
                            <p className="text-sm text-muted inline-flex items-center gap-1.5 py-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement…</p>
                          ) : !items || items.length === 0 ? (
                            <p className="text-sm text-muted italic py-1">Aucun contenu rattaché.</p>
                          ) : (
                            <ul className="space-y-1.5 py-1">
                              {items.map((it) => (
                                <li key={`${it.kind}-${it.id}`} className="text-[13px]">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-glass-tint border border-glass-border text-muted shrink-0">{KIND_LABEL[it.kind] ?? it.kind}</span>
                                    <span className="text-ink font-medium truncate">{it.sujet || `#${it.id}`}</span>
                                    <a href={`#${it.path}`} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 text-[12px] text-accent hover:underline shrink-0">Ouvrir <ExternalLink className="w-3 h-3" /></a>
                                  </div>
                                  {it.extrait && <p className="text-muted mt-0.5 line-clamp-2 [unicode-bidi:plaintext]">{it.extrait}</p>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Thèmes */}
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-3.5">Thèmes <span className="text-muted font-normal">({data.themes.length})</span></h2>
            <ul className="space-y-4">
              {data.themes.map((th) => {
                const addKey = `addto:${th.slug}`;
                const isEdit = editSlug === th.slug;
                return (
                  <li key={th.slug} className="rounded-lg border border-line p-3.5">
                    {isEdit ? (
                      <div className="grid sm:grid-cols-[1fr_160px_80px_auto_auto] gap-2 items-end mb-2">
                        <div><label className="block text-[11px] text-muted mb-1">Nom</label><input className={`${fieldCls} w-full`} value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} /></div>
                        <div><label className="block text-[11px] text-muted mb-1">Famille</label><input className={`${fieldCls} w-full`} list="familles-list" value={editForm.famille} onChange={(e) => setEditForm({ ...editForm, famille: e.target.value })} /></div>
                        <div><label className="block text-[11px] text-muted mb-1">Ordre</label><input type="number" className={`${fieldCls} w-full`} value={editForm.ordre} onChange={(e) => setEditForm({ ...editForm, ordre: e.target.value })} /></div>
                        <button type="button" disabled={busy === `edit:${th.slug}`} onClick={() => saveEdit(th.slug)} className="inline-flex items-center gap-1 rounded-lg bg-green text-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50">{busy === `edit:${th.slug}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} OK</button>
                        <button type="button" onClick={() => setEditSlug(null)} className="text-muted text-sm px-2 py-1.5">Annuler</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-ink">{th.nom}</span>
                        {th.famille && <span className="text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-muted border border-line">{th.famille}</span>}
                        <span className="text-[11px] text-muted">· ordre {th.ordre} · {th.tags.length} tag{th.tags.length > 1 ? 's' : ''}</span>
                        <span className="text-[11px] text-muted font-mono">· {th.slug}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <button type="button" onClick={() => startEdit(th)} className="inline-flex items-center gap-1 text-[13px] text-accent hover:underline"><Pencil className="w-3.5 h-3.5" /> Éditer</button>
                          {confirmDel === th.slug ? (
                            <span className="inline-flex items-center gap-1 text-[12px]">
                              <span className="text-red-600">Supprimer&nbsp;?</span>
                              <button type="button" disabled={busy === `del:${th.slug}`} onClick={() => doDelete(th.slug)} className="rounded border border-red-300 text-red-600 px-1.5 py-0.5 hover:bg-red-50">{busy === `del:${th.slug}` ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui'}</button>
                              <button type="button" onClick={() => setConfirmDel(null)} className="text-muted px-1.5 py-0.5">Non</button>
                            </span>
                          ) : (
                            <button type="button" onClick={() => setConfirmDel(th.slug)} className="inline-flex items-center gap-1 text-[13px] text-red-600 hover:underline"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {th.tags.length === 0 && <span className="text-sm text-muted italic">Aucun tag.</span>}
                      {th.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-glass-tint text-ink border border-green-line px-2.5 py-1 text-[13px]">
                          {tag}
                          <button type="button" disabled={busy === `rm:${th.slug}:${tag}`} onClick={() => removeTag(tag, th.slug)} className="text-ink/60 hover:text-red-600" aria-label={`Retirer ${tag}`}>
                            {busy === `rm:${th.slug}:${tag}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input value={newTag[th.slug] ?? ''} onChange={(e) => setNewTag((p) => ({ ...p, [th.slug]: e.target.value }))}
                        placeholder="ajouter un tag à ce thème…"
                        onKeyDown={(e) => { if (e.key === 'Enter') { addTag((newTag[th.slug] ?? ''), th.slug, addKey); setNewTag((p) => ({ ...p, [th.slug]: '' })); } }}
                        className={`${fieldCls} flex-1 min-w-0`} />
                      <button type="button" disabled={!(newTag[th.slug] ?? '').trim() || busy === addKey}
                        onClick={() => { addTag((newTag[th.slug] ?? ''), th.slug, addKey); setNewTag((p) => ({ ...p, [th.slug]: '' })); }}
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
