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
  { to: '/croyance', label: 'Croyance' },
  { to: '/hadiths', label: 'Hadiths' },
  { to: '/ecoles', label: 'Écoles' },
  { to: '/paroles', label: 'Paroles' },
  { to: '/invocations', label: 'Invocations & Évocations' },
  { to: '/multimedia', label: 'Multimédia' },
  { to: '/femmes', label: 'Femmes' },
];

// Noms français (translittérés) des 12 mois du calendrier hégirien, dans l'ordre.
// Sert à afficher la date higri en français ; la version arabe est produite à
// l'exécution par moment-hijri (aucun texte arabe n'est saisi ici).
const HIJRI_MONTHS_FR = [
  'Mouharram', 'Safar', 'Rabîʿ al-awwal', 'Rabîʿ ath-thânî',
  'Joumâdâ al-oûlâ', 'Joumâdâ ath-thâniya', 'Rajab', 'Chaʿbân',
  'Ramadân', 'Chawwâl', 'Dhou al-qiʿda', 'Dhou al-hijja',
];

// Marque IslamHub : croissant + étoile, motif or clair (#caa24a).
const Mark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M27 8 A13 13 0 1 0 27 32 A10 10 0 1 1 27 8Z" fill="#caa24a" />
    <path d="M30 15 l1.3 3.4 3.7.2-2.9 2.3 1 3.6-3.1-2-3.1 2 1-3.6-2.9-2.3 3.7-.2z" fill="#caa24a" />
  </svg>
);

// Badge vert profond (dégradé fixe, lisible en clair comme en sombre) portant la marque.
const BrandBadge: React.FC<{ px: number; radius: string; mark: number }> = ({ px, radius, mark }) => (
  <span
    className={`grid place-items-center shrink-0 bg-[linear-gradient(140deg,#1c5a43,#0f3d2e)] ${radius}`}
    style={{ width: px, height: px }}
  >
    <Mark size={mark} />
  </span>
);

export const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hijriFr, setHijriFr] = useState('');
  const [greg, setGreg] = useState('');
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      const d = moment();
      // Date hégirienne translittérée (chiffres latins + mois translittéré).
      setHijriFr(`${d.iDate()} ${HIJRI_MONTHS_FR[d.iMonth()]} ${d.iYear()}`);
      // Date grégorienne (2ᵉ ligne, discrète).
      setGreg(new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 3600000); // rafraîchit chaque heure (passage de jour)
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
            <BrandBadge px={40} radius="rounded-[11px]" mark={26} />
            <span className="font-display text-2xl font-bold tracking-tight">
              <span className="text-green-deep">Islam</span><span className="text-gold">Hub</span>
            </span>
          </Link>

          {/* Liens en ligne à partir de 1180px (9 entrées avec libellés complets,
              dont « Invocations & Évocations ») ; en dessous, drawer hamburger. */}
          <div className="hidden min-[1180px]:flex items-center gap-0.5 flex-1 min-w-0">
            {navItems.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={`font-sans text-[13.5px] px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
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
          <div className="flex items-center gap-2.5 shrink-0 ml-auto min-[1180px]:ml-0">
            {/* Chip date : badge marque + hijri translittéré (ligne 1) + grégorien (ligne 2) */}
            <div
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface border border-line"
              aria-label={`Date : ${hijriFr}`}
            >
              <BrandBadge px={30} radius="rounded-lg" mark={19} />
              <span className="leading-tight">
                <span className="block font-display font-semibold text-[13px] text-green-deep whitespace-nowrap">{hijriFr}</span>
                <span className="block text-[11px] text-muted whitespace-nowrap first-letter:uppercase">{greg}</span>
              </span>
            </div>

            <div className="hidden min-[1180px]:block"><InstallPWA /></div>

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
              className="min-[1180px]:hidden w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-green-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu replié (< 1180px) */}
        <AnimatePresence>
          {isMenuOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="min-[1180px]:hidden overflow-hidden motion-reduce:transition-none"
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
