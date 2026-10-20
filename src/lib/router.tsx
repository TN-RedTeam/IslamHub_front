import { createContext, useCallback, useContext, forwardRef } from 'react';
import {
  Link as RRLink,
  NavLink as RRNavLink,
  Navigate as RRNavigate,
  useNavigate as useRRNavigate,
  useLocation as useRRLocation,
  type LinkProps,
  type NavLinkProps,
  type NavigateProps,
  type NavigateFunction,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale, type Locale } from '../i18n';

/**
 * Routage localisé (Phase 15.3) — drop-in pour `react-router-dom`.
 *
 * Toutes les URL publiques sont préfixées par la langue (`/fr`, `/en`, `/ar`).
 * Ce module ré-exporte `react-router-dom` à l'identique mais surcharge
 * `Link`, `NavLink`, `Navigate` et `useNavigate` pour **préfixer
 * automatiquement** la langue active aux chemins absolus — les ~140 liens
 * existants (`to="/hadiths"`, `navigate('/coran')`…) restent inchangés.
 *
 * Règles de préfixe :
 *  • chemin relatif (sans `/` initial) → inchangé ;
 *  • `/admin/…` → inchangé (l'admin reste non préfixé, FR) ;
 *  • chemin déjà préfixé (`/fr/…`) → inchangé ;
 *  • sinon → `/<langue active><chemin>`.
 */

// Ré-exporte tout react-router-dom ; les exports nommés ci-dessous priment.
export * from 'react-router-dom';

// --- Contexte de langue --------------------------------------------------
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
export const LocaleProvider = LocaleContext.Provider;
/** Langue active (défaut `fr` hors contexte, ex. admin). */
export const useLocale = (): Locale => useContext(LocaleContext);

// --- Helpers de chemin ---------------------------------------------------
/** Retire un préfixe de langue en tête de chemin (`/fr/x` → `/x`). */
export function stripLocale(pathname: string): string {
  const seg = pathname.split('/')[1];
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1); // retire `/fr`
    return rest || '/';
  }
  return pathname;
}

/** Préfixe un chemin absolu non-admin avec la langue active. */
function prefixPath(path: string, locale: Locale): string {
  if (!path.startsWith('/')) return path; // relatif → inchangé
  if (path === '/admin' || path.startsWith('/admin/')) return path; // admin non préfixé
  const seg = path.split('/')[1];
  if (isLocale(seg)) return path; // déjà préfixé
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

function prefixTo(to: To, locale: Locale): To {
  if (typeof to === 'string') return prefixPath(to, locale);
  if (to && typeof to.pathname === 'string') {
    return { ...to, pathname: prefixPath(to.pathname, locale) };
  }
  return to;
}

// --- Composants surchargés ----------------------------------------------
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const locale = useLocale();
  return <RRLink ref={ref} to={prefixTo(to, locale)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const locale = useLocale();
  return <RRNavLink ref={ref} to={prefixTo(to, locale)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const locale = useLocale();
  return <RRNavigate to={prefixTo(to, locale)} {...rest} />;
}

/** `useNavigate` dont la cible absolue est préfixée par la langue active. */
export function useNavigate(): NavigateFunction {
  const locale = useLocale();
  const navigate = useRRNavigate();
  return useCallback<NavigateFunction>(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }
      navigate(prefixTo(to, locale), options);
    },
    [navigate, locale],
  );
}

/** `location.pathname` débarrassé du préfixe de langue (pour l'état « actif »). */
export function useLocalizedPathname(): string {
  const { pathname } = useRRLocation();
  return stripLocale(pathname);
}
