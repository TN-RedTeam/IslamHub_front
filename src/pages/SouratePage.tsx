import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { Markdown } from '../components/Markdown';
import { SourateReader } from '../components/SourateReader';
import { useSeo } from '../hooks/useSeo';
import type { SourateDetail, SourateInfo } from '../types';
import { IconBadge } from '../components/Icon';

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-green-soft border border-line px-3 py-1 text-xs font-semibold text-ink/80 whitespace-nowrap">
    {children}
  </span>
);

export const SouratePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<SourateDetail | null>(null);
  const [all, setAll] = useState<SourateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSeo({
    title: data ? `Sourate ${data.sourate.nom} — exégèse` : 'Sourate',
    description: data ? `Exégèse de la sourate ${data.sourate.nom} (${data.sourate.revelation ?? ''}).` : undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getSourate(slug)
      .then((d) => { if (!alive) return; if (!d) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => { dataService.getSourates().then(setAll).catch(() => setAll([])); }, []);

  // Sourates adjacentes (par numéro) parmi celles qui existent.
  const { prev, next } = useMemo(() => {
    if (!data) return { prev: null as SourateInfo | null, next: null as SourateInfo | null };
    const sorted = [...all].sort((a, b) => a.numero - b.numero);
    const n = data.sourate.numero;
    return {
      prev: [...sorted].reverse().find((s) => s.numero < n) ?? null,
      next: sorted.find((s) => s.numero > n) ?? null,
    };
  }, [all, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-ground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-surface rounded-card shadow-card border border-line">
          <IconBadge name="book" />
          <h1 className="text-xl font-bold text-ink mb-2 font-display">Sourate introuvable</h1>
          <Link to="/coran/sourates" className="px-6 py-2 bg-green hover:bg-green-deep text-white rounded-lg transition-colors inline-block mt-2">Toutes les sourates</Link>
        </div>
      </div>
    );
  }

  const { sourate, versets } = data;

  return (
    <div className="min-h-screen bg-ground">
      {/* En-tête resserré, aligné sur le corps, enrichi */}
      <header className="bg-ivory border-b border-line">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <Link to="/coran/sourates" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-green-deep mb-3">
            <ArrowLeft className="h-4 w-4" /> Toutes les sourates
          </Link>
          <div className="flex items-center gap-5 flex-wrap">
            <span className="shrink-0 w-14 h-14 rounded-2xl bg-green-soft text-green-deep grid place-items-center font-display font-semibold text-2xl tabular-nums">
              {sourate.numero}
            </span>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(24px,3.4vw,32px)' }}>{sourate.nom}</h1>
              {sourate.nom_arabe && <p className="font-arabic text-gold text-2xl leading-none mt-1" dir="rtl" lang="ar">{sourate.nom_arabe}</p>}
            </div>
            <div className="flex gap-2 flex-wrap sm:ml-auto">
              {sourate.revelation && <Chip>{sourate.revelation}</Chip>}
              {sourate.ordre_revelation != null && <Chip>{sourate.ordre_revelation}ᵉ à la révélation</Chip>}
              {sourate.nb_versets != null && <Chip>{sourate.nb_versets} versets</Chip>}
            </div>
          </div>

          {/* Commentaire / introduction — dans l'en-tête, près du nom (masqué si vide) */}
          {sourate.introduction_md && (
            <div className="mt-4 border-l-[3px] border-l-gold pl-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gold font-semibold mb-1">À propos de la sourate</p>
              <div className="text-ink/80 leading-relaxed text-[15px]"><Markdown>{sourate.introduction_md}</Markdown></div>
            </div>
          )}
        </div>
      </header>

      {versets.length === 0 ? (
        <main className="max-w-6xl mx-auto px-4 py-8 pb-16">
          <div className="text-center py-16 bg-surface rounded-card shadow-card border border-line">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-green opacity-70" />
            <p className="text-muted">Le texte et l'exégèse de cette sourate seront bientôt disponibles.</p>
          </div>
        </main>
      ) : (
        <SourateReader versets={versets} />
      )}

      {/* Navigation fin de sourate : précédent / suivant */}
      {(prev || next) && (
        <nav aria-label="Sourates adjacentes" className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-2 gap-3">
          {prev ? (
            <Link to={`/coran/sourates/${prev.slug}`} className="flex items-center gap-2.5 rounded-card border border-line bg-surface px-4 py-3 hover:border-green transition-colors">
              <ChevronLeft className="w-5 h-5 text-gold shrink-0" />
              <span className="min-w-0">
                <span className="block text-[11px] text-muted uppercase tracking-wide">Précédente</span>
                <span className="block font-display font-semibold text-green-deep truncate">{prev.numero}. {prev.nom}</span>
              </span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/coran/sourates/${next.slug}`} className="flex items-center justify-end gap-2.5 rounded-card border border-line bg-surface px-4 py-3 hover:border-green transition-colors text-right">
              <span className="min-w-0">
                <span className="block text-[11px] text-muted uppercase tracking-wide">Suivante</span>
                <span className="block font-display font-semibold text-green-deep truncate">{next.numero}. {next.nom}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-gold shrink-0" />
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
};

export default SouratePage;
