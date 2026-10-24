import React, { useState, useEffect } from 'react';
import { Link } from '../lib/router';
import { Book, BookOpen, Heart, GraduationCap, Moon, Sun, Sparkles, Loader2, ArrowRight, Folder, Tag, Clock, Sunrise } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import { slugify } from '../utils/slug';
import { dayOfYear } from '../utils/daily';
import { GlassCard, SectionHeader, Tile } from '../components/ui/Nuit';
import { HeroCarousel, type HeroSlide } from '../components/HeroCarousel';
import { UI } from '../strings';
import type { Hadith, Invocation, Coran, Parole, ThemeCard, HomeVedette, HomeRecentItem } from '../types';
// Hero validé — Dôme vert au crépuscule (violet), images fidèles bundlées (offline).
import domeW800 from '../assets/hero/dome-violet-800.webp';
import domeW1280 from '../assets/hero/dome-violet-1280.webp';
import domeW1672 from '../assets/hero/dome-violet-1672.webp';
import domeJ800 from '../assets/hero/dome-violet-800.jpg';
import domeJ1280 from '../assets/hero/dome-violet-1280.jpg';
import domeJ1672 from '../assets/hero/dome-violet-1672.jpg';

interface SiteStats { hadiths: number; paroles: number; douaas: number; dhikrs: number; videos: number; coran: number; }

const isNightDouaa = (d: Invocation | null): boolean => (d?.tag ?? '').toLowerCase().includes('nuit');

export const Home: React.FC = () => {
  useSeo({ description: "Hadiths authentiques, versets du Coran traduits, invocations, paroles de savants et croyance (ʿaqīda) — le savoir islamique sunnite en français." });
  const [stats, setStats] = useState<SiteStats>({ hadiths: 0, paroles: 0, douaas: 0, dhikrs: 0, videos: 0, coran: 0 });
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [dailyDouaa, setDailyDouaa] = useState<Invocation | null>(null);
  const [dailyVerse, setDailyVerse] = useState<Coran | null>(null);
  const [dailyParole, setDailyParole] = useState<Parole | null>(null);
  const [vedette, setVedette] = useState<HomeVedette | null>(null);
  const [recent, setRecent] = useState<HomeRecentItem[]>([]);
  const [themes, setThemes] = useState<ThemeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const day = dayOfYear();
    // Chargements INDÉPENDANTS : l'échec d'une source ne doit pas vider les autres.
    const jobs = [
      dataService.getStats().then(setStats),
      dataService.getDailyHadith(day).then(setDailyHadith),
      dataService.getDailyInvocation(day, 1).then(setDailyDouaa),
      dataService.getDailyCoran(day).then(setDailyVerse),
      dataService.getDailyParole(day).then(setDailyParole),
      dataService.getHomeVedette().then(setVedette),
      dataService.getHomeRecent(3).then(setRecent),
      dataService.getThemes().then((t) => setThemes(t.slice(0, 8))),
    ].map((pr) => pr.catch(() => {}));
    Promise.allSettled(jobs).finally(() => setIsLoading(false));
  }, []);

  const themeTotal = (t: ThemeCard) => (t.n_coran ?? 0) + (t.n_hadith ?? 0) + (t.n_parole ?? 0);
  const figures = [
    { n: stats.hadiths, label: 'hadiths' },
    { n: stats.paroles, label: 'paroles' },
    { n: stats.douaas + stats.dhikrs, label: 'invocations' },
    { n: stats.coran, label: 'versets' },
  ].filter((f) => f.n > 0);

  // Carrousel du hero : verset / hadith / parole (rotation déterministe par date).
  const heroSlides: HeroSlide[] = [
    // Pas de lien : le verset du jour peut venir d'une sourate sans page
    // d'exégèse (la rubrique Coran ne couvre pas tout le Coran). On l'affiche
    // sans renvoyer vers une page qui ne contient pas ce verset.
    dailyVerse?.texte_arabe && { key: 'verset', eyebrow: UI.hero.verset, eyebrowAr: UI.hero.versetAr, arabic: dailyVerse.texte_arabe, translation: dailyVerse.texte_francais, source: dailyVerse.sourate, to: null },
    dailyHadith?.texte_arabe && { key: 'hadith', eyebrow: UI.hero.hadith, arabic: dailyHadith.texte_arabe, translation: dailyHadith.texte_francais, source: dailyHadith.rapporteur ?? dailyHadith.narrateur ?? null, to: `/hadiths/${dailyHadith.id}/${slugify(dailyHadith.sujet)}` },
    dailyParole?.texte_arabe && { key: 'parole', eyebrow: UI.hero.parole, arabic: dailyParole.texte_arabe, translation: dailyParole.texte_francais, source: dailyParole.savant, to: dailyParole.slug ? `/paroles/${dailyParole.slug}` : null },
  ].filter(Boolean) as HeroSlide[];

  const explore = [
    { title: 'Coran', meta: 'Exégèse des sourates', icon: <BookOpen className="w-5 h-5" />, to: '/coran/sourates' },
    { title: 'Croyance', meta: 'Le dossier', icon: <Sparkles className="w-5 h-5" />, to: '/croyance' },
    { title: 'Hadiths', meta: stats.hadiths ? String(stats.hadiths) : '—', icon: <Book className="w-5 h-5" />, to: '/hadiths' },
    { title: 'Invocations', meta: stats.douaas + stats.dhikrs ? String(stats.douaas + stats.dhikrs) : '—', icon: <Heart className="w-5 h-5" />, to: '/invocations' },
    { title: 'Paroles de savants', meta: stats.paroles ? String(stats.paroles) : '—', icon: <GraduationCap className="w-5 h-5" />, to: '/savants/paroles' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* HERO validé — Dôme vert au crépuscule, PLEINE LARGEUR (edge-to-edge,
          passe sous la nav). Image ENTIÈRE (height:auto → sol compris, aucun
          recadrage à toutes les largeurs). Fondu bas en CSS vers la couleur de
          page (var --hero-fade). Verset du jour (dynamique) par-dessus. */}
      <section className="relative w-full md:-mt-16 overflow-hidden">
        <picture>
          <source type="image/webp" srcSet={`${domeW800} 800w, ${domeW1280} 1280w, ${domeW1672} 1672w`} sizes="100vw" />
          <img
            src={domeJ1672}
            srcSet={`${domeJ800} 800w, ${domeJ1280} 1280w, ${domeJ1672} 1672w`}
            sizes="100vw"
            alt="La mosquée du Prophète ﷺ et son Dôme vert au crépuscule, à Médine"
            width={1672} height={941} loading="eager" fetchPriority="high"
            className="block w-full h-auto"
          />
        </picture>
        {/* Fondu bas en CSS : léger assombrissement pour le verset, puis fondu
            vers la couleur de page (clair comme sombre). Jamais cuit dans l'image. */}
        <div className="absolute inset-0" aria-hidden="true" style={{ background: 'linear-gradient(180deg, transparent 46%, rgba(4,13,14,.5) 86%, var(--hero-fade) 100%)' }} />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(26px,9%)] text-center">
          {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} startIndex={dayOfYear()} />}
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

        {/* DOSSIER PHARE — le dossier mis en vedette (réglable en admin) */}
        {vedette && (
          <Link to={`/dossiers/${vedette.slug}`} className="group block mt-8">
            <GlassCard tint className="p-5 sm:p-6 flex items-start gap-4 transition-colors group-hover:border-accent/60">
              <span className="hidden sm:grid place-items-center w-14 h-14 rounded-2xl bg-accent-deep text-[#eafffb] shrink-0"><Folder className="w-7 h-7" /></span>
              <span className="min-w-0">
                <span className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent mb-1">{UI.home.featured}</span>
                <span className="block font-display font-bold text-ink text-xl leading-tight">{vedette.h1}</span>
                {vedette.meta_description && <span className="block text-[13.5px] text-muted mt-1 line-clamp-2">{vedette.meta_description}</span>}
                <span className="inline-flex items-center gap-1.5 mt-2.5 text-sm font-semibold text-green">{UI.home.openDossier} <ArrowRight className="w-4 h-4" /></span>
              </span>
            </GlassCard>
          </Link>
        )}

        {/* PARCOURIR PAR THÈME */}
        {themes.length > 0 && (
          <>
            <SectionHeader title={UI.home.byTheme} to="/themes" seeLabel={UI.home.allThemes} />
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <Link key={t.slug} to={`/themes/${t.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-green-line bg-glass-tint text-ink px-3.5 py-1.5 text-sm hover:border-green transition-colors">
                  <Tag className="w-3.5 h-3.5 text-accent" /> {t.nom} <span className="text-muted text-xs tabular-nums">{themeTotal(t)}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* DERNIERS AJOUTS */}
        {recent.length > 0 && (
          <>
            <SectionHeader title={UI.home.recent} />
            <div className="grid gap-3 sm:grid-cols-3">
              {recent.map((r, i) => (
                <Link key={i} to={r.href} className="block">
                  <GlassCard className="h-full p-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent mb-1"><Clock className="w-3 h-3" /> {r.type}</span>
                    <span className="block font-display font-semibold text-ink leading-snug line-clamp-2">{r.titre}</span>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* LES ÉVOCATIONS DE LA JOURNÉE — accès au parcours (frise 13.5) */}
        <Link to="/invocations" className="group block mt-8">
          <GlassCard tint className="p-5 flex items-center gap-4 transition-colors group-hover:border-accent/60">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-accent-deep text-[#eafffb] shrink-0"><Sunrise className="w-6 h-6" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-bold text-ink">{UI.home.adhkar}</span>
              <span className="block text-[13px] text-muted">{UI.home.adhkarSub}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-green shrink-0">{UI.home.startParcours} <ArrowRight className="w-4 h-4" /></span>
          </GlassCard>
        </Link>

        {/* EXPLORER — tuiles de rubriques */}
        <SectionHeader title="Explorer" />
        <div className="grid grid-cols-2 gap-3">
          {explore.map((t) => (
            <Tile key={t.title} to={t.to} icon={t.icon} title={t.title} meta={t.meta} />
          ))}
        </div>

        {/* REPÈRES CHIFFRÉS */}
        {figures.length > 0 && (
          <>
            <SectionHeader title={UI.home.figures} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {figures.map((f) => (
                <GlassCard key={f.label} className="p-4 text-center">
                  <span className="block font-display font-extrabold text-ink text-2xl tabular-nums">{f.n}</span>
                  <span className="block text-[12px] text-muted">{f.label}</span>
                </GlassCard>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
