import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BadgeGeneration } from './BadgeGeneration';
import type { ExposeCitation } from '../types';

/**
 * Bloc de citation réutilisable (verset coranique en clair, ou hadith / parole
 * référencé). Pour une parole, lien vers sa page dédiée (/paroles/:slug, scans).
 * Même mécanisme que les preuves des attributs / versets équivoques.
 */
export const ExposeCitationBloc: React.FC<{ c: ExposeCitation }> = ({ c }) => {
  const tag = c.type === 'parole' ? 'Parole de savant' : c.type === 'hadith' ? 'Hadith' : 'Coran';
  const tagCls = c.type === 'parole' || c.type === 'hadith'
    ? 'bg-gold-soft text-[#7a5a17] border-[#e6d3a3]'
    : 'bg-green-soft text-green-deep border-green-line';

  return (
    <figure className="rounded-xl border border-line bg-surface p-4 mt-3">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={`inline-block text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border ${tagCls}`}>{tag}</span>
        {c.type === 'parole' && c.savant && (c.savant_slug ? (
          <Link to={`/savants/${c.savant_slug}`} className="font-display font-semibold text-green-deep hover:underline">{c.savant}</Link>
        ) : (
          <span className="font-display font-semibold text-green-deep">{c.savant}</span>
        ))}
        {c.type === 'parole' && <BadgeGeneration generation={c.generation} />}
      </div>

      {c.arabe && <p className="font-arabic text-2xl leading-loose text-right text-ink whitespace-pre-wrap line-clamp-4" dir="rtl" lang="ar">{c.arabe}</p>}
      {c.phonetique && <p className="text-sm text-muted italic mt-2 [unicode-bidi:plaintext]">{c.phonetique}</p>}
      {c.signification && <p className="text-ink mt-2 pl-3.5 border-l-2 border-gold line-clamp-4 [unicode-bidi:plaintext]">{c.signification}</p>}
      {c.ref && <figcaption className="text-xs uppercase tracking-wide text-gold font-semibold mt-2">{c.ref}</figcaption>}

      {c.type === 'parole' && c.parole_slug && (
        <Link to={`/paroles/${c.parole_slug}`} className="inline-flex items-center gap-1.5 mt-3 text-green text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green rounded">
          Voir la parole complète et le scan <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {c.type === 'hadith' && c.hadith_id && c.hadith_slug && (
        <Link to={`/hadiths/${c.hadith_id}/${c.hadith_slug}`} className="inline-flex items-center gap-1.5 mt-3 text-green text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green rounded">
          Voir le hadith <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </figure>
  );
};

export default ExposeCitationBloc;
