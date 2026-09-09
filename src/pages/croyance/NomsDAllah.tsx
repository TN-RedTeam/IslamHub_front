import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader, X } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { PageHeader } from '../../components/PageHeader';
import { Markdown } from '../../components/Markdown';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { NomAllah } from '../../types';

// Recherche insensible aux diacritiques (côté client).
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ─── Modale : nom complet + sens + explication ────────────────────────────────
const NomModal: React.FC<{ nom: NomAllah; onClose: () => void }> = ({ nom, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true" aria-label={nom.translitteration || 'Nom'}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-card bg-surface border border-line p-7 shadow-card-hover text-center"
      >
        <button onClick={onClose} aria-label="Fermer" className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full text-muted hover:text-green-deep hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
          <X className="w-5 h-5" />
        </button>
        {nom.ordre != null && <p className="font-display text-gold text-sm mb-1 tabular-nums">{nom.ordre}</p>}
        <p className="font-arabic text-green-deep leading-[1.9]" dir="rtl" lang="ar" style={{ fontSize: 'clamp(34px,7vw,48px)' }}>{nom.nom_arabe}</p>
        {nom.translitteration && <p className="font-display text-green-deep text-xl mt-2">{nom.translitteration}</p>}
        {nom.sens_fr
          ? <p className="text-ink text-lg mt-1">{nom.sens_fr}</p>
          : <p className="text-muted italic mt-1">Sens à venir.</p>}
        {nom.explication && (
          <div className="mt-5 pt-5 border-t border-line text-left">
            <Markdown>{nom.explication}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export const NomsDAllah: React.FC = () => {
  usePageTitle("Les 99 Noms d'Allah");
  const [noms, setNoms] = useState<NomAllah[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<NomAllah | null>(null);

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
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
            {filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelected(n)}
                aria-label={`${n.translitteration ?? 'Nom'} — voir le détail`}
                className="group relative flex flex-col items-center text-center overflow-hidden rounded-card border border-line bg-surface px-4 pt-8 pb-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                {n.ordre != null && (
                  <span className="absolute top-2.5 left-3.5 font-display text-sm text-gold tabular-nums" aria-hidden="true">{n.ordre}</span>
                )}
                {/* Hauteur réservée : 2 lignes d'arabe, pour que toutes les cartes soient identiques. */}
                <p
                  className="font-arabic text-green-deep w-full text-center leading-[1.7] [word-break:normal] [overflow-wrap:normal] line-clamp-2 min-h-[2.3em]"
                  dir="rtl"
                  lang="ar"
                  style={{ fontSize: 'clamp(20px,2.8vw,26px)' }}
                >
                  {n.nom_arabe}
                </p>
                {n.translitteration && (
                  <p className="font-display text-green-deep text-[15px] mt-1.5 w-full truncate">{n.translitteration}</p>
                )}
                <p className="text-[13px] text-muted mt-0.5 w-full line-clamp-2 min-h-[2.4em]">
                  {n.sens_fr || <span className="italic">à venir</span>}
                </p>
                {n.explication && (
                  <span className="mt-1.5 text-[11px] font-medium text-green group-hover:underline">Détails</span>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 text-[13px] text-muted bg-surface border border-line border-l-[3px] border-l-gold rounded-r-card px-4 py-3">
          <b className="text-ink">À relire :</b> les noms (arabe + translittération) sont amorcés depuis une liste reconnue ;
          les énumérations varient selon les sources. Le sens en français est complété et validé par l'auteur.{' '}
          <Link to="/croyance" className="text-green font-medium hover:underline">Retour à la Croyance</Link>
        </p>
      </main>

      {selected && <NomModal nom={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default NomsDAllah;
