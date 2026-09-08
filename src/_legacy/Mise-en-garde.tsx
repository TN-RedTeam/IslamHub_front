import React from 'react';
import { m } from 'framer-motion';
import { BookOpen, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importez useNavigate

const MiseEnGarde: React.FC = () => {
    const navigate = useNavigate(); // Utilisez useNavigate pour la navigation

    const handleTopicClick = (topic: string) => {
        // Redirigez vers la page correspondante
        if (topic === 'Croyance') {
            navigate('/croyance');
        }
        // Ajoutez d'autres conditions pour les autres thèmes
    };

    return (
        <div className="space-y-8">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-16 bg-arabesque bg-cover bg-center"
            >
                <div className="absolute inset-0 bg-emerald-900/80 dark:bg-emerald-950/90 backdrop-blur-sm"></div>
                <div className="relative text-center px-4">
                    <h1 className="text-4xl font-bold text-white mb-4 font-amiri">Jurisprudence Islamique</h1>
                    <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
                        Apprendre les lois et les régles de l'Islam
                    </p>
                </div>
            </m.div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search topics..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button className="flex items-center justify-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors">
                            <Filter className="h-5 w-5 mr-2" />
                            Categories
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['Croyance', 'Salat', 'Jeûne', 'Zakat', 'Mariage', 'Ventes', 'Famille', 'Femmes'].map((topic, index) => (
                        <m.div
                            key={topic}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-emerald-100 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group cursor-pointer"
                            onClick={() => handleTopicClick(topic)} // Gestion du clic
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                                    <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-amiri">
                                        {topic}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        En savoir plus
                                    </p>
                                </div>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MiseEnGarde