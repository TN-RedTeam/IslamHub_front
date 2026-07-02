import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Scale, Star, ChevronRight, GraduationCap, ChevronDown, ChevronUp, Heart, Globe, Shield, Sparkles, Calendar, BookMarked } from 'lucide-react';

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

const Hanbalite: React.FC = () => {
    const stats = [
        { label: 'Œuvres majeures', value: '30+', icon: BookOpen },
        { label: "Élèves célèbres", value: '50+', icon: Users },
        { label: "Siècles d'influence", value: '12+', icon: Scale },
        { label: 'Textes fondamentaux', value: '15+', icon: GraduationCap },
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
            name: 'Maliki',
            nameArabic: 'المالكية',
            path: '/ecoles/Malikite',
            description: "L'école de la pratique médinoise",
            color: 'from-emerald-500 to-teal-600'
        },
        {
            id: 3,
            name: "Shafi'i",
            nameArabic: 'الشافعية',
            path: '/ecoles/Shafii',
            description: "L'école équilibrée entre texte et raison",
            color: 'from-blue-500 to-indigo-600'
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
                        <Users className="h-12 w-12 text-white" />
                    </m.div>

                    <m.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 font-amiri"
                    >
                        École Hanbalite
                    </m.h1>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-emerald-200 max-w-3xl mx-auto mb-4"
                    >
                        L'école du texte et de la tradition
                    </m.p>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-emerald-300 max-w-2xl mx-auto font-amiri"
                    >
                        Fondée par l'Imam Ahmad ibn Hanbal (780-855 EC)
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
                    className="mb-16"
                >
                    <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-6 font-amiri text-center">
                        L'Imam Ahmad Ibnou Hanbal
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            L'Imam Ahmad Ibnou Hanbal fait partie des grands savants de l'Islam. Il a vécu pendant le 2ème siècle de l'Hégire, il a ainsi appris la science de la religion auprès de l'Imam Ach-Chafi^iyy (Chafi'i) entre autres. Il a par la suite fondé sa propre école de jurisprudence : l'école hanbalite. Il a eu entre autres deux fils : ^Abdou l-Lah, d'où son surnom Abou ^Abdi l-Lah, et Salih.
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            Grandir orphelin ne l'a pas empêché de devenir le défenseur de la croyance musulmane, il y a plus de 13 siècles de cela. Et ses enseignements constituent aujourd'hui encore une forteresse qui protège la croyance de toute tentative de corruption. Quoi que tu imagines en ton esprit Dieu en est différent. C'est là sa croyance et son enseignement. Ahmad ibn Hanbal !
                        </p>
                        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full mt-6"></div>
                    </div>
                </m.section>

                {/* Sections biographiques détaillées */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-16 space-y-6"
                >
                    <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
                        Biographie détaillée
                    </h2>

                    {/* Sa jeunesse */}
                    <CollapsibleSection
                        title="Sa jeunesse"
                        icon={<Heart className="w-5 h-5" />}
                        defaultOpen={true}
                    >
                        <p className="mb-4">
                            ^Adiyy a extrait son ascendance : il s'agit de Ahmad fils de Mouhammad fils de Hanbal fils de Hilal fils de Açad. L'Imam Ahmad a grandi orphelin. En effet, son père Mouhammad est mort jeune.
                        </p>
                        <p className="mb-4">
                            Il a commencé à apprendre la science de la religion très tôt puis a appris la science du hadith alors qu'il avait 15 ans, c'est-à-dire en l'an 179, année durant laquelle le fondateur de l'école malikite, l'Imam Malik, que Allah l'agrée, est décédé.
                        </p>
                        <p className="mb-4">
                            Il a eu entre autres deux fils ^Abdou l-Lah, d'où son surnom Abou ^Abdi l-Lah, et Salih.
                        </p>
                        <p>
                            L'Imam Ahmad est décédé en l'an 241 de l'Hégire. Que Allah agrée ce savant éminent du Salaf.
                        </p>
                    </CollapsibleSection>

                    {/* L'élève de l'Imam Ach-Chafi^iyy */}
                    <CollapsibleSection
                        title="L'élève de l'Imam Ach-Chafi^iyy"
                        icon={<GraduationCap className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Lorsque Ach-Chafi^iyy est retourné à la Mecque pour transmettre et dispenser son enseignement dans l'enceinte sacrée, à la période du pèlerinage, il y a rencontré les plus grands savants qui ont appris la science auprès de lui. C'est par la suite qu'il a rencontré Ahmad Ibnou Hanbal, le glorieux savant, que Allah l'agrée. Lorsqu'on a interrogé Ahmad au sujet de Ach-Chafi^iyy, il a dit : « C'est une grâce que Allah nous a accordée. J'ai pu profiter de son assemblée durant des jours et des nuits ; je n'ai remarqué en lui que du bien, que Allah lui fasse miséricorde ! » Ibnou Hanbal allait souvent aux assemblées de Ach-Chafi^iyy, il le respectait beaucoup et l'honorait.
                        </p>
                        <p>
                            Il a été dit qu'un jour, Ach-Chafi^iyy était sur son âne, Ibnou Hanbal marchant à ses côtés en train de réviser avec lui des questions de religion. Lorsque Yahya Ibnou Mou^in –un savant musulman spécialiste dans le hadith et ami de l'Imam Ahmad– en a été informé, il a blâmé Ahmad Ibnou Hanbal. C'est alors que l'Imam Ahmad lui a dit : « Si tu avais été de l'autre côté de l'âne, cela aurait mieux valu pour toi. »
                        </p>
                    </CollapsibleSection>

                    {/* Son école */}
                    <CollapsibleSection
                        title="Son école"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Ahmad Ibnou Hanbal a fondé sa propre école de jurisprudence. Il s'agit du madh-hab hanbalite. De nos jours, son école est suivie dans une partie des régions du Cham –le Cham comprend la Syrie, le Liban, la Jordanie et la Palestine–, au Hijaz –région de la péninsule arabique– et aussi un peu en Irak.
                        </p>
                        <p>
                            Mais certains de ceux qui s'en réclament de nos jours en réalité ont dévié de sa croyance et de son enseignement et se sont singularisés.
                        </p>
                    </CollapsibleSection>

                    {/* Ses livres */}
                    <CollapsibleSection
                        title="Ses livres"
                        icon={<BookMarked className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Ahmad que Allah l'agrée, a écrit de nombreux ouvrages dont :
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Al-Mousnad,</li>
                            <li>An-Nasikh wal-Mansoukh c'est-à-dire L'Abrogatif et l'Abrogé,</li>
                            <li>Ar-Radd ^ala z–Zanadiqah c'est-à-dire Réplique contre les Hérétiques,</li>
                            <li>At-Tafsir c'est-à-dire L'Interprétation,</li>
                            <li>Fada'ilou s–Sahabah c'est-à-dire Les Mérites des Compagnons</li>
                            <li>Al-Manacik waz–Zouhd c'est-à-dire Les Actes d'Ascèse et le Détachement de la Vie d'Ici- bas.</li>
                        </ul>
                    </CollapsibleSection>

                    {/* L'Imam Ahmad en quête de science */}
                    <CollapsibleSection
                        title="L'Imam Ahmad en quête de science"
                        icon={<Globe className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Lorsque l'Imam Ahmad eut atteint quinze ans lunaires, il chercha à apprendre la science et le hadith. Il a alors voyagé dans différents pays afin de rechercher le hadith auprès des savants spécialistes de cette science.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-4">À Bassora</h4>
                        <p className="mb-4">
                            Parmi les voyages qui ont contribué à l'élargissement de sa science, il y a ses cinq voyages à Bassora (Al-Basrah) –ville située au sud de l'Iraq actuel–.
                        </p>
                        <p className="mb-4">
                            Il allait de savant en savant pour acquérir le hadith.
                        </p>
                        <p className="mb-4">
                            Un grand nombre de savants résidaient alors dans cette ville.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-4">Sa rencontre avec l'Imam Ach-Chafi^iyy au Hijaz</h4>
                        <p className="mb-4">
                            Comptent parmi ses voyages les plus bénéfiques, ceux qu'il a accomplis vers le Hijaz –région de la péninsule arabique–.
                        </p>
                        <p className="mb-4">
                            Il a ainsi rencontré de grands savants comme l'Imam Ach-Chafi^iyy qui lui a enseigné les fondements du hadith, la jurisprudence, la connaissance de l'abrogatif, de l'abrogé et d'autres sciences. Ils se sont aimé et respecté mutuellement.
                        </p>
                        <p className="mb-4">
                            À Bagdad, il a rencontré Soufyan Ibnou ^Ouyaynah qui, à cette époque, était incontestablement le spécialiste de la science du hadith (mouhaddith) du Hijaz. Il a appris auprès de lui et en a tiré de grands profits.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-4">À Koufa</h4>
                        <p className="mb-4">
                            L'Imam Ahmad s'est également rendu à Koufa (Al-Koufah) –ville d'Iraq– où il a acquis la science. L'Iraq était à l'époque une terre de science, de nombreux savants y vivaient et les étudiants en science de la religion s'y rendaient en grand nombre.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-4">À Sanaa</h4>
                        <p className="mb-4">
                            L'Imam Ahmad a également voyagé à Sanaa (San^a') –capitale actuelle du Yémen– où il a appris le hadith auprès de ^Abdou r-Razzaq Ibnou Hammam. Il y est resté deux ans malgré la rudesse de la vie. En effet, il patientait dans les difficultés en proposant de transporter les affaires des gens jusqu'à Sanaa contre rémunération.
                        </p>
                        <p>
                            Il y travaillait aussi comme tisserand –en tissant des nattes– ou comme copiste pour consommer le fruit de son propre labeur, et c'est-là la tradition des savants.
                        </p>
                    </CollapsibleSection>

                    {/* Ses enseignants */}
                    <CollapsibleSection
                        title="Ses enseignants"
                        icon={<Users className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Quant à ses chaykh, ils étaient plus de trois cents. Parmi les plus grands et les plus importants, il y a eu Houchaym Ibnou Bachir de qui il avait appris le hadith à Bagdad. Il est resté avec lui quatre ans à apprendre le hadith.
                        </p>
                        <p>
                            Il y a eu aussi Soufyan Ibnou ^Ouyaynah, Bichr Ibnou l-Moufaddal, An-Nadr Ibnou Isma^il Al-Bajliyy, Al-Walid Ibnou Mouslim, Yazid Ibnou Haroun, Waki^, le hafidh Abou Nou^aym et beaucoup d'autres encore.
                        </p>
                    </CollapsibleSection>

                    {/* Ses élèves */}
                    <CollapsibleSection
                        title="Ses élèves"
                        icon={<GraduationCap className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Ceux qui ont rapporté le hadith de l'Imam Ahmad sont nombreux.
                        </p>
                        <p className="mb-4">
                            Parmi eux, on cite les six rapporteurs de hadith très connus :
                        </p>
                        <ul className="list-disc list-inside space-y-2 mb-4">
                            <li>l'Imam des mouhaddith Al-Boukhariyy,</li>
                            <li>l'Imam Mouslim,</li>
                            <li>Abou Dawoud,</li>
                            <li>An-Naça'iyy,</li>
                            <li>At-Tirmidhiyy,</li>
                            <li>et Ibnou Majah.</li>
                        </ul>
                        <p className="mb-4">
                            Les deux fils de l'Imam Ahmad, Salih et ^Abdou l-Lah, ont également rapporté le hadith.
                        </p>
                        <p>
                            On peut aussi citer parmi ses élèves Yahya Ibnou Mou^in, Abou Zour^ah, Ibrahim Al-Harbiyy et d'autres encore.
                        </p>
                    </CollapsibleSection>

                    {/* La croyance de l'Imam Ahmad */}
                    <CollapsibleSection
                        title="La croyance de l'Imam Ahmad"
                        icon={<Shield className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Il existe de nos jours un groupe de gens qui prétendent suivre l'école de l'Imam Ahmad Ibnou Hanbal, alors qu'ils n'ont pas les mêmes croyances que ce grand savant. Pire encore, ce groupe juge toute personne qui n'adopterait pas ses croyances mécréante. Nous montrons ici que l'Imam Ahmad avait la croyance des prophètes et des compagnons du Dernier des prophètes, que Allah l'élève en degré.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad exemptait Allah de la forme et de l'image</h4>
                        <p className="mb-4">
                            Dans son livre: I^tiqadou l-'Imami l-Moubajjali Ahmad Ibnou Hanbal –La Croyance de l'Imam Ahmad Ibnou Hanbal–, Abou l-Fadl At-Tamimiyy Al-hanbaliyy rapporte que l'Imam Ahmad a dit : (mahma tasawwarta bibalik fal-Lahou bikhilafi dhalika) ce qui signifie : « Quoi que tu imagines en ton esprit Dieu en est différent. ». Cette parole est en fait tirée du hadith du Prophète صلى الله عليه وسلم :
                        </p>
                        <p className="mb-4 text-center font-amiri text-lg">
                            ((لا فِكْرَةَ في الرَّبِّ))
                        </p>
                        <p className="mb-4">
                            [rapporté par Abou l-Qaçim Al-'Ansariyy] (la fikrata fi r-Rabb)
                        </p>
                        <p className="mb-4">
                            « On ne peut pas atteindre la réalité de Dieu par l'imagination. »
                        </p>
                        <p className="mb-4">
                            Elle est aussi tirée de la ayah du Qour'an :
                        </p>
                        <p className="mb-4 text-center font-amiri text-lg">
                            ﴿وأنّ إلى ربِّكَ المُنتَهى﴾
                        </p>
                        <p className="mb-4">
                            [Sourat An-Najm / 42] (wa'anna 'ila Rabbika l-mountaha). Ce verset a été interprété par le célèbre compagnon Oubayy Ibnou Ka^b de la façon suivante : « L'imagination de celui qui imagine s'arrête lorsqu'il s'agit du Créateur, ainsi les imaginations ne peuvent L'atteindre. »
                        </p>
                        <p className="mb-4">
                            À l'inverse, les assimilationnistes disent ne pas pouvoir adorer ce qu'on ne peut pas imaginer, car ils font de la possibilité d'être imaginé une condition de l'existence.
                        </p>
                        <p>
                            On réplique à cette prétention de la manière suivante : Dieu a d'abord créé l'eau et le trône. Après la création de ces deux créatures-là, Il a créé d'autres créatures à savoir la lumière et l'obscurité. Il y a donc eu toute une époque entre la création des deux premières créatures et la suite, où il n'y avait ni lumière ni obscurité. Bien qu'on ne puisse pas imaginer cette réalité, il est un devoir d'y croire puisque cela a été rapporté dans le Qour'an.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad dit que Allah n'est pas un corps</h4>
                        <p className="mb-4">
                            Dans son livre: 'I^tiqadou l-'Imami l-Moubajjali Ahmad Ibnou Hanbal –La Croyance de l'Imam Ahmad Ibnou Hanbal–, Abou l-Fadl At-Tamimiyy Al-hanbaliyy rapporte que l'Imam Ahmad a dit :
                        </p>
                        <p className="mb-4">
                            « Les noms sont tirés de la religion (chari^ah) et de la langue arabe ; or les spécialistes de la langue arabe ont mentionné que le mot « corps » (jism) est employé pour tout ce qui présente une longueur, une largeur, une épaisseur, une composition, une image et une constitution, et Allah –ta^ala– est exempt de tout cela. Il n'est donc pas permis de L'appeler corps (jism) puisqu'Il est exempt de ce qui impliquerait qu'Il soit un corps et cela n'a pas été cité dans la religion (chari^ah) : c'est donc infondé ».
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad déclarait mécréant quiconque attribue le corps à Allah</h4>
                        <p className="mb-4">
                            Az–Zarkachiyy a rapporté dans son livre Tachnifou l-Maçami^ de l'auteur du livre Al-Khisal qu'il a dit : l'Imam Ahmad Ibnou Hanbal a dit :
                        </p>
                        <p className="mb-4 text-center font-amiri text-lg">
                            (مَنْ قَالَ إِنَّ اللهَ جِسْمٌ لاَ كَالأَجْسَامِ كَفَرَ)
                        </p>
                        <p className="mb-4">
                            (man qala 'inna l-Laha jismoun la ka l-'ajsami kafar)
                        </p>
                        <p className="mb-4">
                            « Quiconque dit que Allah est un corps qui n'est pas comme les corps n'est pas musulman ».
                        </p>
                        <p className="mb-4">
                            (tome 2 page 249 de cette édition)
                        </p>
                        <p>
                            L'Imam Al-Bayhaqiyy a également rapporté cette parole dans son livre Manaqibou Ahmad –manuscrit– de l'Imam Abou l-Fadl At-Tamimiyy qui était maître et fils du maître des hanbalites à Bagdad.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad considérait permise l'interprétation (at-ta'wil) qui est conforme aux textes de la religion et à la langue des arabes</h4>
                        <p className="mb-4">
                            Il a interprété lui-même le verset 22 de Sourate Al-Fajr :
                        </p>
                        <p className="mb-4 text-center font-amiri text-lg">
                            ﴿وَجَاءَ رَبُّكَ والْمَلَكُ صَفًّا صَفًّا﴾
                        </p>
                        <p className="mb-4">
                            (wa ja'a Rabbouka wal-malakou saffan saffa) en disant : (ja'a 'amrouh) ce qui signifie : « Son ordre viendra… » et dans une autre version, il a dit (ja'at qoudratouh) ce qui signifie : « des manifestations de Sa toute-puissance viendront… » c'est-à-dire qu'au Jour du jugement, Allah montrera aux gens des choses terribles qu'Il a prédestinées. Par conséquent, si l'Imam Ahmad avait eu pour croyance l'assimilation de Allah à Ses créatures, comme ces gens qui prétendent faire partie du salaf, il n'aurait pas interprété ce verset (ayah) mais l'aurait pris selon son sens apparent.
                        </p>
                        <p>
                            Les gens de ce groupe disent que l'interprétation revient à nier les attributs de Dieu, ils disent (at-ta'wilou ta^til) c'est-à-dire que celui qui pratique l'inter­prétation des textes tomberait d'après eux dans la négation de l'existence de Dieu et de Ses attributs. Selon eux, l'Imam Ahmad serait mécréant puisqu'il a interprété cette ayah. Comment peuvent-ils encore, après cela, se réclamer de l'école de l'Imam Ahmad ?
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad considérait permise la recherche des bénédictions de la tombe du Prophète صلى الله عليه وسلم</h4>
                        <p className="mb-4">
                            ^Abdou l-Lah le fils de l'Imam Ahmad a rapporté de son père qu'il a dit dans le livre Al-^Ilalou waMa^rifatou r-Rijal : « Je l'ai interrogé –c'est-à-dire qu'il a posé la question à son père l'Imam Ahmad– au sujet d'un homme qui toucherait ou embrasserait le minbar du Prophète pour en rechercher les bénédictions (tabarrouk) et qui agirait de la même manière avec la tombe ou ce qui est de cet ordre en voulant par-là se rapprocher de l'agrément de Allah ». Il lui a dit : « Il n'y a pas de mal en cela. »
                        </p>
                        <p>
                            Or certains extrémistes propagent de nos jours que rechercher les bénédictions –faire le tabarrouk– par les traces du Messager صلى الله عليه وسلم serait une forme d'association et que celui qui le fait ne serait plus musulman. D'après eux, Ahmad et son fils sont mécréants.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad considérait permise l'invocation par le degré des Prophètes et des saints</h4>
                        <p className="mb-4">
                            Il a été rapporté par l'Imam Al-Mardawiyy, dans son livre Al-'Insaf, que l'Imam Ahmad a écrit dans son Mansak adressé à Al-Marwadhiyy qu'il est recommandé à celui qui demande à Allah la pluie de faire l'invocation par le degré du Prophète صلى الله عليه وسلم.
                        </p>
                        <p>
                            Pourquoi certains égarés disent-ils maintenant que l'invocation par le degré du Prophète serait interdite et qu'elle serait une forme d'association ? Ils sont allés jusqu'à inventer une règle qui n'existe pas dans l'Islam selon laquelle appeler quelqu'un qui n'est pas vivant et présent serait de l'associa­tion(chirk).
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">L'Imam Ahmad ne jugeait pas interdit de voyager pour visiter la tombe du Prophète صلى الله عليه وسلم</h4>
                        <p className="mb-4">
                            Bien au contraire, il considérait ce voyage comme une chose recommandée, contrairement aux extrémistes qui considèrent ce voyage comme une désobéissance et même de la mécréance si c'est par recherche des bénédictions. Or les spécialistes de la jurisprudence hanbalite sont unanimes qu'il est recommandé pour celui qui termine son pèlerinage de voyager de la Mecque honorée vers Médine l'Illuminée pour visiter la tombe du Bien-aimé, le Prophète Mouhammad صلى الله عليه وسلم, ce qui fait largement la distance du voyage.
                        </p>
                        <p className="mb-4">
                            Ibnou Qoudamah a dit dans Al-Mouqni^ page 35 : « Quand le pèlerin termine son pèlerinage, il lui est recommandé de visiter la tombe du Prophète et celles de ses deux compagnons, que Dieu les agrée tous les deux. »
                        </p>
                        <p className="mb-4">
                            Et l'Imam Al-Mardawiyy a dit dans son commentaire de la parole de Ibnou Qoudamah citée dans son livre Al-'Insaf [Tome 4/Page 53] : « C'est bien cela la voie de tous les savants de l'école –hanbalite–, des premiers aux derniers. » Fin de citation.
                        </p>
                        <p>
                            Devant le jugement des savants les plus célèbres de l'école hanbalite, que diront les théoriciens de ce groupe anthropomorphiste, qui interdisent ce qui est recommandé par unanimité des hanbalites et même par unanimité de tous les musulmans ?
                        </p>
                        <p className="mt-4">
                            Tout ceci n'est qu'un faible échantillon des différences entre la croyance de l'Imam Ahmad et la croyance de ceux qui se réclament mensongèrement de son école. Ils se proclament hanbalites alors que l'Imam Ahmad n'a rien à voir avec eux.
                        </p>
                    </CollapsibleSection>

                    {/* La vertu et l'ascèse de l'Imam Ahmad */}
                    <CollapsibleSection
                        title="La vertu et l'ascèse de l'Imam Ahmad"
                        icon={<Sparkles className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Vertueux, ascète, savant aux qualités innombrables, l'Imam Ahmad en plus de sa grande science dans la religion était connu de tous pour son comportement d'excellence. Il agissait en bien envers les autres, était poli et ne prononçait aucune parole vile.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Le comportement de l'Imam Ahmad</h4>
                        <p className="mb-4">
                            C'est par son excellence de comportement que l'Imam Ahmad, que Allah l'agrée, a été connu. Les gens parlaient de lui, de son comportement et il était considéré meilleur que beaucoup d'autres.
                        </p>
                        <p className="mb-4">
                            Il est rapporté de Abou l-Houçayn Ibnou l-Mounada qu'il a dit : J'ai entendu mon grand-père dire : « Ahmad était parmi les gens, celui qui était le plus pudique et celui qui avait une grandeur d'âme, celui qui avait le meilleur comportement et la plus grande politesse. Il écoutait beaucoup ceux qui parlaient et baissait le regard. Il se détournait de ce qui était mauvais et des paroles inutiles. On entendait de lui la citation du hadith, la mention des gens vertueux, des gens ascètes. Il parlait calmement et avec de belles paroles. »
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Sa dignité dans la pauvreté et son ascèse</h4>
                        <p className="mb-4">
                            Il a été rapporté qu'un homme s'était rendu chez Ahmad Ibnou Hanbal à la suite du vol des vêtements de Ahmad. Cet homme était reparti chez lui chercher cent dirhams, mais Ahmad n'avait pas voulu les prendre ni en tant que cadeau, ni en tant que prêt. Ahmad lui avait dit : – N'est-ce pas que tu as entendu avec moi le hadith de Ibnou ^Ouyaynah ?   – Oui, répondit l'homme. Puis Ahmad lui dit –Veux-tu que je te l'écrive ? – d'accord, lui répondit l'homme. Il l'a donc écrit en contrepartie de quelques dirhams avec lesquelles il a pu s'acheter deux vêtements.
                        </p>
                        <p className="mb-4">
                            Selon le Hafidh Abou Nou^aym, l'Imam Ahmad que Allah l'agrée avait mis en hypothèque un seau chez un vendeur de pois-chiche afin d'acheter ce qu'il pouvait manger pour sa subsistance. Après un certain temps, il était venu récupérer son seau pour lever son hypothèque. C'est alors que le vendeur lui avait ramené deux seaux en lui disant : – Lequel des deux est le tien ? – Je ne sais pas, lui dit l'Imam Ahmad. Puis il a ajouté – Je t'excuse pour le seau et pour ce que je t'ai donné. En effet, du fait qu'il ne savait plus lequel des deux seaux était le sien, l'Imam Ahmad avait préféré pardonner au juge le seau qu'il aurait dû lui rendre. Le vendeur de pois chiches avait dit par la suite : « Par Allah, voilà son seau, mais je voulais simplement le tester ! »
                        </p>
                        <p className="mb-4">
                            Et Ibnou Hatim rapporte de Ahmad Ibnou Sinan que l'Imam Ahmad que Allah l'agrée, avait mis en hypothèque ses chaussures, chez un vendeur de pain au Yémen et qu'il avait loué ses services à deux transporteurs pour pouvoir acheter de quoi manger !
                        </p>
                        <p className="mb-4">
                            Quant à son fils Salih, il a rapporté de son père : « J'ai quelquefois vu mon père prendre les morceaux de pain, il enlevait la poussière qui était dessus, il les mettait dans un petit bol, il versait dessus de l'eau et il les mangeait avec du sel. Et je n'ai jamais vu mon père acheter de grenades ou de coings, ni aucun autre fruit si ce n'est du melon ou de la pastèque qu'il consommait avec du pain, du raisin et des dattes. »
                        </p>
                        <p>
                            Les récits rapportés sur son délaissement des plaisirs du bas monde et sa pratique de l'ascèse, sur le fait qu'il suivait le chemin du soufisme, sont trop nombreux pour être cités ici.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Sa modestie</h4>
                        <p className="mb-4">
                            L'Imam Ahmad Ibnou Hanbal était, que Allah l'agrée, très modeste vis-à-vis des savants et extrêmement humble envers eux. Lorsqu'il aimait quelqu'un, c'était par recherche de l'agrément de Allah et lorsqu'il détestait quelqu'un, c'était par obéissance à Allah.
                        </p>
                        <p>
                            Ibnou Salam a dit : « J'ai assisté aux assemblées de Abou Youçouf, de Mouhammad Ibnou l-Haçan, de Yahya Ibnou Sa^id et de ^Abdou r-Rahman Ibnou Mahdiyy mais je n'ai vu personne inspirer autant de respect que Ahmad Ibnou Hanbal. » Et d'après ^Abdou l-Lah, le fils d'Ahmad Ibnou Hanbal : « Mon père faisait chaque jour et nuit trois cents rak^ah surérogatoires et lorsqu'il était malade il accomplissait cent cinquante rak^ah surérogatoires par jour et nuit. »
                        </p>
                    </CollapsibleSection>

                    {/* Son haut degré */}
                    <CollapsibleSection
                        title="Son haut degré"
                        icon={<Star className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            At–Tabaraniyy et Al-Bayhaqiyy ont rapporté qu'une femme, atteinte de paralysie des jambes depuis vingt ans, avait dit un jour à son fils d'aller chez Ahmad pour qu'il lui fasse des invocations. À son arrivée chez Ahmad, il frappa à la porte et lui expliqua le but de sa visite. Ahmad dit alors : « J'ai davantage besoin de ses invocations qu'elle n'a besoin des miennes. » Et il lui a fait une invocation. À son retour, le fils vit sa mère marcher sur ses jambes, qui lui disait : « Allah m'a accordé la guérison. »
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Ach-Chafi^iyy a recherché les bénédictions par l'Imam Ahmad</h4>
                        <p className="mb-4">
                            Al-Bayhaqiyy rapporte que Ar-Rabi^ a dit : « Ach-Chafi^iyy m'a confié une lettre à remettre à Ahmad. Je l'ai donc rencontré juste après qu'il a accompli la prière du matin (as–soubh) et la lui ai remise. Il m'a demandé : "L'as-tu lue ?" Je lui ai répondu : "Non." Il l'a prise et quand il en termina la lecture il a pleuré. Je lui ai demandé alors : « Ya 'Aba ^Abdi l-Lah, qu'as-tu lu ? » Il a répondu : « Ach-Chafi^iyy m'informe qu'il a vu le Prophète dans le rêve lui dire ce qui signifie : Écris à Abou ^Abdi l-Lah Ahmad Ibnou Hanbal, passe lui mon salam et dis-lui : Tu seras éprouvé pour que tu dises que le Qour'an est créé. Alors ne les écoute pas, Allah t'en rétribuera jusqu'au Jour dernier. » J'ai dit alors à Ahmad Ibnou Hanbal : « Quelle est ma récompense pour cette nouvelle ? » Il a retiré le vêtement qu'il portait et me l'a remis. Lorsque je suis retourné chez Ach-Chafi^iyy, je l'ai informé de ce qui s'était passé, alors il m'a dit : « Je ne vais pas t'attrister en te demandant ce vêtement mais trempe-le dans l'eau et donne-moi de cette eau pour les bénédictions. »
                        </p>
                    </CollapsibleSection>

                    {/* Le décès de l'Imam Ahmad */}
                    <CollapsibleSection
                        title="Le décès de l'Imam Ahmad"
                        icon={<Calendar className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Le décès de l'Imam Ahmad a eu lieu à Bagdad un vendredi 12 du mois de Rabi^ou l-'Awwal en l'an 241 de l'Hégire. Des centaines de milliers de musulmans ont suivi son convoi funéraire.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Le décès d'un homme de grande valeur</h4>
                        <p className="mb-4">
                            Ibnou Khil-likan a cité dans Al-Wafayat que l'Imam Ahmad est décédé à Bagdad aux alentours du vendredi 12 du mois de Rabi^ou l-'Awwal en l'an 241 de l'Hégire. Un soir l'Imam Ahmad, que Allah l'agrée, est tombé malade de la fièvre. Sa maladie a duré neuf jours. Puis, il décéda à l'âge de soixante-dix-sept ans. Il a été enterré au cimetière de Bab Harb à Bagdad et environ huit cent mille hommes et soixante mille femmes ont assisté à la prière funéraire (Janazah). Et il a été dit que le jour de sa mort vingt mille personnes se sont converties à l'Islam.
                        </p>

                        <h4 className="font-bold text-lg text-emerald-700 dark:text-emerald-300 mb-2 mt-6">Le testament de l'Imam Ahmad Ibnou Hanbal</h4>
                        <p className="mb-4">
                            L'Imam Ahmad Ibnou Hanbal que Allah l'agrée, a rédigé son testament dont nous citerons le début : « Bismi l-Lahi r-Rahmani r-Rahim, ceci est ce que recommande Ahmad Ibnou Mouhammad Ibnou Hanbal, il confirme qu'il témoigne qu'il n'est de dieu que Allah, Lui seul Il n'a pas d'associé, et que Mouhammad est Son esclave et Son Messager, envoyé avec la droiture et la religion de vérité, pour la manifester entièrement malgré l'opposition des associateurs. Et il recommande à ceux qui lui obéissent de sa famille et de sa parenté, d'adorer Allah parmi ceux qui L'adorent et de louer Allah parmi ceux qui Le louent, et qu'ils donnent le conseil à la communauté musulmane. Et je témoigne que mon cœur est satisfait du fait que Allah est mon Seigneur et que l'Islam est ma religion et que Mouhammad est mon Prophète. »
                        </p>
                        <p className="mb-4">
                            Dieu nous dit dans le Livre honoré :
                        </p>
                        <p className="mb-4 text-center font-amiri text-lg">
                            ﴿إنّا نحنُ نزّلنا الذِّكرَ وإِنّا لَهُ لَحافِظينَ﴾
                        </p>
                        <p className="mb-4">
                            [sourat Al-Hijr / 9] ('inna nahnou nazzalna dh-dhikra wa'inna lahou lahafidhin)
                        </p>
                        <p className="mb-4">
                            « C'est Nous Qui avons fait descendre le Livre révélé et c'est Nous Qui le gardons. »
                        </p>
                        <p>
                            Effectivement, Allah, Qui a la gloire et Qui est exempt de toute imperfection, a préservé notre religion par la cause d'hommes tels que l'Imam Ahmad, que Allah l'agrée.
                        </p>
                    </CollapsibleSection>
                </m.section>

                {/* Section caractéristiques */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
                        Caractéristiques de l'École Hanbalite
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center mb-4">
                                <BookOpen className="h-6 w-6 text-amber-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                Attachement au Texte
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Priorité absolue au Coran et à la Sunna authentique, avec une utilisation
                                limitée du raisonnement analogique.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center mb-4">
                                <Scale className="h-6 w-6 text-amber-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                Rigueur Juridique
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                Approche conservatrice en matière de jurisprudence, privilégiant la
                                préservation des pratiques établies.
                            </p>
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-amber-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                Influence Moderne
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                                L'école hanbalite est particulièrement influente en Arabie Saoudite,
                                au Qatar et dans certaines régions de Syrie et d'Irak.
                            </p>
                        </div>
                    </div>
                </m.section>

                {/* Autres écoles */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
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
                                transition={{ delay: 0.8 + index * 0.1 }}
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
                    transition={{ delay: 0.9 }}
                    className="mt-16 bg-gradient-to-r from-amber-100 to-emerald-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-2xl p-8 text-center shadow-lg"
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="text-5xl mb-4 text-amber-600 dark:text-amber-400">"</div>
                        <p className="text-xl text-gray-800 dark:text-gray-200 font-amiri leading-relaxed mb-4">
                            Quoi que tu imagines en ton esprit, Dieu en est différent.
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            - Imam Ahmad ibn Hanbal
                        </p>
                    </div>
                </m.section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">
                        "Ceux qui savent et ceux qui ne savent pas sont-ils égaux ?"
                    </p>
                    <p className="text-emerald-200 text-sm">
                        Sourate Az-Zumar, verset 9
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Hanbalite;
