import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface Hadith {
  id: number;
  sujet: string;
  rapporteur: string;
  narrateur: string;
  statut: string;
  texte_arabe: string;
  texte_francais: string;
  phonétique: string;
  explication: string;
  tag: string;
}

interface HadithContextType {
  hadiths: Hadith[];
  fetchHadiths: () => Promise<void>;
  isLoading: boolean; // Ajout d'un état de chargement
  error: string | null; // Ajout d'une gestion d'erreur
}

const HadithContext = createContext<HadithContextType | undefined>(undefined);

export const HadithProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // État de chargement
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs

  const fetchHadiths = async () => {
    setIsLoading(true);
    setError(null); // Réinitialiser l'erreur avant chaque requête
    try {
      const response = await api.get<Hadith[]>('/hadiths');
      setHadiths(response.data);
    } catch (error) {
      console.error('Error fetching hadiths:', error);
      setError('Failed to fetch hadiths. Please try again later.'); // Message d'erreur
    } finally {
      setIsLoading(false); // Arrêter le chargement une fois la requête terminée
    }
  };

  useEffect(() => {
    fetchHadiths();
  }, []);

  return (
    <HadithContext.Provider value={{ hadiths, fetchHadiths, isLoading, error }}>
      {children}
    </HadithContext.Provider>
  );
};

export const useHadiths = () => {
  const context = useContext(HadithContext);
  if (context === undefined) {
    throw new Error('useHadiths must be used within a HadithProvider');
  }
  return context;
};