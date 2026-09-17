import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Markdown } from './Markdown';
import type { Bloc, BlocRef } from '../types';

/**
 * Rendu d'un article composé par blocs (Phase 3.4) — reproduit la maquette
 * validée `docs/islamhub-article-composable.html` :
 *  - liseré OR = preuve (référence à une source existante, lue en direct) ;
 *  - liseré BLEU = commentaire libre ;
 *  - sommaire ancré depuis les titres (##) des blocs Texte.
 * Les preuves ne recopient rien : texte/réf/lien viennent de `bloc.ref`.
 */

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function sourceLink(citation: Bloc['citation_type'], ref: BlocRef): string | null {
  if (!ref) return null;
  if (citation === 'hadith') return `/hadiths/${ref.id}/${ref.slug ?? ''}`;
  if (citation === 'parole') return ref.slug ? `/paroles/${ref.slug}` : null;
  if (citation === 'verset') return '/coran';
  return null;
}
function badgeText(citation: Bloc['citation_type'], ref: BlocRef): string | null {
  if (citation === 'verset') return ref.sourate ?? null;
  if (citation === 'hadith') return ref.degre_authenticite ?? ref.recueils ?? null;
  if (citation === 'parole') return ref.ecole ?? null;
  return null;
}

const Proof: React.FC<{ b: Bloc }> = ({ b }) => {
  const ref = b.ref;
  if (!ref) return null;
  const kind = b.citation_type === 'hadith' ? 'Hadith' : b.citation_type === 'parole' ? 'Parole de savant' : 'Coran';
  const href = sourceLink(b.citation_type, ref);
  const badge = badgeText(b.citation_type, ref);
  return (
    <div className="my-5 rounded-r-card border border-line border-l-[3px] border-l-gold bg-surface px-5 py-4 shadow-card">
      <div className="flex items-center gap-2 mb-2.5 text-[10.5px] uppercase tracking-[0.12em] text-muted">
        <span className="text-gold font-bold">Preuve</span>
        <span>· {kind}</span>
        <span className="ml-auto normal-case tracking-normal">réutilisée depuis la rubrique {b.source_rubrique}</span>
      </div>

      {b.citation_type === 'parole' && (ref.savant || ref.sujet) && (
        <p className="font-display font-semibold text-green-deep text-[16px] mb-1.5">
          {ref.savant_slug ? <Link to={`/savants/${ref.savant_slug}`} className="hover:underline">{ref.savant}</Link> : ref.savant}
          {badge && <span className="ml-2 align-middle text-[10px] font-bold uppercase text-[#7a5a17] bg-gold-soft border border-gold rounded-full px-2 py-0.5">{badge}</span>}
        </p>
      )}

      {ref.texte_arabe && <p className="font-arabic text-right leading-[2] text-ink" dir="rtl" lang="ar" style={{ fontSize: 'clamp(20px,4.2vw,26px)' }}>{ref.texte_arabe}</p>}

      {ref.texte_francais && (
        <p className="mt-2 text-ink">
          <span className="text-muted italic">ce qui signifie&nbsp;: </span>«&nbsp;{ref.texte_francais}&nbsp;»
          {b.citation_type !== 'parole' && badge && <span className="ml-2 align-middle text-[10px] font-bold uppercase text-[#7a5a17] bg-gold-soft border border-gold rounded-full px-2 py-0.5">{badge}</span>}
        </p>
      )}

      {href && (
        <Link to={href} className="inline-flex items-center gap-1.5 mt-2.5 text-[12.5px] font-semibold text-green hover:text-green-deep">
          <BookOpen className="w-4 h-4" /> Voir la source {b.citation_type === 'parole' ? 'et le scan' : ''} <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )}

      {b.commentaire_md && (
        <div className="mt-3 -mx-5 -mb-4 px-5 py-2.5 border-t border-dashed border-line bg-gold-soft/60 rounded-br-card">
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-[#7a5a17] font-bold mr-1.5">Commentaire</span>
          <div className="text-[15px] text-muted italic [&_p]:my-1"><Markdown>{b.commentaire_md}</Markdown></div>
        </div>
      )}
    </div>
  );
};

const Callout: React.FC<{ b: Bloc }> = ({ b }) => (
  <div className="my-5 rounded-r-card border border-line border-l-[3px] border-l-[#3f6c96] bg-[#eef2f6] dark:bg-[#12303f] px-5 py-4">
    <p className="text-[10.5px] uppercase tracking-[0.12em] text-[#3f6c96] dark:text-[#7fb0dd] font-bold mb-1.5">Note de l’auteur</p>
    <div className="text-ink [&_p]:my-1.5"><Markdown>{b.texte_md ?? ''}</Markdown></div>
  </div>
);

export const ArticleBlocs: React.FC<{ blocs: Bloc[]; showToc?: boolean }> = ({ blocs, showToc = true }) => {
  // Sommaire : premier titre (## …) de chaque bloc Texte.
  const toc = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    blocs.forEach((b, i) => {
      if (b.type === 'texte' && b.texte_md) {
        const m = b.texte_md.match(/^\s*#{1,3}\s+(.+)$/m);
        if (m) out.push({ id: `bloc-${i}-${slugify(m[1]).slice(0, 40)}`, label: m[1].trim() });
      }
    });
    return out;
  }, [blocs]);

  const tocIdFor = (i: number): string | undefined => {
    const b = blocs[i];
    if (b.type !== 'texte' || !b.texte_md) return undefined;
    const m = b.texte_md.match(/^\s*#{1,3}\s+(.+)$/m);
    return m ? `bloc-${i}-${slugify(m[1]).slice(0, 40)}` : undefined;
  };

  const body = (
    <div className="max-w-[68ch]">
      {blocs.map((b, i) => {
        if (b.type === 'preuve') return <Proof key={b.id} b={b} />;
        if (b.type === 'commentaire') return <Callout key={b.id} b={b} />;
        return (
          <section key={b.id} id={tocIdFor(i)} style={{ scrollMarginTop: 80 }} className="[&_h4]:scroll-mt-20">
            <Markdown>{b.texte_md ?? ''}</Markdown>
          </section>
        );
      })}
    </div>
  );

  if (!showToc || toc.length < 2) return body;

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-[210px_1fr] gap-8 items-start">
      <nav aria-label="Sommaire" className="min-[900px]:sticky min-[900px]:top-20">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold font-bold mb-2.5">Sommaire</p>
        <ol className="list-none m-0 p-0">
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className="block text-[13.5px] text-muted hover:text-green-deep border-l-2 border-line hover:border-gold pl-3 py-1.5 leading-snug">{t.label}</a>
            </li>
          ))}
        </ol>
      </nav>
      {body}
    </div>
  );
};

export default ArticleBlocs;
