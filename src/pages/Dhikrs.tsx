import React from 'react';
import { Heart } from 'lucide-react';
import { CollectionPage } from '../components/CollectionPage';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Dhikr } from '../types';

export const Dhikrs: React.FC = () => {
  usePageTitle('Dhikrs');
  return CollectionPage<Dhikr>({
    title: 'Évocations et Dhikrs',
    subtitle: "« N'est-ce pas par l'évocation d'Allâh que les cœurs se tranquillisent ? »",
    icon: Heart,
    searchPlaceholder: 'Rechercher une évocation…',
    noun: ['évocation', 'évocations'],
    tasbih: true,
    footerQuote: '« Et glorifiez-Le matin et soir »',
    footerSource: 'Sourate Al-Ahzab, verset 42',
    fetch: ({ term, tag, params }) => dataService.searchDhikrs(term, tag, params),
    getTags: () => dataService.getDhikrTags(),
    fields: {
      commentaire: (d) => d.commentaire,
    },
  });
};

export default Dhikrs;
