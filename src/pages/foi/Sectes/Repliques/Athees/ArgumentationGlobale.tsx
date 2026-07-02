import React from 'react';
import { m } from 'framer-motion';

const ArgumentationGlobale: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-emerald-950 py-12">
      {/* En-tête avec motif islamique */}
      <m.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-16 bg-emerald-800 dark:bg-emerald-950 overflow-hidden mb-12"
      >
        <div className="absolute inset-0 opacity-20 bg-arabesque" />
        <div className="container mx-auto px-4 relative">
          <m.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-white mb-2 font-amiri text-center"
          >
            Argumentation Globale
          </m.h1>
        </div>
      </m.header>

      <div className="container mx-auto px-4 space-y-8">
        {/* Section principale */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-emerald-100 dark:border-emerald-900"
        >
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri mb-6">
            Exposé de l'argumentation globale
          </h2>
          
          <div className="space-y-6 text-gray-600 dark:text-gray-300">
            <p>
              Les savants de l'Islam ont dit qu'il est un devoir pour toute personne responsable de connaître la preuve globale selon la raison au sujet de l'existence de Allah.
            </p>     
            
            <p>
              Un exemple d'argumentation globale, c'est comme de dire :
            </p>
            
            <p>
              * <b>L'écriture a nécessairement qui a tracé cette écriture</b>. La raison n'accepte pas qu'une série de lettres se soient assemblées ainsi pour former des mots pour ensuite former des phrases qui ont un sens. La raison confirme que cet écrit a eu nécessairement qui l'a écrit.
            </p>
            
            <p>
              * <b>Une construction comme une maison a nécessairement qui l'a bâtit</b>, qui a élevé cette construction et l'a édifié ainsi avec ses fenêtres, sa gouttière, sa peinture, ses lampes. Ainsi, une personne qui a une raison saine, si elle passe devant un tel édifice ne doute pas qu'il a eu besoin de qui le construit, même si elle n'a pas vu les plans de cet édifice, ni les ouvriers, sa raison lui confirme cette information.
            </p>
                  
            <p>
              Les savants ont dit que l'écriture et la construction sont des parties de ce monde, et ce qui a été dit concernant des parties de ce monde s'applique également à tout ce monde, puisque le monde se compose de ses parties. Ce qui a été dit pour l'écriture et la construction est donc valable pour tout ce monde. Ce monde à plus forte raison a nécessairement Qui lui a donné l'existence.
            </p>
            
            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri">
              Ceci est un exemple d'argumentation globale.
            </h3>
            
            <p>
              Un autre exemple d'argumentation globale, c'est comme si une personne dit : "moi, j'existe après n'avoir pas existé, et tout ce qui existe après n'avoir pas existé a nécessairement Qui l'a fait existé. J'ai donc nécessairement besoin d'un Être Qui m'a donné l'existence et Qui n'a absolument aucune ressemblance avec moi". Et cette argumentation est également valable pour toutes les parties de ce monde, pour toutes les créatures. Et Celui qui a donné l'existence à ce monde, n'a absolument aucune ressemblance avec ce monde, sinon Il aurait eut Lui aussi besoin d'un être qui Lui donne l'existence.        
            </p>
          </div>
        </m.div>
      </div>
    </div>
  );
};

export default ArgumentationGlobale;