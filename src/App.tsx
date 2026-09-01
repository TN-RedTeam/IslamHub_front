import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { PwaUpdater } from './components/PwaUpdater';
import { Home } from './pages/Home';
import { Hadiths } from './pages/Hadiths';
import { Dhikrs } from './pages/Dhikrs';
import { Douaas } from './pages/Douaas';
import { Paroles } from './pages/Paroles';
import { Savants } from './pages/Savants';
import { Corans } from './pages/Coran';
import { Multimedia } from './pages/Multimedia';
import { Femmes } from './pages/Femmes';
import { ThemeProvider } from './context/ThemeContext';
import { Madhaheb } from './pages/Madhaheb';
import AlBukhari from './pages/hadith/Al-Bukhari/AlBukhari';
import part1 from './pages/hadith/Al-Bukhari/part1';

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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navigation />
            <PwaUpdater />
            <main>
              <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Home />} />
                <Route path="/coran" element={<Corans />} />
                <Route path="/hadiths" element={<Hadiths />} />
                <Route path="/hadith/albukhari" element={<AlBukhari />} />
                <Route path="/hadith/albukhari/part1" element={<part1 />} />
                <Route path="/dhikrs" element={<Dhikrs />} />
                <Route path="/douaas" element={<Douaas />} />
                <Route path="/paroles" element={<Paroles />} />
                <Route path="/savants" element={<Savants />} />
                <Route path="/multimedia" element={<Multimedia />} />
                <Route path="/femmes" element={<Femmes />} />

                {/* Écoles (Madhaheb) */}
                <Route path="/ecoles" element={<Madhaheb />} />
                <Route path="/ecoles/Hanafi" element={<Hanafi />} />
                <Route path="/ecoles/Malikite" element={<Malikite />} />
                <Route path="/ecoles/Shafii" element={<Shafii />} />
                <Route path="/ecoles/Hanbalite" element={<Hanbalite />} />
              </Routes>
            </main>
          </div>
        </Router>
      </LazyMotion>
    </ThemeProvider>
  );
}

export default App;
