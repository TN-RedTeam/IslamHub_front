import React, { useState } from 'react';
import { Loader2, AlertTriangle, Check, Search, Replace } from 'lucide-react';
import { adminService, type GlobalReplaceResult } from '../../services/AdminService';

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

// Noms lisibles des rubriques (tables) dans le récap.
const RUBRIQUE: Record<string, string> = {
  hadiths: 'Hadiths', hadith_segments: 'Hadiths (dialogue)', hadith_variants: 'Hadiths (variantes)',
  paroles: 'Paroles', parole_images: 'Scans de paroles', savants: 'Savants', narrateurs: 'Narrateurs',
  recueils: 'Recueils', coran: 'Coran (thématique)', invocations: 'Invocations', fiqh: 'Fiqh', themes: 'Thèmes',
  dossiers: 'Dossiers', exposes: 'Exposés', versets_equivoques: 'Équivoques', recits: 'Récits',
  contenu_blocs: 'Blocs de contenu', expose_citations: 'Citations d’exposé', attribut_citations: 'Citations d’attribut',
  attributs: 'Attributs', femmes: 'La femme musulmane',
};

export const AdminRemplacer: React.FC = () => {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [wholeWord, setWholeWord] = useState(true);
  const [preview, setPreview] = useState<GlobalReplaceResult | null>(null);
  const [busy, setBusy] = useState<'preview' | 'apply' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<GlobalReplaceResult | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const reset = () => { setPreview(null); setDone(null); setConfirmText(''); setError(null); };

  const doPreview = async () => {
    if (!find.trim()) return;
    setBusy('preview'); setError(null); setDone(null); setConfirmText('');
    try { setPreview(await adminService.globalReplace(find, replace, false, wholeWord)); }
    catch (e) { setError((e as Error).message || 'Échec de la prévisualisation.'); }
    finally { setBusy(null); }
  };
  const doApply = async () => {
    setBusy('apply'); setError(null);
    try { const r = await adminService.globalReplace(find, replace, true, wholeWord); setDone(r); setPreview(null); setConfirmText(''); }
    catch (e) { setError((e as Error).message || 'Échec du remplacement.'); }
    finally { setBusy(null); }
  };

  const canApply = confirmText.trim().toLowerCase() === 'remplacer';

  return (
    <div className="max-w-3xl px-6 py-8">
      <h1 className="font-display font-semibold text-ink text-3xl mb-1">Remplacer partout</h1>
      <p className="text-sm text-muted mb-5">
        Harmonise l'écriture d'un mot ou d'un nom (rapporteur, narrateur, savant…) dans <b>tout le site</b>,
        textes déjà enregistrés inclus. <b>Sensible à la casse et aux accents</b> : « Allah » ≠ « Allâh ».
        N'affecte pas le texte arabe, les slugs ni les tags.
      </p>

      <div className="rounded-card border border-line bg-surface p-5 mb-4">
        <div className="grid sm:grid-cols-2 gap-3.5">
          <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Rechercher</label>
            <input className={field} value={find} onChange={(e) => { setFind(e.target.value); reset(); }} placeholder="Ex. Al-Bukhari" /></div>
          <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Remplacer par</label>
            <input className={field} value={replace} onChange={(e) => { setReplace(e.target.value); reset(); }} placeholder="Ex. Al-Boukhariyy" /></div>
        </div>
        <label className="flex items-center gap-2 mt-3.5 cursor-pointer">
          <input type="checkbox" checked={wholeWord} onChange={(e) => { setWholeWord(e.target.checked); reset(); }} className="w-4 h-4 accent-green" />
          <span className="text-[14px] text-ink">Mot entier <span className="text-muted">(recommandé — « Allah » ne touchera pas « Abdallah »)</span></span>
        </label>
        <div className="flex items-center gap-2.5 mt-4">
          <button type="button" disabled={!find.trim() || busy !== null} onClick={doPreview}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-glass-tint text-ink font-semibold px-4 py-2.5 text-sm disabled:opacity-50">
            {busy === 'preview' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Prévisualiser
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</p>}

      {/* Résultat de prévisualisation */}
      {preview && (
        <div className="rounded-card border border-gold bg-glass-tint px-5 py-4 mb-4">
          {preview.total === 0 ? (
            <p className="text-sm text-ink">Aucune occurrence de « <b>{preview.find}</b> » {preview.whole_word ? '(en mot entier)' : ''}. Rien à remplacer.</p>
          ) : (
            <>
              <p className="text-[14px] text-ink font-semibold mb-2">
                « {preview.find} » → « {preview.replace} » : <b>{preview.total}</b> fiche{preview.total > 1 ? 's' : ''} concernée{preview.total > 1 ? 's' : ''}
              </p>
              <ul className="text-[13px] text-ink grid sm:grid-cols-2 gap-x-6 gap-y-0.5 mb-3 max-h-60 overflow-auto">
                {preview.details.map((d, i) => (
                  <li key={i} className="flex justify-between gap-2 border-b border-glass-border py-0.5">
                    <span>{RUBRIQUE[d.rubrique] ?? d.rubrique} <span className="text-muted">· {d.champ}</span></span>
                    <span className="font-semibold shrink-0">{d.fiches}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[12.5px] text-muted mb-2">Action <b>irréversible</b>. Vérifie bien le terme et le remplacement ci-dessus.</p>
              <label className="block text-[13px] text-ink mb-1.5">Tape <b>remplacer</b> pour confirmer</label>
              <div className="flex items-center gap-2.5">
                <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="remplacer"
                  className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink focus:outline-none focus:ring-2 focus:ring-red-400" />
                <button type="button" disabled={!canApply || busy !== null} onClick={doApply}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 text-white font-semibold px-4 py-2.5 text-sm hover:bg-red-700 disabled:opacity-50">
                  {busy === 'apply' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Replace className="w-4 h-4" />} Appliquer le remplacement
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Résultat de l'application */}
      {done && (
        <div className="rounded-card border border-green-line bg-glass-tint px-5 py-4">
          <p className="text-[14px] text-ink font-semibold inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green" /> Remplacement effectué : <b>{done.total}</b> fiche{done.total > 1 ? 's' : ''} mise{done.total > 1 ? 's' : ''} à jour.
          </p>
          <p className="text-[12.5px] text-muted mt-1">« {done.find} » → « {done.replace} ». Pense à vérifier quelques fiches, et à redéployer n'est pas nécessaire (c'est en base).</p>
        </div>
      )}
    </div>
  );
};

export default AdminRemplacer;
