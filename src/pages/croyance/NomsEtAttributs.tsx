import React, { useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * « Les Attributs d'Allah » — les treize attributs qu'il est du devoir de
 * connaître (aṣ-ṣifāt al-wājiba). Structure : sommaire ancré (sticky) + une
 * section par attribut. Corps en romain (l'italique est réservé à l'emphase).
 * L'énumération (noms + glose FR) est la liste reconnue ; l'exposé détaillé de
 * chaque attribut est saisi/vérifié par l'auteur.
 */
interface Attribut { id: string; nom: string; gloss: string; corps?: string }

const ATTRIBUTS: Attribut[] = [
  { id: 'wujud',        nom: 'Al-Wujūd',                     gloss: "l'existence" },
  { id: 'qidam',        nom: 'Al-Qidam',                     gloss: "l'éternité sans début" },
  { id: 'baqa',         nom: 'Al-Baqāʾ',                     gloss: "la pérennité sans fin" },
  { id: 'mukhalafa',    nom: 'Al-Mukhālafatu li-l-ḥawādith', gloss: "la non-ressemblance aux créatures" },
  { id: 'qiyam',        nom: 'Al-Qiyāmu bi-nafsih',          gloss: "le fait de ne dépendre de rien" },
  { id: 'wahdaniyya',   nom: 'Al-Waḥdāniyya',                gloss: "l'unicité" },
  { id: 'qudra',        nom: 'Al-Qudra',                     gloss: "la toute-puissance" },
  { id: 'irada',        nom: 'Al-Irāda',                     gloss: "la volonté" },
  { id: 'ilm',          nom: 'Al-ʿIlm',                      gloss: "le savoir (l'omniscience)" },
  { id: 'hayat',        nom: 'Al-Ḥayāt',                     gloss: "la vie" },
  { id: 'sam',          nom: 'As-Samʿ',                      gloss: "l'ouïe" },
  { id: 'basar',        nom: 'Al-Baṣar',                     gloss: "la vue" },
  { id: 'kalam',        nom: 'Al-Kalām',                     gloss: "la parole" },
];

export const NomsEtAttributs: React.FC = () => {
  usePageTitle("Les Attributs d'Allah");
  const items = useMemo(() => ATTRIBUTS, []);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les Attributs d'Allah"
        subtitle="Les treize attributs qu'il est du devoir de connaître, exempt de tout lieu, forme et ressemblance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: "Attributs d'Allah" }]}
      />

      <main className="max-w-5xl mx-auto px-5 py-8 pb-16">
        <p className="text-ink max-w-[65ch] mb-6">
          Il est un devoir de connaître treize attributs d'Allah. Allah est exempt de tout lieu,
          de toute direction et de toute ressemblance avec Ses créatures :{' '}
          <em>rien ne Lui ressemble</em>. On affirme de Lui ce que le Coran et la Sunna ont affirmé,
          sans Lui attribuer de corps, de forme ni de limite.
        </p>

        <div className="grid grid-cols-1 min-[860px]:grid-cols-[220px_1fr] gap-7">
          {/* Sommaire ancré */}
          <nav aria-label="Sommaire" className="self-start min-[860px]:sticky min-[860px]:top-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">Les treize attributs</p>
            <ol className="list-none m-0 p-0">
              {items.map((a, i) => (
                <li key={a.id}>
                  <a href={`#${a.id}`} className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg text-sm text-ink hover:bg-green-soft hover:text-green-deep">
                    <span className="font-display font-semibold text-gold text-[13px] tabular-nums">{i + 1}</span>
                    {a.nom}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div>
            {items.map((a, i) => (
              <section key={a.id} id={a.id} className="mb-8" style={{ scrollMarginTop: 20 }}>
                <h2 className="font-display font-semibold text-green-deep text-[22px] mb-2 flex items-center gap-2.5">
                  <span className="w-[26px] h-[26px] rounded-full bg-green-soft text-green grid place-items-center text-sm shrink-0 font-display tabular-nums">{i + 1}</span>
                  {a.nom} <span className="text-muted font-sans text-base font-normal">— {a.gloss}</span>
                </h2>
                {a.corps
                  ? <p className="text-ink leading-relaxed max-w-[65ch]">{a.corps}</p>
                  : <p className="text-muted italic">Exposé à compléter.</p>}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NomsEtAttributs;
