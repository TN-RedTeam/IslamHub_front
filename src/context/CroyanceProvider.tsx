import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface Croyance {
  id: number;
  nom: string;
  arabe: string;
  francais: string;
  type_id: number;
  sujet: string;
  phonetique: string;
  explication: string;
  audio: string; // Chemin ou URL du fichier audio
}

interface CroyanceContextType {
  croyances: Croyance[];
  fetchCroyances: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CroyanceContext = createContext<CroyanceContextType | undefined>(undefined);

export const CroyanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [croyances, setCroyances] = useState<Croyance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCroyances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Croyance[]>('/croyances'); // Endpoint pour récupérer les croyances
      setCroyances(response.data);
    } catch (error) {
      console.error('Error fetching croyances:', error);
      setError('Failed to fetch croyances. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCroyances();
  }, []);

  return (
    <CroyanceContext.Provider value={{ croyances, fetchCroyances, isLoading, error }}>
      {children}
    </CroyanceContext.Provider>
  );
};

export const useCroyances = () => {
  const context = useContext(CroyanceContext);
  if (context === undefined) {
    throw new Error('useCroyances must be used within a CroyanceProvider');
  }
  return context;
};