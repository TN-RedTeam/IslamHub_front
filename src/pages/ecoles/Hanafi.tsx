import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, BookOpen, Users, Star, ChevronRight, Lightbulb, Globe, ChevronDown, ChevronUp, Heart, Shield, Sparkles, Calendar, BookMarked, Brain, HeartCrack } from 'lucide-react';
import { EcoleFiqhSection } from '../../components/EcoleFiqhSection';

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
                        Fondée par l'Imam Abou Hanifa an-Nou'man
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
                        <p className="mb-4">
                            Il a également composé 4 autres livres concernant la science du Tawhid qui constituent encore une référence de nos jours : Al-Fiqhou l-‘Akbar,

                            Al-Fiqhou l-‘Absat,

                            Ar-Riçalah,

                            Al-^Alim wal-Mouta^allim et

                            Al-Wasiyyah.
                        </p>
                    </CollapsibleSection>


                    <CollapsibleSection
                        title="Sa Croyance en Allah"
                        icon={<Shield className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            <strong><h2>Au sujet de la non ressemblance absolue du Créateur avec les créatures</h2></strong>
                        </p>
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
                        <p className="mb-6">
                            Parmi les paroles précieuses que l’imam Abou Hanifah a dites au sujet de l’exemption de Allah ta^ala de toutes caractéristiques des corps, il y a sa parole dans son livre Al-Fiqhou l-‘Akbar :
                        </p>
                        <p className="mb-6 font-amiri">
                            (والله واحد لا من طريق العدد ولكن من طريق أنه لا شريك له، لم يلد ولم يولد ولم يكن له كفوًا أحد، لا جسم ولا عَرَض ولا حَدَّ له ولا ضد ولا ند ولا مثل، لا يشبه شيئًا من خلقه، ولا يشبهه شىء من خلقه، وهو شىء لا كالأشياء)


                        </p>
                        <p className="mb-4">
                            (wal-Lahou wahidoun la min tariqi l-^adad walakin min tariqi ‘annahou la charika lah lam yalid walam youlad walam yakoun lahou koufouwan ‘ahad, la jismoun wala ^aradoun wala haddoun lahou wala diddoun wala niddoun wala mithl, la youchbihou chay’an min khalqihi wala youchbihouhou chay’oun min khalqih, wa houwa chay’oun la kal-‘achya’)
                        </p>
                        <p className="mb-4">
                            <strong>ce qui signifie:</strong> « Dieu est unique, non pas dans le sens numérique mais dans le sens qu’Il n’a pas d’associé, Il n’engendre pas et n’est pas engendré et Il n’a pas d’équivalent. Il n’est pas un corps, ni une caractéristique d’un corps, Il est donc exempt d’avoir une limite –grande ou petite–, un opposé, un semblable ou un ressemblant. Il n’a pas de ressemblance avec quoi que ce soit dans Sa création et rien de Sa création n’a de ressemblance avec lui. Il existe [Dieu] mais pas comme tout ce qui existe.».
                        </p>
                        <p className="mb-6">
                            Il a dit également :
                        </p>
                        <p className="mb-4 font-amiri">
                            (أنىَّ يشبه الخالق مخلوقه)
                        </p>
                        <p className="mb-6">
                            (‘anna youchbihou l-khaliqou makhlouqah)
                        </p>
                        <p className="mb-4">
                          <strong>ce qui signifie:</strong>  « Comment serait-il possible que le Créateur ait une ressemblance avec ce qu’Il crée ? »
                        </p>
                        <p className="mb-4">
                            <strong><h2>Au sujet de la parole de Dieu</h2></strong>
                        </p>
                        <p className="mb-6">
                            Abou Hanifah était de ceux qui exemptaient Allah de la voix, des lettres et de la langue. Il a en effet précisé que la parole de Allah qui est Son attribut propre à Son Être de toute éternité, exempt de début et de fin, n’est pas composée de lettres et n’est pas une voix. Il a dit dans son livre Al-Fiqhou l-‘Absat ce qui suit :
                        </p>
                        <p className="mb-4 font-amiri">
                            (واللهُ يتكلّم بكلام لا يشبهُ كلامَنا نحن نتكلّم بالآلات من المخارج والحروف والله متكلّم بلا آلةٍ ولا حرفٍ، فصفاته غير مخلوقة ولا مُحْدثة، والتغير والاختلاف في الأحوال يحدث في المخلوقين، ومن قال إنها مُحدثة أو مخلوقة أو توقف أو شك فهو كافر)
                        </p>
                        <p className="mb-6">
                            (wal-Lahou yatakallamou bikalamin la youchbihou kalamana nahnou natakallamou bil-‘alati mina makhariji wal-houroufi wal-Lahou moutakallimoun bila ‘alatin wala harf)
                        </p>
                        <p className="mb-4">
                            <strong>ce qui signifie:</strong>  « Dieu parle d’une parole qui n’est pas comme la nôtre, nous parlons par le moyen d’organes à partir de points de prononciation et de lettres mais Dieu parle sans organe ni lettre. Ses attributs ne sont pas créés, ni entrés en existence. Le changement et la modification des états ont lieu pour les créatures et si quelqu’un croit que les attributs de Allah sont entrés en existence ou qu’ils sont créés ou s’abstient en ne voulant pas se prononcer ou en doute, il n’est pas musulman. »
                        </p>
                        <p className="mb-6">
                            Au sujet de la vision de Allah dans l’au-delà
                        </p>
                        <p className="mb-6">
                            L’imam de l’école hanafite, qui est l’un des savants du Salaf les plus réputés a dit :
                        </p>
                        <p className="mb-6 font-amiri">
                            (واللهُ تعلى يُرى في الآخرة ويراه المؤمنون وهم في الجنّة يأعين رؤوسهم بلا تشبيه ولا كميّة ولا يكون بينه وبين خلقه مسافة)
                        </p>
                        <p className="mb-6">
                            (wal-Lahou ta^ala youra fi l-‘akhirah, wayarahou l-mou’minouna wahoum fi l-jannah bi ’a^youni rou’oucihim bila tachbihin wala kammiyyah wala yakounou baynahou wabayna khalqihi maçafah)
                        </p>
                        <p className="mb-4">
                            <strong>ce qui signifie:</strong>  « Allah ta^ala sera vu dans l’au-delà, les croyants le verront alors qu’ils seront eux au Paradis, avec les yeux de leur tête, sans aucune ressemblance ni aucune forme, et il n’y aura pas de distance entre Lui et Ses créatures. » Il a cité cela dans son livre Al-Fiqhou l-‘Akbar.
                        </p>
                        <p className="mb-6">
                            Il a dit également dans son livre Al-Wasiyyah page 4 :
                        </p>
                        <p className="mb-6 font-amiri">
                            (ولقاء الله تعالى لأهل الجنّة بلا كيف ولا تشبيه ولا جهةٍ حقّ)
                        </p>
                        <p className="mb-6">
                            (wa liqa’ou l-Lahi ta^ala li ’ahli l-jannati bila kayfin wala tachbihin wala jihatin haqq)
                        </p>
                        <p className="mb-6">
                            <strong>ce qui signifie:</strong> « La vision de Allah par les gens du Paradis sans comment, sans ressemblance et sans direction, est une vérité. »
                        </p>

                        <p className="mb-4">
                            Ces paroles sont claires et nettes, ce sont les paroles du Salaf, des savants des trois premiers siècles de l'Hégire, qui sont les meilleurs siècles de cette communauté. Un savant de la taille de l'Imam Abou Hanifah, qu'on appelle le plus grand des Imams, déclare sans hésitation que Allah existe sans endroit et que ce qui est évoqué dans le Qour'an comme le yad ou le wajh au sujet de Allah, ne sont pas à comprendre au sens physique, c'est-à-dire que le yad de Allah est un attribut qui ne ressemble pas aux attributs des créatures, en d'autres termes, il ne s'agit pas de dire que le yad de Allah c'est une main ou un membre ou une direction ou un endroit ou quelque chose de physique, car tout cela ce sont des attributs des créatures, et pas les attributs de Allah.
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="l'interprétation des versets non explicites"
                        icon={<Sparkles className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            On trouve dans le Qour’an des versets explicites et des versets non explicites. Certains savants tels que Abou Hanifah ont interprété les versets non explicites, ils leur ont donné un sens conforme à la Sounnah et aux versets explicites.
                        </p>
                        <p className="mb-4">
                            L’interprétation globale des versets non explicites
                        </p>
                        <p className="mb-4">
                            L’imam Abou Hanifah fait partie des successeurs, né en 80 il est mort en 150 de l’Hégire et fait donc partie du Salaf dont le Prophète a fait l’éloge. Il a eu l’immense honneur de voir les compagnons, des gens qui avaient vu et vécu avec notre Prophète bien-aimé, Mouhammad fils de ^Abdou l-Lah.
                        </p>
                        <p className="mb-4">
                            Dans le Qour’an honoré figurent :
                        </p>
                        <p className="mb-4">
                            1. <b><u>des versets explicites</u></b> : ce sont les versets qui n’admettent qu’un seul sens du point de vue de la langue, ou encore ceux dont le sens qui est visé a été clairement connu. C’est le cas de la parole de Allah :
                        </p>
                        <p className="mb-4 font-amiri">
                            ﴿لَيْسَ كَمِثْلِهِ شَىْء﴾
                        </p>
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

                    <CollapsibleSection
                        title="La science et la forte capacité de riposte de l’Imam Abou Hanifah"
                        icon={<Brain className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Abou Hanifah était la référence des savants sunnites –les savants de Ahlou s-Sounnah–, le plus réputé d’entre eux pour répliquer aux gens qui suivent leurs passions et plus particulièrement les mou^tazilah. Ach-Chafi^iyy a dit : « Celui qui veut approfondir ses connaissances dans la jurisprudence sera comme un enfant par rapport à Abou Hanifah. »
                        </p>
                        <p className="mb-4">
                            <strong><h2>Ses répliques contre les détracteurs de l’Islam</h2></strong>
                        </p>
                        <p className="mb-4">
                            L’Imam Abou Hanifah, que Allah l’agrée, était un moujtahid absolu, qui avait une forte capacité de riposte et d’argumentation. À son époque, il était le défenseur de la Sounnah contre l’égarement des mou^tazilah –un groupe se réclamant de l’Islam qui a innové dans la croyance en disant notamment que Dieu aurait créé les humains en leur donnant le pouvoir de créer leurs actes et que suite à cela Dieu n’aurait plus eu de pouvoir sur eux–. Une à une, il avait recherché leurs assemblées dans le pays pour débattre avec eux et leur répliquer avec l’argument décisif qui les faisait taire. Il avait montré l’infondé de leurs prétentions et révélé leurs supercheries.
                        </p>
                        <p className="mb-4">
                            <strong><h2>Sa maîtrise de la science du Tawhid</h2></strong>
                        </p>
                        <p className="mb-4">
                            Il avait atteint un degré tel dans la science du Tawhid qu’il est devenu la référence auprès des gens, le soutien de Ahlou s-Sounnah et le plus connu dans la riposte contre les gens de l’égarement, particulièrement les mou^tazilah.
                        </p>
                        <p className="mb-4">
                            La science du Tawhid, c’est la science de la croyance en l’unicité. Cette science concerne la connaissance des attributs qui sont obligatoires au sujet de Allah, des attributs qui sont impossibles à Son sujet et de ce qui est possible à Son sujet ta^ala. C’est une science louable. L’imam Abou Hanifah était parmi les gens de son époque, celui qui s’en préoccupait le plus. Ses deux livres Al-Fiqhou l-‘Akbar et Al-Fiqhou l-‘Absat sont une preuve claire qu’il maîtrisait la science du Tawhid par le biais des preuves selon la raison et selon les textes qu’il avait réunies conformément à la voie sunnite –la voie de Ahlou s-Sounnah wal-Jama^ah.
                        </p>
                        <p className="mb-4">
                            <strong><h2>Ceux qui ont fait ses éloges</h2></strong>
                        </p>
                        <p className="mb-4">
                            L’auteur du livre At-Tabsiratou l-Baghdadiyyah a rapporté de l’imam Abou ^Abdi l-Lah As–Saymariyy que l’Imam Abou Hanifah était le spécialiste de la science du Kalam de cette communauté dans son époque ainsi que le spécialiste de référence dans la jurisprudence, c’est-à-dire dans le licite et l’interdit.
                        </p>
                        <p className="mb-4">
                            Al-Khatib a rapporté dans son livre Tarikh Baghdad sur l’Histoire de Bagdad, d’après Harmalah Ibnou Yahya d’après Ach-Chafi^iyy qu’il a dit : « Celui qui veut approfondir ses connaissances dans la jurisprudence sera comme un enfant par rapport à Abou Hanifah. »
                        </p>
                        <p className="mb-4">
                            Il a été rapporté également de Ach-Chafi^iyy qu’on a dit à Malik que Allah l’agrée : « Est-ce que tu as rencontré l’Imam Abou Hanifah ? » Il a dit : « Oui, et j’ai vu un homme qui, s’il te disait qu’il transformerait ce pilier en or, par la puissance de ses arguments il saurait t’en convaincre. » –C’est une métaphore arabe qui montre la force de ses démonstrations et cela ne veut pas dire qu’il aurait menti
                        </p>
                        <p className="mb-4">
                            Al-Khatib a également dit dans Tarikh Baghdad que Abou Hanifah a vu dans le rêve comme s’il creusait la tombe du Messager de Allah صلى الله عليه وسلم . Il a fait interroger Ibnou Sirin au sujet de ce rêve. –Ibnou Sirin est un savant et un saint à qui Dieu a donné la science de l’interprétation des rêves– Il a dit : « Celui qui a vu ce rêve va faire jaillir une connaissance à laquelle personne n’était parvenu avant lui. »
                        </p>
                    </CollapsibleSection>

                    <CollapsibleSection
                        title="Le haut degré de l’Imam Abou Hanifah"
                        icon={<Scale className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Les spécialistes de l’histoire des biographies attribuent à l’Imam Abou Hanifah de nombreux évènements indiquant son intelligence et sa grande perspicacité.
                        </p>
                        <p className="mb-4">
                            L’Imam moujtahid Abou Hanifah que Allah l’agrée, n’aurait pas eu tant de science ni cette formidable capacité de donner des arguments s’il n’avait pas été extrêmement perspicace et s’il n’avait pas une capacité de mémorisation exceptionnelle. En effet, il a été confirmé à son sujet une multitude de choses étonnantes et surprenantes aussi bien dans le qada’ c’est-à-dire lorsqu’il prononçait les sentences entre les parties adverses, que dans la jurisprudence, ce qui témoigne de son haut degré et de son intelligence.
                        </p>
                        <p className="mb-4">
                            <strong><h2>Un sage conseil</h2></strong>
                        </p>
                        <p className="mb-4">
                            Parmi cela, il a été rapporté qu’un homme était venu à lui. Il lui a dit : « Imam, j’ai enterré de l’argent il y a longtemps mais j’ai oublié l’endroit où je l’ai enterré. »

                            C’est alors que l’Imam lui a dit « Va et passe toute la nuit en prières jusqu’au matin, tu te rappelleras si Allah le veut où tu as enterré cet argent. » L’homme a fait ce qu’il lui avait dit et avant même que ne s’écoule le premier quart de la nuit, il s’est souvenu de l’endroit où il avait enterré son argent. Il est alors parti voir l’Imam Abou Hanifah et lui a raconté cela. Abou Hanifah lui a dit : « Je savais que le chaytan –le diable– ne te laisserait pas passer toute la nuit à faire des prières. Maintenant, si tu passais le restant de la nuit en prières pour remercier Allah ? »
                        </p>
                        <p className="mb-4">
                            <strong><h2>Sa piété</h2></strong>
                        </p>

                        <p className="mb-4">
                            L’Imam Abou Hanifah, que Allah l’agrée, était un homme ascète, ayant la crainte de Allah, pieux, ayant beaucoup de crainte et d’humilité à l’égard de Allah et qui invoquait en permanence Allah ta^ala. Ibnou Khillikan a rapporté dans son livre Wafayatou l-‘A^yan d’après Açad fils de ^Amr qu’il a dit : « Abou Hanifah récitait tout le Qour’an dans un seul cycle de prière (rak^ah). Et on l’entendait pleurer pendant la nuit au point que ses voisins compatissaient avec lui. On a retenu de lui qu’il a récité sept mille fois le Qour’an du début jusqu’à la fin dans l’endroit où il est mort. »
                        </p>

                        <p className="mb-4">
                            <strong><h2>Un de ses prodiges</h2></strong>
                        </p>

                        <p className="mb-4">
                            Yazid Ibnou l-Koumayt a dit : « Abou Hanifah était de ceux qui avait une intense crainte de Allah dans leur cœur. » Il raconte « Un soir, ^Aliyy Ibnou l-Houçayn, a récité durant la prière du ^icha’ la sourate Az–Zalzalah alors qu’Abou Hanifah était derrière lui dans l’assemblée de prière. Lorsqu’il termina la prière et que les gens étaient partis, j’ai dirigé mon regard vers Abou Hanifah et il était encore assis, il méditait et il soupirait. Lorsque je suis sorti, j’ai laissé la chandelle contenant un tout petit peu d’huile. Elle était proche de l’extinction. Je suis revenu après la levée de l’aube et Abou Hanifah était debout. Il tenait sa barbe et disait : “Ô Toi Qui rétribue pour un grain de bien par du bien, ô Toi Qui rétribue pour un grain de mal par du mal, évite à Ton esclave An-Nou^man le feu de l’enfer et le mal qui rapproche du feu de l’enfer et accorde lui une part dans Ta large miséricorde.” Yazid a dit : “J’ai fait l’appel à la prière et la chandelle était toujours allumée.” –c’est-à-dire que la veille il l’avait laissée proche de l’extinction et le lendemain, elle brillait plus intensément– Lorsque je suis entré, il m’a dit : “Garde pour toi ce que tu as vu ! ” –en effet, ceci était un prodige que Allah a accordé à l’imam Abou Hanifah et il ne voulait pas être dévoilé– Et il a accompli deux rak^ah –c’est-à-dire une prière surérogatoire de deux cycles–, puis il s’est assis jusqu’à ce que je fasse l’appel à la prière. Il s’est levé et a fait la prière avec nous, la prière du matin avec le woudou’ du début de la nuit. »
                        </p>

                        <p className="mb-4">
                            Le Calife Al-Mansour avait voulu élever Abou Hanifah au rang de juge et Abou Hanifah lui avait répondu : « Crains Allah et ne confie ta sécurité qu’à quelqu’un qui craint Allah car par Allah je ne suis pas préservé de la satisfaction alors comment serais-je préservé de la colère ? Je ne conviens pas pour cela. » Al-Mansour avait dit : « tu mens, c’est toi qui conviens pour cela. » Alors il avait répondu : « Ainsi tu as jugé en ma faveur contre toi-même, comment élèveras-tu au rang de juge quelqu’un de menteur ? »
                        </p>

                        <p className="mb-4">
                            Yazid fils de ^Amr fils de Houbayrah Al-Fazzariyy, un émir, avait voulu qu’il soit juge à Koufa au temps de Marwan Ibnou l-Hakam mais il avait refusé. Il l’avait donc frappé de cent dix coups de fouet à raison de dix coup par jour, mais lorsqu’il avait constaté son obstination à refuser d’être juge, il avait fini par le relâcher.
                        </p>

                        <p className="mb-4">
                            <h2>Haroun Ar-Rachid témoigne en faveur de Abou Hanifah</h2>
                        </p>

                        <p className="mb-4">
                            Abou Youçouf Al-Qadi, que Allah lui fasse miséricorde, a grandi orphelin –dans la loi de l’Islam, l’orphelin est l’enfant qui n’a pas atteint l’âge de la puberté et dont le père est décédé– et fut le compagnon de Abou Hanifah, il a appris auprès de lui. Il demeura longtemps auprès d’Abou Hanifah sans occuper d’apprendre un métier grâce auquel il puisse vivre. C’est alors que la mère de Abou Youçouf était venue auprès de Abou Hanifah et s’en était plainte en le blâmant. Elle avait dit : « Il est la prunelle de mes yeux. » Abou Hanifah avait répondu à la mère de Abou Youçouf : « Réjouis ton cœur, il est en train d’apprendre comment manger du faloudhaj –c’est une sorte de plat sucré très raffiné– à l’huile de pistache. » Effectivement, lorsqu’il eut grandi, il est devenu le Qadi des qadi et mangeait auprès de Haroun Ar-Rachid qui était l’Émir des musulmans. On avait rapporté à Ar-Rachid cet événement et il avait dit : « Abou Hanifah voit grâce à une lumière que Allah lui accorde », c’est-à-dire qu’il a eu un dévoilement (kachf), Allah le lui a fait savoir.
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
                        icon={<HeartCrack className="w-5 h-5" />}
                    >
                        <p className="mb-4">
                            Il est décédé en 150 de l'Hégire. Un très grand nombre de personnes ont assisté à son enterrement. Sa tombe est actuellement à Bagdad, que Allah l'agrée.
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

                {/* Jurisprudence (fiqh) de l'école — contenu dynamique depuis Supabase */}
                <EcoleFiqhSection ecole="Hanafi" titre="Jurisprudence de l'école Hanafite" />

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
