import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookOpen, Heart, GraduationCap, Video, Moon, Sun, Sparkles, Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import { slugify } from '../utils/slug';
import { GlassCard, SectionHeader, Tile } from '../components/ui/Nuit';
import type { Hadith, Invocation, Coran } from '../types';
// Hero validé — Dôme vert au crépuscule (violet), images fidèles bundlées (offline).
import domeW800 from '../assets/hero/dome-violet-800.webp';
import domeW1280 from '../assets/hero/dome-violet-1280.webp';
import domeW1672 from '../assets/hero/dome-violet-1672.webp';
import domeJ800 from '../assets/hero/dome-violet-800.jpg';
import domeJ1280 from '../assets/hero/dome-violet-1280.jpg';
import domeJ1672 from '../assets/hero/dome-violet-1672.jpg';

interface SiteStats { hadiths: number; paroles: number; douaas: number; dhikrs: number; videos: number; coran: number; }

const isNightDouaa = (d: Invocation | null): boolean => (d?.tag ?? '').toLowerCase().includes('nuit');
const getDayOfYear = (): number => {
  const t = new Date();
  return Math.floor((t.getTime() - new Date(t.getFullYear(), 0, 0).getTime()) / 86400000);
};

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

  const explore = [
    { title: 'Coran', meta: stats.coran ? `${stats.coran} versets` : 'Exégèse', icon: <BookOpen className="w-5 h-5" />, to: '/coran' },
    { title: 'Croyance', meta: 'Le dossier', icon: <Sparkles className="w-5 h-5" />, to: '/croyance' },
    { title: 'Hadiths', meta: stats.hadiths ? String(stats.hadiths) : '—', icon: <Book className="w-5 h-5" />, to: '/hadiths' },
    { title: 'Invocations', meta: stats.douaas + stats.dhikrs ? String(stats.douaas + stats.dhikrs) : '—', icon: <Heart className="w-5 h-5" />, to: '/invocations' },
    { title: 'Paroles de savants', meta: stats.paroles ? String(stats.paroles) : '—', icon: <GraduationCap className="w-5 h-5" />, to: '/savants/paroles' },
    { title: 'Vidéos', meta: stats.videos ? String(stats.videos) : '—', icon: <Video className="w-5 h-5" />, to: '/multimedia' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* HERO validé — Dôme vert au crépuscule, PLEINE LARGEUR (edge-to-edge,
          passe sous la nav). Image fidèle (non retouchée), fondu bas en CSS
          uniquement. Le verset du jour (dynamique) est posé par-dessus. */}
      <section className="relative w-full -mt-16 overflow-hidden h-[clamp(340px,44vw,540px)]">
        <picture>
          <source type="image/webp" srcSet={`${domeW800} 800w, ${domeW1280} 1280w, ${domeW1672} 1672w`} sizes="100vw" />
          <img
            src={domeJ1672}
            srcSet={`${domeJ800} 800w, ${domeJ1280} 1280w, ${domeJ1672} 1672w`}
            sizes="100vw"
            alt="La mosquée du Prophète ﷺ et son Dôme vert au crépuscule, à Médine"
            width={1672} height={941} loading="eager" fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
          />
        </picture>
        {/* Fondu bas décoratif (jamais cuit dans l'image) */}
        <div className="absolute inset-0" aria-hidden="true" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(5,15,15,.88))' }} />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[30px] text-center">
          {/* Textes sur photo sombre (bas assombri) → teintes claires fixes */}
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#7fe9d8] [text-shadow:0_1px_10px_rgba(0,0,0,.7)]" lang="ar">آية اليوم · Verset du jour</p>
          {dailyVerse?.texte_arabe && (
            <p className="font-arabic-display text-white [text-shadow:0_2px_16px_rgba(0,0,0,.7)] max-w-2xl" lang="ar" dir="rtl" style={{ fontSize: 'clamp(24px,3vw,32px)', lineHeight: 1.7 }}>{dailyVerse.texte_arabe}</p>
          )}
          {(dailyVerse?.texte_francais || dailyVerse?.sourate) && (
            <p className="mt-2.5 max-w-xl text-[14px] font-medium text-[#f3f6f4] [text-shadow:0_1px_10px_rgba(0,0,0,.6)]">
              {dailyVerse?.texte_francais && <>«&nbsp;{dailyVerse.texte_francais}&nbsp;»</>}{dailyVerse?.sourate ? ` — ${dailyVerse.sourate}` : ''}
            </p>
          )}
        </div>
      </section>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pb-20 pt-6">

        {/* AUJOURD'HUI — cartes verre (défilement horizontal sur mobile) */}
        <SectionHeader title="Aujourd'hui" />
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-accent animate-spin" /></div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible">
            {/* Hadith du jour */}
            <Link to={dailyHadith ? `/hadiths/${dailyHadith.id}/${slugify(dailyHadith.sujet)}` : '/hadiths'} className="flex-none w-[78%] sm:w-auto">
              <GlassCard tint className="h-full p-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="grid place-items-center w-9 h-9 rounded-[11px] bg-accent-deep text-[#eafffb]"><Book className="w-[18px] h-[18px]" /></span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.04em] text-muted">Hadith du jour</span>
                    <span className="block text-[13.5px] font-bold text-ink truncate">{dailyHadith?.rapporteur || dailyHadith?.narrateur || 'Hadith'}</span>
                  </span>
                </div>
                {dailyHadith?.texte_arabe && <p className="font-arabic text-[17px] text-ink line-clamp-3" lang="ar" dir="rtl">{dailyHadith.texte_arabe}</p>}
                {dailyHadith?.texte_francais && <p className="mt-1.5 text-[12.5px] text-muted line-clamp-2">«&nbsp;{dailyHadith.texte_francais}&nbsp;»</p>}
              </GlassCard>
            </Link>

            {/* Invocation / évocation du jour */}
            <Link to="/invocations" state={dailyDouaa ? { openItem: dailyDouaa } : undefined} className="flex-none w-[78%] sm:w-auto">
              <GlassCard tint className="h-full p-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className="grid place-items-center w-9 h-9 rounded-[11px] bg-accent-deep text-[#eafffb]">{isNightDouaa(dailyDouaa) ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}</span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.04em] text-muted">{isNightDouaa(dailyDouaa) ? 'Invocation de la nuit' : 'Invocation du jour'}</span>
                    <span className="block text-[13.5px] font-bold text-ink truncate">{dailyDouaa?.sujet || 'Dhikr'}</span>
                  </span>
                </div>
                {dailyDouaa?.texte_arabe && <p className="font-arabic text-[17px] text-ink line-clamp-3" lang="ar" dir="rtl">{dailyDouaa.texte_arabe}</p>}
                {dailyDouaa?.texte_francais && <p className="mt-1.5 text-[12.5px] text-muted line-clamp-2">{dailyDouaa.texte_francais}</p>}
              </GlassCard>
            </Link>
          </div>
        )}

        {/* EXPLORER — tuiles de rubriques */}
        <SectionHeader title="Explorer" />
        <div className="grid grid-cols-2 gap-3">
          {explore.map((t) => (
            <Tile key={t.title} to={t.to} icon={t.icon} title={t.title} meta={t.meta} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
