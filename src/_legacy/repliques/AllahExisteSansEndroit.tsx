import React from 'react';
import { m } from 'framer-motion';

const AllahExisteSansEndroit: React.FC = () => {
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
            className="text-4xl md:text-5xl font-bold text-white mb-6 font-amiri"
          >
            Réplique aux égarés qui attribuent à Dieu le corps et l'endroit
          </m.h1>
          <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
            La croyance authentique de Ahlou s-Sounnah concernant l'existence de Allah
          </p>
        </div>
      </m.header>

      <main className="container mx-auto px-4 py-12 -mt-12">
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-amber-200 dark:border-emerald-800"
        >
          {/* Section 1 : L'existence */}
          <section className="space-y-8 mb-12">
            <m.h2 
              whileHover={{ x: 5 }}
              className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 border-b border-amber-200 dark:border-emerald-700 pb-2 font-amiri"
            >
              Preuves textuelles des savants
            </m.h2>

            {[
              {
                author: "Aliyy Ibnou Abi Talib",
                period: "40 H",
                text: "Allah existe de toute éternité alors qu'il n'y a pas d'endroit de toute éternité et Il est maintenant tel qu'Il est de toute éternité",
                source: "Al-Farqou bayna l-Firaq, page 333"
              },
              {
                author: "Zaynou l-^Abidin ^Aliyy fils de Al-Houçayn",
                period: "94 H",
                text: "C'est Toi Allah Qu'aucun endroit ne contient",
                source: "Ithafou s-sadati l-Mouttaqin, tome 4 page 380"
              },
              
              {
                author: "L'Imam, le grand Moujtahid Abou Hanifah An-Nou^man Ibnou Thabit l'un des savants du Salaf les plus réputés, l'Imam de l'école hanafite a dit :",
                period: "150 H",
                text: "Allah ta^ala sera vu dans l'au-delà, les croyants Le verront alors qu'ils seront eux au paradis, avec les yeux de leur tête, sans aucune ressemblance ni aucune quantité, et il n'y aura pas de distance entre Lui et Ses créatures",
                source: "Il a cité cela dans son livre Al-Fiqhou l-'akbar. ^Aliyy l-Qari l'a expliqué dans le livre charhou l-Fiqhi l-'akbar page 136"
              },
              {
                author: "l'Imam, le Chaykh des Mouhaddith Abou ^Abdi l-Lah Mouhammad Ibnou 'Isma^il Al-Bou­khariyy, l'auteur du fameux « Sahih »",
                period: "256 H",
                text: "Le Chaykh ^Aliyy Ibnou Khalaf le Malikite, l'un des commenta­teurs du « Sahih » de Al-Boukhariyy, décédé en 449 de l'Hégire a dit : « L'objectif de Al-Boukhariyy dans ce chapitre, c'est de répliquer aux Jahmites qui ont attribué le corps à Allah en s'attachant à ces sens apparents alors qu'il a été authentifié que Allah n'est pas un corps. Il n'a donc pas besoin d'un endroit où s'établir, Il existe de toute éternité alors qu'il n'y a pas d’endroit de toute éternité",
                source: "Fathou l-Bari tome 13 page 416"
              },
              {
                author: "Le spécialiste de la langue Ibrahim Ibnou s-Sourriyy Az-Zajjaj, l'un des linguistes les plus connus",
                period: "311 H",
                text: "Allah ta^ala est ^Aliyyoun – Celui Qui a la supériorité absolue– sur les créatures par Sa puissance. Il ne faut donc pas aller dans le sens de l'éléva­tion spatiale car nous avons indiqué que ceci n'est pas possible au sujet de Ses attributs exempts d'imperfection. Il n'est pas permis de considérer qu'Il serait accessible à l'ima­gination. Que Allah soit exempté de tout cela d'une totale exemption ",
                source: "Tafsirou l-'Asma'i l-Housna page 48"
              },
               {
                author: "L'Imam Abou Ja^far 'Ahmad Ibnou Salamah At-Tahawiyy le hanafite",
                period: "321 H",
                text: " Allah est exempt des limites, des fins, des côtés, des organes et des membres. Les six directions ne Le délimitent pas, contrairement à toutes les créatures",
                source: "l-^Aqidatou t-Tahawiyyah"
              },
              {
                author: "Le Hafidh, Mouhammad Ibnou Hibban l'auteur du « Sahih » réputé sous le nom de « Sahihou ibn Hibban »",
                period: "354 H",
                text: " La louange est à Allah, Celui Qui est exempt de limite et Qui n’est donc pas limité pour être contenu, Qui est exempt de terme et n'est donc pas décompté pour être anéanti, Qui n'est cerné par aucun des endroits et Qui n'est pas sujet à l'écoule­ment du temps",
                source: "Ath-Thiqat tome 1 page 1"
              },
              {
                author: "Le Hafidh Abou Bakr Ahmad Ibnou l-Houçayn Al-Bayhaqiyy »",
                period: "458 H",
                text: "Certains de nos compa­gnons ont tiré un argument, pour renier l'endroit à Son sujet, de la parole du Prophète : اللّـٰهُمَّ أَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَىءٌ وَأَنْتَ البَاطِنُ فَلَيْسَ دُونك شَىءٌ qui signifie : « Ô Allah, Tu es Adh-Dhahir, rien n'est donc au-dessus de Toi et Tu es Al-Batin, rien n’est donc en dessous de Toi ». Puisque rien n'est au-dessus de Lui et rien n'est en dessous de Lui, Il n’est donc pas dans un endroit » fin de citation",
                source: "Al-'Asma'ou wa s-Sifat page 400"
              },
                
               
              

           ].map((quote, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-xl p-6 mb-6 border border-amber-100 dark:border-emerald-800"
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <svg viewBox="0 0 100 100" className="text-amber-500 dark:text-emerald-400">
                    <path fill="currentColor" d="M20,20 Q30,10 40,20 T60,20 T80,20 T100,20" className="transform rotate-45"/>
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2 font-amiri">
                  {quote.author} <span className="text-sm text-emerald-700 dark:text-emerald-400">({quote.period})</span>
                </h3>
                <p className="font-amiri text-gray-700 dark:text-gray-300 text-xl leading-relaxed mb-4">
                  {quote.text}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {quote.source}
                </p>
              </m.div>
            ))}
          </section>

          {/* Section 2 : La non ressemblance */}
          <section className="space-y-8 mb-12">
            <m.h2 
              whileHover={{ x: 5 }}
              className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 border-b border-amber-200 dark:border-emerald-700 pb-2 font-amiri"
            >
              L'attribut de non-ressemblance
            </m.h2>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-emerald-800"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center md:text-right w-full md:w-1/3">
                  <p className="font-amiri text-3xl text-gray-900 dark:text-white mb-2">
                    لَيْسَ كَمِثْلِهِ شَىءٌ
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">(layça kamithlihi chay')</p>
                </div>
                <div className="w-full md:w-2/3">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "Absolument rien ne ressemble à Allah" [Sourate Ach-Choura, verset 11]
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    L'Imam At-Tahawiyy (mort en 323 H) a dit : « Il est exempt des limites, des fins, des côtés, des organes et des membres ; Il n'est pas concerné par les six directions contrairement à toutes les créatures ».
                  </p>
                </div>
              </div>
            </m.div>
          </section>

          {/* Section 3 : L'unicité */}
          <section className="space-y-8">
            <m.h2 
              whileHover={{ x: 5 }}
              className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 border-b border-amber-200 dark:border-emerald-700 pb-2 font-amiri"
            >
              L'unicité divine
            </m.h2>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-emerald-800"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center md:text-right w-full md:w-1/3">
                  <p className="font-amiri text-3xl text-gray-900 dark:text-white mb-2">
                    وَإِلَهُكُمْ إِلَـهٌ وَاحِدٌ
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">(wa 'ilāhoukoum 'ilāhoun wāḥid)</p>
                </div>
                <div className="w-full md:w-2/3">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "Votre Dieu est un Dieu unique" [Sourate Al-Baqarah, verset 163]
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    L'Imam Abou Hanifah a dit : <strong>« Allah est Unique, non pas du point de vue numérique, mais dans le sens qu'Il n'a pas d'associé »</strong>. La preuve rationnelle montre qu'il est impossible selon la raison qu'il y ait un associé au sujet de Dieu.
                  </p>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-emerald-800 mt-6"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center md:text-right w-full md:w-1/3">
                  <p className="font-amiri text-3xl text-gray-900 dark:text-white mb-2">
                    لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّـهُ لَفَسَدَتَا
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">(Law kāna fīhimā 'ālihatoun 'il-la l-Lāhou lafaçadatā)</p>
                </div>
                <div className="w-full md:w-2/3">
                  <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                    "S'il y avait [pour le ciel et la terre] des dieux hormis Allah, [les cieux et les terres] seraient certes en discordance" [Sourate Al-Anbiya, verset 22]
                  </p>
                </div>
              </div>
            </m.div>
          </section>
        </m.div>
      </main>

      {/* Pied de page décoratif */}
      <footer className="bg-emerald-900 dark:bg-emerald-950 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-300 mb-4 font-amiri text-xl">
            "La parole la plus véridique est le Livre d'Allah, et la meilleure guidée est la guidée de Muhammad"
          </p>
          <p className="text-emerald-200">© {new Date().getFullYear()} Répliques Islamiques</p>
        </div>
      </footer>
    </div>
  );
};

export default AllahExisteSansEndroit;