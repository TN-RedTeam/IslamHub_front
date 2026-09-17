import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BookMarked, ScrollText } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { compteur } from '../utils/compteur';
import type { RecitCard, RecitCategorie } from '../types';

const SECTIONS: { categorie: RecitCategorie; titre: string; sous_titre: string }[] = [
  { categorie: 'prophetes',           titre: 'Histoires des Prophètes', sous_titre: 'Qiṣaṣ al-anbiyāʾ' },
  { categorie: 'vertueux',            titre: 'Vies des vertueux',       sous_titre: 'Awliyāʾ et pieux prédécesseurs' },
  { categorie: 'histoires du passe',  titre: 'Histoires du passé',      sous_titre: 'Récits et leçons d’autrefois' },
];

const Carte: React.FC<{ r: RecitCard }> = ({ r }) => (
  <Link
    to={`/recits/${r.slug}`}
    className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card hover:shadow-card-hover hover:border-green transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
  >
    {r.image_url && (
      <div className="aspect-[16/9] overflow-hidden bg-ground">
        <img src={r.image_url} alt={r.titre} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform motion-reduce:transition-none" />
      </div>
    )}
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-display font-bold text-lg text-green-deep group-hover:text-green">{r.titre}</h3>
      {r.nb_enfants ? <span className="mt-1 text-xs text-muted">{compteur(r.nb_enfants, 'recit')}</span> : null}
      <span className="mt-auto pt-3 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">
        Lire le récit →
      </span>
    </div>
  </Link>
);

export const Recits: React.FC = () => {
  const [recits, setRecits] = useState<RecitCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getRecits().then(setRecits).catch(() => setRecits([])).finally(() => setLoading(false));
  }, []);

  const parCategorie = useMemo(() => {
    const map: Record<RecitCategorie, RecitCard[]> = { prophetes: [], vertueux: [], 'histoires du passe': [] };
    for (const r of recits) (map[r.categorie] ??= []).push(r);
    return map;
  }, [recits]);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Récits"
        title="Récits"
        subtitle="Les histoires des Prophètes, les vies des vertueux et les leçons du passé, pour l'exemple et le rappel."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Récits' }]}
      />

      <main className="max-w-5xl mx-auto px-4 py-10 pb-16 space-y-12">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : (
          SECTIONS.map(({ categorie, titre, sous_titre }, i) => {
            const items = parCategorie[categorie] ?? [];
            return (
              <section key={categorie}>
                <div className="flex items-baseline gap-2.5 mb-4">
                  {i === 0 ? <ScrollText className="h-5 w-5 text-gold shrink-0" aria-hidden /> : <BookMarked className="h-5 w-5 text-gold shrink-0" aria-hidden />}
                  <h2 className="font-display font-bold text-2xl text-green-deep">{titre}</h2>
                  <span className="text-sm text-muted">— {sous_titre}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-muted italic rounded-card border border-dashed border-line bg-surface px-4 py-6 text-center">
                    Récits à venir.
                  </p>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    {items.map((r) => <Carte key={r.slug} r={r} />)}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Recits;
