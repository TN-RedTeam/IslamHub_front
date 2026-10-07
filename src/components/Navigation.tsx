import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { InstallPWA } from './InstallPWA';
import moment from 'moment-hijri';

// Barre principale (entrées essentielles).
const mainItems = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/coran', label: 'Coran' },
  { to: '/croyance', label: 'Croyance' },
  { to: '/hadiths', label: 'Hadiths & paroles' },
  { to: '/biographies', label: 'Biographies' },
  { to: '/invocations', label: 'Invocations & Évocations' },
];
// Regroupées sous le menu déroulant « Ressources ».
const resItems = [
  { to: '/themes', label: 'Thèmes' },
  { to: '/dossiers', label: 'Dossiers thématiques' },
  { to: '/ecoles', label: 'Écoles' },
  { to: '/recits', label: 'Récits' },
  { to: '/multimedia', label: 'Multimédia' },
  { to: '/femmes', label: 'La femme musulmane' },
];

// Noms français (translittérés) des 12 mois du calendrier hégirien, dans l'ordre.
// Sert à afficher la date higri en français ; la version arabe est produite à
// l'exécution par moment-hijri (aucun texte arabe n'est saisi ici).
const HIJRI_MONTHS_FR = [
  'Mouharram', 'Safar', 'Rabîʿ al-awwal', 'Rabîʿ ath-thânî',
  'Joumâdâ al-oûlâ', 'Joumâdâ ath-thâniya', 'Rajab', 'Chaʿbân',
  'Ramadân', 'Chawwâl', 'Dhou al-qiʿda', 'Dhou al-hijja',
];

// Marque IslamHub : croissant + étoile, teinte accent (héritée via currentColor).
const Mark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M27 8 A13 13 0 1 0 27 32 A10 10 0 1 1 27 8Z" fill="currentColor" />
    <path d="M30 15 l1.3 3.4 3.7.2-2.9 2.3 1 3.6-3.1-2-3.1 2 1-3.6-2.9-2.3 3.7-.2z" fill="currentColor" />
  </svg>
);

// Badge « verre » (glass-tint + bord fin) portant la marque en accent menthe.
const BrandBadge: React.FC<{ px: number; radius: string; mark: number }> = ({ px, radius, mark }) => (
  <span
    className={`grid place-items-center shrink-0 bg-glass-tint border border-glass-border text-accent ${radius}`}
    style={{ width: px, height: px }}
  >
    <Mark size={mark} />
  </span>
);

export const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [hijriFr, setHijriFr] = useState('');
  const [greg, setGreg] = useState('');
  const location = useLocation();
  const resRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const d = moment();
      setHijriFr(`${d.iDate()} ${HIJRI_MONTHS_FR[d.iMonth()]} ${d.iYear()}`);
      setGreg(new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 3600000); // rafraîchit chaque heure (passage de jour)
    return () => clearInterval(interval);
  }, []);

  // Ferme les menus au changement de page.
  useEffect(() => { setIsMenuOpen(false); setResOpen(false); }, [location.pathname]);

  // Ferme le déroulant « Ressources » au clic extérieur / touche Échap.
  useEffect(() => {
    if (!resOpen) return;
    const onDown = (e: MouseEvent) => { if (resRef.current && !resRef.current.contains(e.target as Node)) setResOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setResOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [resOpen]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);
  const resActive = resItems.some((i) => isActive(i.to));

  const linkCls = (active: boolean) =>
    `font-sans text-[13.5px] px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
      active ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-glass-border" style={{ background: 'color-mix(in srgb, var(--bg2) 82%, transparent)' }}>
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Marque */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="IslamHub — accueil">
            <BrandBadge px={40} radius="rounded-[11px]" mark={26} />
            <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">
              <span className="text-ink">Islam</span><span className="text-accent">Hub</span>
            </span>
          </Link>

          {/* Liens en ligne à partir de 900px ; en dessous, drawer hamburger. */}
          <div className="hidden min-[900px]:flex items-center gap-0.5 flex-1 min-w-0">
            {mainItems.map(({ to, label, exact }) => (
              <Link key={to} to={to} className={linkCls(isActive(to, exact))}>{label}</Link>
            ))}

            {/* Menu déroulant « Ressources » */}
            <div className="relative" ref={resRef}>
              <button
                type="button"
                onClick={() => setResOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={resOpen}
                className={`${linkCls(resActive)} inline-flex items-center gap-1`}
              >
                Ressources
                <ChevronDown className={`w-3.5 h-3.5 transition-transform motion-reduce:transition-none ${resOpen ? 'rotate-180' : ''}`} />
              </button>
              {resOpen && (
                <div role="menu" className="absolute left-0 top-full mt-1.5 min-w-[210px] rounded-xl border border-glass-border bg-bg1 backdrop-blur-md shadow-glass py-1.5 z-50">
                  {resItems.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className={`block px-3.5 py-2 text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                        isActive(to) ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions (droite) */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto min-[900px]:ml-0">
            {/* Chip date : badge marque + hijri translittéré (ligne 1) + grégorien (ligne 2) */}
            <div
              className="hidden min-[1360px]:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface border border-line"
              aria-label={`Date : ${hijriFr}`}
            >
              <BrandBadge px={30} radius="rounded-lg" mark={19} />
              <span className="leading-tight">
                <span className="block font-display font-semibold text-[13px] text-ink whitespace-nowrap">{hijriFr}</span>
                <span className="block text-[11px] text-muted whitespace-nowrap first-letter:uppercase">{greg}</span>
              </span>
            </div>

            <div className="hidden min-[1360px]:block"><InstallPWA /></div>

            <Link
              to="/recherche"
              aria-label="Rechercher sur le site"
              className="w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-ink hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème"
              className="w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-ink hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
              className="min-[900px]:hidden w-9 h-9 grid place-items-center rounded-lg border border-line bg-ivory text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
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
                {mainItems.map(({ to, label, exact }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block px-4 py-2.5 rounded-lg mb-0.5 font-sans transition-colors ${
                      isActive(to, exact) ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {/* Sous-groupe « Ressources » */}
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Ressources</p>
                {resItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block pl-6 pr-4 py-2.5 rounded-lg mb-0.5 font-sans transition-colors ${
                      isActive(to) ? 'bg-glass-tint text-ink font-medium' : 'text-ink hover:bg-glass-tint hover:text-ink'
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
