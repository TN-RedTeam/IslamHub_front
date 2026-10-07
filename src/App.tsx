import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';

// Routeur choisi au build :
//   • VITE_ROUTER=browser → BrowserRouter (URLs propres, indexables par Google) ;
//     requiert une base absolue (VITE_BASE) + un fallback 404.html (GitHub Pages).
//   • défaut → HashRouter (#/...), seul compatible avec la WebView Capacitor
//     Android et les démos servies en sous-dossier (base relative './').
const USE_BROWSER_ROUTER = import.meta.env.VITE_ROUTER === 'browser';
const Router = USE_BROWSER_ROUTER ? BrowserRouter : HashRouter;
// base '/IslamHub_front/' → basename '/IslamHub_front' ; base '/' → '/'.
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/';
const routerProps = USE_BROWSER_ROUTER ? { basename: BASENAME } : {};
import { Loader2 } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { PwaUpdater } from './components/PwaUpdater';
import { SiteFooter } from './components/SiteFooter';
import { BottomNav } from './components/BottomNav';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Pages publiques — chargées à la demande (code-splitting par route).
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Hadiths = lazy(() => import('./pages/Hadiths').then((m) => ({ default: m.Hadiths })));
const HadithPage = lazy(() => import('./pages/HadithPage').then((m) => ({ default: m.HadithPage })));
const Invocations = lazy(() => import('./pages/Invocations').then((m) => ({ default: m.Invocations })));
const Paroles = lazy(() => import('./pages/Paroles').then((m) => ({ default: m.Paroles })));
const ParolePage = lazy(() => import('./pages/ParolePage').then((m) => ({ default: m.ParolePage })));
const Biographies = lazy(() => import('./pages/Biographies').then((m) => ({ default: m.Biographies })));
const SavantPage = lazy(() => import('./pages/SavantPage').then((m) => ({ default: m.SavantPage })));
const Corans = lazy(() => import('./pages/Coran').then((m) => ({ default: m.Corans })));
const SouratesIndex = lazy(() => import('./pages/SouratesIndex').then((m) => ({ default: m.SouratesIndex })));
const SouratePage = lazy(() => import('./pages/SouratePage').then((m) => ({ default: m.SouratePage })));
const Multimedia = lazy(() => import('./pages/Multimedia').then((m) => ({ default: m.Multimedia })));
const ThemesIndex = lazy(() => import('./pages/ThemesIndex').then((m) => ({ default: m.ThemesIndex })));
const ThemePage = lazy(() => import('./pages/ThemePage').then((m) => ({ default: m.ThemePage })));
const Recherche = lazy(() => import('./pages/Recherche').then((m) => ({ default: m.Recherche })));
const ExposePage = lazy(() => import('./pages/ExposePage').then((m) => ({ default: m.ExposePage })));
const Recits = lazy(() => import('./pages/Recits').then((m) => ({ default: m.Recits })));
const RecitPage = lazy(() => import('./pages/RecitPage').then((m) => ({ default: m.RecitPage })));
const Femmes = lazy(() => import('./pages/Femmes').then((m) => ({ default: m.Femmes })));
const Madhaheb = lazy(() => import('./pages/Madhaheb').then((m) => ({ default: m.Madhaheb })));
const Croyance = lazy(() => import('./pages/Croyance').then((m) => ({ default: m.Croyance })));
const Attributs = lazy(() => import('./pages/croyance/Attributs').then((m) => ({ default: m.Attributs })));
const PiliersDeLaFoi = lazy(() => import('./pages/croyance/PiliersDeLaFoi').then((m) => ({ default: m.PiliersDeLaFoi })));
const VersetsEquivoques = lazy(() => import('./pages/croyance/VersetsEquivoques').then((m) => ({ default: m.VersetsEquivoques })));
const VersetEquivoque = lazy(() => import('./pages/croyance/VersetEquivoque').then((m) => ({ default: m.VersetEquivoque })));
const ComprendreEquivoques = lazy(() => import('./pages/croyance/ComprendreEquivoques').then((m) => ({ default: m.ComprendreEquivoques })));
const JugementRationnel = lazy(() => import('./pages/croyance/JugementRationnel').then((m) => ({ default: m.JugementRationnel })));
const NomsDAllah = lazy(() => import('./pages/croyance/NomsDAllah').then((m) => ({ default: m.NomsDAllah })));
const DossierThematique = lazy(() => import('./pages/DossierThematique').then((m) => ({ default: m.DossierThematique })));
const DossiersIndex = lazy(() => import('./pages/DossiersIndex').then((m) => ({ default: m.DossiersIndex })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Écoles (madhāhib)
const Hanafi = lazy(() => import('./pages/ecoles').then((m) => ({ default: m.Hanafi })));
const Malikite = lazy(() => import('./pages/ecoles').then((m) => ({ default: m.Malikite })));
const Shafii = lazy(() => import('./pages/ecoles').then((m) => ({ default: m.Shafii })));
const Hanbalite = lazy(() => import('./pages/ecoles').then((m) => ({ default: m.Hanbalite })));

// Espace d'administration — chunk séparé, jamais chargé pour les visiteurs publics.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminHome = lazy(() => import('./pages/admin/AdminHome').then((m) => ({ default: m.AdminHome })));
const AdminRecherche = lazy(() => import('./pages/admin/AdminRecherche').then((m) => ({ default: m.AdminRecherche })));
const AdminHadithForm = lazy(() => import('./pages/admin/AdminHadithForm').then((m) => ({ default: m.AdminHadithForm })));
const AdminHadithsList = lazy(() => import('./pages/admin/AdminHadithsList').then((m) => ({ default: m.AdminHadithsList })));
const AdminParoleForm = lazy(() => import('./pages/admin/AdminParoleForm').then((m) => ({ default: m.AdminParoleForm })));
const AdminParolesList = lazy(() => import('./pages/admin/AdminParolesList').then((m) => ({ default: m.AdminParolesList })));
const AdminRecitForm = lazy(() => import('./pages/admin/AdminRecitForm').then((m) => ({ default: m.AdminRecitForm })));
const AdminRecitsList = lazy(() => import('./pages/admin/AdminRecitsList').then((m) => ({ default: m.AdminRecitsList })));
const AdminTagsList = lazy(() => import('./pages/admin/AdminTagsList').then((m) => ({ default: m.AdminTagsList })));
const AdminSujetsList = lazy(() => import('./pages/admin/AdminSujetsList').then((m) => ({ default: m.AdminSujetsList })));
const AdminEquivoqueForm = lazy(() => import('./pages/admin/AdminEquivoqueForm').then((m) => ({ default: m.AdminEquivoqueForm })));
const AdminEquivoquesList = lazy(() => import('./pages/admin/AdminEquivoquesList').then((m) => ({ default: m.AdminEquivoquesList })));
const AdminCoranForm = lazy(() => import('./pages/admin/AdminCoranForm').then((m) => ({ default: m.AdminCoranForm })));
const AdminCoranList = lazy(() => import('./pages/admin/AdminCoranList').then((m) => ({ default: m.AdminCoranList })));
const AdminSourateForm = lazy(() => import('./pages/admin/AdminSourateForm').then((m) => ({ default: m.AdminSourateForm })));
const AdminSouratesList = lazy(() => import('./pages/admin/AdminSouratesList').then((m) => ({ default: m.AdminSouratesList })));
const AdminInvocationForm = lazy(() => import('./pages/admin/AdminInvocationForm').then((m) => ({ default: m.AdminInvocationForm })));
const AdminInvocationsList = lazy(() => import('./pages/admin/AdminInvocationsList').then((m) => ({ default: m.AdminInvocationsList })));
const AdminSavantForm = lazy(() => import('./pages/admin/AdminSavantForm').then((m) => ({ default: m.AdminSavantForm })));
const AdminSavantsList = lazy(() => import('./pages/admin/AdminSavantsList').then((m) => ({ default: m.AdminSavantsList })));
const AdminDossierForm = lazy(() => import('./pages/admin/AdminDossierForm').then((m) => ({ default: m.AdminDossierForm })));
const AdminDossiersList = lazy(() => import('./pages/admin/AdminDossiersList').then((m) => ({ default: m.AdminDossiersList })));
const AdminExposeForm = lazy(() => import('./pages/admin/AdminExposeForm').then((m) => ({ default: m.AdminExposeForm })));
const AdminExposesList = lazy(() => import('./pages/admin/AdminExposesList').then((m) => ({ default: m.AdminExposesList })));
const AdminFiqhForm = lazy(() => import('./pages/admin/AdminFiqhForm').then((m) => ({ default: m.AdminFiqhForm })));
const AdminFiqhList = lazy(() => import('./pages/admin/AdminFiqhList').then((m) => ({ default: m.AdminFiqhList })));
const AdminFemmeForm = lazy(() => import('./pages/admin/AdminFemmeForm').then((m) => ({ default: m.AdminFemmeForm })));
const AdminFemmesList = lazy(() => import('./pages/admin/AdminFemmesList').then((m) => ({ default: m.AdminFemmesList })));

/** Repli pendant le chargement d'un chunk de page. */
function PageFallback() {
  return (
    <div className="grid place-items-center py-24" aria-busy="true" aria-live="polite">
      <Loader2 className="w-9 h-9 text-accent animate-spin" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

// Redirige l'ancienne fiche /croyance/versets-equivoques/:slug vers la nouvelle URL.
function OldVersetRedirect() {
  const { slug = '' } = useParams();
  return <Navigate to={`/croyance/versets-hadiths-equivoques/${slug}`} replace />;
}

/** Shell public : barre de nav + pied de page + toutes les pages du site. */
function PublicShell() {
  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col">
      <Navigation />
      <PwaUpdater />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Home />} />
                <Route path="/coran" element={<Corans />} />
                <Route path="/coran/sourates" element={<SouratesIndex />} />
                <Route path="/coran/sourates/:slug" element={<SouratePage />} />
                <Route path="/recherche" element={<Recherche />} />
                <Route path="/exposes/:slug" element={<ExposePage />} />
                <Route path="/hadiths" element={<Hadiths />} />
                <Route path="/hadiths/:id/:slug" element={<HadithPage />} />
                {/* Rubrique unifiée Invocations & Évocations (ex-douaas + ex-dhikrs) */}
                <Route path="/invocations" element={<Invocations />} />
                {/* Redirections des anciennes URL pour ne pas casser les liens */}
                <Route path="/douaas" element={<Navigate to="/invocations" replace />} />
                <Route path="/dhikrs" element={<Navigate to="/invocations" replace />} />
                {/* Rubrique « Savants » : répertoire (défaut) + toutes les paroles */}
                {/* Phase 10 : hub unique « Biographies » (ex-Savants + ex-Compagnons). */}
                <Route path="/biographies" element={<Biographies />} />
                <Route path="/savants" element={<Navigate to="/biographies" replace />} />
                <Route path="/compagnons" element={<Navigate to="/biographies" replace />} />
                <Route path="/savants/paroles" element={<Navigate to="/paroles" replace />} />
                <Route path="/savants/:slug" element={<SavantPage />} />
                {/* Pages de parole dédiées + redirection de l'ancienne rubrique */}
                <Route path="/paroles/:slug" element={<ParolePage />} />
                <Route path="/paroles" element={<Paroles />} />
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
                <Route path="/dossiers" element={<DossiersIndex />} />
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
        </Suspense>
      </main>
      <SiteFooter />
      <BottomNav />
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
          <Router {...routerProps}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Espace d'administration (hors shell public, auth requise) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHome />} />
                  <Route path="recherche" element={<AdminRecherche />} />
                  <Route path="hadiths" element={<AdminHadithsList />} />
                  <Route path="hadiths/nouveau" element={<AdminHadithForm />} />
                  <Route path="hadiths/:id" element={<AdminHadithForm />} />
                  <Route path="paroles" element={<AdminParolesList />} />
                  <Route path="paroles/nouveau" element={<AdminParoleForm />} />
                  <Route path="paroles/:id" element={<AdminParoleForm />} />
                  <Route path="recits" element={<AdminRecitsList />} />
                  <Route path="tags" element={<AdminTagsList />} />
                  <Route path="sujets" element={<AdminSujetsList />} />
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
                  <Route path="dossiers" element={<AdminDossiersList />} />
                  <Route path="dossiers/nouveau" element={<AdminDossierForm />} />
                  <Route path="dossiers/:id" element={<AdminDossierForm />} />
                  <Route path="exposes" element={<AdminExposesList />} />
                  <Route path="exposes/nouveau" element={<AdminExposeForm />} />
                  <Route path="exposes/:slug" element={<AdminExposeForm />} />
                  <Route path="fiqh" element={<AdminFiqhList />} />
                  <Route path="fiqh/nouveau" element={<AdminFiqhForm />} />
                  <Route path="fiqh/:id" element={<AdminFiqhForm />} />
                  <Route path="femmes" element={<AdminFemmesList />} />
                  <Route path="femmes/nouveau" element={<AdminFemmeForm />} />
                  <Route path="femmes/:id" element={<AdminFemmeForm />} />
                </Route>
                {/* Site public */}
                <Route path="/*" element={<PublicShell />} />
              </Routes>
            </Suspense>
          </Router>
        </LazyMotion>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
