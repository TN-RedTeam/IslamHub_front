import React from 'react';

const jourDernier: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="relative py-16 bg-arabesque bg-cover bg-center">
        <div className="absolute inset-0 bg-emerald-900/80 dark:bg-emerald-950/90 backdrop-blur-sm"></div>
        <div className="relative text-center px-4">
          <h1 className="text-4xl font-bold text-white mb-4 font-amiri">École Hanafi</h1>
          <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
            Découvrez les principes et les enseignements de l'école Hanafi.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-300">
            L'école Hanafi est l'une des quatre écoles de jurisprudence sunnites. Elle a été fondée par l'imam Abu Hanifa...
          </p>
        </div>
      </div>
    </div>
  );
};

export default jourDernier;