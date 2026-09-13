import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, X, Check, ChevronRight } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { Markdown } from '../../components/Markdown';
import { ExposeCitationBloc } from '../../components/ExposeCitationBloc';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Expose, ExposeCitation, MutashabihExemple } from '../../types';

/** Découpe la prose Markdown en sections au niveau des titres « ## ». */
function splitSections(md: string): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  let cur: { title: string; body: string } | null = null;
  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (cur) out.push(cur);
      cur = { title: m[1].replace(/^\s*\d+[.)]\s*/, '').trim(), body: '' };
    } else if (cur) {
      cur.body += line + '\n';
    }
  }
  if (cur) out.push(cur);
  return out;
}

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

  const sections = useMemo(() => splitSections(expose?.contenu_md ?? ''), [expose]);
  const citForSection = (n: number) => citations.filter((c) => c.section === n);
  const generalCit = citations.filter((c) => c.section == null);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }

  const renderCitations = (list: ExposeCitation[]) => {
    const direct = list.filter((c) => !c.accordeon);
    const folded = list.filter((c) => c.accordeon);
    return (
      <>
        {direct.map((c) => <ExposeCitationBloc key={c.id} c={c} />)}
        {folded.length > 0 && (
          <details className="mt-3 border-t border-dashed border-line pt-3">
            <summary className="cursor-pointer font-semibold text-green text-sm list-none flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4" /> Voir {folded.length} autre{folded.length > 1 ? 's' : ''} preuve{folded.length > 1 ? 's' : ''}
            </summary>
            {folded.map((c) => <ExposeCitationBloc key={c.id} c={c} />)}
          </details>
        )}
      </>
    );
  };

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

        {/* Sommaire + contenu */}
        <div className="grid grid-cols-1 min-[860px]:grid-cols-[210px_1fr] gap-7 mt-6">
          {sections.length > 0 && (
            <nav aria-label="Sommaire" className="self-start min-[860px]:sticky min-[860px]:top-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">Sur cette page</p>
              <ol className="list-none m-0 p-0">
                {sections.map((s, i) => (
                  <li key={i}>
                    <a
                      href={`#sec-${i + 1}`}
                      onClick={(e) => { e.preventDefault(); scrollToId(`sec-${i + 1}`); }}
                      className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg text-sm text-ink hover:bg-green-soft hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                    >
                      <span className="font-display font-semibold text-gold text-[13px]">{i + 1}</span>{s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div>
            {sections.length === 0 && !expose?.contenu_md && (
              <p className="text-muted italic">Article en cours de rédaction.</p>
            )}

            {sections.map((s, i) => (
              <section key={i} id={`sec-${i + 1}`} className="mb-9" style={{ scrollMarginTop: 20 }}>
                <h2 className="font-display font-semibold text-green-deep text-[22px] mb-3 flex items-center gap-2.5">
                  <span className="w-[26px] h-[26px] rounded-full bg-green-soft text-green grid place-items-center text-sm shrink-0 font-display">{i + 1}</span>
                  {s.title}
                </h2>
                <Markdown>{s.body}</Markdown>
                {renderCitations(citForSection(i + 1))}
              </section>
            ))}

            {generalCit.length > 0 && (
              <section className="mb-9">
                <h2 className="font-display font-semibold text-green-deep text-[22px] mb-3">Preuves</h2>
                {renderCitations(generalCit)}
              </section>
            )}
          </div>
        </div>

        {/* Subtilité de la langue : cartes d'exemples */}
        {exemples.length > 0 && (
          <section className="mt-2">
            <h2 className="font-display font-semibold text-green-deep text-xl mb-1.5">La subtilité de la langue arabe</h2>
            <p className="text-[15px] text-muted mb-4 max-w-[64ch]">
              Un mot a souvent un sens propre et un sens figuré ; le contexte impose lequel retenir. Au sujet d'Allah,
              c'est toujours le sens digne de Sa transcendance qui est visé.
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
