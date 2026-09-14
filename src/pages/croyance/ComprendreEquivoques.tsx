import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, X, Check } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { ExposeBody } from '../../components/ExposeBody';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Expose, ExposeCitation, MutashabihExemple } from '../../types';

/**
 * Article de fond « Comprendre les textes équivoques » (à lire en premier).
 * Tout est éditable en base : prose et bloc « texte fondateur » via `exposes`
 * (slug comprendre-textes-equivoques) ; cartes de langue via `mutashabih_exemples` ;
 * preuves via `expose_citations` (mécanisme réutilisable, paroles → /paroles/:slug).
 */
export const ComprendreEquivoques: React.FC = () => {
  usePageTitle('Comprendre les textes équivoques');
  const [expose, setExpose] = useState<Expose | null>(null);
  const [exemples, setExemples] = useState<MutashabihExemple[]>([]);
  const [citations, setCitations] = useState<ExposeCitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataService.getExpose('comprendre-textes-equivoques').catch(() => null),
      dataService.getMutashabihExemples().catch(() => []),
      dataService.getExposeCitations('comprendre-textes-equivoques').catch(() => []),
    ]).then(([e, ex, ci]) => { setExpose(e); setExemples(ex); setCitations(ci); }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/croyance" className="hover:text-green-deep">Croyance</Link> <span aria-hidden>·</span>{' '}
          <Link to="/croyance/versets-hadiths-equivoques" className="hover:text-green-deep">Versets et hadiths équivoques</Link>
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">À lire en premier</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>
          {expose?.titre || 'Comprendre les textes équivoques'}
        </h1>
        <p className="text-muted text-[15px] mt-2 max-w-[64ch]">
          Pourquoi tous les textes ne se prennent pas au sens apparent — la preuve, par le Coran lui-même, la Sunna
          et les savants, qu'il existe des textes clairs et des textes équivoques.
        </p>

        {/* Verset fondateur (optionnel) */}
        {(expose?.verset_arabe || expose?.verset_ref) && (
          <div className="rounded-panel border border-line bg-surface p-6 sm:p-7 mt-5 text-center shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold mb-3">Le texte fondateur</p>
            {expose?.verset_arabe && (
              <p className="font-arabic text-green-deep leading-[2.05]" dir="rtl" lang="ar" style={{ fontSize: 'clamp(22px,3.6vw,30px)' }}>{expose.verset_arabe}</p>
            )}
            {expose?.verset_traduction && <p className="text-[16px] text-ink mt-4 max-w-[60ch] mx-auto">{expose.verset_traduction}</p>}
            {expose?.verset_phonetique && <p className="text-[13px] text-muted italic mt-2 [unicode-bidi:plaintext]">{expose.verset_phonetique}</p>}
            {expose?.verset_ref && <p className="text-xs uppercase tracking-[0.06em] text-gold font-semibold mt-3">{expose.verset_ref}</p>}
          </div>
        )}

        <div className="mt-6">
          <ExposeBody contenuMd={expose?.contenu_md ?? null} citations={citations} />
        </div>

        {/* Subtilité de la langue : cartes d'exemples */}
        {exemples.length > 0 && (
          <section className="mt-2">
            <h2 className="font-display font-semibold text-green-deep text-xl mb-1.5">La subtilité de la langue arabe</h2>
            <p className="text-[15px] text-muted mb-4 max-w-[64ch]">
              Un mot a souvent un sens propre et un sens figuré ; le contexte impose lequel retenir. Au sujet d'Allah,
              c'est toujours le sens digne de Allah qui est visé.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {exemples.map((ex) => (
                <div key={ex.id} className="rounded-card border border-line bg-surface p-4">
                  <p className="font-arabic-name text-green-deep text-3xl text-center leading-snug" dir="rtl" lang="ar">{ex.mot_arabe}</p>
                  {ex.translitteration && <p className="text-center text-[12.5px] text-muted italic mt-0.5 mb-3">{ex.translitteration}</p>}
                  {ex.sens_apparent && (
                    <p className="flex items-start gap-2 text-sm text-muted">
                      <X className="w-4 h-4 shrink-0 mt-0.5 text-[#b06a5c]" aria-hidden />
                      <span>Sens apparent : <span className="line-through decoration-[#c9a9a0]">{ex.sens_apparent}</span></span>
                    </p>
                  )}
                  {ex.sens_vise && (
                    <p className="flex items-start gap-2 text-sm text-ink mt-1.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-green" aria-hidden />
                      <span>Sens visé : <b className="text-green-deep">{ex.sens_vise}</b></span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA vers la collection */}
        <Link
          to="/croyance/versets-hadiths-equivoques"
          className="group mt-9 flex items-center justify-between gap-4 rounded-card bg-[linear-gradient(135deg,#1c5a43,#0f3d2e)] text-white px-6 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          <span>
            <span className="block font-display font-semibold text-lg">Passer aux textes, un par un</span>
            <span className="block text-[14px] text-white/80">L'istiwāʾ, la yad, le wajh… chaque texte avec ses preuves.</span>
          </span>
          <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
        </Link>
      </main>
    </div>
  );
};

export default ComprendreEquivoques;
