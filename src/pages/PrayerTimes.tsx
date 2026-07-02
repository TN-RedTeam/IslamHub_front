import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, ChevronRight } from 'lucide-react';
import { PrayerTimes as PrayerTimesComponent } from '../components/PrayerTimes';
// import { usePrayerTimes } from '../hooks/usePrayerTimes'; // API horaires désactivée en attendant une API plus fiable
import { usePageTitle } from '../hooks/usePageTitle';

const mockPrayerTimes = {
  fajr: "05:30",
  sunrise: "06:45",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:15",
  isha: "19:30"
};

interface CityOption {
  name: string;
  country: string;
}

const cities: CityOption[] = [
  { name: "Paris", country: "France" },
  { name: "Marseille", country: "France" },
  { name: "Lyon", country: "France" },
  { name: "London", country: "UK" },
  { name: "New York", country: "USA" },
  { name: "Dubai", country: "UAE" }
];

// Calendrier mensuel via API — désactivé en attendant une API plus fiable.
// Réactiver en décommentant ce bloc et les appels dans le composant.
// interface CalendarDay {
//   date: string;
//   fajr: string;
//   sunrise: string;
//   dhuhr: string;
//   asr: string;
//   maghrib: string;
//   isha: string;
// }
//
// const cleanTime = (value: string): string => value.split(' ')[0];
//
// /**
//  * Calendrier du mois via AlAdhan (méthode 12 - UOIF), mis en cache
//  * dans localStorage par ville et par mois.
//  */
// function useMonthlyCalendar(city: string, country: string) {
//   const [days, setDays] = useState<CalendarDay[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//
//   useEffect(() => {
//     let cancelled = false;
//     const now = new Date();
//     const month = now.getMonth() + 1;
//     const year = now.getFullYear();
//     const cacheKey = `prayer-calendar:${city}:${year}-${month}`;
//
//     const fetchCalendar = async () => {
//       setIsLoading(true);
//
//       try {
//         const cached = localStorage.getItem(cacheKey);
//         if (cached) {
//           if (!cancelled) {
//             setDays(JSON.parse(cached) as CalendarDay[]);
//             setIsLoading(false);
//           }
//           return;
//         }
//       } catch {
//         // cache illisible : on continue vers le réseau
//       }
//
//       try {
//         const response = await fetch(
//           `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=12`
//         );
//         if (!response.ok) throw new Error(`AlAdhan API: ${response.status}`);
//
//         const json = await response.json();
//         const result: CalendarDay[] = (json?.data || []).map((day: {
//           date: { readable: string };
//           timings: Record<string, string>;
//         }) => ({
//           date: day.date.readable,
//           fajr: cleanTime(day.timings.Fajr),
//           sunrise: cleanTime(day.timings.Sunrise),
//           dhuhr: cleanTime(day.timings.Dhuhr),
//           asr: cleanTime(day.timings.Asr),
//           maghrib: cleanTime(day.timings.Maghrib),
//           isha: cleanTime(day.timings.Isha),
//         }));
//
//         try {
//           localStorage.setItem(cacheKey, JSON.stringify(result));
//         } catch {
//           // stockage plein : tant pis pour le cache
//         }
//
//         if (!cancelled) setDays(result);
//       } catch (err) {
//         console.error('Error fetching prayer calendar:', err);
//         if (!cancelled) setDays([]);
//       } finally {
//         if (!cancelled) setIsLoading(false);
//       }
//     };
//
//     fetchCalendar();
//     return () => {
//       cancelled = true;
//     };
//   }, [city, country]);
//
//   return { days, isLoading };
// }
//

export const PrayerTimesPage: React.FC = () => {
  usePageTitle('Horaires de prière');
  const [selectedCity, setSelectedCity] = useState<CityOption>(cities[0]);
  const [searchTerm, setSearchTerm] = useState("");

  // Horaires via API désactivés pour l'instant — réactiver en remplaçant
  // l'implémentation des hooks (usePrayerTimes / useMonthlyCalendar) par l'API choisie :
  // const { times } = usePrayerTimes(selectedCity.name, selectedCity.country);
  // const { days: calendarDays, isLoading: isCalendarLoading } = useMonthlyCalendar(
  //   selectedCity.name,
  //   selectedCity.country
  // );
  const times = mockPrayerTimes;

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          >
            Horaires de Prière
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Trouvez les horaires précis des prières pour votre localité
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sélection de ville */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800"
          >
            {/* Décoration orientale */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                <path
                  fill="currentColor"
                  d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20"
                  className="transform rotate-45"
                />
              </svg>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                  Sélectionnez une ville
                </h2>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Choisissez votre localité pour des horaires précis
                </p>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une ville..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredCities.length === 0 ? (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    Aucune ville trouvée
                  </m.div>
                ) : (
                  filteredCities.map((city, index) => (
                    <m.div
                      key={city.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCity(city)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        city.name === selectedCity.name
                          ? 'bg-emerald-100 dark:bg-emerald-900/50'
                          : 'bg-white dark:bg-gray-800/80 hover:bg-amber-50 dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{city.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{city.country}</p>
                        </div>
                        {city.name === selectedCity.name && (
                          <ChevronRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    </m.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </m.div>

          {/* Horaires de prière */}
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 h-full">
              <PrayerTimesComponent times={times} city={selectedCity.name} />
            </div>
          </m.div>
        </div>

        {/* Calendrier mensuel */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800"
        >
          {/* Décoration orientale */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
              <path
                fill="currentColor"
                d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20"
                className="transform rotate-45"
              />
            </svg>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                Calendrier Mensuel
              </h2>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Consultez les horaires pour tout le mois
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Fajr</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Sunrise</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Dhuhr</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Asr</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Maghrib</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-emerald-800 dark:text-emerald-300">Isha</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((day) => (
                  <tr
                    key={day}
                    className="border-t border-amber-200 dark:border-emerald-800 hover:bg-amber-50 dark:hover:bg-emerald-900/30"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">Mars {day}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">05:30</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">06:45</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">12:30</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">15:45</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">18:15</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">19:30</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>
      </main>

      {/* Pied de page décoratif */}
      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 mb-4 font-amiri text-xl">
            "La meilleure des paroles que j’ai dite, moi ainsi que les prophètes qui m’ont précédé c’est لاَ إِلَهَ إِلَّا الله –Il n’est de dieu que Dieu"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Horaires de Prière</p>
        </div>
      </footer>
    </div>
  );
};
