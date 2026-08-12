import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Book, Heart, Wind, GraduationCap, Video, BookOpen, Moon, Sun, Menu, X, Bookmark } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import moment from 'moment-hijri';

const navItems = [
    { to: '/coran', icon: Bookmark, label: 'Coran' },
    { to: '/hadiths', icon: Book, label: 'Hadiths' },
    { to: '/dhikrs', icon: Wind, label: 'Dhikrs' },
    { to: '/douaas', icon: Heart, label: 'Douaas' },
    { to: '/paroles', icon: GraduationCap, label: 'Paroles' },
    { to: '/multimedia', icon: Video, label: 'Multimedia' },
    { to: '/ecoles', icon: BookOpen, label: 'Madhaheb' },
];

export const Navigation: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hijriDate, setHijriDate] = useState('');
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

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center group">
                            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-amiri group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                IslamicHub
                            </span>
                        </Link>
                        <span className="text-lg text-gray-600 dark:text-gray-300 font-amiri whitespace-nowrap">
                            {hijriDate}
                        </span>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleTheme}
                            aria-label="Basculer le thème"
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            aria-expanded={isMenuOpen}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map(({ to, icon: Icon, label }) => {
                            const isActive = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 mx-1 ${
                                        isActive
                                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40'
                                            : 'text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    <span className="font-amiri truncate max-w-[100px]">{label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={toggleTheme}
                            aria-label="Basculer le thème"
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="py-4">
                                {navItems.map(({ to, icon: Icon, label }) => {
                                    const isActive = location.pathname === to;
                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`flex items-center px-4 py-3 text-base font-medium transition-all duration-200 rounded-md mb-1 ${
                                                isActive
                                                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40'
                                                    : 'text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 mr-3" />
                                            <span className="font-amiri">{label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};
