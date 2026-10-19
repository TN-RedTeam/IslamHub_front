import React from 'react';
import { Markdown } from './Markdown';
import { DocReader } from './DocReader';
import type { ReaderSection, ReaderItem } from './DocReader';
import type { FemmesChapitre, FemmesSegment } from '../types';

const AUTRES = 'Autres';
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Rendu d'un segment : arabe + matn (encadré) + commentaire (Markdown) + source. */
const Segment: React.FC<{ seg: FemmesSegment }> = ({ seg }) => (
  <div className="space-y-2">
    {seg.texte_arabe && (
      <p lang="ar" dir="rtl" className="font-display text-2xl leading-loose text-ink text-center">{seg.texte_arabe}</p>
    )}
    {seg.matn && (
      <div className="bg-glass-tint border-l-4 border-green rounded-r-lg px-4 py-3">
        <p className="font-semibold text-ink leading-relaxed">{seg.matn}</p>
      </div>
    )}
    {seg.commentaire && (
      <div className={seg.matn ? 'px-4 pt-1' : ''}>
        {seg.matn && <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">Commentaire</p>}
        <Markdown>{seg.commentaire}</Markdown>
      </div>
    )}
    {seg.source && <p className="text-xs italic text-muted px-4">Source : {seg.source}</p>}
  </div>
);

/** Contenu d'un cours : plat, ou découpé en parties (sommaire + sections ancrées). */
const CoursContent: React.FC<{ chap: FemmesChapitre }> = ({ chap }) => {
  // Regroupe les segments par partie interne (14.B.3). Ordre préservé par la RPC.
  const parts: { titre: string; key: string; segs: FemmesSegment[] }[] = [];
  for (const s of chap.segments) {
    const titre = s.section_titre ?? '';
    const last = parts[parts.length - 1];
    if (titre && (!last || last.titre !== titre)) parts.push({ titre, key: slug(`${chap.chapitre}-${titre}`), segs: [s] });
    else if (titre && last) last.segs.push(s);
    else if (last && !last.titre) last.segs.push(s);
    else parts.push({ titre: '', key: `flat-${parts.length}`, segs: [s] });
  }
  const hasSections = parts.filter((p) => p.titre).length > 1;

  if (!hasSections) {
    return <div className="space-y-6">{chap.segments.map((seg) => <Segment key={seg.id} seg={seg} />)}</div>;
  }

  return (
    <div className="space-y-7">
      <nav aria-label="Sommaire du cours" className="flex flex-wrap gap-2 rounded-lg border border-line bg-glass-tint px-3 py-2.5">
        {parts.filter((p) => p.titre).map((p) => (
          <a key={p.key} href={`#${p.key}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(p.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            className="text-[13px] font-medium text-green hover:text-ink rounded-full border border-green-line bg-surface px-3 py-1">{p.titre}</a>
        ))}
      </nav>
      {parts.map((p) => (
        <section key={p.key} id={p.titre ? p.key : undefined} style={{ scrollMarginTop: 80 }}>
          {p.titre && <h3 className="font-display font-bold text-ink text-lg mb-3 pb-1.5 border-b border-line">{p.titre}</h3>}
          <div className="space-y-6">{p.segs.map((seg) => <Segment key={seg.id} seg={seg} />)}</div>
        </section>
      ))}
    </div>
  );
};

/**
 * Lecteur des cours « femmes » (14.B) : sommaire regroupé PAR CATÉGORIE
 * (réglée en admin ; catégories vides masquées), volet de lecture = le cours,
 * avec parties internes pour les cours composés (ex. al-istiḥāḍah).
 */
export const FemmesReader: React.FC<{ chapitres: FemmesChapitre[] }> = ({ chapitres }) => {
  // Regroupe par catégorie, ordonné par cat_ordre ; « Autres » en dernier.
  const byCat = new Map<string, { ordre: number; chaps: FemmesChapitre[] }>();
  for (const chap of chapitres) {
    const cat = (chap.categorie ?? '').trim() || AUTRES;
    const ordre = cat === AUTRES ? 9999 : (chap.cat_ordre ?? 500);
    if (!byCat.has(cat)) byCat.set(cat, { ordre, chaps: [] });
    byCat.get(cat)!.chaps.push(chap);
  }
  const sections: ReaderSection[] = [...byCat.entries()]
    .sort((a, b) => a[1].ordre - b[1].ordre || a[0].localeCompare(b[0]))
    .map(([cat, { chaps }]) => ({
      chapitre: cat,
      items: chaps.map<ReaderItem>((chap) => ({
        key: chap.chapitre,
        title: chap.chapitre,
        search: `${chap.chapitre} ${chap.segments.map((s) => `${s.matn ?? ''} ${s.commentaire ?? ''}`).join(' ')}`,
        content: <CoursContent chap={chap} />,
      })),
    }));

  return <DocReader sections={sections} searchPlaceholder="Rechercher un cours…" title="La femme musulmane" />;
};

export default FemmesReader;
