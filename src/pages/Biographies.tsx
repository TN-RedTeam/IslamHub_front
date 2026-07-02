import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, X, Star, ChevronRight, BookOpen } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const Biographies: React.FC = () => {
  usePageTitle('Biographies');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const biographies = [
    { 
      id: 1,
      name: 'Abu Bakr As-Siddiq', 
      title: 'Le Premier Calife', 
      category: 'Compagnon',
      description: 'Premier calife de l\'Islam et proche compagnon du Prophète (ﷺ). ^Oumar Ibnou l-Khattab a témoigné des mérites du premier des califes :\n' +
          '« Le Messager de Allah nous avait ordonné un jour de donner des aumônes et cela avait coïncidé avec de l’argent que je possédais. Je me suis dit : “Aujourd’hui je vais surpasser Abou Bakr en générosité, s’il se peut que je le surpasse un jour.” J’ai ramené la moitié de mes biens,  le Messager de Allah m’a dit : ما أبقيت لأهلك ؟ (Ma ‘abqayta li ‘ahlik ?) ce qui signifie : “Qu’as-tu laissé pour ta famille ?” Je lui ai répondu : “La même chose que ce que je donne là.” Abou Bakr a alors ramené tout ce qu’il possédait. Le Messager de Allah lui a dit : ما أبقيت لأهلك ؟  (Ma ‘abqayta li ‘ahlik ?) ce qui signifie : “Qu’as-tu laissé pour ta famille ?” Il a répondu : “Je me fie à Allah.” J’ai dit : “je ne pourrai vraiment jamais faire mieux que lui !” » Rapporté par At-Tirmidhiyy.',
      tags: 'Calife,Sahabi,Leadership'
    },
    { 
      id: 2,
      name: 'Umar ibn Al-Khattab', 
      title: 'Le Second Calife', 
      category: 'Compagnon',
      description: 'Parmi ses mérites : il est le premier à avoir mis en place la datation pour compter les années lunaires. C’est lui qui a donc instauré le calendrier de l’Hégire. Il est le premier à avoir rassemblé les gens pour accomplir la prière du qiyam Ramadan (prières surérogatoires) derrière un seul imam, alors qu’auparavant on ne l’accomplissait pas en assemblée. Il a dit à ce sujet :\n' +
          '\n' +
          '   نِعْمَتِ الْبِدْعَةُ هذه\n' +
          '\n' +
          '(ni^mati l-bid^atou hadhihi) ce qui signifie : « Qu’elle est bénéfique cette innovation ! » Il est également le premier à avoir fait des inspections de nuit pour veiller sur les musulmans. Il veillait à ce que les gens douteux ne leur nuisent pas. Il est aussi le premier à avoir été surnommé Emir des croyants.',
      tags: 'Calife,Sahabi,Justice'
    },
    {
      id: 3,
      name: '^Outhman ibnou ^Affan',
      title: 'Le troisième Calife',
      category: 'Compagnon',
      description: '^Outhman ibnou ^Affan est le troisième calife. Il fait partie des premiers convertis à l’Islam. Il a été surnommé “l’homme aux deux lumières” (Dhou n-Nourayn) car il a épousé successivement deux des filles du Messager de Allah .\n' +
          'Il a été rapporté à son sujet, que Allah l’agrée, qu’il donnait aux gens à manger la nourriture qui lui était destinée en tant qu’Emir des croyants et qu’il rentrait chez lui pour manger du pain accompagné d’huile. Ceci est une preuve de son détachement de la vie d’ici-bas.',
      tags: 'Calife,Sahabi,Justice'
    },
    {
      id: 4,
      name: 'Ali Ibn Abi Talib',
      title: 'Le quatrième Calife',
      category: 'Compagnon',
      description: 'Il est notre maître le père de Al-Haçan et de Al-Houçayn, ^Aliyy fils de Abou Talib. Il est le fils de l’oncle paternel du Messager de Allah et le gendre du Prophète car le Prophète  l’avait marié avec sa fille Fatimah. Il était le premier des enfants à être entré en Islam.\n' +
          'Il était le plus savant des compagnons. En effet, le Messager de Allah dit :\n' +
          '\n' +
          ' أَنَا مَدِينَةُ العِلْمِ وَ عَلِيٌ بَابُهَا\n' +
          '\n' +
          '(Ana madinatou l-^ilmi wa ^Aliyyoun babouha) ce qui signifie : « Je suis comme une ville de la science, et ^Aliyy en serait la porte. » Ce hadith est rapporté par al-Hakim dans son livre al-Moustadrak.\n' +
          'Que Allah les agrée tous et nous accorde des bénédictions par leurs degrés. Les compagnons ont pris le relais dans la diffusion de la science. Ils ont poursuivi l’appel à l’Islam à travers le monde.',
      tags: 'Calife,Sahabi,Justice'
    },
    { 
      id: 5,
      name: 'Aisha bint Abi Bakr', 
      title: 'Mère des Croyants', 
      category: 'Famille Prophétique',
      description: 'Épouse du Prophète (ﷺ) et érudite en hadith et jurisprudence',
      tags: 'Hadith,Femmes,Sahabiya'
    },
    { 
      id: 6,
      name: 'Imam Al-Bukhari', 
      title: 'Maître du Hadith', 
      category: 'Savant',
      description: 'Compilateur du Sahih al-Bukhari, la plus authentique collection de hadiths',
      tags: 'Hadith,Muhaddith,Fiqh'
    },

    { 
      id: 7,
      name: 'Fatimah Az-Zahra',
      title: 'fille du Messager de Allah salla l-Lahou ^alayhi wasallam',
      category: 'Compagnon',
      description: 'Fatimah, fille du Messager de Allah salla l-Lahou ^alayhi wasallam, est la meilleure des femmes de l’humanité de son époque.',
      tags: 'Education,Femmes,Histoire'
    }
  ];

  const categories = [...new Set(biographies.map(bio => bio.category))];
  const allTags = [...new Set(biographies.flatMap(bio => bio.tags.split(',')))];

  const filteredBios = biographies.filter(bio => {
    const matchesSearch = bio.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bio.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? bio.category === selectedCategory : true;
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
            Biographies Islamiques
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            Découvrez la vie des grandes figures de l'histoire musulmane
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
                placeholder="Rechercher une biographie..."
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
            {filteredBios.length === 0 ? (
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
                  {filteredBios.length} biographie{filteredBios.length > 1 ? 's' : ''} trouvée{filteredBios.length > 1 ? 's' : ''}
                </m.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBios.map((bio, index) => (
                    <m.div
                      key={bio.id}
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
                      
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800/80 flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 font-amiri">
                                {bio.name}
                              </h3>
                              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                {bio.title}
                              </p>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs">
                              {bio.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 mt-3 text-sm">
                            {bio.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {bio.tags.split(',').map(tag => (
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
            "Cherchez la connaissance du berceau jusqu'à la tombe"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Biographies Islamiques</p>
        </div>
      </footer>
    </div>
  );
};