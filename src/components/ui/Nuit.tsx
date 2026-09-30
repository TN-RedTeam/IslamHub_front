import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Primitives « Nuit Teal » (Phase 8.3) — briques réutilisables de la charte :
 * cartes verre, tuiles, monogrammes, lignes de liste, chips, en-têtes.
 * Tout est piloté par les tokens (accent menthe, verre) : rien en dur.
 */

/** Carte « verre » : fond translucide, bord fin, flou, coins doux. */
export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { tint?: boolean }> = ({ tint, className = '', ...p }) => (
  <div
    className={`rounded-glass border border-glass-border ${tint ? 'bg-glass-tint' : 'bg-glass'} backdrop-blur-md shadow-glass ${className}`}
    {...p}
  />
);

/** En-tête de section : titre + lien « Tout voir » optionnel. */
export const SectionHeader: React.FC<{ title: string; to?: string; seeLabel?: string }> = ({ title, to, seeLabel = 'Tout voir' }) => (
  <div className="flex items-baseline justify-between gap-3 mt-8 mb-3">
    <h2 className="font-display font-extrabold tracking-[-0.01em] text-ink text-[17px]">{title}</h2>
    {to && <Link to={to} className="shrink-0 text-[13px] font-semibold text-accent hover:underline">{seeLabel}</Link>}
  </div>
);

/** Tuile de rubrique : pastille icône + titre + compteur. */
export const Tile: React.FC<{ to: string; icon: React.ReactNode; title: string; meta?: string }> = ({ to, icon, title, meta }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-[18px] border border-glass-border bg-glass p-4 transition-colors hover:border-accent/60 motion-reduce:transition-none"
  >
    <span className="grid place-items-center w-10 h-10 shrink-0 rounded-[12px] bg-glass-tint text-accent">{icon}</span>
    <span className="min-w-0">
      <span className="block font-bold text-[13.5px] text-ink truncate">{title}</span>
      {meta && <span className="mt-0.5 block text-[11px] text-muted truncate">{meta}</span>}
    </span>
  </Link>
);

/** Monogramme d'un savant : lettre arabe dans un cercle verre. Jamais de visage. */
export const SavantMonogram: React.FC<{ to: string; letter: string; name: string; role?: string }> = ({ to, letter, name, role }) => (
  <Link
    to={to}
    className="flex-none w-24 rounded-[16px] border border-glass-border bg-glass p-3 text-center transition-colors hover:border-accent/60 motion-reduce:transition-none"
  >
    <span className="mx-auto mb-2 grid place-items-center w-10 h-10 rounded-full border border-glass-border bg-glass-tint font-arabic-display text-[22px] text-accent" lang="ar" dir="rtl">{letter}</span>
    <span className="block text-[11.5px] font-semibold text-ink truncate">{name}</span>
    {role && <span className="mt-0.5 block text-[9px] uppercase tracking-[0.05em] text-muted truncate">{role}</span>}
  </Link>
);

/** Petite pilule d'information. */
export const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-[11px] font-semibold text-muted whitespace-nowrap">{children}</span>
);

/** Ligne de liste « verre » : index en losange + titre/méta + arabe à droite. */
export const ListRow: React.FC<{ to: string; index: React.ReactNode; title: string; meta?: string; arabic?: string | null }> = ({ to, index, title, meta, arabic }) => (
  <Link
    to={to}
    className="flex items-center gap-3.5 rounded-[16px] border border-glass-border bg-glass px-4 py-3 transition-colors hover:border-accent/60 motion-reduce:transition-none"
  >
    <span className="grid place-items-center w-[34px] h-[34px] shrink-0 rotate-45 rounded-[11px] bg-glass-tint text-accent font-extrabold text-[13px]">
      <span className="-rotate-45 tabular-nums">{index}</span>
    </span>
    <span className="flex-1 min-w-0">
      <span className="block font-bold text-[14px] text-ink truncate">{title}</span>
      {meta && <span className="mt-0.5 block text-[11px] text-muted truncate">{meta}</span>}
    </span>
    {arabic && <span className="shrink-0 font-arabic text-[19px] text-accent-br" lang="ar" dir="rtl">{arabic}</span>}
  </Link>
);

/** Bouton plein (dégradé accent, texte sombre) ou secondaire (contour verre). */
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost' }> = ({ variant = 'solid', className = '', ...p }) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-[filter,background-color] motion-reduce:transition-none ${
      variant === 'solid'
        ? 'bg-gradient-to-br from-accent-br to-accent-deep text-[#062018] hover:brightness-105'
        : 'border border-glass-border bg-glass text-ink hover:border-accent/60'
    } ${className}`}
    {...p}
  />
);
