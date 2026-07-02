import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Filter, X, Star, ChevronRight, 
  Heart, Sun, Moon, Scale, Gift, Home, ShoppingCart, 
  Users,  Landmark, Utensils, Shirt, HandCoins 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Configuration des catégories avec icônes et descriptions
const categoryConfig = [
  { 
    name: 'Croyance', 
    icon: <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    description: 'Les fondements de la foi et la théologie islamique'
  },
  { 
    name: 'Salat', 
    icon: <Sun className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    description: 'Les règles de la prière et ses conditions'
  },
  { 
    name: 'Jeûne', 
    icon: <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    description: 'Les règles du jeûne du Ramadan et des jeûnes surérogatoires'
  },
  { 
    name: 'Zakat', 
    icon: <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    description: 'Les règles de l\'aumône obligatoire et son calcul'
  },
  { 
    name: 'Mariage', 
    icon: <Gift className="h-6 w-6 text-pink-600 dark:text-pink-400" />,
    description: 'Les règles du mariage, divorce et relations conjugales'
  },
  { 
    name: 'Ventes', 
    icon: <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    description: 'Les règles des transactions commerciales licites'
  },
  { 
    name: 'Famille', 
    icon: <Home className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
    description: 'Les droits et devoirs familiaux en Islam'
  },
 {
  name: 'Femmes',
  icon: (
    <img
      src="./public/img/hijab.svg"
      alt="Icône femmes"
      className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400"
    />
  ),
  description: 'Les règles spécifiques concernant les femmes'
},

  { 
    name: 'Héritage', 
    icon: <Landmark className="h-6 w-6 text-amber-800 dark:text-amber-400" />,
    description: 'Les règles de répartition de l\'héritage'
  },
  { 
    name: 'Alimentation', 
    icon: <Utensils className="h-6 w-6 text-green-600 dark:text-green-400" />,
    description: 'Les règles concernant la nourriture halal et haram'
  },
  { 
    name: 'Vêtements', 
    icon: <Shirt className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
    description: 'Les règles vestimentaires en Islam'
  },
  { 
    name: 'Transactions', 
    icon: <HandCoins className="h-6 w-6 text-lime-600 dark:text-lime-400" />,
    description: 'Les règles des transactions financières'
  }
];

export const Jurisprudence: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const schools = [
    'Toutes les écoles',
    'Hanafite',
    'Malikite',
    'Chafiite',
    'Hanbalite'
    
  ];

  const handleTopicClick = (topic: string) => {
    // Ajout de l'école sélectionnée dans la navigation si elle existe
    const schoolParam = selectedSchool ? `?school=${encodeURIComponent(selectedSchool)}` : '';
    navigate(`/jurisprudence/${topic.toLowerCase()}${schoolParam}`);
  };

  const filteredCategories = categoryConfig.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? category.name === selectedCategory : true;
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
            Jurisprudence Islamique
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Découvrez les règles et lois islamiques selon les différentes écoles
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un thème..."
                  className="w-full pl-12 pr-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-amiri"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
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
                    {categoryConfig.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative md:w-64">
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <select
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none font-medium"
                    value={selectedSchool || ''}
                    onChange={(e) => setSelectedSchool(e.target.value || null)}
                  >
                    {schools.map(school => (
                      <option key={school} value={school === 'Toutes les écoles' ? '' : school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(selectedCategory || selectedSchool) && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
              >
                {selectedCategory && (
                  <m.div
                    className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-4 py-2"
                  >
                    <span className="font-medium text-emerald-800 dark:text-emerald-200">
                      Catégorie : <span className="font-bold">{selectedCategory}</span>
                    </span>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 p-1 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </m.div>
                )}
                {selectedSchool && (
                  <m.div
                    className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/30 rounded-lg px-4 py-2"
                  >
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      École : <span className="font-bold">{selectedSchool}</span>
                    </span>
                    <button 
                      onClick={() => setSelectedSchool(null)}
                      className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 p-1 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </m.div>
                )}
              </m.div>
            )}
          </div>
        </m.section>

        {/* Thèmes de jurisprudence */}
        <section className="pb-16">
          <AnimatePresence>
            {filteredCategories.length === 0 ? (
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
                      setSelectedSchool(null);
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
                  {filteredCategories.length} thème{filteredCategories.length > 1 ? 's' : ''} trouvé{filteredCategories.length > 1 ? 's' : ''}
                  {selectedSchool && ` (École ${selectedSchool})`}
                </m.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCategories.map((category, index) => (
                    <m.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900 dark:to-amber-900 rounded-2xl p-6 shadow-xl border border-amber-200 dark:border-emerald-800 overflow-hidden cursor-pointer"
                      onClick={() => handleTopicClick(category.name)}
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
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center p-2 mt-1">
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                            {category.name}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                            {category.description}
                          </p>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            <m.span
                              whileHover={{ scale: 1.05 }}
                              className="text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full flex items-center"
                            >
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Explorer
                            </m.span>
                            
                            {selectedSchool && (
                              <m.span
                                whileHover={{ scale: 1.05 }}
                                className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full"
                              >
                                {selectedSchool}
                              </m.span>
                            )}
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
            "Celui à qui Allah veut du bien, Il lui donne la compréhension de la religion"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Jurisprudence Islamique</p>
        </div>
      </footer>
    </div>
  );
};