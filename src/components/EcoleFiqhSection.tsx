import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { dataService } from '../services/DataService';
import { FiqhReader } from './FiqhReader';
import type { FiqhChapitre } from '../types';

/**
 * Section de jurisprudence (fiqh) pour UNE école.
 * À insérer dans une page école : <EcoleFiqhSection ecole="Hanafi" />
 *
 * La prop `ecole` doit correspondre à la valeur stockée dans `fiqh.ecole`
 * (comparaison insensible à la casse). Noms uniformisés en base :
 *   /ecoles/Hanafi    -> "Hanafite"
 *   /ecoles/Malikite  -> "Malikite"
 *   /ecoles/Shafii    -> "Chaféite"
 *   /ecoles/Hanbalite -> "Hanbalite"
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
    <section className="py-10">
      <h2 className="text-2xl font-bold text-ink mb-6 font-display text-center">
        {titre ?? 'Points de jurisprudence'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-7 h-7 text-green animate-spin" />
        </div>
      ) : chapitres.length === 0 ? (
        <div className="max-w-xl mx-auto text-center bg-glass-tint border border-line rounded-card px-6 py-8">
          <p className="text-ink font-medium">Section en cours de préparation</p>
          <p className="text-muted text-sm mt-1.5">
            Les points de jurisprudence de cette école seront ajoutés prochainement, in shā’ Allah.
          </p>
        </div>
      ) : (
        <FiqhReader chapitres={chapitres} />
      )}
    </section>
  );
};

export default EcoleFiqhSection;
