import React from 'react';

/**
 * Badge de génération / rôle d'un savant ou narrateur.
 *
 * Génération : sahabi (Compagnon) → tabii → tabi_tabii → khalaf.
 *   Les trois premiers sont les Salaf. sahabi en or, tabii/tabi_tabii en vert
 *   « Salaf », khalaf en contour sobre.
 * Rôle (narrateurs) — prioritaire sur la génération, badge distinct :
 *   epouse_prophete  → « Mère des croyants » (or plein), honorifique au féminin
 *   calife_rachidoun → « Calife bien-guidé »  (vert plein)
 *
 * Honorifiques : écrits en points de code Unicode (aucun glyphe arabe saisi),
 * déclinés au masculin / féminin selon `sexe`.
 *   Compagnon : raḍiya Llāhu ʿanhu / ʿanhā
 *   autres    : raḥimahu / raḥimahā Llāh
 */
type Gen = 'sahabi' | 'salaf' | 'tabii' | 'tabi_tabii' | 'khalaf';
type Role = 'epouse_prophete' | 'calife_rachidoun';
type HonorLevel = 'sahabi' | 'default';

// raḍiya Llāhu ʿanhu / ʿanhā ; raḥimahu / raḥimahā Llāh
const HONOR: Record<HonorLevel, { m: string; f: string }> = {
  sahabi: {
    m: 'رضي الله عنه',
    f: 'رضي الله عنها',
  },
  default: {
    m: 'رحمه الله',
    f: 'رحمها الله',
  },
};

type Entry = { label: string; cls: string; honor: HonorLevel };

const GEN: Record<Gen, Entry> = {
  sahabi:     { label: 'Compagnon', cls: 'bg-gold-soft text-[#7a5a17] border-[#e6d3a3]', honor: 'sahabi' },
  salaf:      { label: 'Salaf',     cls: 'bg-green-soft text-green-deep border-green-line', honor: 'default' },
  tabii:      { label: 'Salaf',     cls: 'bg-green-soft text-green-deep border-green-line', honor: 'default' },
  tabi_tabii: { label: 'Salaf',     cls: 'bg-green-soft text-green-deep border-green-line', honor: 'default' },
  khalaf:     { label: 'Khalaf',    cls: 'bg-transparent text-muted border-line',           honor: 'default' },
};

const ROLE: Record<Role, Entry> = {
  epouse_prophete:  { label: 'Mère des croyants', cls: 'bg-gold text-white border-gold',   honor: 'sahabi' },
  calife_rachidoun: { label: 'Calife bien-guidé',  cls: 'bg-green text-white border-green', honor: 'sahabi' },
};

/** Le rôle prime sur la génération ; sinon on retombe sur la génération. */
const resolve = (generation?: string | null, role?: string | null): Entry | null => {
  if (role && role in ROLE) return ROLE[role as Role];
  if (generation && generation in GEN) return GEN[generation as Gen];
  return null;
};

/** Honorifique arabe (au bon genre), ou null si aucun rôle/génération connu. */
export const honorificFor = (
  generation?: string | null,
  opts?: { sexe?: string | null; role?: string | null },
): string | null => {
  const e = resolve(generation, opts?.role);
  if (!e) return null;
  return HONOR[e.honor][opts?.sexe === 'f' ? 'f' : 'm'];
};

/** Pastille de génération/rôle ; `withHonorific` ajoute l'honorifique arabe à droite. */
export const BadgeGeneration: React.FC<{
  generation?: string | null;
  role?: string | null;
  sexe?: string | null;
  withHonorific?: boolean;
  className?: string;
}> = ({ generation, role, sexe, withHonorific = false, className = '' }) => {
  const e = resolve(generation, role);
  if (!e) return null;
  const honor = HONOR[e.honor][sexe === 'f' ? 'f' : 'm'];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`inline-block text-[11px] font-semibold tracking-[0.02em] px-2.5 py-0.5 rounded-full border ${e.cls}`}>
        {e.label}
      </span>
      {withHonorific && (
        <span className="font-arabic-name font-medium text-ink text-[15px]" lang="ar" dir="rtl">{honor}</span>
      )}
    </span>
  );
};

export default BadgeGeneration;
