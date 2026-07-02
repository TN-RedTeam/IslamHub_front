import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { PrayerTimes as PrayerTimesType } from '../types';

interface PrayerTimesProps {
  times: PrayerTimesType | null;
  city: string;
}

const PRAYER_LABELS: Record<keyof PrayerTimesType, string> = {
  fajr: 'Fajr',
  sunrise: 'Chourouq',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PrayerTimes: React.FC<PrayerTimesProps> = ({ times, city }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-emerald-100 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/50 rounded-br-[100px] -z-10"></div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-amiri font-semibold text-gray-800 dark:text-white">Horaires de prière</h2>
        <span className="text-emerald-600 dark:text-emerald-400 font-amiri text-lg">{city}</span>
      </div>
      {!times ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(times) as [keyof PrayerTimesType, string][]).map(([prayer, time]) => (
            <div
              key={prayer}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-amiri text-lg text-gray-800 dark:text-gray-200">{PRAYER_LABELS[prayer] ?? prayer}</span>
              </div>
              <span className="font-medium font-amiri text-lg text-gray-800 dark:text-gray-200">{time}</span>
            </div>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-300 to-emerald-500 dark:from-emerald-600 dark:to-emerald-400 rounded-b-xl"></div>
    </div>
  );
};
