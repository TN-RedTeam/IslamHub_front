import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { PwaUpdater } from './components/PwaUpdater';
import { SiteFooter } from './components/SiteFooter';
import { Home } from './pages/Home';
import { Hadiths } from './pages/Hadiths';
import { HadithPage } from './pages/HadithPage';
import { Invocations } from './pages/Invocations';
import { Paroles } from './pages/Paroles';
import { Savants } from './pages/Savants';
import { SavantPage } from './pages/SavantPage';
import { Corans } from './pages/Coran';
import { SouratesIndex } from './pages/SouratesIndex';
import { SouratePage } from './pages/SouratePage';
import { Multimedia } from './pages/Multimedia';
import { Femmes } from './pages/Femmes';
import { ThemeProvider } from './context/ThemeContext';
import { Madhaheb } from './pages/Madhaheb';
import { Croyance } from './pages/Croyance';
import { NomsEtAttributs } from './pages/croyance/Attributs';
import { PiliersDeLaFoi } from './pages/croyance/PiliersDeLaFoi';
import { VersetsEquivoques } from './pages/croyance/VersetsEquivoques';
import { VersetEquivoque } from './pages/croyance/VersetEquivoque';
import { NomsDAllah } from './pages/croyance/NomsDAllah';
import { DossierThematique } from './pages/DossierThematique';
import { NotFound } from './pages/NotFound';

// Import des écoles
import {
  Hanafi,
  Malikite,
  Shafii,
  Hanbalite,
} from './pages/ecoles';

function App() {
  return (
    <ThemeProvider>
      {/* LazyMotion fournit les animations aux composants `m.` de framer-motion.
          Mode NON strict : les pages encore en `motion.` continuent de fonctionner. */}
      <LazyMotion features={domAnimation}>
        <Router>
          <div className="min-h-screen bg-ground transition-colors duration-200 flex flex-col">
            <Navigation />
            <PwaUpdater />
            <main className="flex-1">
              <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Home />} />
                <Route path="/coran" element={<Corans />} />
                <Route path="/coran/sourates" element={<SouratesIndex />} />
                <Route path="/coran/sourates/:slug" element={<SouratePage />} />
                <Route path="/hadiths" element={<Hadiths />} />
                <Route path="/hadiths/:id/:slug" element={<HadithPage />} />
                {/* Rubrique unifiée Invocations & Évocations (ex-douaas + ex-dhikrs) */}
                <Route path="/invocations" element={<Invocations />} />
                {/* Redirections des anciennes URL pour ne pas casser les liens */}
                <Route path="/douaas" element={<Navigate to="/invocations" replace />} />
                <Route path="/dhikrs" element={<Navigate to="/invocations" replace />} />
                <Route path="/paroles" element={<Paroles />} />
                <Route path="/savants" element={<Savants />} />
                <Route path="/savants/:slug" element={<SavantPage />} />
                <Route path="/multimedia" element={<Multimedia />} />
                <Route path="/femmes" element={<Femmes />} />

                {/* Croyance (Aqida) */}
                <Route path="/croyance" element={<Croyance />} />
                <Route path="/croyance/noms-et-attributs" element={<NomsEtAttributs />} />
                <Route path="/croyance/piliers-de-la-foi" element={<PiliersDeLaFoi />} />
                <Route path="/croyance/versets-equivoques" element={<VersetsEquivoques />} />
                <Route path="/croyance/versets-equivoques/:slug" element={<VersetEquivoque />} />
                <Route path="/croyance/noms-d-allah" element={<NomsDAllah />} />
                <Route path="/dossiers/:slug" element={<DossierThematique />} />

                {/* Écoles (madhāhib) */}
                <Route path="/ecoles" element={<Madhaheb />} />
                {/* Redirection de l'ancienne route pour ne pas casser les liens */}
                <Route path="/madhaheb" element={<Navigate to="/ecoles" replace />} />
                <Route path="/ecoles/Hanafi" element={<Hanafi />} />
                <Route path="/ecoles/Malikite" element={<Malikite />} />
                <Route path="/ecoles/Shafii" element={<Shafii />} />
                <Route path="/ecoles/Hanbalite" element={<Hanbalite />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </Router>
      </LazyMotion>
    </ThemeProvider>
  );
}

export default App;
