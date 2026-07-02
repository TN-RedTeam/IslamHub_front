import { useEffect, useState } from 'react';
import type { PrayerTimes } from '../types';

interface AlAdhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface UsePrayerTimesResult {
  times: PrayerTimes | null;
  isLoading: boolean;
  error: string | null;
}

/** Nettoie les horaires AlAdhan (parfois suffixés "(CET)") en "HH:MM". */
const cleanTime = (value: string): string => value.split(' ')[0];

/**
 * Horaires de prière du jour via l'API AlAdhan (gratuite, sans clé),
 * méthode 12 (Union des Organisations Islamiques de France).
 * Mis en cache dans localStorage par ville et par jour pour éviter
 * une requête à chaque visite.
 */
export function usePrayerTimes(city: string, country: string = 'France'): UsePrayerTimesResult {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `prayer-times:${city}:${today}`;

    const fetchTimes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          if (!cancelled) {
            setTimes(JSON.parse(cached) as PrayerTimes);
            setIsLoading(false);
          }
          return;
        }
      } catch {
        // cache illisible : on continue vers le réseau
      }

      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=12`
        );
        if (!response.ok) throw new Error(`AlAdhan API: ${response.status}`);

        const json = await response.json();
        const timings = json?.data?.timings as AlAdhanTimings | undefined;
        if (!timings) throw new Error('AlAdhan API: réponse inattendue');

        const result: PrayerTimes = {
          fajr: cleanTime(timings.Fajr),
          sunrise: cleanTime(timings.Sunrise),
          dhuhr: cleanTime(timings.Dhuhr),
          asr: cleanTime(timings.Asr),
          maghrib: cleanTime(timings.Maghrib),
          isha: cleanTime(timings.Isha),
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
          // stockage plein : tant pis pour le cache
        }

        if (!cancelled) setTimes(result);
      } catch (err) {
        console.error('Error fetching prayer times:', err);
        if (!cancelled) setError("Impossible de récupérer les horaires");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTimes();
    return () => {
      cancelled = true;
    };
  }, [city, country]);

  return { times, isLoading, error };
}
