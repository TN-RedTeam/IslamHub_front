import React from 'react';
import { Link, useLocalizedPathname } from '../lib/router';
import { Home, BookOpen, Sparkles, Users, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Navigation d'app sur mobile (< md) : pilule flottante + FAB recherche.
 * Sur desktop (≥ md), la barre haute est conservée et ceci est masqué.
 * Fixe en bas, respecte la safe-area, cibles tactiles ≥ 44 px, clavier OK.
 */
const TABS = [
  { to: '/', key: 'home', icon: Home, exact: true },
  { to: '/coran/sourates', key: 'coran', icon: BookOpen },
  { to: '/croyance', key: 'croyance', icon: Sparkles },
  { to: '/biographies', key: 'biographies', icon: Users },
];

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const pathname = useLocalizedPathname(); // sans préfixe de langue
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <nav
      aria-label={t('nav.mainNav')}
      className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 px-4 pointer-events-none"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', paddingTop: '10px' }}
    >
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-glass-border p-1.5 backdrop-blur-md shadow-glass"
        style={{ background: 'color-mix(in srgb, var(--bg1) 82%, transparent)' }}
      >
        {TABS.map(({ to, key, icon: Icon, exact }) => {
          const on = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              aria-label={t(`nav.${key}`)}
              aria-current={on ? 'page' : undefined}
              className={`grid place-items-center w-11 h-11 rounded-full transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                on ? 'bg-white text-[#0b1e22]' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>

      <Link
        to="/recherche"
        aria-label={t('nav.search')}
        className="pointer-events-auto grid place-items-center w-[52px] h-[52px] rounded-full bg-gradient-to-br from-accent-br to-accent-deep text-[#062018] shadow-fab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <Search className="w-[23px] h-[23px]" strokeWidth={2} />
      </Link>
    </nav>
  );
};

export default BottomNav;
