import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/DataService';
import { ExposeBody } from '../components/ExposeBody';
import { ArticleBlocs } from '../components/ArticleBlocs';
import { useSeo } from '../hooks/useSeo';
import type { Expose, ExposeCitation, Bloc } from '../types';

/**
 * Page publique générique d'un exposé (`/exposes/:slug`). Rend l'en-tête verset
 * optionnel, puis l'article composable (blocs) s'il existe, sinon la prose
 * Markdown + les citations réutilisables (`expose_citations`).
 * Les exposés « historiques » gardent leurs pages Croyance dédiées ; cette route
 * dessert tout nouvel exposé créé en admin.
 */
export const ExposePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [expose, setExpose] = useState<Expose | null>(null);
  const [citations, setCitations] = useState<ExposeCitation[]>([]);
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({ title: expose?.titre || 'Exposé', description: expose?.verset_traduction || undefined });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false); setBlocs([]); setCitations([]);
    Promise.all([
      dataService.getExpose(slug).catch(() => null),
      dataService.getExposeCitations(slug).catch(() => []),
      dataService.getBlocs('expose', slug).catch(() => []),
    ]).then(([e, ci, bl]) => {
      if (!alive) return;
      if (!e) setNotFound(true);
      else { setExpose(e); setCitations(ci); setBlocs(bl); }
      setLoading(false);
    });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (notFound || !expose) {
    return (
      <div className="min-h-screen bg-ground grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-green-deep mb-2">Exposé introuvable</h1>
          <Link to="/" className="text-green font-medium hover:underline">Retour à l’accueil</Link>
        </div>
      </div>
    );
  }

  const hasVerse = expose.verset_arabe || expose.verset_traduction;

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-5xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span> Exposé
        </nav>

        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Exposé</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{expose.titre || 'Exposé'}</h1>

        {hasVerse && (
          <div className="rounded-panel border border-line bg-surface p-6 mt-5 text-center shadow-card">
            {expose.verset_arabe && <p className="font-arabic text-green-deep leading-[2]" dir="rtl" lang="ar" style={{ fontSize: 'clamp(24px,4.2vw,34px)' }}>{expose.verset_arabe}</p>}
            {expose.verset_traduction && <p className="text-[17px] text-ink mt-3">{expose.verset_traduction}</p>}
            {expose.verset_phonetique && <p className="text-[13px] text-muted italic mt-1.5 [unicode-bidi:plaintext]">{expose.verset_phonetique}</p>}
            {expose.verset_ref && <p className="text-xs uppercase tracking-[0.06em] text-gold font-semibold mt-3">{expose.verset_ref}</p>}
          </div>
        )}

        <div className="mt-6">
          {blocs.length > 0
            ? <ArticleBlocs blocs={blocs} showToc />
            : <ExposeBody contenuMd={expose.contenu_md ?? null} citations={citations} />}
        </div>

        <div className="mt-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-green font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Retour à l’accueil
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ExposePage;
