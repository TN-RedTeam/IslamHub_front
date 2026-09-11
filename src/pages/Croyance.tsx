import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Icon, type IconName } from '../components/Icon';
import { usePageTitle } from '../hooks/usePageTitle';

interface Card { to: string; title: string; desc: string; icon: IconName; }

const CARDS: Card[] = [
  {
    to: '/croyance/attributs',
    title: "Les Attributs de Allah",
    desc: "Ce qu'il convient de croire d'Allah, exempt de tout lieu, forme et ressemblance avec les créatures.",
    icon: 'diamant',
  },
  {
    to: '/croyance/noms-d-allah',
    title: "Les 99 Noms d'Allah",
    desc: "Les plus beaux noms d'Allah, en arabe et en français, à parcourir et à méditer.",
    icon: 'qalam',
  },
  {
    to: '/croyance/piliers-de-la-foi',
    title: 'Les piliers de la foi',
    desc: 'Les six fondements : croire en Allah, en Ses anges, en Ses livres, en Ses prophètes, au Jour dernier et au destin.',
    icon: 'pillars',
  },
];

export const Croyance: React.FC = () => {
  usePageTitle('Croyance');

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-8 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden="true">·</span> Croyance
        </nav>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Aqida</p>
        <h1 className="font-display font-semibold text-green-deep" style={{ fontSize: 'clamp(30px,5vw,46px)' }}>La Croyance</h1>
        <p className="text-muted mt-2.5 max-w-[62ch]">
          La croyance authentique en Allah, exempt de toute ressemblance avec Ses créatures — exposée simplement,
          et prouvée par le Coran, la Sunna et les paroles des savants.
        </p>

        <div className="w-14 h-0.5 bg-gold rounded my-7" />

        {/* Au cœur de la croyance — Versets équivoques */}
        <Link
          to="/croyance/versets-equivoques"
          className="group grid grid-cols-1 sm:grid-cols-[150px_1fr] overflow-hidden rounded-panel border border-line bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          <div className="grid place-items-center p-6 text-white bg-[linear-gradient(135deg,#1c5a43,#0f3d2e)]" aria-hidden="true">
            <Icon name="book" className="w-11 h-11" />
          </div>
          <div className="p-6 sm:p-7">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a5a17] bg-gold-soft border border-[#e6d3a3] px-2.5 py-0.5 rounded-full mb-2.5">
              Au cœur de la croyance
            </span>
            <h2 className="font-display font-semibold text-green-deep text-2xl mb-1.5">Versets équivoques</h2>
            <p className="text-ink/85 text-[15px] max-w-[52ch]">
              Le sens réel des versets sur les Attributs d'Allah — l'istiwāʾ, la «&nbsp;main&nbsp;», le «&nbsp;visage&nbsp;»… —
              avec les preuves, sans détour. On va à l'essentiel.
            </p>
            <span className="mt-3.5 inline-flex items-center gap-1.5 font-semibold text-green text-sm group-hover:gap-2.5 transition-all motion-reduce:transition-none">
              Explorer les versets <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Cartes secondaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group flex flex-col gap-2.5 rounded-card border border-line bg-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              <span className="w-11 h-11 rounded-[11px] bg-green-soft text-green grid place-items-center">
                <Icon name={c.icon} className="w-[22px] h-[22px]" />
              </span>
              <h3 className="font-display font-semibold text-green-deep text-xl">{c.title}</h3>
              <p className="text-[14.5px] text-ink/80">{c.desc}</p>
              <span className="mt-auto pt-1.5 inline-flex items-center gap-1.5 font-semibold text-green text-[13.5px] group-hover:gap-2.5 transition-all motion-reduce:transition-none">
                Découvrir <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* Ornement de fin : parenthèses coraniques ornées (Amiri), discret et doré. */}
        <div className="flex items-center justify-center gap-3 mt-10 text-gold" aria-hidden="true">
          <span className="font-arabic-display text-3xl leading-none">{'\uFD3E'}</span>
          <span className="w-1.5 h-1.5 rotate-45 bg-gold rounded-[1px]" />
          <span className="font-arabic-display text-3xl leading-none">{'\uFD3F'}</span>
        </div>
      </main>
    </div>
  );
};

export default Croyance;
