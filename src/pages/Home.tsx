import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookOpen, Heart, GraduationCap, Video, Moon, Sun, Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import { BISMILLAH } from '../constants/bismillah';
import type { Hadith, Invocation, Coran } from '../types';

interface SiteStats { hadiths: number; paroles: number; douaas: number; dhikrs: number; videos: number; coran: number; }

const isNightDouaa = (d: Invocation | null): boolean => (d?.tag ?? '').toLowerCase().includes('nuit');
const getDayOfYear = (): number => {
  const t = new Date();
  return Math.floor((t.getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 86400000);
};

/** Ornement doré : deux filets encadrant un khatam à 8 branches. */
const Ornament: React.FC = () => (
  <div className="flex items-center justify-center gap-4 mb-6 text-gold" aria-hidden="true">
    <span className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent to-gold" />
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" />
      <rect x="9" y="9" width="22" height="22" />
      <circle cx="20" cy="20" r="4" fill="currentColor" stroke="none" />
    </svg>
    <span className="h-px w-20 sm:w-28 bg-gradient-to-l from-transparent to-gold" />
  </div>
);

export const Home: React.FC = () => {
  usePageTitle();
  const [stats, setStats] = useState<SiteStats>({ hadiths: 0, paroles: 0, douaas: 0, dhikrs: 0, videos: 0, coran: 0 });
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [dailyDouaa, setDailyDouaa] = useState<Invocation | null>(null);
  const [dailyVerse, setDailyVerse] = useState<Coran | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const day = getDayOfYear();
        const [s, h, d, v] = await Promise.all([
          dataService.getStats(), dataService.getDailyHadith(day),
          dataService.getDailyInvocation(day, 1), dataService.getDailyCoran(day),
        ]);
        setStats(s); setDailyHadith(h); setDailyDouaa(d); setDailyVerse(v);
      } catch (e) { console.error('Error fetching home data:', e); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const ressources = [
    { label: 'Hadiths', value: stats.hadiths, icon: Book, path: '/hadiths' },
    { label: 'Paroles', value: stats.paroles, icon: GraduationCap, path: '/paroles' },
    { label: 'Invocations & Évocations', value: stats.douaas + stats.dhikrs, icon: Heart, path: '/invocations' },
    { label: 'Vidéos', value: stats.videos, icon: Video, path: '/multimedia' },
    { label: 'Versets', value: stats.coran, icon: BookOpen, path: '/coran' },
  ];

  const cardBase = 'flex flex-col gap-3 rounded-card border border-line bg-ivory p-6 shadow-card hover:shadow-card-hover transition-shadow motion-reduce:transition-none';

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 pb-16">
        {/* Hero — Bismillah */}
        <section className="relative overflow-hidden bg-ivory border border-line rounded-panel mt-6 px-7 py-14 text-center">
          <Ornament />
          <p className="bismillah text-green-deep" lang="ar" dir="rtl" style={{ fontSize: 'clamp(38px,8vw,72px)' }}>{BISMILLAH}</p>
          <p className="font-display italic text-green mt-5" style={{ fontSize: 'clamp(17px,2.4vw,22px)' }}>
            Bienvenue sur <span className="not-italic font-semibold">IslamHub</span>
          </p>
          <p className="text-muted mt-2">La croyance authentique et ses preuves — Coran, hadiths et paroles des savants.</p>
        </section>

        {/* Citation en vedette */}
        <blockquote className="bg-ivory border border-line border-l-[3px] border-l-gold rounded-r-card px-7 py-6 my-6 max-w-3xl mx-auto">
          <p className="font-display text-green-deep font-medium leading-snug" style={{ fontSize: 'clamp(19px,2.6vw,25px)' }}>
            «&nbsp;Celui pour qui Allah veut le bien, Il lui facilite l'apprentissage de la religion.&nbsp;»
          </p>
          <p className="mt-4 text-sm text-muted tracking-wide">— <span className="text-green font-semibold">Prophète Muḥammad ﷺ</span> · Rapporté par Al-Bukhārī</p>
        </blockquote>

        {/* Cartes du jour */}
        <h2 className="font-display font-semibold text-green-deep text-center mt-10" style={{ fontSize: 'clamp(22px,3.2vw,30px)' }}>Votre source quotidienne</h2>
        <div className="w-16 h-0.5 bg-gold rounded mx-auto mt-3.5 mb-7" />

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-green animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Hadith */}
            <Link to="/hadiths" className={`${cardBase} group`}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-card bg-green-soft text-green grid place-items-center shrink-0"><Book className="w-5 h-5" /></span>
                <span><span className="block font-display font-semibold text-green-deep leading-tight">Hadith du jour</span>
                  {dailyHadith?.narrateur && <span className="block text-xs text-muted">Rapporté par {dailyHadith.narrateur}</span>}</span>
              </div>
              {dailyHadith?.texte_arabe && <p className="font-arabic text-xl text-ink leading-loose line-clamp-3" lang="ar" dir="rtl">{dailyHadith.texte_arabe}</p>}
              {dailyHadith?.texte_francais && <p className="text-[15px] text-ink/90 italic line-clamp-3">«&nbsp;{dailyHadith.texte_francais}&nbsp;»</p>}
              <div className="mt-auto pt-3 border-t border-line flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted">{dailyHadith?.rapporteur || dailyHadith?.sujet}</span>
                <span className="text-green group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none">→</span>
              </div>
            </Link>

            {/* Douaa */}
            <Link to="/invocations" className={`${cardBase} group`}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-card bg-green-soft text-green grid place-items-center shrink-0">{isNightDouaa(dailyDouaa) ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</span>
                <span><span className="block font-display font-semibold text-green-deep leading-tight">{isNightDouaa(dailyDouaa) ? 'Invocation de la nuit' : 'Invocation du jour'}</span>
                  {dailyDouaa?.sujet && <span className="block text-xs text-muted line-clamp-1">{dailyDouaa.sujet}</span>}</span>
              </div>
              {dailyDouaa?.texte_arabe && <p className="font-arabic text-xl text-ink leading-loose line-clamp-3" lang="ar" dir="rtl">{dailyDouaa.texte_arabe}</p>}
              {dailyDouaa?.texte_francais && <p className="text-[15px] text-ink/90 italic line-clamp-2">{dailyDouaa.texte_francais}</p>}
              <div className="mt-auto pt-3 border-t border-line flex items-center justify-end">
                <span className="text-green group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none">→</span>
              </div>
            </Link>

            {/* Verset */}
            <Link to="/coran" className={`${cardBase} group`}>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-card bg-green-soft text-green grid place-items-center shrink-0"><BookOpen className="w-5 h-5" /></span>
                <span><span className="block font-display font-semibold text-green-deep leading-tight">Verset à méditer</span>
                  {dailyVerse?.sourate && <span className="block text-xs text-muted">{dailyVerse.sourate}</span>}</span>
              </div>
              {dailyVerse?.texte_arabe && <p className="font-arabic text-xl text-ink leading-loose line-clamp-3" lang="ar" dir="rtl">{dailyVerse.texte_arabe}</p>}
              {dailyVerse?.texte_francais && <p className="text-[15px] text-ink/90 italic line-clamp-3">«&nbsp;{dailyVerse.texte_francais}&nbsp;»</p>}
              <div className="mt-auto pt-3 border-t border-line flex items-center justify-end">
                <span className="text-green group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none">→</span>
              </div>
            </Link>
          </div>
        )}

        {/* Explorer les ressources */}
        <h2 className="font-display font-semibold text-green-deep text-center mt-14" style={{ fontSize: 'clamp(20px,3vw,26px)' }}>Explorer nos ressources</h2>
        <div className="w-16 h-0.5 bg-gold rounded mx-auto mt-3.5 mb-7" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ressources.map((r) => (
            <Link key={r.label} to={r.path} className="flex flex-col items-center gap-2 rounded-card border border-line bg-ivory p-4 shadow-card hover:shadow-card-hover hover:border-green transition-all motion-reduce:transition-none">
              <span className="w-11 h-11 rounded-card bg-green-soft text-green grid place-items-center"><r.icon className="w-5 h-5" /></span>
              <span className="font-display text-xl font-semibold text-green-deep">{isLoading ? '—' : (r.value > 0 ? r.value : '—')}</span>
              <span className="text-xs text-muted">{r.label}</span>
            </Link>
          ))}
        </div>
      </main>

    </div>
  );
};

export default Home;
