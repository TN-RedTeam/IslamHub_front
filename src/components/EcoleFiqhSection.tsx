import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FiqhAccordion } from './FiqhAccordion';
import type { FiqhChapitre } from '../types';

/**
 * Section de jurisprudence (fiqh) pour UNE école.
 * À insérer dans une page école : <EcoleFiqhSection ecole="Hanafi" />
 *
 * Correspondance route -> valeur `ecole` en base :
 *   /ecoles/Hanafi    -> "Hanafi"
 *   /ecoles/Malikite  -> "Malikite"
 *   /ecoles/Shafii    -> "Ach-Chafi^iyy"
 *   /ecoles/Hanbalite -> "Hanbali"
 */
export const EcoleFiqhSection: React.FC<{ ecole: string; titre?: string }> = ({ ecole, titre }) => {
  const [chapitres, setChapitres] = useState<FiqhChapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dataService.getFiqhByEcole(ecole)
      .then(setChapitres)
      .catch(() => setChapitres([]))
      .finally(() => setLoading(false));
  }, [ecole]);

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-6 font-amiri text-center">
        {titre ?? 'Points de jurisprudence'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
      ) : chapitres.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Aucun point de jurisprudence pour l'instant.
        </p>
      ) : (
        <FiqhAccordion chapitres={chapitres} />
      )}
    </section>
  );
};

export default EcoleFiqhSection;
