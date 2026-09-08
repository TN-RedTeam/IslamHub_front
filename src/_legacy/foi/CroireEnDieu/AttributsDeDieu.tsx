import React from 'react';
import { m } from 'framer-motion';

const AttributsDeDieu: React.FC = () => {
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
            Les Attributs d'Allah
          </m.h1>
        </div>
      </m.header>

      <div className="container mx-auto px-4 space-y-12">
        {/* Section 1 : L'existence */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-emerald-100 dark:border-emerald-900"
        >
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri mb-6">
            L'attribut de Dieu - Allāh - l'existence
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Dieu existe de toute éternité, sans début. Allāh Ta`ālā [Ta`ālā veut dire qu'Il est exempt d'imperfection] dit :
            </p>
            <p className="font-amiri text-2xl text-center my-4">
              ﴿ أَفِي اللهِ شَكّ ﴾
            </p>
            <p className="text-center">(‘Afī l-Lāhi chakk)</p>
            <p className="italic">
              ce qui signifie : « Il n'y a pas de doute au sujet de l'existence de Allāh ».
            </p>
            <p>
              L'existence de Dieu n'est pas due à la création de quiconque. Dieu existe et n'a pas de ressemblance avec les créatures. Il existe sans comment et sans endroit comme l'a dit l'Imām `Aliyy que Allāh l'agrée et honore son visage : « Allāh est de toute éternité alors qu'il n'y a pas d'endroit de toute éternité, et Il est maintenant tel qu'Il est de toute éternité ».
            </p>
            <p>
              L'Imâm Aḥmad Ar-Rifā`iyy a dit :
            </p>
            <p className="font-amiri text-2xl text-center my-4">
              غايةُ الـمَعْرِفَةِ بِالله الإيقانُ بِوُجُودِه تعالى بلا كَيفٍ ولا مَكان
            </p>
            <p className="italic">
              Ce qui signifie : « La limite de la connaissance que l'on peut avoir de Allāh, c'est d'avoir la certitude que Son existence Ta`ālā est sans comment et sans endroit ».
            </p>
            <p>
              Notre connaissance de Dieu ne peut pas atteindre la réalité de Dieu, mais elle concerne ce qui est obligatoire à Son Sujet comme attributs de perfection, telle que la science et la puissance, ce qui est impossible à Son Sujet comme le fait d'avoir un associé, et ce qui est possible à Son Sujet comme le fait de créer quelque chose et de l'anéantir.
            </p>
          </div>
        </m.div>

        {/* Section 2 : La non ressemblance avec les créatures */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-emerald-100 dark:border-emerald-900"
        >
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri mb-6">
            L'attribut de Dieu - Allāh - la non ressemblance avec les créatures
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Dieu a pour attribut toute perfection qui est digne de Lui et Il est exempt de toute imperfection c'est-à-dire de tout ce qui n'est pas digne de Lui ta`ālā, comme l'ignorance, l'impuissance, l'endroit, le lieu, la couleur et la limite. Allāh Ta`ālā dit :
            </p>
            <p className="font-amiri text-2xl text-center my-4">
              ﴿ لَيْسَ كَمِثْلِهِ شَىءٌ ﴾
            </p>
            <p className="text-center">(layça kamithlihi chay')</p>
            <p className="italic">
              ce qui signifie : « Absolument rien ne ressemble à Allāh » [soūrat Ach-Choūrā / 'āyah 11].
            </p>
            <p>
              L'Imām Aboū Ja`far At-Ṭaḥāwiyy (mort en 323 de l'Hégire) a dit : « Il est exempt – c'est-à-dire Allāh – des limites, des fins, des côtés, des organes et des membres ; Il n'est pas concerné par les six directions contrairement à toutes les créatures ».
            </p>
          </div>
        </m.div>

        {/* Section 3 : L'unicité */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-emerald-100 dark:border-emerald-900"
        >
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri mb-6">
            L'attribut de Dieu - Allāh - l'unicité
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Allāh est unique, Il n'a pas d'associé c'est-à-dire qu'Il n'a pas de second. Dieu n'est pas composé de parties comme les corps, car le Trône ou n'importe quel corps, même le plus petit est composé de parties : il est donc impossible qu'il y ait une ressemblance entre le trône et Dieu. Allāh Ta`ālā - exempté d'imperfection - dit :
            </p>
            <p className="font-amiri text-2xl text-center my-4">
              ﴿ وَإِلَهُكُمْ إِلَـهٌ وَاحِدٌ ﴾
            </p>
            <p className="text-center">(wa 'ilāhoukoum 'ilāhoun wāḥid)</p>
            <p className="italic">
              ce qui signifie : « Votre Dieu est un dieu unique » [soūrat al-Baqarah / 'āyah 163].
            </p>
            <p>
              Si Allāh Ta`ālā n'était pas unique mais multiple, le monde ne serait pas ordonné ; or le monde est ordonné : il est donc obligatoire que Allāh soit unique. L'Imām Aboū Hanīfah a dit : <strong>« Allāh est Unique, non pas du point de vue numérique, mais dans le sens qu'Il n'a pas d'associé »</strong>.
            </p>
            <p>
              La preuve rationnelle de Son unicité est qu'il est indispensable que celui qui crée l'univers soit vivant, tout-puissant, ayant une science, une volonté et un choix. Comme il a été confirmé que celui qui crée l'univers a pour attribut ce que nous avons cité, nous disons : si le monde avait deux créateurs, il serait obligatoire selon la raison que chacun d'eux soit vivant, tout-puissant, ayant une science, une volonté et un choix. Or il est possible selon la raison à deux êtres ayant le choix qu'ils divergent dans leurs choix car chacun d'entre eux n'est pas obligé d'être en accord avec l'autre dans son choix, sinon ils seraient contraints et celui qui est contraint ne peut avoir la divinité. Par conséquent, si cela était valable, si l'un des deux voulait l'opposé de ce que veut l'autre pour un même sujet, comme si l'un voulait la vie pour un homme et que l'autre voulait sa mort, il n'en irait pas autrement que leurs deux volontés se réalisent, ou que leurs deux volontés ne se réalisent pas ou que la volonté de l'un se réalise et non celle de l'autre. Il est impossible selon la raison que leurs deux volontés se réalisent du fait de leur contradiction mutuelle, c'est-à-dire que si l'un deux voulait qu'un homme vive et que l'autre voulait qu'il meure, il serait impossible que cet homme soit vivant et mort en même temps. Si leurs deux volontés ne se réalisent pas, ils sont tous les deux impuissants. Et si la volonté de l'un d'eux se réalise et celle de l'autre ne se réalise pas, alors celui dont la volonté ne se réalise pas est impuissant et celui qui est impuissant ne peut avoir la divinité et ne peut être exempt de début. Enfin si les deux volontés ne se réalisent pas alors cela confirme l'incapacité pour les deux. Cela montre clairement qu'il est impossible selon la raison l'associé au sujet de Dieu. Cette preuve est connue chez les savants du tawḥīd et elle est appelé la preuve de l'incompatibilité mutuelle. Allāh Ta`ālā dit :
            </p>
            <p className="font-amiri text-2xl text-center my-4">
              ﴿لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّـهُ لَفَسَدَتَاٌ ﴾
            </p>
            <p className="text-center">(Law kāna fīhimā 'ālihatoun 'il-la l-Lāhou lafaçadatā)</p>
            <p className="italic">
              ce qui signifie: <strong>« S'il y avait [pour le ciel et la terre] des dieux hormis Allāh, [les cieux et les terres] seraient certes en discordance »</strong> [soūrat al-'Anbiyā' / 'āyah 22].
            </p>
          </div>
        </m.div>
      </div>
    </div>
  );
};

export default AttributsDeDieu;