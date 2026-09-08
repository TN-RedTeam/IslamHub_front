import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, X, ChevronRight, BookOpen } from 'lucide-react';

const CroyanceEnDieu: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const croyanceEnDieu = [
    { 
      id: 1, 
      name: 'Existence de Dieu', 
      path: '/croyance/CroireEnDieu/ExistenceDeDieu',
      category: 'Existence',
      description: 'Existence de Dieu selon la raison',
      tags: 'Woujoud,existence,Preuve'
    },
    { 
      id: 1, 
      name: 'Attributs de Dieu', 
      path: '/croyance/CroireEnDieu/AttributsDeDieu',
      category: 'Attributs',
      description: 'Comprendre les attributs parfaits et éternels d\'Allah',
      tags: 'Sifat,Parfait,Éternel'
    },
    { 
      id: 2, 
      name: 'Dieu existe sans endroit', 
      path: '/croyance/CroireEnDieu/DieuExisteSansEndroit',
      category: 'Unicité',
      description: 'Allah existe sans besoin d\'endroit ni de direction',
      tags: 'Tawhid,Transcendance,Incomparable'
    },
    { 
      id: 3, 
      name: 'Dieu ne ressemble pas aux créatures', 
      path: '/croyance/CroireEnDieu/DieuSansComment',
      category: 'Unicité',
      description: 'Allah n\'a aucune ressemblance avec Ses créatures',
      tags: 'Takyeef,Négation,Similitude'
    },
    { 
      id: 4, 
      name: 'Les noms parfaits de Dieu', 
      path: '/croyance/CroireEnDieu/LesNomsDeDieu',
      category: 'Attributs',
      description: 'Les 99 noms d\'Allah et leurs significations',
      tags: 'Asma-ul-Husna,Invocation,Adoration'
    },
  ];

  const categories = [...new Set(croyanceEnDieu.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const filteredCroyance = croyanceEnDieu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
            Croyance en Allah
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Les fondements de la croyance en notre Créateur
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
                placeholder="Rechercher une croyance..."
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
            {filteredCroyance.length === 0 ? (
              <m.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🕌</div>
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
                  {filteredCroyance.length} aspect{filteredCroyance.length > 1 ? 's' : ''} de la croyance trouvé{filteredCroyance.length > 1 ? 's' : ''}
                </m.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCroyance.map((item, index) => (
                    <m.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden"
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
                      
                      <Link to={item.path} className="block">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                  {item.category}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs">
                                {item.category}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
                              {item.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              {item.tags.split(',').map(tag => (
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
                      </Link>
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
            "Allah existe sans comment, sans endroit et ne ressemble à rien de ce qui existe"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Croyance en Allah</p>
        </div>
      </footer>
    </div>
  );
};

export default CroyanceEnDieu;