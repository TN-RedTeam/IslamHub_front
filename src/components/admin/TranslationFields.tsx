import React, { useEffect, useState } from 'react';
import { Loader2, Check, AlertTriangle, Languages } from 'lucide-react';
import { adminService } from '../../services/AdminService';

/**
 * Panneau de traductions « colonnes par langue » réutilisable.
 * Déposé dans un formulaire admin (une fois l'entrée créée), il charge les
 * colonnes _en/_ar via admin_entry_i18n_get et enregistre chaque champ au blur
 * via admin_entry_i18n_set. Zéro câblage dans le formulaire hôte.
 * Les spécifications par table reflètent la liste blanche SQL (_i18n_cols).
 */
type Group = { base: string; en: string; ar?: string; multiline?: boolean };

const SPECS: Record<string, Group[]> = {
  hadiths: [
    { base: 'Sujet', en: 'sujet_en', ar: 'sujet_ar' },
    { base: 'Traduction', en: 'texte_en' },
    { base: 'Phonétique', en: 'phonetique_en' },
    { base: 'Explication', en: 'explication_en', ar: 'explication_ar', multiline: true },
    { base: 'Intro', en: 'intro_en', ar: 'intro_ar', multiline: true },
    { base: 'Commentaire (invocation)', en: 'invocation_commentaire_en', ar: 'invocation_commentaire_ar', multiline: true },
  ],
  coran: [
    { base: 'Sujet', en: 'sujet_en', ar: 'sujet_ar' },
    { base: 'Traduction', en: 'texte_en' },
    { base: 'Phonétique', en: 'phonetique_en' },
    { base: 'Explication', en: 'explication_en', ar: 'explication_ar', multiline: true },
  ],
  versets_equivoques: [
    { base: 'Thème', en: 'theme_en', ar: 'theme_ar' },
    { base: 'Traduction du verset', en: 'verset_traduction_en' },
    { base: 'Phonétique', en: 'verset_phonetique_en' },
    { base: 'Sens juste', en: 'sens_juste_en', ar: 'sens_juste_ar', multiline: true },
    { base: 'Objection', en: 'objection_en', ar: 'objection_ar', multiline: true },
    { base: 'Réponse', en: 'reponse_en', ar: 'reponse_ar', multiline: true },
  ],
  dossiers: [
    { base: 'Titre (H1)', en: 'h1_en', ar: 'h1_ar' },
    { base: 'Meta title', en: 'meta_title_en', ar: 'meta_title_ar' },
    { base: 'Meta description', en: 'meta_description_en', ar: 'meta_description_ar', multiline: true },
    { base: 'La croyance', en: 'croyance_texte_en', ar: 'croyance_texte_ar', multiline: true },
    { base: 'L’objection', en: 'objection_texte_en', ar: 'objection_texte_ar', multiline: true },
    { base: 'La réponse', en: 'reponse_texte_en', ar: 'reponse_texte_ar', multiline: true },
  ],
  recits: [
    { base: 'Titre', en: 'titre_en', ar: 'titre_ar' },
    { base: 'Contenu', en: 'contenu_md_en', ar: 'contenu_md_ar', multiline: true },
  ],
  fiqh: [
    { base: 'Chapitre', en: 'chapitre_en', ar: 'chapitre_ar' },
    { base: 'Sujet', en: 'sujet_en', ar: 'sujet_ar' },
    { base: 'Texte', en: 'texte_en', multiline: true },
  ],
  femmes: [
    { base: 'Chapitre', en: 'chapitre_en', ar: 'chapitre_ar' },
    { base: 'Titre de section', en: 'section_titre_en', ar: 'section_titre_ar' },
    { base: 'Matn (traduction)', en: 'matn_en', multiline: true },
    { base: 'Commentaire', en: 'commentaire_en', ar: 'commentaire_ar', multiline: true },
  ],
  invocations: [
    { base: 'Sujet', en: 'sujet_en', ar: 'sujet_ar' },
    { base: 'Traduction', en: 'texte_en' },
    { base: 'Phonétique', en: 'phonetique_en' },
    { base: 'Explication', en: 'explication_en', ar: 'explication_ar', multiline: true },
    { base: 'Commentaire', en: 'commentaire_en', ar: 'commentaire_ar', multiline: true },
  ],
  savants: [
    { base: 'Biographie', en: 'biographie_en', ar: 'biographie_ar', multiline: true },
    { base: 'Résumé', en: 'resume_en', ar: 'resume_ar', multiline: true },
  ],
  sourates: [
    { base: 'Nom', en: 'nom_en', ar: 'nom_ar' },
    { base: 'Introduction', en: 'introduction_md_en', ar: 'introduction_md_ar', multiline: true },
  ],
};

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-green';

const LangInput: React.FC<{
  value: string; dir?: 'rtl' | 'ltr'; multiline?: boolean; placeholder?: string;
  onSave: (v: string) => Promise<void>;
}> = ({ value, dir, multiline, placeholder, onSave }) => {
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
  const cls = `${field} ${dir === 'rtl' ? 'text-right font-arabic' : ''} ${multiline ? 'min-h-[64px]' : ''} ${state === 'err' ? 'border-red-500' : ''}`;
  const common = { dir, value: v, placeholder, onBlur: commit,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value) };
  return (
    <div className="relative">
      {multiline ? <textarea className={cls} {...common} />
                 : <input className={cls} {...common} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />}
      {state === 'saving' && <Loader2 className="w-4 h-4 text-green animate-spin absolute end-2 top-2.5" />}
      {state === 'ok' && <Check className="w-4 h-4 text-green absolute end-2 top-2.5" />}
      {state === 'err' && <AlertTriangle className="w-4 h-4 text-red-600 absolute end-2 top-2.5" />}
    </div>
  );
};

export const TranslationFields: React.FC<{ table: string; id: number }> = ({ table, id }) => {
  const groups = SPECS[table] ?? [];
  const [vals, setVals] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminService.getEntryI18n(table, id).then((d) => { if (alive) setVals(d); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [table, id]);

  if (groups.length === 0) return null;
  const save = (col: string) => (v: string) => adminService.setEntryI18n(table, id, { [col]: v });

  return (
    <section className="rounded-card border border-line bg-surface p-5 mb-4">
      <h2 className="font-display font-semibold text-ink text-lg mb-1 flex items-center gap-2"><Languages className="w-5 h-5 text-green" /> Traductions <span className="text-muted font-normal text-sm">(English / العربية)</span></h2>
      <p className="text-xs text-muted mb-4">Le FR reste la base (ci-dessus). Saisis ici l’anglais et l’arabe — enregistrés automatiquement en quittant le champ ; vide = repli FR.</p>
      {loading ? <div className="py-4"><Loader2 className="w-6 h-6 text-green animate-spin" /></div> : (
        <div className="space-y-3.5">
          {groups.map((g) => (
            <div key={g.en}>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">{g.base}</label>
              <div className={`grid gap-2.5 ${g.ar ? 'sm:grid-cols-2' : ''}`}>
                <LangInput value={vals[g.en] ?? ''} multiline={g.multiline} placeholder="English" onSave={save(g.en)} />
                {g.ar && <LangInput value={vals[g.ar] ?? ''} dir="rtl" multiline={g.multiline} placeholder="العربية" onSave={save(g.ar)} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TranslationFields;
