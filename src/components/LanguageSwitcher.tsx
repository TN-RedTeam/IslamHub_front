import React, { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useLocale, stripLocale } from '../lib/router';
import { LOCALES, type Locale } from '../i18n';

/**
 * Sélecteur de langue (Phase 15.3) — bascule `/fr` ⇄ `/en` ⇄ `/ar` en
 * **conservant la page courante** (même chemin, préfixe de langue remplacé),
 * requête et ancre préservées. Libellés via i18n (`lang.*`), aucun texte en dur.
 *
 * Deux variantes :
 *  - `bar`    : bouton + menu déroulant (barre haute, desktop) ;
 *  - `drawer` : liste à plat (menu replié mobile, déjà déployé).
 *
 * Accessible clavier : bouton `aria-haspopup`/`aria-expanded`, options
 * `menuitemradio` + `aria-checked`, fermeture par Échap (focus rendu au
 * bouton) et clic extérieur.
 */
export const LanguageSwitcher: React.FC<{ variant?: 'bar' | 'drawer' }> = ({ variant = 'bar' }) => {
  const { t } = useTranslation();
  const current = useLocale();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Chemin sans préfixe de langue → on reconstruit avec la langue cible.
  const base = stripLocale(pathname);

  const choose = (loc: Locale) => {
    setOpen(false);
    // Cible déjà préfixée → le wrapper ne re-préfixe pas.
    navigate(`/${loc}${base === '/' ? '' : base}${search}${hash}`);
  };

  // Fermeture au clic extérieur / touche Échap (focus rendu au bouton).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Variante « drawer » (mobile) : liste à plat, pas de déroulant.
  if (variant === 'drawer') {
    return (
      <div role="group" aria-label={t('lang.switch')}>
        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {t('lang.switch')}
        </p>
        {LOCALES.map((loc) => {
          const on = loc === current;
          return (
            <button
              key={loc}
              type="button"
              lang={loc}
              onClick={() => choose(loc)}
              aria-current={on ? 'true' : undefined}
              className={`flex w-full items-center gap-2 pl-6 pr-4 py-2.5 rounded-lg mb-0.5 font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                on ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
              }`}
            >
              <Check className={`w-4 h-4 shrink-0 ${on ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
              {t(`lang.${loc}`)}
            </button>
          );
        })}
      </div>
    );
  }

  // Variante « bar » (desktop) : bouton + menu déroulant.
  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('lang.switch')}
        className="h-9 px-2.5 inline-flex items-center gap-1 rounded-lg border border-line bg-ivory text-muted hover:text-ink hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
      >
        <Globe className="w-5 h-5" aria-hidden="true" />
        <span className="text-[12px] font-semibold uppercase tracking-wide">{current}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t('lang.switch')}
          className="absolute end-0 top-full mt-1.5 min-w-[160px] rounded-xl border border-glass-border bg-bg1 backdrop-blur-md shadow-glass py-1.5 z-50"
        >
          {LOCALES.map((loc) => {
            const on = loc === current;
            return (
              <button
                key={loc}
                type="button"
                lang={loc}
                role="menuitemradio"
                aria-checked={on}
                onClick={() => choose(loc)}
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                  on ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
                }`}
              >
                <Check className={`w-4 h-4 shrink-0 ${on ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                {t(`lang.${loc}`)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
