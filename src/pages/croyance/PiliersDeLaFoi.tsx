import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Markdown } from '../../components/Markdown';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Exposé éditorial « Les piliers de la foi » (les six fondements).
 * Structure scaffoldée ; le contenu doctrinal de chaque pilier est saisi/vérifié
 * par l'auteur (marqué « Bientôt » tant qu'il n'est pas prêt — rien n'est fabriqué).
 */
const CONTENU = `
La foi (al-īmān) repose sur six fondements, énoncés dans le hadith de Jibrīl :
croire en Allah, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier,
et au destin — qu'il soit en bien ou en mal.

### 1. La croyance en Allah
> Il est un devoir de croire que Dieu existe, il n’y pas de doute au sujet de Son existence, qu’Il est l’Unique Créateur, et qu’Il existe sans endroit, sans direction et sans comment ;

### 2. La croyance en Ses anges
> Il est un devoir de croire en l’existence des anges. Ils sont des esclaves honorés par Dieu. Ils sont créés de lumière. Ils ne désobéissent jamais à Dieu ; ils ne sont ni mâles ni femelles, ils ne mangent pas et ne boivent pas, ils ne dorment pas et ne se reproduisent pas ;

### 3. La croyance en Ses messagers
> Il est un devoir de croire à tous les Prophètes et Messagers envoyés par Dieu depuis ءادم Adam jusqu’à محمد Mouhammad, en passant par نوح Nouh -Noé-, إبراهيم Ibrahim -Abraham-, موسى Mouça -Moïse-, et عيسى ^Iça -Jésus- et qu’ils étaient tous musulmans.

### 4. La croyance en Ses livres
> Ils sont au nombre de cent quatre. Les plus connus sont التوراة At-Tawrah -La Torah authentique-, الإنجيل Al-Injil -l’Evangile authentique-, الزبور Az-Zabour -Psaumes authentiques-, et le dernier révélé القرءان Al-Qour’an. 



### 5. La croyance au Jour dernier
> Il est un devoir de croire Dieu nous ressuscitera et nous jugera pour nos actes.

### 6. La croyance au destin (al-qadar)
> l est un devoir de croire que tout ce qui arrive a lieu par la prédestination de Dieu, le bien et le mal ont donc lieu par la création de Dieu, selon Sa science et Sa volonté. Mais Dieu agrée le bien et n’agrée pas le mal.

Il est aussi un devoir de croire que le Prophète محمد Mouhammad صلى الله عليه وسلم est le dernier des prophètes et qu’il est le Maître de tous les fils de ‘Adam, c‘est à dire qu’il est le meilleur être humain et le meilleur être créé.
`;

export const PiliersDeLaFoi: React.FC = () => {
  usePageTitle('Les piliers de la foi');
  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les piliers de la foi"
        subtitle="Les six fondements de la croyance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: 'Piliers de la foi' }]}
      />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <article className="rounded-card border border-line bg-surface p-6 sm:p-8 shadow-card">
          <Markdown>{CONTENU}</Markdown>
        </article>
      </main>
    </div>
  );
};

export default PiliersDeLaFoi;
