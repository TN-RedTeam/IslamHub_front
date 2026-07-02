import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Sun, Moon, Sunrise, Sunset, Book, Heart, Wind, GraduationCap, Video, Loader2 } from 'lucide-react';
import { PrayerTimes } from '../components/PrayerTimes';
import { DailyQuote } from '../components/DailyQuote';
import { dataService } from '../services/DataService';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Hadith, Douaa, Coran } from '../types';

const mockQuote = {
  text: "Celui pour qui Allah veut le bien, lui facilite l'apprentissage de la religion",
  author: "Prophet Muhammad ﷺ",
  source: "Sahih Al-Bukhari"
};

interface SiteStats {
  hadiths: number;
  savants: number;
  douaas: number;
  dhikrs: number;
  videos: number;
  coran: number;
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getTimeIcon = (time: string) => {
  switch (time) {
    case 'morning': return <Sunrise className="w-6 h-6" />;
    case 'afternoon': return <Sun className="w-6 h-6" />;
    case 'evening': return <Sunset className="w-6 h-6" />;
    case 'night': return <Moon className="w-6 h-6" />;
    default: return <Sun className="w-6 h-6" />;
  }
};

const getTimeLabel = (time: string): string => {
  switch (time) {
    case 'morning': return 'Doua du matin';
    case 'afternoon': return 'Doua de l\'après-midi';
    case 'evening': return 'Doua du soir';
    case 'night': return 'Doua de la nuit';
    default: return 'Doua du jour';
  }
};

const getDayOfYear = (): number => {
  const today = new Date();
  return Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
};

export const Home: React.FC = () => {
  usePageTitle();
  const [selectedCity] = useState("Paris");
  const [timeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(getTimeOfDay());
  const { times: prayerTimes } = usePrayerTimes(selectedCity);

  const [stats, setStats] = useState<SiteStats>({
    hadiths: 0,
    savants: 0,
    douaas: 0,
    dhikrs: 0,
    videos: 0,
    coran: 0
  });

  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [dailyDouaa, setDailyDouaa] = useState<Douaa | null>(null);
  const [dailyVerse, setDailyVerse] = useState<Coran | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Compteurs sans transfert de données + une seule ligne par "item du jour",
        // au lieu de télécharger les tables entières (ex-pageSize: 1000).
        const dayOfYear = getDayOfYear();
        const [siteStats, hadith, douaa, verse] = await Promise.all([
          dataService.getStats(),
          dataService.getDailyHadith(dayOfYear),
          dataService.getDailyDouaa(dayOfYear),
          dataService.getDailyCoran(dayOfYear),
        ]);

        setStats(siteStats);
        setDailyHadith(hadith);
        setDailyDouaa(douaa);
        setDailyVerse(verse);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const siteStatsConfig = [
    { label: 'Hadiths', value: stats.hadiths, icon: Book, color: 'from-emerald-500 to-teal-500', path: '/hadiths' },
    { label: 'Savants', value: stats.savants, icon: GraduationCap, color: 'from-blue-500 to-indigo-500', path: '/savants' },
    { label: 'Douaas', value: stats.douaas, icon: Heart, color: 'from-rose-500 to-pink-500', path: '/douaas' },
    { label: 'Dhikrs', value: stats.dhikrs, icon: Wind, color: 'from-cyan-500 to-blue-500', path: '/dhikrs' },
    { label: 'Vidéos', value: stats.videos, icon: Video, color: 'from-purple-500 to-violet-500', path: '/multimedia' },
    { label: 'Versets', value: stats.coran, icon: BookOpen, color: 'from-amber-500 to-orange-500', path: '/coran' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      {/* En-tête avec motif islamique */}
      <m.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />

        <div className="relative container mx-auto px-4 text-center">
          <m.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri"
            lang="ar"
            dir="rtl"
          >
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Bienvenue sur IslamHub - Votre source de savoir islamique
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
        {/* Section principale avec citation et horaires */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 h-full">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                    <path
                      fill="currentColor"
                      d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20"
                      className="transform rotate-45"
                    />
                  </svg>
                </div>
                <DailyQuote quote={mockQuote} />
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 h-full">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                    <path
                      fill="currentColor"
                      d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20"
                      className="transform rotate-45"
                    />
                  </svg>
                </div>
                <PrayerTimes times={prayerTimes} city={selectedCity} />
              </div>
            </m.div>
          </div>
        </m.section>

        {/* Section contenu quotidien */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
            Votre dose quotidienne de spiritualité
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hadith du jour */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                      <Book className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 font-amiri">
                        Hadith du jour
                      </h3>
                      {dailyHadith?.narrateur && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Rapporté par {dailyHadith.narrateur}
                        </p>
                      )}
                    </div>
                  </div>

                  {dailyHadith ? (
                    <>
                      {dailyHadith.texte_arabe && (
                        <p className="text-lg text-right font-amiri text-gray-800 dark:text-gray-200 mb-3 leading-loose line-clamp-3" lang="ar" dir="rtl">
                          {dailyHadith.texte_arabe.substring(0, 200)}...
                        </p>
                      )}
                      {dailyHadith.texte_francais && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 italic line-clamp-3">
                          "{dailyHadith.texte_francais}"
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                          {dailyHadith.rapporteur || dailyHadith.sujet}
                        </span>
                        <Link to="/hadiths" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucun hadith disponible
                    </p>
                  )}
                </div>
              </m.div>

              {/* Doua du moment */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                whileHover={{ y: -5 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                      {getTimeIcon(timeOfDay)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300 font-amiri">
                        {getTimeLabel(timeOfDay)}
                      </h3>
                      {dailyDouaa?.sujet && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dailyDouaa.sujet}
                        </p>
                      )}
                    </div>
                  </div>

                  {dailyDouaa ? (
                    <>
                      <p className="text-xl text-right font-amiri text-gray-800 dark:text-gray-200 mb-3 leading-loose" lang="ar" dir="rtl">
                        {dailyDouaa.texte_arabe}
                      </p>

                      {dailyDouaa.phonétique && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                          {dailyDouaa.phonétique}
                        </p>
                      )}

                      {dailyDouaa.texte_francais && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {dailyDouaa.texte_francais}
                        </p>
                      )}

                      <div className="flex justify-end">
                        <Link to="/douaas" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucune doua disponible
                    </p>
                  )}
                </div>
              </m.div>

              {/* Verset à méditer */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ y: -5 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 font-amiri">
                        Verset à méditer
                      </h3>
                      {dailyVerse?.sourate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dailyVerse.sourate}
                        </p>
                      )}
                    </div>
                  </div>

                  {dailyVerse ? (
                    <>
                      <p className="text-xl text-right font-amiri text-gray-800 dark:text-gray-200 mb-4 leading-loose" lang="ar" dir="rtl">
                        {dailyVerse.texte_arabe}
                      </p>

                      {dailyVerse.texte_francais && (
                        <p className="text-gray-700 dark:text-gray-300 italic mb-4 line-clamp-3">
                          "{dailyVerse.texte_francais}"
                        </p>
                      )}

                      <div className="flex justify-end">
                        <Link to="/coran" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucun verset disponible
                    </p>
                  )}
                </div>
              </m.div>
            </div>
          )}
        </m.section>

        {/* Section statistiques : whileInView pour animer à l'arrivée dans le
            viewport (la section est sous la ligne de flottaison). */}
        <m.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-8 font-amiri text-center">
            Explorer nos ressources
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {siteStatsConfig.map((stat, index) => (
              <m.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link to={stat.path}>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-1 font-amiri">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        stat.value > 0 ? stat.value : '-'
                      )}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      {stat.label}
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </div>
                </Link>
              </m.div>
            ))}
          </div>
        </m.section>
      </main>

      {/* Pied de page décoratif */}
      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 mb-4 font-amiri text-xl">
            « Que l'un de vous apprenne un chapitre de la religion ou l'enseigne aura plus de récompenses que de prier mille rak`ah des prières surérogatoires »
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} IslamHub - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};
