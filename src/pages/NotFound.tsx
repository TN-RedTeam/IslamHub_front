import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Home, BookOpen } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const NotFound: React.FC = () => {
  usePageTitle('Page introuvable');

  return (
    <div className="min-h-screen bg-ground flex items-center justify-center px-4">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <p className="text-7xl mb-8 font-display bg-green bg-clip-text text-transparent font-bold">
          404
        </p>
        <h1 className="text-2xl font-bold text-green-deep mb-3 font-display">
          Cette page n'existe pas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La page que vous cherchez a peut-être été déplacée ou n'existe plus.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green hover:bg-green-deep text-white rounded-xl shadow-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            to="/coran"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-green border border-line rounded-xl shadow transition-colors hover:bg-green-soft"
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
