import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Home, BookOpen } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const NotFound: React.FC = () => {
  usePageTitle('Page introuvable');

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 flex items-center justify-center px-4">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <p className="text-7xl mb-8 font-amiri bg-gradient-to-r from-emerald-600 to-amber-500 dark:from-emerald-400 dark:to-amber-400 bg-clip-text text-transparent font-bold">
          404
        </p>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-3 font-amiri">
          Cette page n'existe pas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La page que vous cherchez a peut-être été déplacée ou n'existe plus.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            to="/coran"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-xl shadow transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <BookOpen className="w-5 h-5" />
            Lire le Coran
          </Link>
        </div>
      </m.div>
    </div>
  );
};

export default NotFound;
