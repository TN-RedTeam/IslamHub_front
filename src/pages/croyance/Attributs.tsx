import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { dataService } from '../../services/DataService';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Attribut, AttributCitation } from '../../types';

/**
 * « Les Attributs de Allah » — les treize attributs (aṣ-ṣifāt).
 * Contenu piloté depuis la base (`attributs` + table enfant `attribut_citations`) :
 * l'auteur remplit l'explication et ajoute 0..N preuves (versets ET hadiths).
 * Table des matières ancrée en haut + une section par attribut ; corps en romain.
 */

// Bloc de preuve : tag (Coran/Hadith) → arabe → phonétique → signification (gras) → réf.
const Preuve: React.FC<{ c: AttributCitation }> = ({ c }) => (
  <figure className="rounded-xl border border-line bg-surface p-4 mt-3">
    <span className={`inline-block text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full mb-2 ${
      c.type === 'hadith' ? 'bg-gold-soft text-[#7a5a17] border border-[#e6d3a3]' : 'bg-green-soft text-green-deep border border-green-line'
    }`}>
      {c.type === 'hadith' ? 'Hadith' : 'Coran'}
    </span>
    {c.arabe && <p className="font-arabic text-2xl leading-loose text-right text-ink whitespace-pre-wrap" dir="rtl" lang="ar">{c.arabe}</p>}
    {c.phonetique && <p className="text-sm text-muted italic mt-2 [unicode-bidi:plaintext]">{c.phonetique}</p>}
    {c.signification && <p className="text-ink font-bold mt-2 [unicode-bidi:plaintext]">{c.signification}</p>}
    {c.ref && <figcaption className="text-xs uppercase tracking-wide text-gold font-semibold mt-2">{c.ref}</figcaption>}
  </figure>
);

// Défilement en douceur vers un attribut (ancre interne). On NE change pas le
// hash de l'URL : sous HashRouter, `href="#..."` serait interprété comme une
// route et provoquerait un 404 — d'où le scroll géré en JS.
const scrollToAttribut = (slug: string) => {
  document.getElementById(`attribut-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const Attributs: React.FC = () => {
  usePageTitle("Les Attributs de Allah");
  const [items, setItems] = useState<Attribut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getAttributs()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les Attributs de Allah"
        subtitle="Les treize attributs qu'il est du devoir de connaître, exempt de tout lieu, forme et ressemblance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: "Attributs de Allah" }]}
      />

      <main className="max-w-4xl mx-auto px-5 py-8 pb-16">
        <p className="text-ink max-w-[68ch] mb-6">
          Les savants de l'Islam confirment que Dieu (Allah) n'est pas limité et que Ses attributs sont éternels, et que 13 sont obligatoires à connaître pour tout musulman pour qu'il puisse protéger sa croyance en Dieu.
          Allah a les attributs de perfection absolue qui sont dignes de Lui et Il est exempt de tout attribut d'imperfection à Son égard. Les savants musulmans ont dit qu'il est un devoir pour toute personne pubère, saine d'esprit et à qui est parvenu l'appel à l'Islam (moukallaf), de connaître 13 attributs de Allah.
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-green animate-spin" /></div>
        ) : (
          <>
            {/* Table des matières ancrée (en haut) */}
            <nav aria-label="Sommaire" className="rounded-card border border-line bg-surface p-4 mb-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">Les treize attributs</p>
              <ol className="list-none m-0 p-0 flex flex-wrap gap-1.5">
                {items.map((a, i) => (
                  <li key={a.id}>
                    <a
                      href={`#attribut-${a.slug}`}
                      onClick={(e) => { e.preventDefault(); scrollToAttribut(a.slug); }}
                      className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-full border border-line text-sm text-ink hover:bg-green-soft hover:text-green-deep hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                    >
                      <span className="font-display font-semibold text-gold text-[12px] tabular-nums">{i + 1}</span>
                      {a.nom}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Sections */}
            {items.map((a, i) => (
              <section key={a.id} id={`attribut-${a.slug}`} className="mb-10" style={{ scrollMarginTop: 80 }}>
                <h2 className="font-display font-semibold text-green-deep text-[22px] mb-2 flex items-center gap-2.5">
                  <span className="w-[26px] h-[26px] rounded-full bg-green-soft text-green grid place-items-center text-sm shrink-0 font-display tabular-nums">{i + 1}</span>
                  {a.nom}{a.gloss && <span className="text-muted font-sans text-base font-normal">— {a.gloss}</span>}
                </h2>

                {a.explication && (
                  <p className="text-ink leading-relaxed max-w-[68ch] whitespace-pre-line">{a.explication}</p>
                )}

                {a.citations.map((c) => <Preuve key={c.id} c={c} />)}

                {!a.explication && a.citations.length === 0 && (
                  <p className="text-muted italic">Exposé à compléter.</p>
                )}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
};

export default Attributs;
