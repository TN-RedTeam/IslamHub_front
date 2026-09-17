import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { adminService, type DeletableKind, type EntryDeps } from '../../services/AdminService';

/**
 * Suppression d'une entrée admin (Phase 4.6) avec garde-fou de dépendances.
 * Avant de supprimer un verset/hadith/parole, on liste où il est référencé
 * (articles composés, équivoques, dossiers, exposés, attributs). L'auteur doit
 * confirmer, et pour forcer il retire aussi ces références.
 */
const REF_LABEL: Record<string, string> = {
  articles: 'article(s) composé(s)', equivoques: 'équivoque(s)', dossiers: 'dossier(s)',
  exposes: 'exposé(s)', attributs: 'page(s) Attributs',
};

export const DeleteEntryButton: React.FC<{
  kind: DeletableKind; id: string | number; label: string; redirectTo: string;
}> = ({ kind, id, label, redirectTo }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deps, setDeps] = useState<EntryDeps | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const openPanel = async () => {
    setOpen(true); setError(null); setDeps(null); setConfirmText('');
    try { setDeps(await adminService.entryDependencies(kind, id)); }
    catch { setDeps({ total: 0, refs: {} }); }
  };

  const refs = deps?.refs ?? {};
  const refLines = Object.entries(refs).filter(([, n]) => (n ?? 0) > 0);
  const hasRefs = (deps?.total ?? 0) > 0;
  const canDelete = confirmText.trim().toLowerCase() === 'supprimer';

  const doDelete = async () => {
    setBusy(true); setError(null);
    try {
      await adminService.deleteEntry(kind, id, hasRefs);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      const msg = (e as Error).message || 'Erreur.';
      if (/HAS_PAROLES/.test(msg)) setError('Ce savant a des paroles rattachées. Supprime ou réattribue d’abord ses paroles.');
      else if (/REFERENCED/.test(msg)) { setError('Références détectées entre-temps — relance la suppression.'); openPanel(); }
      else setError(msg);
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button type="button" onClick={openPanel} className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold px-3.5 py-2.5 text-sm">
        <Trash2 className="w-4 h-4" /> Supprimer
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
      <div className="w-full max-w-md rounded-card border border-line bg-surface shadow-card-hover p-5">
        <div className="flex items-start gap-2.5 mb-3">
          <span className="w-9 h-9 rounded-full bg-red-50 text-red-600 grid place-items-center shrink-0"><AlertTriangle className="w-5 h-5" /></span>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-ink text-lg leading-tight">Supprimer définitivement&nbsp;?</h3>
            <p className="text-sm text-muted mt-0.5 truncate">« {label} »</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="ml-auto text-muted hover:text-ink" aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>

        {deps === null ? (
          <div className="flex items-center gap-2 text-muted text-sm py-3"><Loader2 className="w-4 h-4 animate-spin" /> Vérification des dépendances…</div>
        ) : hasRefs ? (
          <div className="rounded-lg border border-gold bg-gold-soft px-3.5 py-3 mb-3">
            <p className="text-[13.5px] text-[#7a5a17] font-semibold mb-1.5">Cette entrée est utilisée comme preuve ailleurs :</p>
            <ul className="text-[13px] text-ink list-disc pl-5 space-y-0.5">
              {refLines.map(([k, n]) => <li key={k}>{n} {REF_LABEL[k] ?? k}</li>)}
            </ul>
            <p className="text-[12.5px] text-muted mt-2">La supprimer <b>retirera aussi</b> ces références (les articles concernés perdront ce bloc-preuve).</p>
          </div>
        ) : (
          <p className="text-sm text-muted mb-3">Cette action est irréversible.</p>
        )}

        <label className="block text-[13px] text-ink mb-1.5">Tape <b>supprimer</b> pour confirmer</label>
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="supprimer" />

        {error && <p className="text-red-600 text-sm mt-2.5 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</p>}

        <div className="flex items-center justify-end gap-2.5 mt-4">
          <button type="button" onClick={() => setOpen(false)} className="text-muted text-sm px-3 py-2">Annuler</button>
          <button type="button" disabled={busy || !canDelete || deps === null} onClick={doDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white font-semibold px-4 py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {hasRefs ? 'Supprimer et retirer les références' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEntryButton;
