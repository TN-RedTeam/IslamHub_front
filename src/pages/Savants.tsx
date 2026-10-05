import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Users, Crown, Star, BookOpen, GraduationCap, type LucideIcon } from 'lucide-react';
import { dataService } from '../services/DataService';
import { useSeo } from '../hooks/useSeo';
import { BadgeGeneration } from '../components/BadgeGeneration';
import { SavantsTabs } from '../components/SavantsTabs';
import type { SavantInfo } from '../types';

// Libellés d'affichage des domaines (valeur en base → étiquette FR).
const DOMAINE_LABEL: Record<string, string> = {
  Hadith: 'Hadith', Fiqh: 'Fiqh', Aqida: 'Croyance', Tafsir: 'Exégèse', Langue: 'Langue',
};
const labelDom = (d: string) => DOMAINE_LABEL[d] ?? d;

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const epoque = (s: SavantInfo) => {
  const n = parseInt((s.naissance ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};
// Rang honorifique (ordre de mérite) : califes bien-guidés → mères des croyants
// → Compagnons → Salaf → autres savants. Chaque tier a son icône.
type Tier = 'califes' | 'meres' | 'compagnons' | 'salaf' | 'autres';
const SALAF_GENS = new Set(['salaf', 'tabii', 'tabi_tabii']);
const tierOf = (s: SavantInfo): Tier =>
  s.role === 'calife_rachidoun' ? 'califes'
    : s.role === 'epouse_prophete' ? 'meres'
      : s.is_compagnon ? 'compagnons'
        : SALAF_GENS.has(s.generation ?? '') ? 'salaf'
          : 'autres';

const SECTIONS: { key: Tier; titre: string; desc: string; icon: LucideIcon; badge: string; honor?: string }[] = [
  { key: 'califes', titre: 'Les califes bien-guidés', icon: Crown, badge: 'bg-green text-white border-green',
    desc: "Les quatre successeurs du Prophète ﷺ qui ont dirigé la communauté avec justice, les meilleurs de cette Oumma après les prophètes.", honor: 'رضي الله عنهم' },
  { key: 'meres', titre: 'Les mères des croyants', icon: Star, badge: 'bg-accent text-white border-gold',
    desc: "Les épouses pures du Prophète ﷺ, que le Coran nomme « mères des croyants ».", honor: 'رضي الله عنهنّ' },
  { key: 'compagnons', titre: 'Les Compagnons du Prophète ﷺ', icon: Users, badge: 'bg-glass-tint text-accent border-glass-border',
    desc: "Ceux qui ont vu le Prophète ﷺ en étant croyants : les meilleurs de cette communauté, dont on rapporte les hadiths.", honor: 'رضي الله عنهم' },
  { key: 'salaf', titre: 'Les Salaf', icon: BookOpen, badge: 'bg-glass-tint text-green border-green-line',
    desc: "Les pieux prédécesseurs des trois premières générations (Tābiʿīn et suivants) qui ont transmis et expliqué la religion après les Compagnons." },
  { key: 'autres', titre: 'Les autres savants', icon: GraduationCap, badge: 'bg-glass-tint text-muted border-line',
    desc: "Les savants de Ahlou s-Sounnah qui ont transmis, jugé et expliqué la religion au fil des siècles." },
];

export const Savants: React.FC = () => {
  useSeo({
    title: "Les Savants de l'Islam",
    description: "Les savants de Ahlou s-Sounnah cités dans les hadiths, paroles et dossiers : école, époque, domaines, biographie.",
  });

  const [savants, setSavants] = useState<SavantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [ecole, setEcole] = useState('');
  const [gen, setGen] = useState(''); // '', 'sahabi', 'salaf', 'khalaf'
  const [sort, setSort] = useState<'az' | 'epoque'>('az');
  const [domaines, setDomaines] = useState<Set<string>>(new Set());

  useEffect(() => {
    dataService.getSavants().then(setSavants).catch(() => setSavants([])).finally(() => setLoading(false));
  }, []);

  const ecoles = useMemo(
    () => Array.from(new Set(savants.map((s) => s.ecole).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, 'fr')),
    [savants],
  );
  const domainesDispo = useMemo(
    () => Array.from(new Set(savants.flatMap((s) => s.domaines ?? []))).filter((d) => d !== 'Compagnon').sort(),
    [savants],
  );

  const toggleDom = (d: string) =>
    setDomaines((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });

  // Filtrage, puis regroupement par tier honorifique (ordre de mérite).
  const { groups, total } = useMemo(() => {
    const term = norm(q.trim());
    const raw = q.trim();
    const sel = [...domaines];
    const sortCmp = (a: SavantInfo, b: SavantInfo) =>
      sort === 'epoque' ? epoque(a) - epoque(b) : a.nom.localeCompare(b.nom, 'fr');
    const out = savants.filter((s) => {
      if (term) {
        const hay = norm(`${s.nom} ${s.nom_arabe ?? ''}`);
        if (!hay.includes(term) && !(s.nom_arabe && raw && s.nom_arabe.includes(raw))) return false;
      }
      if (ecole && s.ecole !== ecole) return false;
      if (gen) {
        const g = s.generation ?? '';
        if (gen === 'salaf') { if (g !== 'salaf' && g !== 'tabii' && g !== 'tabi_tabii') return false; }
        else if (g !== gen) return false;
      }
      if (sel.length && !sel.every((d) => (s.domaines ?? []).includes(d))) return false;
      return true;
    });
    const map = new Map<Tier, SavantInfo[]>();
    for (const s of out) {
      const t = tierOf(s);
      (map.get(t) ?? map.set(t, []).get(t)!).push(s);
    }
    for (const arr of map.values()) arr.sort(sortCmp);
    return { groups: map, total: out.length };
  }, [savants, q, ecole, gen, sort, domaines]);

  const renderCard = (s: SavantInfo) => {
    const dates = [s.naissance, s.deces].filter(Boolean).join(' – ');
    const doms = (s.domaines ?? []).filter((d) => d !== 'Compagnon');
    return (
      <Link
        key={s.id}
        to={`/savants/${s.slug}`}
        className="group flex flex-col gap-2.5 rounded-card border border-glass-border bg-glass p-5 shadow-glass hover:border-accent/60 hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
      >
        {/* Carte typographique : monogramme (lettre, jamais de visage) + nom > rôle */}
        <div className="flex items-start gap-3 min-w-0">
          <span className="shrink-0 grid place-items-center w-11 h-11 rounded-full bg-glass-tint border border-glass-border font-arabic-display text-[22px] text-accent" lang="ar" dir="rtl" aria-hidden="true">
            {(s.nom_arabe?.trim()?.[0]) ?? s.nom?.trim()?.[0] ?? '•'}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold leading-tight text-ink group-hover:text-accent break-words">{s.nom}</h3>
            {s.nom_arabe && (
              <p dir="rtl" lang="ar" className="font-arabic-name font-medium text-lg text-accent mt-0.5 [unicode-bidi:plaintext]">{s.nom_arabe}</p>
            )}
          </div>
        </div>

        <BadgeGeneration generation={s.generation} role={s.role} sexe={s.role === 'epouse_prophete' ? 'f' : undefined} />

        {(dates || s.ecole) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted tabular-nums">
            {dates && <span>{dates}</span>}
            {dates && s.ecole && <span aria-hidden="true">·</span>}
            {s.ecole && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {s.ecole}
              </span>
            )}
          </div>
        )}

        {s.resume && <p className="text-sm text-ink line-clamp-2">{s.resume}</p>}

        {doms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doms.map((d) => (
              <span key={d} className="text-[11px] font-semibold tracking-wide text-green bg-glass-tint px-2 py-0.5 rounded">{labelDom(d)}</span>
            ))}
          </div>
        )}

        <span className="mt-auto pt-1 text-sm font-semibold text-green inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all motion-reduce:transition-none">
          {s.resume || !s.is_compagnon ? 'Lire la biographie' : 'Voir la fiche'} →
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent mb-1">
            Ahlou s-Sounnah wa l-Jamā‘ah · Références
          </p>
          <nav aria-label="Fil d'Ariane" className="text-xs text-muted mb-2"><Link to="/" className="hover:text-ink">Accueil</Link> <span aria-hidden>·</span> Savants</nav>
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-display">Les Savants de l'Islam</h1>
          <p className="text-muted mt-2 max-w-2xl">
            Les savants cités à travers les hadiths, les paroles et les dossiers. Chaque fiche donne le crédit et le contexte de celui dont on rapporte la parole.
          </p>
          <SavantsTabs className="mt-5" />
        </header>

        {/* Barre d'outils sticky */}
        <div
          role="search"
          className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-glass-tint /80 backdrop-blur px-3 py-3"
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un savant…"
              aria-label="Rechercher un savant"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-glass text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </div>
          <select
            aria-label="Filtrer par école"
            value={ecole}
            onChange={(e) => setEcole(e.target.value)}
            className="py-2.5 px-3 rounded-lg border border-line bg-glass text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="">Toutes les écoles</option>
            {ecoles.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select
            aria-label="Filtrer par génération"
            value={gen}
            onChange={(e) => setGen(e.target.value)}
            className="py-2.5 px-3 rounded-lg border border-line bg-glass text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="">Toutes générations</option>
            <option value="sahabi">Compagnons</option>
            <option value="salaf">Salaf</option>
            <option value="khalaf">Khalaf</option>
          </select>
          <select
            aria-label="Trier"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'az' | 'epoque')}
            className="py-2.5 px-3 rounded-lg border border-line bg-glass text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <option value="az">A → Z</option>
            <option value="epoque">Par époque</option>
          </select>
        </div>

        {/* Chips domaines (affichées si des domaines existent en base) */}
        {domainesDispo.length > 0 && (
          <div role="group" aria-label="Filtrer par domaine" className="flex flex-wrap gap-2 mt-3">
            {domainesDispo.map((d) => {
              const on = domaines.has(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDom(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${
                    on
                      ? 'bg-green text-white border-green'
                      : 'bg-glass text-muted border-line hover:border-green'
                  }`}
                >
                  {labelDom(d)}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-sm text-muted font-medium my-4">
          <span className="text-green font-bold">{total}</span> référence{total > 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-green animate-spin" /></div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-muted">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-60" />
            <p>Aucune référence ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {SECTIONS.map((sec) => {
              const list = groups.get(sec.key) ?? [];
              if (list.length === 0) return null;
              const Icon = sec.icon;
              return (
                <section key={sec.key} aria-labelledby={`sec-${sec.key}`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`inline-grid place-items-center w-8 h-8 rounded-full border ${sec.badge}`} aria-hidden>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h2 id={`sec-${sec.key}`} className="font-display text-2xl font-bold text-ink">{sec.titre}</h2>
                    <span className="text-xs font-semibold text-accent bg-glass-tint border border-glass-border rounded-full px-2.5 py-0.5 tabular-nums">{list.length}</span>
                  </div>
                  <p className="text-sm text-muted mb-4 max-w-2xl">
                    {sec.desc}
                    {sec.honor && <span className="font-arabic-name text-ink ms-1.5" lang="ar" dir="rtl">{sec.honor}</span>}
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                    {list.map(renderCard)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Savants;
