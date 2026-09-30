import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookOpen, Heart, GraduationCap, Video, Moon, Sun, Sparkles, Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import { slugify } from '../utils/slug';
import { GlassCard, SectionHeader, Tile } from '../components/ui/Nuit';
import type { Hadith, Invocation, Coran } from '../types';
import heroWebp1400 from '../assets/hero/dome-hero-1400.webp';
import heroWebp800 from '../assets/hero/dome-hero-800.webp';
import heroJpg800 from '../assets/hero/dome-hero-800.jpg';

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
      {/* HERO plein cadre « Dôme vert » — la photo se fond dans la page via un
          masque radial (les bords se dissolvent, en clair comme en sombre) ;
          aucune bordure ni rectangle. Le verset du jour (dynamique) est posé
          au-dessus, centré sur le dôme (zone opaque du masque). */}
      <section className="relative w-full h-[clamp(420px,66vw,640px)] -mt-16">
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: 'radial-gradient(128% 116% at 50% 42%, #000 40%, rgba(0,0,0,0.5) 68%, transparent 100%)',
            maskImage: 'radial-gradient(128% 116% at 50% 42%, #000 40%, rgba(0,0,0,0.5) 68%, transparent 100%)',
          }}
          aria-hidden="true"
        >
          <picture>
            <source type="image/webp" srcSet={`${heroWebp800} 800w, ${heroWebp1400} 1400w`} sizes="100vw" />
            <img
              src={heroJpg800}
              alt="Le Dôme vert de la mosquée du Prophète ﷺ, à Médine, au crépuscule"
              width={1400} height={875} loading="eager" fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[50%_42%]"
            />
          </picture>
          {/* Assombrissement léger, bas de l'image seulement (masqué → pas de rectangle) */}
          <div className="absolute inset-0" aria-hidden="true" style={{ background: 'linear-gradient(180deg, rgba(4,14,16,0) 44%, rgba(4,14,16,.4) 74%, rgba(4,14,16,.62) 100%)' }} />
        </div>

        <span className="absolute top-[4.5rem] right-5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-bold text-[#eafffb] backdrop-blur-sm">Dôme vert · Médine</span>

        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-[11%] text-center">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#7fe9d8] [text-shadow:0_1px_10px_rgba(0,0,0,.7)]" lang="ar">آية اليوم · Verset du jour</p>
          {dailyVerse?.texte_arabe && (
            <p className="font-arabic-display text-[#f6fdfb] [text-shadow:0_2px_18px_rgba(0,0,0,.75)] max-w-2xl" lang="ar" dir="rtl" style={{ fontSize: 'clamp(22px,4.6vw,34px)', lineHeight: 1.75 }}>{dailyVerse.texte_arabe}</p>
          )}
          {(dailyVerse?.texte_francais || dailyVerse?.sourate) && (
            <p className="mt-2.5 max-w-xl text-[13px] font-medium text-[#dcefeb] [text-shadow:0_1px_12px_rgba(0,0,0,.8)]">
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
