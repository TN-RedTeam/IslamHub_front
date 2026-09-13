import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Markdown } from './Markdown';
import { ExposeCitationBloc } from './ExposeCitationBloc';
import type { ExposeCitation } from '../types';

/** Découpe la prose Markdown en sections au niveau des titres « ## ». */
export function splitSections(md: string): { title: string; body: string }[] {
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

/**
 * Corps d'une page d'exposé : prose Markdown découpée en sections (« ## »),
 * sommaire ancré (scroll JS, compatible HashRouter) et preuves rattachées
 * (`expose_citations`, par section n° ou en bloc général). Réutilisable.
 */
export const ExposeBody: React.FC<{ contenuMd: string | null; citations: ExposeCitation[] }> = ({ contenuMd, citations }) => {
  const sections = useMemo(() => splitSections(contenuMd ?? ''), [contenuMd]);
  const citForSection = (n: number) => citations.filter((c) => c.section === n);
  const generalCit = citations.filter((c) => c.section == null);

  if (sections.length === 0) {
    return (
      <div>
        {contenuMd ? <Markdown>{contenuMd}</Markdown> : <p className="text-muted italic">Contenu en cours de rédaction.</p>}
        {generalCit.length > 0 && <div className="mt-6">{renderCitations(generalCit)}</div>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 min-[860px]:grid-cols-[210px_1fr] gap-7">
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

      <div>
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
  );
};

export default ExposeBody;
