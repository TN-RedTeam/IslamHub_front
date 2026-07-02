import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, ChevronRight, Scale, Globe, Building, Heart, ChevronDown, ChevronUp, Shield, Sparkles, Calendar, BookMarked } from 'lucide-react';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-amber-200 dark:border-emerald-800"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-emerald-900/30 dark:to-amber-900/30 hover:from-amber-100 hover:to-emerald-100 dark:hover:from-emerald-900/50 dark:hover:to-amber-900/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-white">
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 font-amiri">
                        {title}
                    </h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                            {children}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </m.div>
    );
};

const Malikite: React.FC = () => {
    const stats = [
        { label: 'Œuvres majeures', value: '50+', icon: BookOpen },
        { label: "Élèves célèbres", value: '60+', icon: Users },
        { label: "Siècles d'influence", value: '12+', icon: Scale },
        { label: 'Pays influencés', value: '30+', icon: Globe },
    ];

    const relatedMadhaheb = [
        {
            id: 1,
            name: 'Hanafi',
            nameArabic: 'الحنفية',
            path: '/ecoles/Hanafi',
            description: "L'école de la raison et de l'opinion",
            color: 'from-amber-500 to-orange-600'
        },
        {
            id: 2,
            name: "Shafi'i",
            nameArabic: 'الشافعية',
            path: '/ecoles/Shafii',
            description: "L'école équilibrée entre texte et raison",
            color: 'from-blue-500 to-indigo-600'
        },
        {
            id: 3,
            name: 'Hanbali',
            nameArabic: 'الحنابلة',
            path: '/ecoles/Hanbalite',
            description: "L'école du texte et de la tradition",
            color: 'from-purple-500 to-pink-600'
        },
    ];

    const sources = [
        {
            title: 'Le Coran',
            description: 'Source première et fondamentale de la législation.',
            icon: BookOpen
        },
        {
            title: 'La Sunna',
            description: 'Les enseignements et pratiques du Prophète (paix sur lui).',
            icon: Star
        },
        {
            title: "L'Amal de Médine",
            description: 'La pratique continue des habitants de Médine comme source de loi.',
            icon: Building
        },
        {
            title: "L'Ijma'",
            description: 'Le consensus des savants de Médine.',
            icon: Users
        },
        {
            title: 'Le Qiyas',
            description: 'Le raisonnement analogique.',
            icon: Scale
        },
        {
            title: "Al-Masalih al-Mursala",
            description: "L'intérêt public non réglementé par un texte spécifique.",
            icon: Heart
        },
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
                        <BookOpen className="h-12 w-12 text-white" />
                    </m.div>

                    <m.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 font-amiri"
                    >
                        École Malikite
                    </m.h1>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-emerald-200 max-w-3xl mx-auto mb-4"
                    >
                        L'école de la pratique médinoise
                    </m.p>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-emerald-300 max-w-2xl mx-auto font-amiri"
                    >
                        Fondée par l'Imam Malik ibn Anas (711-795 EC)
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

                {/* Sections biographiques collapsibles */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4 mb-16"
                >
                    <CollapsibleSection
                        title="Son Nom et sa Naissance"
                        icon={<Calendar className="w-5 h-5" />}
                        defaultOpen={true}
                    >
                        <p className="mb-4">
                            L'Imam Malik, que Allah l'agrée, est né en 93 de l'Hégire, dans la ville de Médine l'Illuminée (Al-Madinatou l-mounawwarah). Son nom est Malik fils de Anas fils de Malik fils de Abi ^Amir Al-'Asbahiyy. Son école de jurisprudence est connue sous le nom de l'école malikite (Al-Madhhabou l-Malikiyy).
                        </p>
                        <p className="mb-4">
                            Il est le deuxième des quatre grands Imams moujtahid, ce sont ceux qui ont mis au point une méthodologie d'extraction des lois à partir des textes, pour eux-mêmes et pour ceux qui les suivent. Leur méthodologie a un fondement et des règles et elle s'est transmise aux gens par tawatour – c'est-à-dire par un grand nombre de personnes – de sorte que toute altération en est exclue.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son Apprentissage de la Science"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Malik a grandi dans un foyer de science et de piété, il a suivi la voie de ses ancêtres, que Allah les agrée tous, il a pris la science de nombreux chouyoukh. Le premier d'entre eux fut Ar-Rabii^ah Ibnou ^Abdi r-Rahman, qui est connu sous le nom de Rabii^atou r-Ra'y.
                        </p>
                        <p className="mb-4">
                            L'Imam Malik a également appris la science auprès de Nafi^ l'esclave affranchi de ^Abdou l-Lah Ibnou ^Oumar et auprès de Ibnou Chihab Az-Zouhriyy, qui fut parmi les plus grands mémorisateurs du hadith.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Al-Mouwatta'"
                        icon={<BookMarked className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Le livre Al-Mouwatta' (Le Livre rendu facile) de l'Imam Malik est un des ouvrages de référence dans la jurisprudence et le hadith. L'Imam Ach-Chafi^iyy a dit à propos de ce livre :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (مَا عَلَى وَجْهِ الأرضِ كِتَابٌ بَعْدَ كِتَابِ اللهِ أَكْثَرَ صَوَابًا مِنَ المُوَطَّإِ)
                        </p>
                        <p className="mb-4 italic">
                            (ma ^ala wajhi l-'ardi kitaboun ba^da kitabi l-Lahi 'aktharou sawaban mina l-Mouwatta')
                        </p>
                        <p className="mb-6">
                            « Il n'y a pas sur terre après le Livre de Allah de livre plus juste que Al-Mouwatta'. »
                        </p>
                        <p className="mb-4">
                            C'est-à-dire que Al-Mouwatta' de l'Imam Malik est le meilleur livre de jurisprudence et de hadith après le Qour'an honoré, du vivant de l'Imam Ach-Chafi^iyy qui disait cela à cette époque.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Paroles de Savants à son Sujet"
                        icon={<Star className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Ach-Chafi^iyy a dit au sujet de l'Imam Malik :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (إِذَا جَاءَ الأَثَرُ فَمَالِكٌ النَّجْمُ)
                        </p>
                        <p className="mb-4 italic">
                            ('idha ja'a l-'atharou fa-Malikoun an-najm)
                        </p>
                        <p className="mb-6">
                            « Lorsqu'il s'agit de hadith, Malik est l'étoile. »
                        </p>

                        <p className="mb-4">
                            L'Imam Ach-Chafi^iyy a dit également :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (مَالِكٌ مُعَلِّمِي)
                        </p>
                        <p className="mb-4 italic">
                            (Malikoun mou^allimi)
                        </p>
                        <p className="mb-6">
                            « Malik est mon enseignant. »
                        </p>

                        <p className="mb-4">
                            L'Imam Malik était très respecté par les savants de son époque et ceux qui l'ont suivi. Il était réputé pour sa piété, son attachement à la Sunna et sa connaissance approfondie de la pratique des gens de Médine.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son Décès"
                        icon={<Heart className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Malik est décédé en 179 de l'Hégire, à l'âge de 86 ans. Il fut enterré dans le cimetière de Al-Baqi^ à Médine, que Allah l'agrée et qu'Il illumine sa tombe.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Sa Croyance en Allah"
                        icon={<Shield className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Malik, que Allah l'agrée, a confirmé dans sa croyance que Allah ta^ala existe sans endroit et sans direction. Il a enseigné que Allah n'est pas un corps et qu'Il ne ressemble à aucune de Ses créatures. Il est rapporté de sa part :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (اللهُ فِي السَّمَاءِ وعِلْمُهُ فِي كُلِّ مَكَانٍ)
                        </p>
                        <p className="mb-4 italic">
                            (Allahou fi s-sama'i wa ^ilmouhou fi koulli makan)
                        </p>
                        <p className="mb-6">
                            « Allah est au ciel et Son savoir englobe tout endroit. »
                        </p>
                        <p className="mb-4">
                            Cette parole signifie que Allah a un haut degré et non pas qu'Il serait dans le ciel en tant qu'endroit. Car l'Imam Malik fait partie de ceux qui ont dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (الاسْتِوَاءُ مَعْلُومٌ وَالكَيْفُ غَيْرُ مَعْقُولٍ)
                        </p>
                        <p className="mb-4 italic">
                            (al-istiwa'ou ma^loum wa l-kayfou ghayrou ma^qoul)
                        </p>
                        <p className="mb-6">
                            « Le sens du mot istiwa' est connu [dans la langue arabe] et le comment [c'est-à-dire le comment qui est l'attribut des créatures] est impossible [au sujet de Allah]. »
                        </p>
                        <p className="mb-4">
                            Ce qui signifie que Allah est exempt d'être assis sur le Trône ou d'être établi dessus ou d'y être installé ou du comment de façon absolue, car le comment c'est l'attribut des créatures, c'est tout ce qui a une quantité, une dimension, une mesure, une forme, un aspect, or Allah est exempt de tout cela.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="La Pratique des Gens de Médine"
                        icon={<Sparkles className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'une des particularités de l'école de l'Imam Malik est l'importance accordée à la pratique des gens de Médine (^Amal 'Ahli l-Madinah). L'Imam Malik considérait que la pratique continue et transmise des habitants de Médine constituait une preuve juridique forte, car Médine est la ville où le Prophète (Salla l-Lahou ^alayhi wa sallam) a vécu et où ses compagnons ont transmis ses enseignements.
                        </p>
                        <p className="mb-4">
                            Cette pratique se transmettait de génération en génération, des compagnons aux successeurs (tabi^oun), puis aux savants qui les ont suivis. L'Imam Malik voyait dans cette transmission continue une garantie de l'authenticité des pratiques religieuses.
                        </p>
                    </CollapsibleSection>
                </m.section>

                {/* Section des sources */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
                        Sources et Méthodologie de l'École Malikite
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sources.map((source, index) => (
                            <m.div
                                key={source.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center mb-4">
                                    <source.icon className="h-6 w-6 text-amber-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {source.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {source.description}
                                </p>
                            </m.div>
                        ))}
                    </div>
                </m.section>

                {/* Section caractéristiques spécifiques */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
                        Particularités de l'École Malikite
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3 font-amiri">
                                L'Amal de Médine
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                                L'école malikite accorde une autorité particulière à la pratique continue
                                (Amal) des habitants de Médine, considérant que cette pratique représente
                                la Sunna vivante transmise des compagnons.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3 font-amiri">
                                Rayonnement Géographique
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                                L'école malikite est majoritaire en Afrique du Nord (Maroc, Algérie, Tunisie, Libye),
                                en Afrique de l'Ouest (Sénégal, Mali, Niger, Nigeria), au Soudan, au Koweït,
                                à Bahreïn et aux Émirats arabes unis.
                            </p>
                        </div>
                    </div>
                </m.section>

                {/* Autres écoles */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-16"
                >
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-6 font-amiri text-center">
                        Découvrir les Autres Écoles
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedMadhaheb.map((madhab, index) => (
                            <m.div
                                key={madhab.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.0 + index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="group"
                            >
                                <Link to={madhab.path} className="block h-full">
                                    <div className="relative h-full bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-xl shadow-lg overflow-hidden border border-amber-200 dark:border-emerald-800 transition-all duration-300 hover:shadow-xl">
                                        <div className={`bg-gradient-to-r ${madhab.color} p-4 text-white`}>
                                            <h4 className="text-xl font-bold font-amiri">{madhab.name}</h4>
                                            <p className="text-sm opacity-90">{madhab.nameArabic}</p>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {madhab.description}
                                            </p>
                                            <div className="flex items-center justify-end mt-4">
                                                <m.div
                                                    whileHover={{ x: 5 }}
                                                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm"
                                                >
                                                    Voir <ChevronRight className="h-4 w-4" />
                                                </m.div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </m.div>
                        ))}
                    </div>
                </m.section>

                {/* Section de citation */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-16 bg-gradient-to-r from-amber-100 to-emerald-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-2xl p-8 text-center shadow-lg"
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="text-5xl mb-4 text-amber-600 dark:text-amber-400">"</div>
                        <p className="text-xl text-gray-800 dark:text-gray-200 font-amiri leading-relaxed mb-4">
                            La science se trouve dans les cœurs, pas dans les livres.
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            - Imam Malik ibn Anas
                        </p>
                    </div>
                </m.section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">
                        "Dieu élèvera en degrés ceux d'entre vous qui ont cru et ceux qui ont reçu la science."
                    </p>
                    <p className="text-emerald-200 text-sm">
                        Sourate Al-Mujadila, verset 11
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Malikite;
