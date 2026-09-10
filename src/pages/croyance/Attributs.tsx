import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { dataService } from '../../services/DataService';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Attribut } from '../../types';

/**
 * « Les Attributs de Allah » — les treize attributs (aṣ-ṣifāt).
 * Contenu piloté depuis la base (tables `attributs` + `attribut_citations`) :
 * l'auteur remplit l'explication et les citations dans Supabase, la page suit.
 * Sommaire ancré (sticky) + une section par attribut ; corps en romain.
 */
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

      <main className="max-w-5xl mx-auto px-5 py-8 pb-16">
        <p className="text-ink max-w-[65ch] mb-6">
          Les savants de l'Islam confirment que Dieu (Allah) n'est pas limité et que Ses attributs sont éternels, et que 13 sont obligatoires à connaître pour tout musulman pour qu'il puisse protéger sa croyance en Dieu.
          Allah a les attributs de perfection absolue qui sont dignes de Lui et Il est exempt de tout attribut d'imperfection à Son égard. Les savants musulmans ont dit qu'il est un devoir pour toute personne pubère, saine d'esprit et à qui est parvenu l'appel à l'Islam (moukallaf), de connaître 13 attributs de Allah.
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-green animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 min-[860px]:grid-cols-[220px_1fr] gap-7">
            {/* Sommaire ancré */}
            <nav aria-label="Sommaire" className="self-start min-[860px]:sticky min-[860px]:top-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-2.5">Les treize attributs</p>
              <ol className="list-none m-0 p-0">
                {items.map((a, i) => (
                  <li key={a.id}>
                    <a href={`#${a.slug}`} className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg text-sm text-ink hover:bg-green-soft hover:text-green-deep">
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
                <section key={a.id} id={a.slug} className="mb-10" style={{ scrollMarginTop: 20 }}>
                  <h2 className="font-display font-semibold text-green-deep text-[22px] mb-2 flex items-center gap-2.5">
                    <span className="w-[26px] h-[26px] rounded-full bg-green-soft text-green grid place-items-center text-sm shrink-0 font-display tabular-nums">{i + 1}</span>
                    {a.nom}{a.gloss && <span className="text-muted font-sans text-base font-normal">— {a.gloss}</span>}
                  </h2>

                  {a.explication && (
                    <p className="text-ink leading-relaxed max-w-[65ch] whitespace-pre-line">{a.explication}</p>
                  )}

                  {a.citations.map((c) => (
                    <figure key={c.id} className="rounded-xl border border-line bg-surface p-4 mt-3">
                      <p className="font-arabic text-2xl leading-loose text-right text-ink whitespace-pre-wrap" dir="rtl" lang="ar">{c.arabe}</p>
                      {c.phonetique && (
                        <p className="text-sm text-muted italic mt-2 [unicode-bidi:plaintext]">{c.phonetique}</p>
                      )}
                      {c.signification && (
                        <p className="text-ink font-bold mt-2 [unicode-bidi:plaintext]">{c.signification}</p>
                      )}
                      {c.ref && (
                        <figcaption className="text-xs uppercase tracking-wide text-gold font-semibold mt-2">{c.ref}</figcaption>
                      )}
                    </figure>
                  ))}

                  {!a.explication && a.citations.length === 0 && (
                    <p className="text-muted italic">Exposé à compléter.</p>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Attributs;
