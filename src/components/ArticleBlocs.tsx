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
  const isLibre = !!ref.libre;
  const kind = b.citation_type === 'hadith' ? 'Hadith' : b.citation_type === 'parole' ? 'Parole de savant' : 'Coran';
  const href = isLibre ? null : sourceLink(b.citation_type, ref);
  const badge = isLibre ? null : badgeText(b.citation_type, ref);
  return (
    <figure className="my-6 rounded-xl border border-green-line/70 border-l-[3px] border-l-green bg-green-soft/25 px-5 py-4">
      {/* En-tête discret : nature de la source + éventuel degré/école/sourate */}
      <figcaption className="flex items-center gap-2 mb-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green">{kind}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-green/90 bg-surface/60 border border-green-line rounded-full px-2 py-0.5">{badge}</span>
        )}
      </figcaption>

      {b.citation_type === 'parole' && ref.savant && (
        <p className="font-display font-semibold text-ink text-[15.5px] mb-2">
          {ref.savant_slug ? <Link to={`/savants/${ref.savant_slug}`} className="hover:text-green transition-colors">{ref.savant}</Link> : ref.savant}
        </p>
      )}

      {ref.texte_arabe && (
        <p className="font-arabic text-right leading-[2.05] text-ink" dir="rtl" lang="ar" style={{ fontSize: 'clamp(17px,2.8vw,20px)' }}>{ref.texte_arabe}</p>
      )}

      {ref.texte_francais && (
        <p className="mt-3 pt-3 border-t border-green-line/50 text-[15px] leading-relaxed text-ink/85 [unicode-bidi:plaintext]">
          <span className="text-muted italic">ce qui signifie&nbsp;: </span>«&nbsp;{ref.texte_francais}&nbsp;»
        </p>
      )}

      {isLibre && ref.ref && <p className="mt-2 text-[12.5px] font-medium text-muted">— {ref.ref}</p>}

      {href && (
        <Link to={href} className="inline-flex items-center gap-1.5 mt-3 text-[12.5px] font-semibold text-green hover:text-green-deep transition-colors">
          <BookOpen className="w-4 h-4" /> Voir la source{b.citation_type === 'parole' ? ' et le scan' : ''} <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )}

      {b.commentaire_md && (
        <div className="mt-3.5 pt-3 border-t border-dashed border-green-line/60">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted font-bold mr-1.5">Commentaire</span>
          <div className="text-[14.5px] text-ink/75 italic [&_p]:my-1"><Markdown>{b.commentaire_md}</Markdown></div>
        </div>
      )}
    </figure>
  );
};

const Callout: React.FC<{ b: Bloc }> = ({ b }) => (
  <aside className="my-6 rounded-xl border border-line bg-ground/70 px-5 py-4">
    <p className="text-[10.5px] uppercase tracking-[0.14em] text-muted font-bold mb-1.5">Note</p>
    <div className="text-ink/90 leading-relaxed [&_p]:my-1.5"><Markdown>{b.texte_md ?? ''}</Markdown></div>
  </aside>
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
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent font-bold mb-2.5">Sommaire</p>
        <ol className="list-none m-0 p-0">
          {toc.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="block text-[13.5px] text-muted hover:text-ink border-l-2 border-line hover:border-gold pl-3 py-1.5 leading-snug"
              >{t.label}</a>
            </li>
          ))}
        </ol>
      </nav>
      {body}
    </div>
  );
};

export default ArticleBlocs;
