import React, { lazy, Suspense } from 'react';
import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { ScrollToTop } from './components/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';

// Lazy loading : chaque page part dans son propre chunk au lieu de gonfler
// le bundle initial (le visiteur de l'accueil ne télécharge pas la page Coran).
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Corans = lazy(() => import('./pages/Coran').then(m => ({ default: m.Corans })));
const Hadiths = lazy(() => import('./pages/Hadiths').then(m => ({ default: m.Hadiths })));
const HadithsArabe = lazy(() => import('./pages/HadithsArabe'));
const AlBukhari = lazy(() => import('./pages/hadith/Al-Bukhari/AlBukhari'));
const Dhikrs = lazy(() => import('./pages/Dhikrs').then(m => ({ default: m.Dhikrs })));
const Douaas = lazy(() => import('./pages/Douaas').then(m => ({ default: m.Douaas })));
const Savants = lazy(() => import('./pages/Savants').then(m => ({ default: m.Savants })));
const Biographies = lazy(() => import('./pages/Biographies').then(m => ({ default: m.Biographies })));
const Multimedia = lazy(() => import('./pages/Multimedia'));
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimes').then(m => ({ default: m.PrayerTimesPage })));
const Madhaheb = lazy(() => import('./pages/Madhaheb').then(m => ({ default: m.Madhaheb })));
const NotFound = lazy(() => import('./pages/NotFound'));

// Écoles (Madhaheb)
const Hanafi = lazy(() => import('./pages/ecoles/Hanafi'));
const Malikite = lazy(() => import('./pages/ecoles/Malikite'));
const Shafii = lazy(() => import('./pages/ecoles/Shafii'));
const Hanbalite = lazy(() => import('./pages/ecoles/Hanbalite'));

// Moteur d'animation chargé en asynchrone (voir src/motionFeatures.ts)
const loadMotionFeatures = () => import('./motionFeatures').then(mod => mod.default);

// HashRouter par défaut : indispensable dans la WebView Capacitor et sur
// GitHub Pages. Pour la mise en prod sur un vrai domaine (Vercel/Netlify…),
// builder avec VITE_ROUTER=browser pour des URLs propres indexables.
const useBrowserRouter =
  import.meta.env.VITE_ROUTER === 'browser' && !('Capacitor' in window);
const Router = useBrowserRouter ? BrowserRouter : HashRouter;

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Navigation />
              <main>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Pages principales */}
                    <Route path="/" element={<Home />} />
                    <Route path="/coran" element={<Corans />} />
                    <Route path="/hadiths" element={<Hadiths />} />
                    <Route path="/hadith/albukhari" element={<AlBukhari />} />
                    <Route path="/hadiths-arabe" element={<HadithsArabe />} />
                    <Route path="/dhikrs" element={<Dhikrs />} />
                    <Route path="/douaas" element={<Douaas />} />
                    <Route path="/savants" element={<Savants />} />
                    <Route path="/biographies" element={<Biographies />} />
                    <Route path="/multimedia" element={<Multimedia />} />
                    <Route path="/prayer-times" element={<PrayerTimesPage />} />

                    {/* Écoles (Madhaheb) */}
                    <Route path="/ecoles" element={<Madhaheb />} />
                    <Route path="/ecoles/Hanafi" element={<Hanafi />} />
                    <Route path="/ecoles/Malikite" element={<Malikite />} />
                    <Route path="/ecoles/Shafii" element={<Shafii />} />
                    <Route path="/ecoles/Hanbalite" element={<Hanbalite />} />

                    {/* Page 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </Router>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}

export default App;
