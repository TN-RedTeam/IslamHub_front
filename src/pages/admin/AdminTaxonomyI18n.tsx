import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, Check, AlertTriangle } from 'lucide-react';
import { adminService, type TaxonomyI18n } from '../../services/AdminService';

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Champ de libellé traduit : enregistre au blur si la valeur a changé. */
const LabelInput: React.FC<{
  value: string; dir?: 'rtl' | 'ltr'; placeholder?: string;
  onSave: (v: string) => Promise<void>;
}> = ({ value, dir, placeholder, onSave }) => {
  const [v, setV] = useState(value);
  const [saved, setSaved] = useState(value);
  const [state, setState] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  useEffect(() => { setV(value); setSaved(value); }, [value]);

  const commit = async () => {
    if (v === saved) return;
    setState('saving');
    try { await onSave(v); setSaved(v); setState('ok'); setTimeout(() => setState('idle'), 1500); }
    catch { setState('err'); }
  };

  return (
    <div className="relative">
      <input
        className={`${field} ${dir === 'rtl' ? 'text-right font-arabic' : ''} ${state === 'err' ? 'border-red-500' : ''}`}
        dir={dir} value={v} placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      />
      {state === 'saving' && <Loader2 className="w-4 h-4 text-green animate-spin absolute end-2 top-1/2 -translate-y-1/2" />}
      {state === 'ok' && <Check className="w-4 h-4 text-green absolute end-2 top-1/2 -translate-y-1/2" />}
      {state === 'err' && <AlertTriangle className="w-4 h-4 text-red-600 absolute end-2 top-1/2 -translate-y-1/2" />}
    </div>
  );
};

export const AdminTaxonomyI18n: React.FC = () => {
  const [data, setData] = useState<TaxonomyI18n>({ themes: [], tags: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'themes' | 'tags'>('themes');
  const [q, setQ] = useState('');

  useEffect(() => { adminService.listTaxonomyI18n().then(setData).catch(() => setData({ themes: [], tags: [] })).finally(() => setLoading(false)); }, []);

  const themes = useMemo(() => {
    const t = norm(q.trim());
    return data.themes.filter((x) => !t || norm(`${x.fr} ${x.en ?? ''} ${x.slug}`).includes(t));
  }, [data.themes, q]);
  const tags = useMemo(() => {
    const t = norm(q.trim());
    return data.tags.filter((x) => !t || norm(`${x.fr} ${x.en ?? ''}`).includes(t));
  }, [data.tags, q]);

  const tabBtn = (key: 'themes' | 'tags', label: string, n: number) => (
    <button type="button" onClick={() => setTab(key)} aria-pressed={tab === key}
      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${tab === key ? 'bg-green text-white border-green' : 'bg-surface text-ink border-line hover:border-green'}`}>
      {label} <span className="opacity-70">({n})</span>
    </button>
  );

  return (
    <div className="max-w-4xl px-6 py-8">
      <h1 className="font-display font-semibold text-ink text-3xl mb-1">Traductions — thèmes & tags</h1>
      <p className="text-sm text-muted mb-5">Le libellé <b>FR</b> est la base (édité dans Thèmes / Tags). Saisis ici les versions <b>EN</b> et <b>AR</b> — enregistrées automatiquement en quittant le champ. Laisser vide efface la traduction (repli sur le FR).</p>

      <div className="flex items-center gap-2 mb-4">{tabBtn('themes', 'Thèmes', data.themes.length)}{tabBtn('tags', 'Tags', data.tags.length)}</div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" className="w-full rounded-lg border border-line bg-surface pl-9 pr-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
      ) : (
        <div className="rounded-card border border-line bg-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-2.5 bg-glass-tint border-b border-line text-[12px] font-bold uppercase tracking-wide text-muted">
            <span>Français (base)</span><span>English</span><span>العربية</span>
          </div>
          {tab === 'themes' ? (
            themes.length === 0 ? <p className="text-muted italic p-4">Aucun thème.</p> : (
              <ul className="divide-y divide-line">
                {themes.map((t) => (
                  <li key={t.slug} className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-2.5 items-center">
                    <span className="text-ink text-[14px] min-w-0 truncate" title={t.slug}>{t.fr}</span>
                    <LabelInput value={t.en ?? ''} placeholder="—" onSave={(v) => adminService.setTaxonomyLabel('theme', t.slug, 'en', v)} />
                    <LabelInput value={t.ar ?? ''} dir="rtl" placeholder="—" onSave={(v) => adminService.setTaxonomyLabel('theme', t.slug, 'ar', v)} />
                  </li>
                ))}
              </ul>
            )
          ) : (
            tags.length === 0 ? <p className="text-muted italic p-4">Aucun tag.</p> : (
              <ul className="divide-y divide-line">
                {tags.map((t) => (
                  <li key={t.id} className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-2.5 items-center">
                    <span className="text-ink text-[14px] min-w-0 truncate">{t.fr}</span>
                    <LabelInput value={t.en ?? ''} placeholder="—" onSave={(v) => adminService.setTaxonomyLabel('tag', String(t.id), 'en', v)} />
                    <LabelInput value={t.ar ?? ''} dir="rtl" placeholder="—" onSave={(v) => adminService.setTaxonomyLabel('tag', String(t.id), 'ar', v)} />
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTaxonomyI18n;
