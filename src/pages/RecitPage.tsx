import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { useSeo } from '../hooks/useSeo';
import type { RecitDetail } from '../types';

const CAT_LABEL: Record<string, string> = { prophetes: 'Histoires des Prophètes', vertueux: 'Vies des vertueux', 'histoires du passe': 'Histoires du passé' };

export const RecitPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [r, setR] = useState<RecitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({
    title: r?.titre || 'Récit',
    description: r ? `${CAT_LABEL[r.categorie] ?? 'Récit'} — ${r.titre}.` : undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getRecit(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setR(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (notFound || !r) {
    return (
      <div className="min-h-screen bg-ground grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-green-deep mb-2">Récit introuvable</h1>
          <Link to="/recits" className="text-green font-medium hover:underline">Tous les récits</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-3xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/recits" className="hover:text-green-deep">Récits</Link> <span aria-hidden>·</span>{' '}
          {CAT_LABEL[r.categorie] ?? r.categorie}
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">{CAT_LABEL[r.categorie] ?? 'Récit'}</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{r.titre}</h1>

        {r.image_url && (
          <img src={r.image_url} alt={r.titre} className="w-full rounded-card border border-line mt-5 object-cover" loading="lazy" />
        )}

        {r.contenu_md ? (
          <div className="mt-6"><Markdown>{r.contenu_md}</Markdown></div>
        ) : (!r.enfants || r.enfants.length === 0) ? (
          <p className="mt-6 text-muted italic">Récit en cours de rédaction.</p>
        ) : null}

        {r.enfants && r.enfants.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display font-semibold text-green-deep text-xl mb-3">Ses récits</h2>
            <ul className="divide-y divide-line rounded-card border border-line bg-surface overflow-hidden">
              {r.enfants.map((e) => (
                <li key={e.slug}>
                  <Link to={`/recits/${e.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-green-soft transition-colors">
                    <span className="text-ink font-medium">{e.titre}</span>
                    <span className="ml-auto text-muted text-sm">Lire →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8">
          <Link to="/recits" className="inline-flex items-center gap-1.5 text-green font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Tous les récits
          </Link>
        </div>
      </main>
    </div>
  );
};

export default RecitPage;
