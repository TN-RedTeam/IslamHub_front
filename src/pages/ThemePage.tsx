import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Search, BookOpen, ScrollText, Quote, ArrowRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { BadgeGeneration } from '../components/BadgeGeneration';
import { EcoleBadge } from '../components/EcoleBadge';
import { useSeo } from '../hooks/useSeo';
import { compteur } from '../utils/compteur';
import type { ThemeDetail, ThemeCoranItem, ThemeHadithItem, ThemeParoleItem } from '../types';

const PREVIEW = 4;

const SectionHead: React.FC<{ icon: React.ReactNode; titre: string; n: number }> = ({ icon, titre, n }) => (
  <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-line">
    <span className="w-[34px] h-[34px] rounded-[9px] bg-green-soft text-green grid place-items-center shrink-0">{icon}</span>
    <h2 className="font-display font-semibold text-green-deep text-xl">{titre}</h2>
    <span className="ml-auto text-[12.5px] text-muted">{n}</span>
  </div>
);

const CoranCard: React.FC<{ c: ThemeCoranItem }> = ({ c }) => (
  <div className="rounded-card border border-line bg-surface p-4 shadow-card">
    {c.texte_arabe && <p className="font-arabic text-[21px] leading-[1.9] text-right text-ink" dir="rtl" lang="ar">{c.texte_arabe}</p>}
    {c.texte_francais && <p className="text-sm text-ink/90 mt-2 [unicode-bidi:plaintext]">{c.texte_francais}</p>}
    {c.sourate && <p className="text-xs uppercase tracking-[0.04em] text-muted mt-2.5">{c.sourate}</p>}
  </div>
);

const HadithCard: React.FC<{ h: ThemeHadithItem }> = ({ h }) => {
  const inner = (
    <>
      {h.texte_arabe && <p className="font-arabic text-[21px] leading-[1.9] text-right text-ink" dir="rtl" lang="ar">{h.texte_arabe}</p>}
      {h.texte_francais && <p className="text-sm text-ink/90 mt-2 [unicode-bidi:plaintext]">{h.texte_francais}</p>}
      <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs text-muted">
        {h.degre_authenticite && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-green-soft text-green-deep border border-green-line">{h.degre_authenticite}</span>}
        {h.narrateur && <span>{h.narrateur}</span>}
        <BadgeGeneration generation={h.narrateur_generation} role={h.narrateur_role} sexe={h.narrateur_sexe} />
      </div>
    </>
  );
  return h.slug ? (
    <Link to={`/hadiths/${h.id}/${h.slug}`} className="block rounded-card border border-line bg-surface p-4 shadow-card hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">{inner}</Link>
  ) : (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">{inner}</div>
  );
};

const ParoleCard: React.FC<{ p: ThemeParoleItem }> = ({ p }) => (
  <div className="rounded-card border border-green-line bg-ivory p-4 shadow-card">
    <div className="flex items-center gap-2 flex-wrap">
      {p.savant && (p.savant_slug ? (
        <Link to={`/savants/${p.savant_slug}`} className="font-display font-semibold text-green-deep hover:underline">{p.savant}</Link>
      ) : <span className="font-display font-semibold text-green-deep">{p.savant}</span>)}
      <BadgeGeneration generation={p.generation} />
      {p.ecole && <EcoleBadge ecole={p.ecole} />}
    </div>
    {p.texte_francais && <p className="text-sm text-ink/90 mt-2 line-clamp-3 [unicode-bidi:plaintext]">« {p.texte_francais} »</p>}
    {p.slug && (
      <Link to={`/paroles/${p.slug}`} className="inline-flex items-center gap-1.5 mt-2.5 text-green text-[13px] font-semibold hover:underline">
        Voir la parole et le scan <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

export const ThemePage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expand, setExpand] = useState<{ coran: boolean; hadiths: boolean; paroles: boolean }>({ coran: false, hadiths: false, paroles: false });

  const nom = data?.theme.nom;
  useSeo({
    title: nom ? `${nom} — versets, hadiths et paroles de savants` : 'Thème',
    description: nom ? `Ce que disent le Coran, la Sunna et les savants sur : ${nom}.` : undefined,
  });

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    dataService.getTheme(slug)
      .then((d) => { if (!alive) return; if (!d || !d.theme) setNotFound(true); else setData(d); setLoading(false); })
      .catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-ground grid place-items-center px-5">
        <div className="text-center">
          <h1 className="font-display text-2xl text-green-deep mb-2">Thème introuvable</h1>
          <Link to="/themes" className="text-green font-medium hover:underline">Tous les thèmes</Link>
        </div>
      </div>
    );
  }

  const { coran, hadiths, paroles } = data;
  const counts: string[] = [];
  if (coran.length) counts.push(compteur(coran.length, 'verset'));
  if (hadiths.length) counts.push(compteur(hadiths.length, 'hadith'));
  if (paroles.length) counts.push(`${compteur(paroles.length, 'parole')} de savants`);

  return (
    <div className="min-h-screen bg-ground">
      <main className="max-w-4xl mx-auto px-5 py-7 pb-16">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-1.5">
          <Link to="/" className="hover:text-green-deep">Accueil</Link> <span aria-hidden>·</span>{' '}
          <Link to="/themes" className="hover:text-green-deep">Thèmes</Link> <span aria-hidden>·</span> {nom}
        </nav>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Thème</p>
        <h1 className="font-display font-semibold text-green-deep leading-tight" style={{ fontSize: 'clamp(28px,4.4vw,42px)' }}>{nom}</h1>
        {counts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3.5">
            {counts.map((c) => (
              <span key={c} className="text-[12.5px] font-semibold text-green-deep bg-green-soft border border-green-line rounded-full px-3.5 py-1">{c}</span>
            ))}
          </div>
        )}

        <Link to="/themes" className="mt-5 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-muted hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
          <Search className="w-[18px] h-[18px]" aria-hidden /> Chercher un autre thème…
        </Link>

        {coran.length > 0 && (
          <section className="mt-8">
            <SectionHead icon={<BookOpen className="w-[18px] h-[18px]" />} titre="Dans le Coran" n={coran.length} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              {(expand.coran ? coran : coran.slice(0, PREVIEW)).map((c) => <CoranCard key={c.id} c={c} />)}
            </div>
            {coran.length > PREVIEW && !expand.coran && (
              <button onClick={() => setExpand((e) => ({ ...e, coran: true }))} className="mt-3 text-[13.5px] font-semibold text-green hover:underline">Voir les {coran.length} versets →</button>
            )}
          </section>
        )}

        {hadiths.length > 0 && (
          <section className="mt-8">
            <SectionHead icon={<ScrollText className="w-[18px] h-[18px]" />} titre="Dans la Sunna" n={hadiths.length} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              {(expand.hadiths ? hadiths : hadiths.slice(0, PREVIEW)).map((h) => <HadithCard key={h.id} h={h} />)}
            </div>
            {hadiths.length > PREVIEW && !expand.hadiths && (
              <button onClick={() => setExpand((e) => ({ ...e, hadiths: true }))} className="mt-3 text-[13.5px] font-semibold text-green hover:underline">Voir les {hadiths.length} hadiths →</button>
            )}
          </section>
        )}

        {paroles.length > 0 && (
          <section className="mt-8">
            <SectionHead icon={<Quote className="w-[18px] h-[18px]" />} titre="Paroles des savants" n={paroles.length} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              {(expand.paroles ? paroles : paroles.slice(0, PREVIEW)).map((p) => <ParoleCard key={p.id} p={p} />)}
            </div>
            {paroles.length > PREVIEW && !expand.paroles && (
              <button onClick={() => setExpand((e) => ({ ...e, paroles: true }))} className="mt-3 text-[13.5px] font-semibold text-green hover:underline">Voir les {paroles.length} paroles →</button>
            )}
          </section>
        )}

        {coran.length === 0 && hadiths.length === 0 && paroles.length === 0 && (
          <p className="mt-8 text-muted italic">Aucun contenu rattaché à ce thème pour l'instant.</p>
        )}
      </main>
    </div>
  );
};

export default ThemePage;
