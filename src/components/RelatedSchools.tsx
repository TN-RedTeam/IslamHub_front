import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MADHHAB_AR } from '../constants/madhaheb';

type AccentKey = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';

// Classes littérales par école (Tailwind doit les voir en entier pour les générer).
const ACCENT: Record<AccentKey, { filet: string; text: string; soft: string; ring: string }> = {
  hanafi:  { filet: 'border-t-ecole-hanafi',  text: 'text-ecole-hanafi',  soft: 'bg-ecole-hanafi/10',  ring: 'ring-ecole-hanafi/30' },
  maliki:  { filet: 'border-t-ecole-maliki',  text: 'text-ecole-maliki',  soft: 'bg-ecole-maliki/10',  ring: 'ring-ecole-maliki/30' },
  shafii:  { filet: 'border-t-ecole-shafii',  text: 'text-ecole-shafii',  soft: 'bg-ecole-shafii/10',  ring: 'ring-ecole-shafii/30' },
  hanbali: { filet: 'border-t-ecole-hanbali', text: 'text-ecole-hanbali', soft: 'bg-ecole-hanbali/10', ring: 'ring-ecole-hanbali/30' },
};

const SCHOOLS: { key: AccentKey; name: string; path: string; desc: string; arIndex: number }[] = [
  { key: 'hanafi',  name: 'Ḥanafī',  path: '/ecoles/Hanafi',    desc: "L'école de la raison et de l'opinion",       arIndex: 0 },
  { key: 'maliki',  name: 'Mālikī',  path: '/ecoles/Malikite',  desc: "L'école de la pratique médinoise",           arIndex: 1 },
  { key: 'shafii',  name: 'Shāfiʿī', path: '/ecoles/Shafii',    desc: "L'école équilibrée entre texte et raison",   arIndex: 2 },
  { key: 'hanbali', name: 'Ḥanbalī', path: '/ecoles/Hanbalite', desc: "L'école du texte et de la tradition",        arIndex: 3 },
];

/**
 * Bloc « Découvrir les autres écoles » — cartes unifiées (charte Phase 10.5) :
 * fond ivoire, filet supérieur dans la couleur désaturée de l'école et médaillon
 * teinté portant l'initiale arabe. Exclut l'école courante.
 */
export const RelatedSchools: React.FC<{ current: AccentKey }> = ({ current }) => {
  const others = SCHOOLS.filter((s) => s.key !== current);
  return (
    <section className="mt-16">
      <h3 className="text-2xl font-bold text-green-deep mb-6 font-display text-center">
        Découvrir les autres écoles
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {others.map((s) => {
          const a = ACCENT[s.key];
          return (
            <Link
              key={s.path}
              to={s.path}
              className={`group flex flex-col rounded-card border border-line ${a.filet} border-t-[3px] bg-ivory shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green`}
            >
              <div className="flex items-center gap-3.5 px-5 pt-5">
                <span
                  className={`shrink-0 w-11 h-11 rounded-full grid place-items-center font-arabic-name text-xl ring-1 ring-inset ${a.soft} ${a.text} ${a.ring}`}
                  aria-hidden="true"
                >
                  {MADHHAB_AR[s.arIndex]?.charAt(0)}
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold text-green-deep leading-tight">{s.name}</span>
                  <span dir="rtl" className="block font-arabic-name font-medium text-sm text-ink [unicode-bidi:plaintext]">{MADHHAB_AR[s.arIndex]}</span>
                </span>
              </div>
              <div className="flex flex-col flex-1 px-5 pt-3 pb-5">
                <p className="text-sm text-ink">{s.desc}</p>
                <span className="mt-auto pt-3.5 flex items-center justify-end gap-1 text-sm font-medium text-green">
                  Voir
                  <span className={`w-6 h-6 rounded-full grid place-items-center ${a.soft} ${a.text} group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none`}>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedSchools;
