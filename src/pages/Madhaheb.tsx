import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, ChevronRight, Star, Users, Scale, Sun, Moon } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const Madhaheb: React.FC = () => {
  usePageTitle('Les écoles (Madhaheb)');
    const madhaheb = [
        {
            id: 1,
            name: 'Hanafi',
            nameArabic: 'الحنفية',
            path: '/ecoles/Hanafi',
            founder: 'Imam Abou Hanifa',
            description: 'L\'école de la raison et de l\'opinion, répandue en Turquie, dans les Balkans, en Asie centrale et dans le sous-continent indien.',
            icon: Scale,
            color: 'from-amber-500 to-orange-600'
        },
        {
            id: 2,
            name: 'Maliki',
            nameArabic: 'المالكية',
            path: '/ecoles/Malikite',
            founder: 'Imam Malik ibn Anas',
            description: 'L\'école de la pratique médinoise, prédominante en Afrique du Nord et en Afrique de l\'Ouest.',
            icon: BookOpen,
            color: 'from-emerald-500 to-teal-600'
        },
        {
            id: 3,
            name: 'Shafi\'i',
            nameArabic: 'الشافعية',
            path: '/ecoles/Shafii',
            founder: 'Imam Al-Shafi\'i',
            description: 'L\'école équilibrée entre texte et raison, suivie en Égypte, au Yémen, en Asie du Sud-Est et dans l\'est de l\'Afrique.',
            icon: GraduationCap,
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 4,
            name: 'Hanbali',
            nameArabic: 'الحنابلة',
            path: '/ecoles/Hanbalite',
            founder: 'Imam Ahmad ibn Hanbal',
            description: 'L\'école du texte et de la tradition, influente en Arabie Saoudite, au Qatar et dans certaines régions de Syrie et d\'Irak.',
            icon: Users,
            color: 'from-purple-500 to-pink-600'
        },
    ];

    const stats = [
        { label: 'Écoles principales', value: '4', icon: Scale },
        { label: "Siècles d'histoire", value: '12+', icon: BookOpen },
        { label: 'Pays influencés', value: '50+', icon: Users },
        { label: "Étudiants à travers l'histoire", value: 'Millions', icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
            <m.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-24 bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-amber-950 overflow-hidden"
            >
                <div className="absolute inset-0 opacity-10 bg-arabesque" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-50 dark:to-gray-900" />

                <div className="relative container mx-auto px-4 text-center">
                    <m.div
                        initial={{ scale: 0.9, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm mb-8 shadow-2xl"
                    >
                        <GraduationCap className="h-12 w-12 text-white" />
                    </m.div>

                    <m.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 font-amiri"
                    >
                        Les Madhāhib
                    </m.h1>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-emerald-200 max-w-3xl mx-auto mb-4"
                    >
                        Découvrez les quatre écoles juridiques sunnites
                    </m.p>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-emerald-300 max-w-2xl mx-auto font-amiri"
                    >

                    </m.p>
                </div>
            </m.header>

            <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
                {/* Section des statistiques */}
                <m.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
                >
                    {stats.map((stat, index) => (
                        <m.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl border border-amber-200 dark:border-emerald-800"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 mb-3">
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {stat.label}
                            </div>
                        </m.div>
                    ))}
                </m.section>

                {/* Section d'introduction */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-6 font-amiri">
                        Les Quatre Écoles Juridiques
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            Les madhāhib (écoles de jurisprudence) représentent les différentes méthodologies
                            d'interprétation des sources islamiques. Chaque école offre une compréhension
                            riche et nuancée de la Charia, tout en maintenant l'unité fondamentale de l'Islam.
                        </p>
                        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full mt-6"></div>
                    </div>
                </m.section>

                {/* Cartes des madhahib */}
                <section className="pb-16">
                    <div className="grid md:grid-cols-2 gap-8">
                        {madhaheb.map((madhab, index) => (
                            <m.div
                                key={madhab.id}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 100 }}
                                whileHover={{ scale: 1.02 }}
                                className="group"
                            >
                                <Link to={madhab.path} className="block h-full">
                                    <div className="relative h-full bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-2xl shadow-xl overflow-hidden border border-amber-200 dark:border-emerald-800 transition-all duration-300 hover:shadow-2xl">
                                        {/* Décoration arrière-plan */}
                                        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <svg viewBox="0 0 200 200" className="text-amber-500">
                                                <path fill="currentColor" d="M100,20 Q120,40 140,20 T180,20 T200,20" />
                                            </svg>
                                        </div>

                                        {/* En-tête avec dégradé */}
                                        <div className={`relative bg-gradient-to-r ${madhab.color} p-6 text-white`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-bold font-amiri mb-1">
                                                        {madhab.name}
                                                    </h3>
                                                    <p className="text-lg font-arabic opacity-90">
                                                        {madhab.nameArabic}
                                                    </p>
                                                </div>
                                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <madhab.icon className="h-7 w-7" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenu */}
                                        <div className="p-6">
                                            <div className="mb-4">
                                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                                                    Fondateur
                                                </p>
                                                <p className="text-gray-800 dark:text-gray-200 font-amiri">
                                                    {madhab.founder}
                                                </p>
                                            </div>

                                            <div className="mb-6">
                                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                                                    Présentation
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {madhab.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-amber-200 dark:border-emerald-800">
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Découvrir l'école {madhab.name}
                        </span>
                                                <m.div
                                                    whileHover={{ x: 5 }}
                                                    className="w-8 h-8 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center"
                                                >
                                                    <ChevronRight className="h-4 w-4 text-amber-600 dark:text-emerald-400" />
                                                </m.div>
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-500" />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            École {madhab.name}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </m.div>
                        ))}
                    </div>
                </section>

                {/* Section de citation */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 bg-gradient-to-r from-amber-100 to-emerald-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-2xl p-8 text-center shadow-lg"
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="text-5xl mb-4 text-amber-600 dark:text-amber-400">"</div>
                        <p className="text-xl text-gray-800 dark:text-gray-200 font-amiri leading-relaxed mb-4">
                            a developper
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            - Propos rapporté par Abou Dawoud
                        </p>
                    </div>
                </m.section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">
                        "a developper"
                    </p>
                    <p className="text-emerald-200 text-sm">
                        Sourate Al-Imran, verset 159
                    </p>
                </div>
            </footer>
        </div>
    );
};