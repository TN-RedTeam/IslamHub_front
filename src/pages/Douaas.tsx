import React from 'react';
import { HandHeart } from 'lucide-react';
import { CollectionPage } from '../components/CollectionPage';
import { dataService } from '../services/DataService';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Douaa } from '../types';

export const Douaas: React.FC = () => {
  usePageTitle('Douaas');
  return CollectionPage<Douaa>({
    title: 'Douaas — Invocations',
    subtitle: 'Les invocations authentiques pour chaque moment de la journée',
    icon: HandHeart,
    searchPlaceholder: 'Rechercher une invocation, un moment…',
    noun: ['douaa', 'douaas'],
    footerQuote: '« Invoquez-Moi, Je vous répondrai »',
    footerSource: 'Sourate Ghafir, verset 60',
    fetch: ({ term, tag, params }) => dataService.searchDouaas(term, tag, params),
    getTags: () => dataService.getDouaaTags(),
    fields: {
      commentaire: (d) => d.commentaire,
    },
  });
};

export default Douaas;
