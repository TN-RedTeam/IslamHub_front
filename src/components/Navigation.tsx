import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Book, Heart, Wind, GraduationCap, Video, Clock, BookOpen, Moon, Sun, Menu, X, Bookmark, ScrollText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import moment from 'moment-hijri';

const navItems = [
    { to: '/coran', icon: Bookmark, label: 'Coran' },
    { to: '/hadiths', icon: Book, label: 'Hadiths' },
    { to: '/hadiths-arabe', icon: BookOpen, label: 'أحاديث' },
    { to: '/dhikrs', icon: Wind, label: 'Dhikrs' },
    { to: '/douaas', icon: Heart, label: 'Douaas' },
    { to: '/savants', icon: GraduationCap, label: 'Savants' },
    { to: '/biographies', icon: ScrollText, label: 'Biographies' },
    { to: '/multimedia', icon: Video, label: 'Multimedia' },
    { to: '/ecoles', icon: BookOpen, label: 'Madhaheb' },
    { to: '/prayer-times', icon: Clock, label: 'Horaires' },
];

export const Navigation: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hijriDate, setHijriDate] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const updateHijriDate = () => {
            setHijriDate(moment().format('iD iMMMM iYYYY'));
        };
        updateHijriDate();
        const interval = setInterval(updateHijriDate, 86400000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <m.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-emerald-900/5 dark:shadow-emerald-400/5'
                    : 'bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950'
            }`}
        >
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Left section: Muhammad (Arabic) + Logo + Hijri Date */}
                    <div className="flex items-center space-x-3">
                        {/* Muhammad in Arabic calligraphy */}
                        <m.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="hidden sm:block text-2xl md:text-3xl font-amiri bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-amber-400 bg-clip-text text-transparent drop-shadow-sm"
                            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                        >
                            مُحَمَّد ﷺ
                        </m.span>

                        {/* Decorative separator */}
                        <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-emerald-300 dark:via-emerald-600 to-transparent" />

                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <m.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative"
                            >
                                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent font-amiri">
                                    IslamHub
                                </span>
                                <m.div
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 origin-left"
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </m.div>
                        </Link>

                        {/* Hijri Date */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="hidden lg:flex items-center px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50"
                        >
                            {/* translate="no" : empêche la traduction automatique du navigateur
                                de déformer la date hijri (محرم → « janvier », ère « av. J.-C. »…) */}
                            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-amiri whitespace-nowrap" translate="no" lang="ar" dir="rtl">
                                {hijriDate}
                            </span>
                        </m.div>
                    </div>

                    {/* Mobile controls */}
                    <div className="flex items-center md:hidden space-x-2">
                        {/* Allah in Arabic - mobile */}
                        <span
                            className="text-2xl font-amiri bg-gradient-to-br from-amber-500 via-amber-400 to-emerald-500 dark:from-amber-400 dark:via-amber-300 dark:to-emerald-400 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                        >
                            الله
                        </span>

                        <m.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            aria-label="Basculer le thème"
                            className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-emerald-900 dark:to-amber-900 text-amber-600 dark:text-amber-400 hover:shadow-md transition-all duration-200"
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={theme}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </m.div>
                            </AnimatePresence>
                        </m.button>

                        <m.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            aria-expanded={isMenuOpen}
                            className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900 dark:to-amber-900 text-emerald-600 dark:text-emerald-400 hover:shadow-md transition-all duration-200"
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={isMenuOpen ? 'close' : 'open'}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </m.div>
                            </AnimatePresence>
                        </m.button>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map(({ to, icon: Icon, label }, index) => {
                            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                            return (
                                <m.div
                                    key={to}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                >
                                    <Link
                                        to={to}
                                        className={`relative flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                            isActive
                                                ? 'text-emerald-700 dark:text-emerald-300 bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/50 dark:to-amber-900/30 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 mr-1.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        <span className="font-amiri">{label}</span>
                                        {isActive && (
                                            <m.div
                                                layoutId="activeTab"
                                                className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                </m.div>
                            );
                        })}

                        {/* Decorative separator */}
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-emerald-300 dark:via-emerald-600 to-transparent mx-2" />

                        {/* Theme toggle button */}
                        <m.button
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            aria-label="Basculer le thème"
                            className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-emerald-900 dark:to-amber-900 text-amber-600 dark:text-amber-400 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-emerald-800/50 transition-all duration-200"
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={theme}
                                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </m.div>
                            </AnimatePresence>
                        </m.button>

                        {/* Allah in Arabic calligraphy */}
                        <m.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.1 }}
                            className="text-2xl md:text-3xl font-amiri bg-gradient-to-br from-amber-500 via-amber-400 to-emerald-500 dark:from-amber-400 dark:via-amber-300 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-sm cursor-default ml-2"
                            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                            title="Allah - Le Dieu Unique"
                        >
                            الله
                        </m.span>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="py-4 space-y-1">
                                {/* Hijri Date - Mobile */}
                                <div className="flex justify-center mb-4">
                                    <span className="px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50 text-sm text-emerald-700 dark:text-emerald-300 font-amiri" translate="no" lang="ar" dir="rtl">
                                        {hijriDate}
                                    </span>
                                </div>

                                {/* Muhammad calligraphy - Mobile centered */}
                                <div className="flex justify-center mb-4">
                                    <span
                                        className="text-3xl font-amiri bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-amber-400 bg-clip-text text-transparent"
                                        style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                                    >
                                        مُحَمَّد ﷺ
                                    </span>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-600 to-transparent mb-4" />

                                {navItems.map(({ to, icon: Icon, label }, index) => {
                                    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                                    return (
                                        <m.div
                                            key={to}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={to}
                                                className={`flex items-center px-4 py-3 text-base font-medium transition-all duration-200 rounded-xl mx-2 ${
                                                    isActive
                                                        ? 'text-emerald-700 dark:text-emerald-300 bg-gradient-to-r from-emerald-100 to-amber-50 dark:from-emerald-900/50 dark:to-amber-900/30 shadow-sm'
                                                        : 'text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                                                    isActive
                                                        ? 'bg-gradient-to-br from-emerald-500 to-amber-400 text-white'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-amiri text-lg">{label}</span>
                                                {isActive && (
                                                    <m.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                                                    />
                                                )}
                                            </Link>
                                        </m.div>
                                    );
                                })}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Decorative bottom shadow line when scrolled */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: scrolled ? 1 : 0 }}
                className="h-px bg-gradient-to-r from-transparent via-emerald-200 dark:via-emerald-700 to-transparent"
            />
        </m.nav>
    );
};
