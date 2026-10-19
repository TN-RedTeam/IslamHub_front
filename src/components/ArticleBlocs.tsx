import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Image as ImageIcon, ArrowUp, List } from 'lucide-react';
import { Markdown } from './Markdown';
import { Lightbox, type LightboxImage } from './Lightbox';
import { UI } from '../strings';
import type { Bloc, BlocRef } from '../types';

/**
 * Rendu d'un article composé par blocs (Phase 3.4, finitions 13.2).
 * On RESTE dans l'article : le scan s'ouvre en lightbox, la référence complète
 * est inline, et le lien vers la fiche dédiée est secondaire (nouvel onglet).
 * Sommaire ancré (sticky desktop, dépliant mobile) + section active + retour haut.
 */

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function sourceLink(citation: Bloc['citation_type'], ref: BlocRef): string | null {
  if (!ref) return null;
  if (citation === 'hadith') return `/hadiths/${ref.id}/${ref.slug ?? ''}`;
  if (citation === 'parole') return ref.slug ? `/paroles/${ref.slug}` : null;
  if (citation === 'verset') return '/coran';
  return null;
}
function badgeText(citation: Bloc['citation_type'], ref: BlocRef): string | null {
  if (citation === 'verset') return ref.sourate ?? null;
  if (citation === 'hadith') return ref.degre_authenticite ?? null;
  if (citation === 'parole') return ref.ecole ?? null;
  return null;
}
/** Référence complète, inline (recueil/n°, auteur, degré, livre & page). */
function fullReference(citation: Bloc['citation_type'], ref: BlocRef): string {
  if (ref.libre) return ref.ref ?? '';
  const parts: string[] = [];
  if (citation === 'hadith') {
    if (ref.recueils) parts.push(`Rapporté par ${ref.recueils}`);
    if (ref.degre_authenticite) parts.push(`Authenticité : ${ref.degre_authenticite}`);
  } else if (citation === 'parole') {
    const livre = [ref.source_livre, ref.page ? `p. ${ref.page}` : ''].filter(Boolean).join(', ');
    if (livre) parts.push(livre);
  } else if (citation === 'verset') {
    if (ref.sourate) parts.push(`Sourate ${ref.sourate}`);
  }
  return parts.join(' — ');
}

const Proof: React.FC<{ b: Bloc }> = ({ b }) => {
  const ref = b.ref;
  const [zoom, setZoom] = useState<LightboxImage | null>(null);
  if (!ref) return null;
  const isLibre = !!ref.libre;
  const kind = b.citation_type === 'hadith' ? 'Hadith' : b.citation_type === 'parole' ? 'Parole de savant' : 'Coran';
  const href = isLibre ? null : sourceLink(b.citation_type, ref);
  const badge = isLibre ? null : badgeText(b.citation_type, ref);
  const fullRef = fullReference(b.citation_type, ref);
  const scans = ref.images ?? [];

  return (
    <figure className="my-6 rounded-xl border border-green-line/70 border-l-[3px] border-l-green bg-green-soft/25 px-5 py-4">
      <figcaption className="flex items-center gap-2 mb-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-green">{kind}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-green/90 bg-surface/60 border border-green-line rounded-full px-2 py-0.5">{badge}</span>
        )}
      </figcaption>

      {b.citation_type === 'parole' && ref.savant && (
        <p className="font-display font-semibold text-ink text-[15.5px] mb-2">
          {ref.savant_slug ? <Link to={`/savants/${ref.savant_slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-green transition-colors">{ref.savant}</Link> : ref.savant}
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

      {fullRef && <p className="mt-2 text-[12.5px] text-muted">{fullRef}</p>}

      {(scans.length > 0 || href) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {scans.length > 0 && (
            <button
              type="button"
              onClick={() => setZoom({ image_url: scans[0].image_url, alt: scans[0].alt, legende: scans[0].legende ?? undefined, source_livre: scans[0].source_livre ?? ref.source_livre ?? undefined, source_livre_ar: scans[0].source_livre_ar ?? undefined })}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-green hover:text-green-deep transition-colors"
            >
              <ImageIcon className="w-4 h-4" /> {UI.article.viewScan}
            </button>
          )}
          {href && (
            <Link to={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted hover:text-ink transition-colors">
              <BookOpen className="w-4 h-4" /> {UI.article.openSource} <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {b.commentaire_md && (
        <div className="mt-3.5 pt-3 border-t border-dashed border-green-line/60">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted font-bold mr-1.5">Commentaire</span>
          <div className="text-[14.5px] text-ink/75 italic [&_p]:my-1"><Markdown>{b.commentaire_md}</Markdown></div>
        </div>
      )}

      <Lightbox image={zoom} onClose={() => setZoom(null)} />
    </figure>
  );
};

const Callout: React.FC<{ b: Bloc }> = ({ b }) => (
  <aside className="my-6 rounded-xl border border-line bg-ground/70 px-5 py-4">
    <p className="text-[10.5px] uppercase tracking-[0.14em] text-muted font-bold mb-1.5">Note</p>
    <div className="text-ink/90 leading-relaxed [&_p]:my-1.5"><Markdown>{b.texte_md ?? ''}</Markdown></div>
  </aside>
);

/** Section active au scroll (surligne l'entrée du sommaire). */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

export const ArticleBlocs: React.FC<{ blocs: Bloc[]; showToc?: boolean }> = ({ blocs, showToc = true }) => {
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

  const activeId = useActiveSection(toc.map((t) => t.id));
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
  const toTop = () => window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });

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

  const BackToTop = showTop ? (
    <button
      type="button" onClick={toTop} aria-label={UI.article.backToTop}
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-1.5 rounded-full bg-accent-deep text-white shadow-card px-3.5 py-2.5 text-sm font-medium hover:brightness-110 transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
    >
      <ArrowUp className="w-4 h-4" /> <span className="hidden sm:inline">{UI.article.backToTop}</span>
    </button>
  ) : null;

  if (!showToc || toc.length < 2) return <>{body}{BackToTop}</>;

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-[210px_1fr] gap-8 items-start">
      {/* Mobile : sommaire dépliant */}
      <details className="min-[900px]:hidden rounded-xl border border-line bg-surface">
        <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-[13.5px] font-semibold text-ink list-none [&::-webkit-details-marker]:hidden">
          <List className="w-4 h-4 text-green" /> {UI.article.toc}
        </summary>
        <ol className="list-none m-0 px-2 pb-2 pt-0">
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); goTo(t.id); (e.currentTarget.closest('details') as HTMLDetailsElement).open = false; }}
                className={`block text-[13.5px] pl-3 py-1.5 border-l-2 leading-snug ${activeId === t.id ? 'border-gold text-ink font-medium' : 'border-line text-muted'}`}>{t.label}</a>
            </li>
          ))}
        </ol>
      </details>

      {/* Desktop : sommaire sticky + section active */}
      <nav aria-label={UI.article.toc} className="hidden min-[900px]:block min-[900px]:sticky min-[900px]:top-20 self-start">
        <p className="text-[11px] uppercase tracking-[0.16em] text-accent font-bold mb-2.5">{UI.article.toc}</p>
        <ol className="list-none m-0 p-0">
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); goTo(t.id); }}
                aria-current={activeId === t.id ? 'location' : undefined}
                className={`block text-[13.5px] border-l-2 pl-3 py-1.5 leading-snug transition-colors ${activeId === t.id ? 'border-gold text-ink font-medium' : 'border-line text-muted hover:text-ink hover:border-gold'}`}>{t.label}</a>
            </li>
          ))}
        </ol>
      </nav>
      {body}
      {BackToTop}
    </div>
  );
};

export default ArticleBlocs;
