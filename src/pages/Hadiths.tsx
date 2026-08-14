import React from 'react';
import { BookOpen } from 'lucide-react';
import { CollectionPage } from '../components/CollectionPage';
import { dataService } from '../services/DataService';
import type { Hadith } from '../types';

export const Hadiths: React.FC = () =>
  CollectionPage<Hadith>({
    title: 'Hadiths du Prophète ﷺ',
    subtitle: 'Explorez les paroles et enseignements du Messager de Allâh ﷺ',
    icon: BookOpen,
    searchPlaceholder: 'Rechercher un hadith, un thème…',
    noun: ['hadith', 'hadiths'],
    footerQuote: "« On n'obéit pas à une créature pour désobéir au Créateur »",
    load: (p) => dataService.getHadiths(p),
    search: (t, tag, p) => dataService.searchHadiths(t, tag, p),
    getTags: () => dataService.getHadithTags(),
    fields: {
      author: (h) => h.rapporteur,
      authorLabel: 'Rapporteur',
      author2: (h) => h.narrateur,
      author2Label: 'Narrateur',
      badge: (h) => h.statut,
    },
  });

export default Hadiths;
