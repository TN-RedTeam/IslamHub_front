import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Check, Pencil } from 'lucide-react';
import { adminService, type TranslationStatus } from '../../services/AdminService';

/**
 * Indicateur + circuit de traduction d'une entrée (Phase 15.7).
 * FR ✓ · EN — · AR — : chaque langue est une puce. Présente → cliquable pour
 * éditer ; absente (EN/AR) → bouton « + » qui crée la version (arabe conservé,
 * brouillon) et ouvre son formulaire. Démo sur « parole » ; `kind`/`editPathBase`
 * rendent le composant réutilisable pour d'autres types.
 */
const LANGS: { key: 'fr' | 'en' | 'ar'; label: string }[] = [
  { key: 'fr', label: 'FR' },
  { key: 'en', label: 'EN' },
  { key: 'ar', label: 'AR' },
];

export const TranslationPanel: React.FC<{ kind: string; id: number; editPathBase: string }> = ({ kind, id, editPathBase }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<TranslationStatus | null>(null);
  const [busy, setBusy] = useState<'en' | 'ar' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    setErr(null);
    adminService.translationStatus(kind, id).then(setStatus).catch((e) => setErr((e as { message?: string })?.message ?? 'Erreur'));
  }, [kind, id]);
  useEffect(() => { load(); }, [load]);

  const create = async (loc: 'en' | 'ar') => {
    setBusy(loc); setErr(null);
    try {
      const newId = await adminService.addTranslation(kind, id, loc);
      navigate(`${editPathBase}/${newId}`);
    } catch (e) {
      setErr((e as { message?: string })?.message ?? 'Erreur');
      setBusy(null);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3 mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted me-1">Traductions</span>
        {!status ? (
          <Loader2 className="w-4 h-4 text-green animate-spin" aria-hidden />
        ) : (
          LANGS.map(({ key, label }) => {
            const v = status[key];
            const isCurrent = v.id === id;
            if (v.exists) {
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => { if (!isCurrent && v.id) navigate(`${editPathBase}/${v.id}`); }}
                  aria-current={isCurrent ? 'true' : undefined}
                  title={isCurrent ? 'Entrée en cours d’édition' : `Éditer la version ${label}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                    isCurrent ? 'border-green bg-green text-white cursor-default'
                              : 'border-green-line bg-green-soft/30 text-green hover:bg-green-soft/60'}`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden /> {label}
                  {!v.publiee && <span className="opacity-70 font-normal">(brouillon)</span>}
                  {!isCurrent && <Pencil className="w-3 h-3 ms-0.5 opacity-70" aria-hidden />}
                </button>
              );
            }
            if (key === 'fr') {
              return (
                <span key={key} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] text-muted border border-line">{label} —</span>
              );
            }
            return (
              <button
                key={key}
                type="button"
                disabled={busy !== null}
                onClick={() => create(key as 'en' | 'ar')}
                title={`Créer la version ${label}`}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-semibold border border-line text-ink hover:border-green hover:text-green transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                {busy === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> : <Plus className="w-3.5 h-3.5" aria-hidden />} {label}
              </button>
            );
          })
        )}
      </div>
      {err && <p className="text-[12.5px] mt-2" style={{ color: '#c0392b' }}>{err}</p>}
      <p className="text-[12px] text-muted mt-2">
        EN = traduction reliée (l’arabe est conservé, réécris la prose). AR = version arabe reliée (arabe + commentaire). Créées en brouillon.
      </p>
    </div>
  );
};

export default TranslationPanel;
