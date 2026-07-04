import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, X, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '../hooks/usePageTitle';

interface Savant {
  id: number;
  sujet: string;
  savant: string;
  texte_arabe: string;
  texte_francais: string | null;
  phonétique: string | null;
  explication: string | null;
  tag: string;
}

const SavantCard: React.FC<{ savant: Savant; onClick: () => void }> = ({ savant, onClick }) => (
  <m.div 
    whileHover={{ scale: 1.01 }}
    onClick={onClick}
    className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 space-y-4 overflow-hidden cursor-pointer h-full flex flex-col"
  >
    {/* Décoration orientale */}
    <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
      <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
        <path 
          fill="currentColor" 
          d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" 
          className="transform rotate-45"
        />
      </svg>
    </div>
    
    {savant.sujet && (
      <div className="flex items-center">
        <Star className="h-5 w-5 text-amber-500 dark:text-amber-300 mr-2" />
        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
          {savant.sujet}
        </h3>
      </div>
    )}
    
    
    
    <div className="bg-white dark:bg-gray-800/80 p-4 rounded-lg border border-amber-100 dark:border-emerald-800 flex-grow">
      <p className="text-2xl text-gray-900 dark:text-white font-arabic leading-loose text-right line-clamp-3">
        {savant.texte_arabe}
      </p>
      
      {savant.texte_francais && (
        <div className="mt-4 pl-4 border-l-4 border-amber-300 dark:border-emerald-600 line-clamp-2">
          <p className="text-sm text-amber-700 dark:text-amber-200 mb-1">Signification :</p>
          <p className="text-gray-700 dark:text-gray-300">{savant.texte_francais}</p>
        </div>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {savant.tag.split(',').filter(t => t.trim()).map(tag => (
        <m.span
          key={tag.trim()}
          whileHover={{ scale: 1.05 }}
          className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full flex items-center"
        >
          <ChevronRight className="h-3 w-3 mr-1" />
          {tag.trim()}
        </m.span>
      ))}
    </div>
    
    <div className="mt-auto pt-4 text-center">
      <button className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
        Lire la suite...
      </button>
    </div>
  </m.div>
);

const SavantModal: React.FC<{ 
  savant: Savant | null; 
  onClose: () => void 
}> = ({ savant, onClose }) => {
  if (!savant) return null;

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <m.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                {savant.sujet}
              </h2>
              {savant.savant && (
                <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                  Savant: {savant.savant}
                </p>
              )}
             
              
            </div>
            
            
            
          </div>
          
          <div className="bg-amber-50 dark:bg-gray-700 p-6 rounded-lg">
            <p className="text-3xl text-gray-900 dark:text-white font-arabic leading-loose text-right">
              {savant.texte_arabe}
            </p>
            
            {savant.phonétique && (
              <div className="mt-6 bg-white dark:bg-gray-600 p-4 rounded">
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">Phonétique:</p>
                <p className="text-gray-700 dark:text-gray-200">{savant.phonétique}</p>
              </div>
            )}
            
            {savant.texte_francais && (
              <div className="mt-6 pl-4 border-l-4 border-emerald-500">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">Traduction:</p>
                <p className="text-gray-700 dark:text-gray-300">{savant.texte_francais}</p>
              </div>
            )}
          </div>
          
          {savant.explication && (
            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
              <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-3">Explication:</p>
              <p className="text-gray-700 dark:text-gray-300">{savant.explication}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {savant.tag.split(',').filter(t => t.trim()).map(tag => (
              <span
                key={tag.trim()}
                className="text-xs bg-amber-100 dark:bg-emerald-800 text-amber-800 dark:text-emerald-200 px-3 py-1 rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </m.div>
    </m.div>
  );
};

export const Savants: React.FC = () => {
  usePageTitle('Paroles de savants');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  // Données chargées en lazy : parole.json part dans un chunk séparé
  // au lieu de gonfler le bundle initial.
  const [savantsData, setSavantsData] = useState<Savant[]>([]);
  const [filteredSavants, setFilteredSavants] = useState<Savant[]>([]);

  useEffect(() => {
    import('../data/parole.json').then(mod => {
      setSavantsData(mod.default as unknown as Savant[]);
    });
  }, []);
  const [selectedSavant, setSelectedSavant] = useState<Savant | null>(null);

  const topics = [
    'Sahih Al Bukhari',
    'Sahih Muslim',
    'رياض الصالحين',
    'كتاب ذكر الموت',
    'الأربعون في التصوف',
    'المنتقى من صحيح مسلم',
    'Croyance',
    'Salat',
    'Jeûne',
    'Zakat',
    'Mariage',
    'Ventes',
    'Famille'
  ];

  const handleTopicClick = (topic: string) => {
    switch (topic) {
      case 'Sahih Al Bukhari':
        navigate('/hadith/albukhari');
        break;
      case 'Sahih Muslim':
        navigate('/hadith/muslim');
        break;
      case 'رياض الصالحين':
        navigate('/hadith/riyadhassalihin');
        break;
      case 'كتاب ذكر الموت':
        navigate('/hadith/dhikralmout');
        break;
      case 'الأربعون في التصوف':
        navigate('/hadith/arbaoune-tasawwuf');
        break;
      case 'المنتقى من صحيح مسلم':
        navigate('/hadith/montaqa-sahihmuslim');
        break;
      case 'Croyance':
        navigate('/hadith/croyance');
        break;
      case 'Salat':
        navigate('/hadith/salat');
        break;
      case 'Jeûne':
        navigate('/hadith/jeune');
        break;
      case 'Zakat':
        navigate('/hadith/zakat');
        break;
      case 'Mariage':
        navigate('/hadith/mariage');
        break;
      case 'Ventes':
        navigate('/hadith/ventes');
        break;
      case 'Famille':
        navigate('/hadith/famille');
        break;
      default:
        console.warn(`Aucune route définie pour le thème : ${topic}`);
        break;
    }
  };

  // Extraction des tags uniques
 // Extraction des tags uniques
useEffect(() => {
  const tags = new Set<string>();
  savantsData.forEach(savant => {
    (savant.tag || '').split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .forEach(tag => tags.add(tag));
  });
  // Tri alphabétique ici
  setAllTags(Array.from(tags).sort((a, b) => a.localeCompare(b)));
}, [savantsData]);

  // Filtrage des hadiths
  useEffect(() => {
    let results = [...savantsData];

    // Filtre par tag exact
    if (selectedTag) {
      const tagToFind = selectedTag.toLowerCase();
      results = results.filter(savant => 
        (savant.tag || '').split(',')
          .map(t => t.trim().toLowerCase())
          .includes(tagToFind)
      );
    }

    // Filtre par texte
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(savant => 
        savant.texte_arabe.toLowerCase().includes(term) ||
        (savant.texte_francais?.toLowerCase().includes(term)) ||
        (savant.explication?.toLowerCase().includes(term)) ||
        savant.sujet.toLowerCase().includes(term) ||
        savant.savant.toLowerCase().includes(term)
      );
    }

    setFilteredSavants(results);
  }, [searchTerm, selectedTag, savantsData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950">
      {/* En-tête avec motif islamique */}
      <m.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-20 bg-emerald-800 dark:bg-emerald-950 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-gray-900" />
        
        <div className="relative container mx-auto px-4 text-center">
          <m.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 font-amiri"
          >
            Paroles de savants
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Explorez les paroles des savanst de Ahlu Sounnah
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
        {/* Navigation rapide */}
        <m.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-6 font-amiri text-center">
            Collections principales
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topics.map((topic, i) => (
              <m.div
                key={topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-center rounded-xl p-4 shadow-lg border border-emerald-100 dark:border-emerald-800 transition-all"
                onClick={() => handleTopicClick(topic)}
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {topic}
                </span>
              </m.div>
            ))}
          </div>
        </m.section>

        {/* Recherche et filtres */}
        <m.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-12 sticky top-4 z-20 border border-emerald-100 dark:border-emerald-900"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un hadith..."
                className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-amiri"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative md:w-64">
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <select
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium"
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
              >
                <option value="">Tous les thèmes</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTag && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2"
            >
              <span className="font-medium text-emerald-800 dark:text-emerald-200">
                Filtre : <span className="font-bold">{selectedTag}</span>
              </span>
              <button 
                onClick={() => setSelectedTag(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </m.div>
          )}
        </m.section>

        {/* Résultats */}
        <section className="pb-16">
          <AnimatePresence>
            {filteredSavants.length === 0 ? (
              <m.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag(null);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </m.div>
            ) : (
              <>
                <m.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-6"
                >
                  {filteredSavants.length} hadith{filteredSavants.length > 1 ? 's' : ''} trouvé{filteredSavants.length > 1 ? 's' : ''}
                </m.p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {filteredSavants.map((savant, index) => (
                    <m.div
                      key={`${savant.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <SavantCard 
                        savant={savant} 
                        onClick={() => setSelectedSavant(savant)}
                      />
                    </m.div>
                  ))}
                </div>
              </>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Pied de page décoratif */}
      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 mb-4 font-amiri text-xl">
            "On n’obéit pas à une créature pour désobéir au Créateur"
          </p>
          <p className="text-emerald-200">© 2023 Collection de Hadiths</p>
        </div>
      </footer>

      {/* Modal */}
      <SavantModal 
        savant={selectedSavant} 
        onClose={() => setSelectedSavant(null)} 
      />
    </div>
  );
};