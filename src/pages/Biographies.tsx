import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Users, Crown, Star, GraduationCap, Sparkles, BookOpen, ChevronRight, type LucideIcon } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import { BadgeGeneration } from '../components/BadgeGeneration';
import { SavantsTabs } from '../components/SavantsTabs';
import type { PersonneHub, PersonneCategorie, RecitCard } from '../types';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const epoque = (p: PersonneHub) => {
  const n = parseInt((p.naissance ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};
const DOMAINE_LABEL: Record<string, string> = { Hadith: 'Hadith', Fiqh: 'Fiqh', Aqida: 'Croyance', Tafsir: 'Exégèse', Langue: 'Langue' };

// Familles, dans l'ordre de mérite (10.1).
const FAMILIES: { key: PersonneCategorie; titre: string; desc: string; icon: LucideIcon; badge: string; honor?: string }[] = [
  { key: 'prophete', titre: 'Les Prophètes', icon: Sparkles, badge: 'bg-accent text-white border-gold',
    desc: 'Les prophètes ﷺ — ʿalayhim aṣ-ṣalātu wa s-salām. Leurs récits détaillés sont dans la rubrique Récits.' },
  { key: 'calife', titre: 'Les califes bien-guidés', icon: Crown, badge: 'bg-green text-white border-green',
    desc: 'Les quatre successeurs du Prophète ﷺ, les meilleurs de cette Oumma après les prophètes.', honor: 'رضي الله عنهم' },
  { key: 'compagnon', titre: 'Les Compagnons du Prophète ﷺ', icon: Users, badge: 'bg-glass-tint text-accent border-glass-border',
    desc: 'Ceux qui ont vu le Prophète ﷺ en étant croyants.', honor: 'رضي الله عنهم' },
  { key: 'femme', titre: 'Les femmes', icon: Star, badge: 'bg-accent text-white border-gold',
    desc: 'Les mères des croyants et les femmes vertueuses.', honor: 'رضي الله عنهنّ' },
  { key: 'savant', titre: 'Les Savants', icon: GraduationCap, badge: 'bg-glass-tint text-green border-green-line',
    desc: 'Les savants de Ahlou s-Sounnah (Salaf et siècles suivants).' },
];
const SOUSCAT_LABEL: Record<string, string> = { mere_croyants: 'Mères des croyants', femme_vertueuse: 'Femmes vertueuses' };

const FamilyHead: React.FC<{ icon: LucideIcon; badge: string; titre: string; n: number; desc?: string; honor?: string; id: string }> = ({ icon: Icon, badge, titre, n, desc, honor, id }) => (
  <>
    <div className="flex items-center gap-2.5 mb-1">
      <span className={`inline-grid place-items-center w-8 h-8 rounded-full border ${badge}`} aria-hidden><Icon className="w-4 h-4" /></span>
      <h2 id={id} className="font-display text-2xl font-bold text-ink">{titre}</h2>
      <span className="text-xs font-semibold text-accent bg-glass-tint border border-glass-border rounded-full px-2.5 py-0.5 tabular-nums">{n}</span>
    </div>
    {desc && <p className="text-sm text-muted mb-4 max-w-2xl">{desc}{honor && <span className="font-arabic-name text-ink ms-1.5" lang="ar" dir="rtl">{honor}</span>}</p>}
  </>
);

const StatusBadge: React.FC<{ p: PersonneHub }> = ({ p }) => {
  const label = p.sous_categorie ? SOUSCAT_LABEL[p.sous_categorie]
    : p.est_savant && p.est_narrateur ? 'Narrateur & savant'
    : p.est_narrateur ? 'Narrateur' : null;
  if (!label) return null;
  return <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border border-green-line bg-glass-tint text-green">{label}</span>;
};

const PersonCard: React.FC<{ p: PersonneHub }> = ({ p }) => {
  const dates = [p.naissance, p.deces].filter(Boolean).join(' – ');
  const doms = (p.domaines ?? []).filter((d) => d !== 'Compagnon');
  return (
    <Link
      to={`/savants/${p.slug}`}
      className="group flex flex-col gap-2.5 rounded-card border border-glass-border bg-glass p-5 shadow-glass hover:border-accent/60 hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-glass-tint border border-glass-border font-arabic-display text-[22px] text-accent" lang="ar" dir="rtl" aria-hidden="true">
          {(p.nom_arabe?.trim()?.[0]) ?? p.nom?.trim()?.[0] ?? '•'}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold leading-tight text-ink group-hover:text-accent break-words">{p.nom}</h3>
          {p.nom_arabe && <p dir="rtl" lang="ar" className="font-arabic-name font-medium text-lg text-accent mt-0.5 [unicode-bidi:plaintext]">{p.nom_arabe}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <BadgeGeneration generation={p.generation} role={p.role} sexe={p.sexe ?? (p.role === 'epouse_prophete' ? 'f' : undefined)} />
        <StatusBadge p={p} />
      </div>
      {(dates || p.ecole) && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted tabular-nums">
          {dates && <span>{dates}</span>}
          {dates && p.ecole && <span aria-hidden="true">·</span>}
          {p.ecole && <span className="inline-flex items-center gap-1.5 font-semibold text-accent"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> {p.ecole}</span>}
        </div>
      )}
      {p.resume && <p className="text-sm text-ink line-clamp-2">{p.resume}</p>}
      {doms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doms.map((d) => <span key={d} className="text-[11px] font-semibold tracking-wide text-green bg-glass-tint px-2 py-0.5 rounded">{DOMAINE_LABEL[d] ?? d}</span>)}
        </div>
      )}
      <span className="mt-auto pt-1 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">Lire la biographie →</span>
    </Link>
  );
};

// Carte « prophète » : pointe vers le récit (10.5), pas de fiche bio séparée.
const ProphetCard: React.FC<{ r: RecitCard }> = ({ r }) => (
  <Link
    to={`/recits/${r.slug}`}
    className="group flex flex-col gap-2.5 rounded-card border border-glass-border bg-glass p-5 shadow-glass hover:border-accent/60 hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
  >
    <div className="flex items-start gap-3 min-w-0">
      <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-accent/10 border border-gold/40 text-accent" aria-hidden="true"><Sparkles className="w-5 h-5" /></span>
      <h3 className="font-display text-xl font-bold leading-tight text-ink group-hover:text-accent break-words">{r.titre}</h3>
    </div>
    <span className="mt-auto pt-1 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">
      Lire le récit {r.nb_enfants ? `(${r.nb_enfants} épisode${r.nb_enfants > 1 ? 's' : ''})` : ''} <ChevronRight className="w-4 h-4" />
    </span>
  </Link>
);

export const Biographies: React.FC = () => {
  useSeo({
    title: 'Biographies',
    description: "Les figures de l'Islam : prophètes, califes bien-guidés, Compagnons, femmes et savants — par ordre de mérite.",
  });

  const [personnes, setPersonnes] = useState<PersonneHub[]>([]);
  const [prophetes, setProphetes] = useState<RecitCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'merite' | 'az' | 'epoque'>('merite');

  useEffect(() => {
    Promise.all([dataService.getPersonnes(), dataService.getRecits()])
      .then(([p, r]) => { setPersonnes(p); setProphetes(r.filter((x) => x.categorie === 'prophetes')); })
      .catch(() => { setPersonnes([]); setProphetes([]); })
      .finally(() => setLoading(false));
  }, []);

  const term = norm(q.trim());
  const filtered = useMemo(() => {
    const raw = q.trim();
    const sortCmp = (a: PersonneHub, b: PersonneHub) =>
      sort === 'epoque' ? epoque(a) - epoque(b) : sort === 'az' ? a.nom.localeCompare(b.nom, 'fr') : a.ordre - b.ordre || a.nom.localeCompare(b.nom, 'fr');
    const out = personnes.filter((p) => {
      if (!term) return true;
      const hay = norm(`${p.nom} ${p.nom_arabe ?? ''}`);
      return hay.includes(term) || (p.nom_arabe && raw && p.nom_arabe.includes(raw));
    });
    const by: Record<string, PersonneHub[]> = {};
    for (const p of out) (by[p.categorie] ??= []).push(p);
    for (const k in by) by[k].sort(sortCmp);
    return by;
  }, [personnes, term, q, sort]);

  const prophetesFiltered = useMemo(
    () => (term ? prophetes.filter((r) => norm(r.titre).includes(term)) : prophetes),
    [prophetes, term],
  );

  const total = useMemo(
    () => Object.values(filtered).reduce((n, a) => n + a.length, 0) + prophetesFiltered.length,
    [filtered, prophetesFiltered],
  );

  // Rend une famille ; pour « femme », applique les sous-titres adaptatifs (≥3).
  const renderFamily = (fam: typeof FAMILIES[number]) => {
    if (fam.key === 'prophete') {
      if (prophetesFiltered.length === 0) return null;
      return (
        <section key="prophete" aria-labelledby="fam-prophete">
          <FamilyHead id="fam-prophete" icon={fam.icon} badge={fam.badge} titre={fam.titre} n={prophetesFiltered.length} desc={fam.desc} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {prophetesFiltered.map((r) => <ProphetCard key={r.slug} r={r} />)}
          </div>
        </section>
      );
    }
    const list = filtered[fam.key] ?? [];
    if (list.length === 0) return null;

    // Femmes : sous-titres adaptatifs (une sous-catégorie n'a son titre que si ≥3).
    let body: React.ReactNode;
    if (fam.key === 'femme') {
      const subs = new Map<string, PersonneHub[]>();
      for (const p of list) { const k = p.sous_categorie ?? '_'; (subs.get(k) ?? subs.set(k, []).get(k)!).push(p); }
      const big = [...subs.entries()].filter(([k, arr]) => k !== '_' && arr.length >= 3);
      const rest = list.filter((p) => !big.some(([k]) => k === (p.sous_categorie ?? '_')));
      body = (
        <>
          {big.map(([k, arr]) => (
            <div key={k} className="mb-6">
              <h3 className="font-display text-lg font-bold text-ink mb-3">{SOUSCAT_LABEL[k] ?? 'Femmes'}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">{arr.map((p) => <PersonCard key={p.id} p={p} />)}</div>
            </div>
          ))}
          {rest.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">{rest.map((p) => <PersonCard key={p.id} p={p} />)}</div>
          )}
        </>
      );
    } else {
      body = <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">{list.map((p) => <PersonCard key={p.id} p={p} />)}</div>;
    }

    return (
      <section key={fam.key} aria-labelledby={`fam-${fam.key}`}>
        <FamilyHead id={`fam-${fam.key}`} icon={fam.icon} badge={fam.badge} titre={fam.titre} n={list.length} desc={fam.desc} honor={fam.honor} />
        {body}
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-1">Ahlou s-Sounnah wa l-Jamā‘ah · Références</p>
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span> Biographies</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-display">Biographies</h1>
          <p className="text-muted mt-2 max-w-2xl">Les figures de l'Islam — prophètes, califes bien-guidés, Compagnons, femmes et savants — présentées par ordre de mérite.</p>
          <SavantsTabs className="mt-5" />
        </header>

        <div role="search" className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-glass-tint /80 backdrop-blur px-3 py-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green" />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une personne…" aria-label="Rechercher une personne"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-glass text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green" />
          </div>
          <select aria-label="Trier" value={sort} onChange={(e) => setSort(e.target.value as 'merite' | 'az' | 'epoque')}
            className="py-2.5 px-3 rounded-lg border border-line bg-glass text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
            <option value="merite">Ordre de mérite</option>
            <option value="az">A → Z</option>
            <option value="epoque">Par époque</option>
          </select>
        </div>

        <p className="text-sm text-muted font-medium my-4"><span className="text-green font-bold">{total}</span> référence{total > 1 ? 's' : ''}</p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-muted"><BookOpen className="h-10 w-10 mx-auto mb-3 opacity-60" /><p>Aucune biographie ne correspond.</p></div>
        ) : (
          <div className="space-y-10">{FAMILIES.map(renderFamily)}</div>
        )}
      </div>
    </div>
  );
};

export default Biographies;
