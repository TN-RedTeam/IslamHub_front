import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Check, AlertTriangle, ExternalLink, Hash } from 'lucide-react';
import { adminService } from '../../services/AdminService';

const RUB_LABEL: Record<string, string> = { hadiths: 'Hadiths', paroles: 'Paroles', coran: 'Coran', invocations: 'Invocations', fiqh: 'Fiqh' };
const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-green';
const tagList = (t: string) => t.split(',').map((x) => x.trim()).filter(Boolean);

/**
 * Aperçu + édition inline d'une fiche (sujet, tag, textes arabe & français)
 * sans ouvrir le formulaire complet. Enregistre via admin_update_sujet_tag et
 * resynchronise les thèmes côté base. Réutilisé par Sujets, Tags & Hadiths.
 */
export const InlineSujetTagEditor: React.FC<{
  rubrique: string;
  id: number;
  sujet: string | null;
  tag: string | null;
  texteArabe?: string | null;
  texteFrancais?: string | null;
  onSaved?: (sujet: string, tag: string) => void;
}> = ({ rubrique, id, sujet, tag, texteArabe, texteFrancais, onSaved }) => {
  const [s, setS] = useState(sujet ?? '');
  const [t, setT] = useState(tag ?? '');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty = s !== (sujet ?? '') || t !== (tag ?? '');

  const save = async () => {
    setBusy(true); setErr(null); setOk(false);
    try {
      await adminService.updateSujetTag(rubrique, id, s, t);
      setOk(true); setTimeout(() => setOk(false), 2000);
      onSaved?.(s, t);
    } catch (e) { setErr((e as Error).message || 'Erreur.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-lg border border-glass-border bg-glass p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-accent bg-glass-tint border border-glass-border rounded px-1.5 py-0.5">{RUB_LABEL[rubrique] ?? rubrique}</span>
        <span className="text-[11px] text-muted tabular-nums">#{id}</span>
        <Link to={`/admin/${rubrique}/${id}`} className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted hover:text-accent" title="Ouvrir la fiche complète">
          <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        <label className="block">
          <span className="block text-[11px] font-semibold text-muted mb-1">Sujet</span>
          <input className={field} value={s} onChange={(e) => setS(e.target.value)} placeholder="Sujet…" />
        </label>
        <label className="block">
          <span className="block text-[11px] font-semibold text-muted mb-1">Tags <span className="font-normal">(virgules)</span></span>
          <input className={field} value={t} onChange={(e) => setT(e.target.value)} placeholder="tag1, tag2…" />
        </label>
      </div>

      {tagList(t).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tagList(t).map((x) => (
            <span key={x} className="inline-flex items-center gap-1 text-[11px] text-ink bg-glass-tint border border-glass-border rounded-full px-2 py-0.5">
              <Hash className="w-2.5 h-2.5 text-accent" />{x}
            </span>
          ))}
        </div>
      )}

      {(texteArabe || texteFrancais) && (
        <div className="mt-2.5 space-y-1.5 border-t border-glass-border/60 pt-2">
          {texteArabe && <p dir="rtl" lang="ar" className="font-arabic text-[19px] leading-[1.9] text-right text-ink whitespace-pre-wrap">{texteArabe}</p>}
          {texteFrancais && <p className="text-[13px] text-ink/85 whitespace-pre-wrap [unicode-bidi:plaintext]">{texteFrancais}</p>}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2.5">
        <button type="button" disabled={busy || !dirty || !s.trim()} onClick={save}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green text-white font-semibold px-3 py-1.5 text-[13px] hover:bg-green-deep disabled:opacity-40">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Enregistrer
        </button>
        {ok && <span className="inline-flex items-center gap-1 text-[12px] text-accent"><Check className="w-3.5 h-3.5" /> Enregistré</span>}
        {err && <span className="inline-flex items-center gap-1 text-[12px] text-low"><AlertTriangle className="w-3.5 h-3.5" /> {err}</span>}
      </div>
    </div>
  );
};

export default InlineSujetTagEditor;
