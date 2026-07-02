import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, X, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Repliques: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const repliques = [
    { 
      id: 1,
      title: 'Réplique à ceux qui ne croient pas en l\'existence de Dieu',
      category: 'Croyance',
      description: 'Arguments rationnels et textuels prouvant l\'existence du Créateur',
      tags: 'Tawhid,Theologie,Existence'
    },
    { 
      id: 2,
      title: 'Réplique aux égarés qui attribuent à Dieu le corps et l\'endroit',
      category: 'Croyance',
      description: 'Réfutation des anthropomorphistes selon les preuves textuelles et rationnelles',
      tags: 'Asharite,Anthropomorphisme,Aqida'
    },
    { 
      id: 3,
      title: 'Réplique à ceux qui croient que Dieu serait localisé dans le ciel ou sur un trône',
      category: 'Croyance',
      description: 'Explication de la doctrine sunnite concernant l\'Istawa',
      tags: 'Trone,Ciel,Interpretation'
    },
    { 
      id: 4,
      title: 'Réplique à ceux qui interdisent la récitation du Qour\'an pour les morts musulmans',
      category: 'Pratiques',
      description: 'Preuves de la validité de cette pratique selon les 4 écoles',
      tags: 'Fatiha,Don,Benefice'
    },
    { 
      id: 5,
      title: 'Réplique à ceux qui interdisent le tawassoul',
      category: 'Pratiques',
      description: 'Analyse détaillée des arguments pour et contre',
      tags: 'Intercession,Proximite,Salafisme'
    },
    { 
      id: 6,
      title: 'L\'innovation (al-bid^ah)',
      category: 'Concept',
      description: 'Explication des différents types d\'innovations en Islam',
      tags: 'Bidah,Sunna,Classification'
    },
    { 
      id: 7,
      title: 'Réplique à ceux qui interdisent le tabarrouk',
      category: 'Pratiques',
      description: 'Preuves historiques et textuelles de cette pratique',
      tags: 'Reliques,Benefice,Compagnons'
    },
    { 
      id: 8,
      title: 'Réplique à ceux qui soutiennent la théorie de Darwin',
      category: 'Science',
      description: 'Analyse islamique de la théorie de l\'évolution',
      tags: 'Creation,Evolution,Biologie'
    },
    { 
      id: 9,
      title: 'Extraits de livres de savants',
      category: 'Savoirs',
      description: 'Citations clés des grands érudits de l\'Islam',
      tags: 'Citations,Erudits,References'
    }
  ];

  const categories = [...new Set(repliques.map(item => item.category))];
  const allTags = [...new Set(repliques.flatMap(item => item.tags.split(',')))];

  const handleTopicClick = (title: string) => {
    const replique = repliques.find(r => r.title === title);
    if (replique) {
      switch (replique.id) {
        case 1:
          navigate('/repliques/existence-dieu');
          break;
        case 2:
          navigate('/repliques/allahexistesansendroit');
          break;
        // Ajoutez d'autres cas selon vos besoins
        default:
          navigate(`/repliques/${replique.id}`);
      }
    }
  };

  const filteredRepliques = repliques.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

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
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Répliques islamiques aux idées erronées et aux doutes courants
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12 relative z-10">
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
                placeholder="Rechercher une réplique..."
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
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCategory && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2"
            >
              <span className="font-medium text-emerald-800 dark:text-emerald-200">
                Filtre : <span className="font-bold">{selectedCategory}</span>
              </span>
              <button 
                onClick={() => setSelectedCategory(null)}
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
            {filteredRepliques.length === 0 ? (
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
                      setSelectedCategory(null);
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
                  {filteredRepliques.length} réplique{filteredRepliques.length > 1 ? 's' : ''} trouvée{filteredRepliques.length > 1 ? 's' : ''}
                </m.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRepliques.map((replique, index) => (
                    <m.div
                      key={replique.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden cursor-pointer"
                      onClick={() => handleTopicClick(replique.title)}
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
                      
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                              {replique.title}
                            </h3>
                            <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs">
                              {replique.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {replique.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {replique.tags.split(',').map(tag => (
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
                        </div>
                      </div>
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
            "Quérir la science de la religion est une obligation pour tout musulman"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Répliques Islamiques</p>
        </div>
      </footer>
    </div>
  );
};

export default Repliques;