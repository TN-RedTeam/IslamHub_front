import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { PwaUpdater } from './components/PwaUpdater';
import { SiteFooter } from './components/SiteFooter';
import { Home } from './pages/Home';
import { Hadiths } from './pages/Hadiths';
import { HadithPage } from './pages/HadithPage';
import { Invocations } from './pages/Invocations';
import { Paroles } from './pages/Paroles';
import { ParolePage } from './pages/ParolePage';
import { Savants } from './pages/Savants';
import { SavantPage } from './pages/SavantPage';
import { Corans } from './pages/Coran';
import { SouratesIndex } from './pages/SouratesIndex';
import { SouratePage } from './pages/SouratePage';
import { Multimedia } from './pages/Multimedia';
import { ThemesIndex } from './pages/ThemesIndex';
import { ThemePage } from './pages/ThemePage';
import { Recits } from './pages/Recits';
import { RecitPage } from './pages/RecitPage';
import { Femmes } from './pages/Femmes';
import { ThemeProvider } from './context/ThemeContext';
import { Madhaheb } from './pages/Madhaheb';
import { Croyance } from './pages/Croyance';
import { Attributs } from './pages/croyance/Attributs';
import { PiliersDeLaFoi } from './pages/croyance/PiliersDeLaFoi';
import { VersetsEquivoques } from './pages/croyance/VersetsEquivoques';
import { VersetEquivoque } from './pages/croyance/VersetEquivoque';
import { ComprendreEquivoques } from './pages/croyance/ComprendreEquivoques';
import { JugementRationnel } from './pages/croyance/JugementRationnel';
import { NomsDAllah } from './pages/croyance/NomsDAllah';
import { DossierThematique } from './pages/DossierThematique';
import { NotFound } from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminHadithForm } from './pages/admin/AdminHadithForm';
import { AdminHadithsList } from './pages/admin/AdminHadithsList';
import { AdminParoleForm } from './pages/admin/AdminParoleForm';
import { AdminParolesList } from './pages/admin/AdminParolesList';
import { AdminRecitForm } from './pages/admin/AdminRecitForm';
import { AdminRecitsList } from './pages/admin/AdminRecitsList';
import { AdminEquivoqueForm } from './pages/admin/AdminEquivoqueForm';
import { AdminEquivoquesList } from './pages/admin/AdminEquivoquesList';
import { AdminCoranForm } from './pages/admin/AdminCoranForm';
import { AdminCoranList } from './pages/admin/AdminCoranList';
import { AdminSourateForm } from './pages/admin/AdminSourateForm';
import { AdminSouratesList } from './pages/admin/AdminSouratesList';
import { AdminInvocationForm } from './pages/admin/AdminInvocationForm';
import { AdminInvocationsList } from './pages/admin/AdminInvocationsList';
import { AdminSavantForm } from './pages/admin/AdminSavantForm';
import { AdminSavantsList } from './pages/admin/AdminSavantsList';

// Import des écoles
import {
  Hanafi,
  Malikite,
  Shafii,
  Hanbalite,
} from './pages/ecoles';

// Redirige l'ancienne fiche /croyance/versets-equivoques/:slug vers la nouvelle URL.
function OldVersetRedirect() {
  const { slug = '' } = useParams();
  return <Navigate to={`/croyance/versets-hadiths-equivoques/${slug}`} replace />;
}

/** Shell public : barre de nav + pied de page + toutes les pages du site. */
function PublicShell() {
  return (
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
                {/* Rubrique « Savants » : répertoire (défaut) + toutes les paroles */}
                <Route path="/savants" element={<Savants />} />
                <Route path="/savants/paroles" element={<Paroles />} />
                <Route path="/savants/:slug" element={<SavantPage />} />
                {/* Pages de parole dédiées + redirection de l'ancienne rubrique */}
                <Route path="/paroles/:slug" element={<ParolePage />} />
                <Route path="/paroles" element={<Navigate to="/savants/paroles" replace />} />
                <Route path="/multimedia" element={<Multimedia />} />
                {/* Thèmes transverses (Coran / Sunna / Paroles) */}
                <Route path="/themes" element={<ThemesIndex />} />
                <Route path="/themes/:slug" element={<ThemePage />} />
                {/* Récits : Histoires des Prophètes + Vies des vertueux */}
                <Route path="/recits" element={<Recits />} />
                <Route path="/recits/:slug" element={<RecitPage />} />
                <Route path="/femmes" element={<Femmes />} />

                {/* Croyance (Aqida) */}
                <Route path="/croyance" element={<Croyance />} />
                <Route path="/croyance/attributs" element={<Attributs />} />
                {/* Redirection de l'ancienne URL */}
                <Route path="/croyance/noms-et-attributs" element={<Navigate to="/croyance/attributs" replace />} />
                <Route path="/croyance/piliers-de-la-foi" element={<PiliersDeLaFoi />} />
                <Route path="/croyance/versets-hadiths-equivoques" element={<VersetsEquivoques />} />
                <Route path="/croyance/versets-hadiths-equivoques/comprendre" element={<ComprendreEquivoques />} />
                <Route path="/croyance/versets-hadiths-equivoques/:slug" element={<VersetEquivoque />} />
                {/* Redirections de l'ancienne route */}
                <Route path="/croyance/versets-equivoques" element={<Navigate to="/croyance/versets-hadiths-equivoques" replace />} />
                <Route path="/croyance/versets-equivoques/:slug" element={<OldVersetRedirect />} />
                <Route path="/croyance/noms-d-allah" element={<NomsDAllah />} />
                <Route path="/croyance/jugement-rationnel" element={<JugementRationnel />} />
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* LazyMotion fournit les animations aux composants `m.` de framer-motion.
            Mode NON strict : les pages encore en `motion.` continuent de fonctionner. */}
        <LazyMotion features={domAnimation}>
          <Router>
            <Routes>
              {/* Espace d'administration (hors shell public, auth requise) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="hadiths" element={<AdminHadithsList />} />
                <Route path="hadiths/nouveau" element={<AdminHadithForm />} />
                <Route path="hadiths/:id" element={<AdminHadithForm />} />
                <Route path="paroles" element={<AdminParolesList />} />
                <Route path="paroles/nouveau" element={<AdminParoleForm />} />
                <Route path="paroles/:id" element={<AdminParoleForm />} />
                <Route path="recits" element={<AdminRecitsList />} />
                <Route path="recits/nouveau" element={<AdminRecitForm />} />
                <Route path="recits/:id" element={<AdminRecitForm />} />
                <Route path="equivoques" element={<AdminEquivoquesList />} />
                <Route path="equivoques/nouveau" element={<AdminEquivoqueForm />} />
                <Route path="equivoques/:id" element={<AdminEquivoqueForm />} />
                <Route path="coran" element={<AdminCoranList />} />
                <Route path="coran/nouveau" element={<AdminCoranForm />} />
                <Route path="coran/:id" element={<AdminCoranForm />} />
                <Route path="sourates" element={<AdminSouratesList />} />
                <Route path="sourates/nouveau" element={<AdminSourateForm />} />
                <Route path="sourates/:id" element={<AdminSourateForm />} />
                <Route path="invocations" element={<AdminInvocationsList />} />
                <Route path="invocations/nouveau" element={<AdminInvocationForm />} />
                <Route path="invocations/:id" element={<AdminInvocationForm />} />
                <Route path="savants" element={<AdminSavantsList />} />
                <Route path="savants/nouveau" element={<AdminSavantForm />} />
                <Route path="savants/:id" element={<AdminSavantForm />} />
              </Route>
              {/* Site public */}
              <Route path="/*" element={<PublicShell />} />
            </Routes>
          </Router>
        </LazyMotion>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
