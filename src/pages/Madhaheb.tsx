import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { MADHHAB_AR } from '../constants/madhaheb';

// Classes littérales par école (Tailwind doit les voir en entier pour les générer).
const ACCENT: Record<string, { filet: string; text: string; soft: string; ring: string }> = {
  hanafi: { filet: 'border-t-ecole-hanafi', text: 'text-ecole-hanafi', soft: 'bg-ecole-hanafi/10', ring: 'ring-ecole-hanafi/30' },
  maliki: { filet: 'border-t-ecole-maliki', text: 'text-ecole-maliki', soft: 'bg-ecole-maliki/10', ring: 'ring-ecole-maliki/30' },
  shafii: { filet: 'border-t-ecole-shafii', text: 'text-ecole-shafii', soft: 'bg-ecole-shafii/10', ring: 'ring-ecole-shafii/30' },
  hanbali:{ filet: 'border-t-ecole-hanbali', text: 'text-ecole-hanbali', soft: 'bg-ecole-hanbali/10', ring: 'ring-ecole-hanbali/30' },
};

const ECOLES = [
  { name: 'Ḥanafī',  path: '/ecoles/Hanafi',   founder: 'Imam Abū Ḥanīfa',      accent: 'hanafi',
    desc: "L'école de la raison et de l'opinion, répandue en Turquie, dans les Balkans, en Asie centrale et dans le sous-continent indien." },
  { name: 'Mālikī',  path: '/ecoles/Malikite', founder: 'Imam Mālik ibn Anas',  accent: 'maliki',
    desc: "L'école de la pratique médinoise, prédominante en Afrique du Nord et en Afrique de l'Ouest." },
  { name: 'Shāfiʿī', path: '/ecoles/Shafii',   founder: 'Imam Ash-Shāfiʿī',     accent: 'shafii',
    desc: "L'école de l'équilibre des sources, répandue en Égypte, en Afrique de l'Est et en Asie du Sud-Est." },
  { name: 'Ḥanbalī', path: '/ecoles/Hanbalite', founder: 'Imam Aḥmad ibn Ḥanbal', accent: 'hanbali',
    desc: "L'école attachée au hadith, prédominante dans la péninsule Arabique." },
];

export const Madhaheb: React.FC = () => {
  usePageTitle('Les écoles (Madhāhib)');

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-10">
        <header className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">Fiqh · Les écoles</p>
          <h1 className="font-display font-semibold text-green-deep" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Les Quatre Écoles Juridiques</h1>
          <div className="w-16 h-0.5 bg-gold rounded mx-auto mt-4 mb-5" />
          <p className="text-muted max-w-[64ch] mx-auto">
            Les madhāhib représentent les méthodologies d'interprétation des sources. Chacune offre une compréhension riche et nuancée de la Charia, dans l'unité fondamentale de l'Islam.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-5">
          {ECOLES.map((e, i) => {
            const a = ACCENT[e.accent];
            return (
              <Link
                key={e.path}
                to={e.path}
                className={`group flex flex-col rounded-card border border-line ${a.filet} border-t-[3px] bg-ivory shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green`}
              >
                <div className="flex items-center gap-3.5 px-6 pt-5">
                  <span className={`shrink-0 w-12 h-12 rounded-full grid place-items-center font-arabic text-2xl ring-1 ring-inset ${a.soft} ${a.text} ${a.ring}`} aria-hidden="true">
                    {MADHHAB_AR[i]?.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-display text-xl font-semibold text-green-deep leading-tight">{e.name}</span>
                    <span dir="rtl" className="block font-arabic text-[15px] text-muted [unicode-bidi:plaintext]">{MADHHAB_AR[i]}</span>
                  </span>
                </div>

                <div className="flex flex-col gap-3 px-6 pt-4 pb-5 flex-1">
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${a.text} mb-0.5`}>Fondateur</p>
                    <p className="text-[15px] text-ink">{e.founder}</p>
                  </div>
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${a.text} mb-0.5`}>Présentation</p>
                    <p className="text-[15px] text-ink">{e.desc}</p>
                  </div>
                  <span className="mt-auto pt-3.5 border-t border-line flex items-center justify-between font-medium text-sm text-green">
                    Découvrir l'école {e.name}
                    <span className={`w-6 h-6 rounded-full grid place-items-center ${a.soft} ${a.text} group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none`}>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};
