import React from 'react';

/**
 * Badge de génération d'un savant (Phase 12.6).
 * Échelle : sahabi (Compagnon) → tabii → tabi_tabii → khalaf.
 * Les trois premiers sont les Salaf. Hiérarchie visuelle : sahabi en or,
 * tabii/tabi_tabii en vert « Salaf », khalaf en contour sobre.
 *
 * Honorifiques : écrits en points de code Unicode (aucun glyphe arabe saisi).
 *   sahabi  -> radiya Llahu 'anhu
 *   autres  -> rahimahu Llah
 */
type Gen = 'sahabi' | 'tabii' | 'tabi_tabii' | 'khalaf';

// radiya Llahu 'anhu
const HONOR_SAHABI = '\u0631\u0636\u064A \u0627\u0644\u0644\u0647 \u0639\u0646\u0647';
// rahimahu Llah
const HONOR_DEFAULT = '\u0631\u062D\u0645\u0647 \u0627\u0644\u0644\u0647';

const GEN: Record<Gen, { label: string; cls: string; honor: string }> = {
  sahabi:     { label: 'Compagnon', cls: 'bg-gold-soft text-[#7a5a17] border-[#e6d3a3]', honor: HONOR_SAHABI },
  tabii:      { label: 'Salaf',     cls: 'bg-green-soft text-green-deep border-green-line', honor: HONOR_DEFAULT },
  tabi_tabii: { label: 'Salaf',     cls: 'bg-green-soft text-green-deep border-green-line', honor: HONOR_DEFAULT },
  khalaf:     { label: 'Khalaf',    cls: 'bg-transparent text-muted border-line',           honor: HONOR_DEFAULT },
};

/** Honorifique arabe dérivé de la génération (ou null si inconnue). */
export const honorificFor = (generation?: string | null): string | null =>
  generation && generation in GEN ? GEN[generation as Gen].honor : null;

/** Pastille de génération ; `withHonorific` ajoute l'honorifique arabe à droite. */
export const BadgeGeneration: React.FC<{ generation?: string | null; withHonorific?: boolean; className?: string }> = ({
  generation, withHonorific = false, className = '',
}) => {
  if (!generation || !(generation in GEN)) return null;
  const g = GEN[generation as Gen];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`inline-block text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-full border ${g.cls}`}>
        {g.label}
      </span>
      {withHonorific && (
        <span className="font-arabic text-muted text-[15px]" lang="ar" dir="rtl">{g.honor}</span>
      )}
    </span>
  );
};

export default BadgeGeneration;
