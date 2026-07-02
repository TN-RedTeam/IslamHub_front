import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface Douaa {
  id: number;
  sujet: string;
  texte_arabe: string;
  texte_francais: string;
  phonétique: string;
  explication: string;
  commentaire: string;
  tag: string;
  
}

interface DouaaContextType {
  douaas: Douaa[];
  fetchDouaas: () => Promise<void>;
  isLoading: boolean; // Ajout d'un état de chargement
  error: string | null; // Ajout d'une gestion d'erreur
}

const DouaaContext = createContext<DouaaContextType | undefined>(undefined);

export const DouaaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [douaas, setDouaas] = useState<Douaa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // État de chargement
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs

  const fetchDouaas = async () => {
    setIsLoading(true);
    setError(null); // Réinitialiser l'erreur avant chaque requête
    try {
      const response = await api.get<Douaa[]>('/douaas');
      setDouaas(response.data);
    } catch (error) {
      console.error('Error fetching douaas:', error);
      setError('Failed to fetch douaas. Please try again later.'); // Message d'erreur
    } finally {
      setIsLoading(false); // Arrêter le chargement une fois la requête terminée
    }
  };

  useEffect(() => {
    fetchDouaas();
  }, []);

  return (
    <DouaaContext.Provider value={{ douaas, fetchDouaas, isLoading, error }}>
      {children}
    </DouaaContext.Provider>
  );
};

export const useDouaas = () => {
  const context = useContext(DouaaContext);
  if (context === undefined) {
    throw new Error('useDouaas must be used within a DouaaProvider');
  }
  return context;
};