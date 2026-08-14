import React from 'react';
import { GraduationCap } from 'lucide-react';
import { CollectionPage } from '../components/CollectionPage';
import { dataService } from '../services/DataService';
import type { Parole } from '../types';

export const Paroles: React.FC = () =>
  CollectionPage<Parole>({
    title: 'Paroles de savants',
    subtitle: 'Les paroles des savants de Ahlou s-Sounnah wa l-Jamâ‘ah',
    icon: GraduationCap,
    searchPlaceholder: 'Rechercher une parole, un savant…',
    noun: ['parole', 'paroles'],
    footerQuote: '« La science est un héritage des prophètes »',
    fetch: ({ term, tag, params }) => dataService.searchParoles(term, tag, params),
    getTags: () => dataService.getParoleTags(),
    fields: {
      author: (p) => p.savant,
      authorLabel: 'Savant',
    },
  });

export default Paroles;
