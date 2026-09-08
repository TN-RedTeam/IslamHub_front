import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { InstallPWA } from './InstallPWA';
import moment from 'moment-hijri';

const navItems = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/coran', label: 'Coran' },
  { to: '/hadiths', label: 'Hadiths' },
  { to: '/dhikrs', label: 'Dhikrs' },
  { to: '/douaas', label: 'Douaas' },
  { to: '/paroles', label: 'Paroles' },
  { to: '/ecoles', label: 'Madhāhib' },
  { to: '/femmes', label: 'Femmes' },
  { to: '/multimedia', label: 'Multimédia' },
];

const Crescent: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M16.5 3.5a8 8 0 1 0 4 12 6.2 6.2 0 0 1-4-12z" />
  </svg>
);

export const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hijri, setHijri] = useState('');
  const [greg, setGreg] = useState('');
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      setHijri(moment().format('iD iMMMM iYYYY'));
      setGreg(new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 86400000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <nav className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Marque */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="IslamHub — accueil">
            <span className="w-9 h-9 rounded-lg bg-green text-white grid place-items-center">
              <Crescent className="w-5 h-5" />
            </span>
            <span className="font-display text-xl font-semibold text-green-deep tracking-tight">
              Islam<span className="text-gold">Hub</span>
            </span>
          </Link>

          {/* Liens (≥ 900px) */}
          <div className="hidden min-[900px]:flex items-center gap-0.5 flex-1">
            {navItems.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={`font-sans text-[14.5px] px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                  isActive(to, exact)
                    ? 'bg-green-soft text-green-deep font-medium'
                    : 'text-ink hover:bg-green-soft hover:text-green-deep'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions (droite) */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto min-[900px]:ml-0">
            {/* Chip date : hijri + grégorien */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-soft border border-line">
              <Crescent className="w-4 h-4 text-gold shrink-0" />
              <span className="leading-tight">
                <span className="block font-sans text-[13px] font-semibold text-green-deep whitespace-nowrap">{hijri}</span>
                <span className="block text-[10px] uppercase tracking-wide text-muted">{greg}</span>
              </span>
            </div>

            <div className="hidden min-[900px]:block"><InstallPWA /></div>

            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème"
              className="w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-green-deep hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
              className="min-[900px]:hidden w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-green-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu replié (< 900px) */}
        <AnimatePresence>
          {isMenuOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="min-[900px]:hidden overflow-hidden motion-reduce:transition-none"
            >
              <div className="py-3">
                {navItems.map(({ to, label, exact }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block px-4 py-2.5 rounded-lg mb-0.5 font-sans transition-colors ${
                      isActive(to, exact)
                        ? 'bg-green-soft text-green-deep font-medium'
                        : 'text-ink hover:bg-green-soft hover:text-green-deep'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <InstallPWA className="mt-2 flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green text-white hover:bg-green-deep transition-colors" />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
