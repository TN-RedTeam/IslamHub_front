import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { PageHeader } from '../../components/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { NomAllah } from '../../types';

// Recherche insensible aux diacritiques (côté client).
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const NomsDAllah: React.FC = () => {
  usePageTitle("Les 99 Noms d'Allah");
  const [noms, setNoms] = useState<NomAllah[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    dataService.getNomsAllah()
      .then(setNoms)
      .catch(() => setNoms([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = norm(q.trim());
    if (!query) return noms;
    return noms.filter((n) =>
      norm(n.translitteration || '').includes(query) ||
      norm(n.sens_fr || '').includes(query) ||
      (n.nom_arabe || '').includes(q.trim()),
    );
  }, [noms, q]);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les 99 Noms d'Allah"
        subtitle="Les plus beaux noms d'Allah (al-asmāʾ al-ḥusnā), en arabe et en français."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: "99 Noms d'Allah" }]}
      />

      <main className="max-w-6xl mx-auto px-5 py-8 pb-16">
        <div role="search" className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden="true" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un nom ou un sens…"
            aria-label="Rechercher un nom"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-[15px] focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-green animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-muted rounded-card border border-line bg-surface">Aucun nom ne correspond.</p>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
            {filtered.map((n) => (
              <article
                key={n.id}
                className="relative flex flex-col items-center text-center rounded-card border border-line bg-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {n.ordre != null && (
                  <span className="absolute top-3 left-3.5 font-display text-sm text-gold tabular-nums" aria-hidden="true">{n.ordre}</span>
                )}
                <p className="font-arabic text-green-deep leading-[1.7] my-1" dir="rtl" lang="ar" style={{ fontSize: 'clamp(30px,5vw,40px)' }}>{n.nom_arabe}</p>
                {n.translitteration && <p className="font-display text-green-deep text-[15px] mt-1">{n.translitteration}</p>}
                <p className="text-sm text-muted mt-0.5 min-h-[1.25rem]">{n.sens_fr || <span className="italic text-muted">à venir</span>}</p>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-[13px] text-muted bg-surface border border-line border-l-[3px] border-l-gold rounded-r-card px-4 py-3">
          <b className="text-ink">À relire :</b> les noms (arabe + translittération) sont amorcés depuis une liste reconnue ;
          les énumérations varient selon les sources. Le sens en français est complété et validé par l'auteur.{' '}
          <Link to="/croyance" className="text-green font-medium hover:underline">Retour à la Croyance</Link>
        </p>
      </main>
    </div>
  );
};

export default NomsDAllah;
