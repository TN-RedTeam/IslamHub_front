import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, BookOpen, Users, Star, ChevronRight, GraduationCap, Lightbulb, Globe, ChevronDown, ChevronUp, Heart, Shield, Sparkles, Calendar, BookMarked } from 'lucide-react';

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

const Hanafi: React.FC = () => {
    const stats = [
        { label: 'Œuvres majeures', value: '100+', icon: BookOpen },
        { label: "Élèves célèbres", value: '80+', icon: Users },
        { label: "Siècles d'influence", value: '13+', icon: Scale },
        { label: 'Pays influencés', value: '40+', icon: Globe },
    ];

    const relatedMadhaheb = [
        {
            id: 1,
            name: 'Maliki',
            nameArabic: 'المالكية',
            path: '/ecoles/Malikite',
            description: "L'école de la pratique médinoise",
            color: 'from-emerald-500 to-teal-600'
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

    const principles = [
        {
            title: 'Le Coran',
            description: 'Source première de la législation islamique.',
            icon: BookOpen
        },
        {
            title: 'La Sunna',
            description: 'Les enseignements et pratiques du Prophète (paix sur lui).',
            icon: Star
        },
        {
            title: 'L\'Ijma\'',
            description: 'Le consensus des savants sur une question juridique.',
            icon: Users
        },
        {
            title: 'Le Qiyas',
            description: 'Le raisonnement analogique pour les nouvelles situations.',
            icon: Scale
        },
        {
            title: 'L\'Istihsan',
            description: 'Le choix de la meilleure solution pour l\'intérêt public.',
            icon: Lightbulb
        },
        {
            title: 'L\'Urf',
            description: 'La coutume locale comme source de droit.',
            icon: Globe
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
                        <Scale className="h-12 w-12 text-white" />
                    </m.div>

                    <m.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-6 font-amiri"
                    >
                        École Hanafite
                    </m.h1>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-emerald-200 max-w-3xl mx-auto mb-4"
                    >
                        L'école de la raison et de l'opinion
                    </m.p>

                    <m.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-emerald-300 max-w-2xl mx-auto font-amiri"
                    >
                        Fondée par l'Imam Abou Hanifa an-Nou'man (699-767 EC)
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
                            L'Imam Abou Hanifah, que Allah l'agrée, dont le nom est An-Nou^man Ibnou Thabit, était un savant brillant. Il est né en 80 de l'Hégire à Al-Koufah, ville dans laquelle il a grandi. Il a rencontré des compagnons du Prophète (Salla l-Lahou ^alayhi wa sallam). Parmi les compagnons qu'il a rencontrés, il y a Anas Ibnou Malik, ^Abdou l-Lah Ibnou Abi Awfa et d'autres, que Allah les agrée tous.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son Apprentissage de la Science"
                        icon={<BookOpen className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Il a appris la science de la religion auprès d'un grand nombre de savants tabi^iyy. Il était connu pour sa grande intelligence et sa compréhension subtile et précise. Il a assisté aux assemblées de science de Hammad Ibnou Abi Soulayman, qui était parmi les plus grands savants de la jurisprudence à Al-Koufah.
                        </p>
                        <p className="mb-4">
                            Quand ce dernier est décédé, les savants de l'époque ont reconnu la place de Abou Hanifah, que Allah l'agrée, parmi les savants de son temps. Ils lui ont confié la responsabilité des assemblées de jurisprudence de son chaykh. Il était connu pour son application à prendre les bonnes décisions quand il enseigne les avis de jurisprudence, parmi ceux qui ont étudié avec lui, il y a l'Imam Malik.
                        </p>
                        <p className="mb-4">
                            Il a également appris d'un des plus grands successeurs des compagnons : ^Ata' Ibnou Abi Rabah, qui était le Moufti de La Mecque.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son École de Jurisprudence"
                        icon={<Scale className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Les élèves de l'Imam Abou Hanifah se comptent par centaines, les plus connus sont Mouhammad Ibnou l-Haçan, Abou Youçouf Al-Qadi et d'autres encore.
                        </p>
                        <p className="mb-4">
                            L'école de jurisprudence de l'Imam Abou Hanifah s'est répandue à l'Est et à l'Ouest et a été adoptée par le califat ottoman, ce qui a permis sa diffusion dans de nombreux pays du monde.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son Œuvre Al-Fiqhou l-'Akbar"
                        icon={<BookMarked className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Le livre Al-Fiqhou l-'Akbar est de l'Imam Abou Hanifah. Ce livre traite des fondements de la croyance. On y trouve les sujets les plus importants de la croyance et des propos concis en ce qui concerne les bases de cette science, conformément à la croyance de Ahlou s-Sounnah wa l-Jama^ah. Dans cet ouvrage, il a posé les fondements et les règles de la croyance.
                        </p>
                        <p className="mb-4">
                            Al-Fiqhou l-'Akbar compte parmi les premiers ouvrages écrits au sujet de la science de la croyance, en conformité avec la croyance de Ahlou s-Sounnah wa l-Jama^ah.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Paroles de Savants à son Sujet"
                        icon={<Star className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Le grand savant Ibnou Hajar Al-^Asqalaniyy a dit au sujet de l'Imam Abou Hanifah :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (هُوَ الفَقِيهُ المشهور أحد الأئمة أخرج له ابن ماجه والترمذي والنسائي من حديثه مجتنباً ما ينفرد به)
                        </p>
                        <p className="mb-4 italic">
                            (houwa l-faqihou l-mach-hour 'ahadou l-'a'immati 'akhraja lahou Ibnou Majah wa t-Tirmidhiyy wa n-Naça'iyy min hadithi mouj-taniban ma yanfaridou bih)
                        </p>
                        <p className="mb-6">
                            « C'est le Faqih célèbre, l'un des Imams. Ibnou Majah, At-Tirmidhiyy et An-Naça'iyy ont rapporté des hadith de sa part, à l'exception de ceux qu'il rapporte seul. »
                        </p>

                        <p className="mb-4">
                            Le grand savant Al-Kawthariyy a dit au sujet du livre de l'Imam Abou Hanifah Al-^Alim wa l-Mouta^allim :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (هو أقدم كتاب في علم التوحيد)
                        </p>
                        <p className="mb-4 italic">
                            (houwa 'aqdamou kitabin fi ^ilmi t-tawhid)
                        </p>
                        <p className="mb-6">
                            « C'est le livre le plus ancien au sujet de la science de la croyance. »
                        </p>

                        <p className="mb-4">
                            Le Chaykh ^Abdou l-Lah Al-Harariyy a dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (جدد الإمام أبو حنيفة علم الفقه وعلم التوحيد)
                        </p>
                        <p className="mb-4 italic">
                            (jaddada l-'Imam Abou Hanifah ^ilma l-fiqhi wa ^ilma t-tawhid)
                        </p>
                        <p className="mb-4">
                            « L'Imam Abou Hanifah a renouvelé la science de la jurisprudence et la science de la croyance. »
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Son Décès"
                        icon={<Heart className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Il est décédé en 150 de l'Hégire. Un très grand nombre de personnes ont assisté à son enterrement. Sa tombe est actuellement à Bagdad, que Allah l'agrée.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Sa Croyance en Allah"
                        icon={<Shield className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Abou Hanifah a expliqué la croyance en Allah et a confirmé dans son livre Al-Fiqhou l-'Akbar que Allah ta^ala existe sans endroit et sans direction, et que Allah ne ressemble pas à Ses créatures. Il a dit, que Allah l'agrée :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (كانَ اللهُ ولا مكان، كانَ قبلَ أن يَخْلُقَ الخلق كانَ ولم يكن أينٌ ولا خَلقٌ ولا شىء وهو خالقُ كل شىء)
                        </p>
                        <p className="mb-4 italic">
                            (kana l-Lahou wala makan, kana qabla 'an yakhlouqa l-khalq, kana wa lam yakoun 'aynoun wa la khalqoun wa la chay' wa houwa khaliqou koulli chay')
                        </p>
                        <p className="mb-6">
                            « Allah est de toute éternité et il n'y a pas d'endroit de toute éternité, Il est de toute éternité avant de créer les créatures, Il est de toute éternité alors qu'il n'y avait ni endroit, ni créatures, ni quoi que ce soit et c'est Lui Qui a tout créé. »
                        </p>

                        <p className="mb-4">
                            Et il a dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (والله تعالى يُرَى في الآخرة ويراه المؤمنون وهم في الجنة بأعين رؤوسهم بلا تشبيه ولا كمِّيَّة ولا يكون بينه وبين خلقه مسافة)
                        </p>
                        <p className="mb-4 italic">
                            (wa l-Lahou ta^ala youra fi l-'akhirah wa yarahou l-mou'minouna wa houm fi l-jannah bi 'a^youni rou'ouçihim bila tachbih wa la kammiyyah wa la yakounou baynahou wa bayna khalqihi maçafah)
                        </p>
                        <p className="mb-6">
                            « Allah ta^ala sera vu dans l'au-delà, les croyants Le verront alors qu'ils sont au paradis avec les yeux de leur tête, sans attribuer à Allah la ressemblance avec les créatures, sans attribuer à Allah de quantité et il n'y aura pas de distance entre Lui et Ses créatures. »
                        </p>

                        <p className="mb-4">
                            Il a dit aussi :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (لا يوصف الله بصفات المخلوقين وغضبُه ورضاه صفتان من صفاته بلا كيف، وهو قول أهل السنة والجماعة وهو يغضب ويرضى ولا يقال غضبُه عقوبته ورضاه ثوابه ونصفه كما وصف نفسه أحدٌ صمدٌ لم يلد ولم يولد ولم يكن له كفواً أحد)
                        </p>
                        <p className="mb-4 italic">
                            (la youçafou l-Lahou bi çifati l-makhlouqin, wa ghadabouhou wa ridahou çifatani min çifatihi bila kayf, wa houwa qawlou 'ahli s-sounnati wa l-jama^ah, wa houwa yaghdabou wa yarda, wa la youqalou ghadabouhou ^ouqoubatouh wa ridahou thawabouhou wa naçifouhou kama waçafa nafsahou 'ahadoun çamadoun lam yalid wa lam youlad wa lam yakoun lahou koufouwan 'ahad)
                        </p>
                        <p className="mb-6">
                            « On n'attribue pas à Allah les attributs des créatures. Son ghadab (châtiment) et Son rida (agrément) sont deux attributs parmi Ses attributs, qui ne sont pas à l'image de ceux des créatures. C'est la parole de Ahlou s-Sounnah wa l-Jama^ah. Il a pour attribut le ghadab et le rida et on ne dit pas que Son ghadab c'est Son châtiment ou que Son rida c'est Sa récompense et nous Le qualifions comme Il S'est qualifié Lui-même : Celui qui est unique, Celui dont toutes les créatures ont besoin et Qui n'a besoin de rien, Il n'engendre pas et Il n'est pas engendré et n'a aucun équivalent. »
                        </p>

                        <p className="mb-4">
                            Et il a dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (ويده صفة بلا كيف)
                        </p>
                        <p className="mb-4 italic">
                            (wa yadouhou çifatoun bila kayf)
                        </p>
                        <p className="mb-6">
                            « Son yad est un attribut qui n'est pas comment celui des créatures. »
                        </p>

                        <p className="mb-4">
                            Et il a dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (وليس اللهُ بِعَرَضٍ ولا جَوْهَرٍ ولا مُتَحَيِّزٍ)
                        </p>
                        <p className="mb-4 italic">
                            (wa laysa l-Lahou bi^aradin wa la jawharin wa la moutahayyiz)
                        </p>
                        <p className="mb-6">
                            « Allah n'est pas un attribut, ni un corps, et Il n'est pas dans un endroit. »
                        </p>

                        <p className="mb-4">
                            Ces paroles sont claires et nettes, ce sont les paroles du Salaf, des savants des trois premiers siècles de l'Hégire, qui sont les meilleurs siècles de cette communauté. Un savant de la taille de l'Imam Abou Hanifah, qu'on appelle le plus grand des Imams, déclare sans hésitation que Allah existe sans endroit et que ce qui est évoqué dans le Qour'an comme le yad ou le wajh au sujet de Allah, ne sont pas à comprendre au sens physique, c'est-à-dire que le yad de Allah est un attribut qui ne ressemble pas aux attributs des créatures, en d'autres termes, il ne s'agit pas de dire que le yad de Allah c'est une main ou un membre ou une direction ou un endroit ou quelque chose de physique, car tout cela ce sont des attributs des créatures, et pas les attributs de Allah.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Les Attributs de Allah"
                        icon={<Sparkles className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            L'Imam Abou Hanifah a dit :
                        </p>
                        <p className="mb-4 text-right font-amiri text-xl leading-loose">
                            (له يد ووجه ونفس كما ذكر الله تعالى في القرءان فما ذكره الله تعالى في القرءان من ذكر الوجه واليد والنفس فهو له صفات بلا كيف ولا يقال إن يده قدرته أو نعمته لأن فيه إبطال الصفة وهو قول أهل القدر والاعتزال ولكن يده صفة بلا كيف)
                        </p>
                        <p className="mb-4 italic">
                            (lahou yadoun wa wajhoun wa nafsoun kama dhakara l-Lahou ta^ala fi l-Qour'an, fama dhakarahou l-Lahou ta^ala fi l-Qour'ani min dhikri l-wajhi wa l-yadi wa n-nafsi fahouwa lahou çifatoun bila kayf, wa la youqalou 'inna yadahou qoudratouhou 'aw ni^matouhou li 'anna fihi 'ibtal as-çifati wa houwa qawlou 'ahli l-qadari wa l-'i^tizal, wa lakinna yadahou çifatoun bila kayf)
                        </p>
                        <p className="mb-6">
                            « Allah a pour attributs un yad, un wajh et un nafs tels que Allah les a évoqués dans le Qour'an. Ce que Allah ta^ala a évoqué dans le Qour'an comme yad, wajh et nafs constituent pour Lui des attributs qui ne sont pas comme ceux des créatures. On ne dit pas que le yad c'est la puissance de Allah ou Sa grâce parce que cela reviendrait à nier l'attribut, c'est ce que disent les gens de la secte qadara et de la secte mou^tazilah. Plutôt, Son yad est un attribut qui n'est pas comme celui des créatures. »
                        </p>

                        <p className="mb-4">
                            C'est-à-dire que l'Imam Abou Hanifah nous enseigne que le yad qui est attribué à Allah dans le Qour'an ou dans les hadith, n'est pas à l'image du yad des créatures, ce n'est pas une main, ce n'est pas un membre, ce n'est pas un organe, ce n'est pas un corps. Mais en même temps, l'Imam Abou Hanifah nous enseigne de ne pas nier complètement le yad comme l'ont fait les mou^tazilah, les gens de la mauvaise secte des mou^tazilah ont dit que le yad de Allah signifie la puissance, l'Imam Abou Hanifah, le plus grand des Imams, leur a répondu il y a plus de 1200 ans : non ! Le yad est un attribut de Allah, mais ce n'est pas la puissance, ça existe, mais ça ne ressemble pas aux attributs des créatures.
                        </p>
                        <p className="mb-4">
                            Ceci est la compréhension correcte des attributs de Allah, c'est la croyance de Ahlou s-Sounnah, c'est ce que les savants des trois premiers siècles ont enseigné.
                        </p>
                    </CollapsibleSection>
                </m.section>

                {/* Section des principes */}
                <m.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
                        Sources et Méthodologie de l'École Hanafite
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {principles.map((principle, index) => (
                            <m.div
                                key={principle.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-emerald-800 flex items-center justify-center mb-4">
                                    <principle.icon className="h-6 w-6 text-amber-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {principle.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {principle.description}
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
                        Particularités de l'École Hanafite
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3 font-amiri">
                                Flexibilité et Adaptabilité
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                                L'école hanafite est reconnue pour sa flexibilité, utilisant des méthodes comme
                                l'istihsan (préférence juridique) pour adapter la loi aux circonstances changeantes
                                et à l'intérêt public.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/50 rounded-xl p-6 shadow-lg border border-amber-200 dark:border-emerald-800">
                            <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3 font-amiri">
                                Rayonnement Géographique
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                                L'école hanafite est majoritaire en Turquie, dans les Balkans, en Asie centrale,
                                en Afghanistan, au Pakistan, en Inde, en Chine et chez les musulmans de l'ex-URSS.
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
                            La science est plus précieuse que l'argent, car la science te protège tandis que tu dois protéger l'argent.
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            - Imam Abou Hanifa
                        </p>
                    </div>
                </m.section>
            </main>

            <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-emerald-300 mb-4 font-amiri text-xl">
                        "Et dis: Seigneur, augmente mes connaissances."
                    </p>
                    <p className="text-emerald-200 text-sm">
                        Sourate Ta-Ha, verset 114
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Hanafi;
