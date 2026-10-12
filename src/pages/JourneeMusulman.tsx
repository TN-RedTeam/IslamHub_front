import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sunrise, ChevronRight, ScrollText } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { IconBadge } from '../components/Icon';
import { MOMENTS, parseMoments } from '../data/moments';
import type { Invocation } from '../types';

const typeLabel = (t: number) => (t === 2 ? 'Évocation' : 'Invocation');

export const JourneeMusulman: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Invocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getJourneeInvocations().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  // Regroupe par moment, dans l'ordre du vocabulaire ; on ne garde que les moments non vides.
  const groups = useMemo(() => MOMENTS
    .map((m) => ({ ...m, list: items.filter((it) => parseMoments(it.moments).includes(m.key)) }))
    .filter((g) => g.list.length > 0), [items]);

  const open = (it: Invocation) => navigate('/invocations', { state: { openItem: it } });

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Invocations & Évocations"
        title="La journée du musulman"
        subtitle="Les invocations et évocations à dire au fil de la journée, du réveil au coucher."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Invocations & Évocations', to: '/invocations' }, { label: 'La journée du musulman' }]}
      />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-green animate-spin" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 bg-glass rounded-card border border-line">
            <IconBadge name="book" />
            <h3 className="text-xl font-bold text-ink mb-2 font-display">Guide en préparation</h3>
            <p className="text-muted max-w-md mx-auto">Les invocations seront rattachées à chaque moment de la journée au fur et à mesure. Reviens bientôt.</p>
          </div>
        ) : (
          <ol className="relative border-l-2 border-green-line ml-3 space-y-8">
            {groups.map((g) => (
              <li key={g.key} className="relative pl-7">
                <span className="absolute -left-[13px] top-0 grid place-items-center w-6 h-6 rounded-full bg-accent-deep text-white">
                  <Sunrise className="w-3.5 h-3.5" />
                </span>
                <h2 className="font-display font-semibold text-ink text-xl mb-3">{g.label}</h2>
                <div className="grid gap-2.5">
                  {g.list.map((it) => (
                    <button key={it.id} onClick={() => open(it)}
                      className="group text-left bg-ivory rounded-card border border-line shadow-card p-4 hover:border-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-glass-tint text-ink border border-green-line">{typeLabel(it.type_id)}</span>
                        <h3 className="font-semibold text-ink">{it.sujet || 'Invocation'}</h3>
                        <ChevronRight className="w-4 h-4 text-muted ml-auto group-hover:text-green transition-colors" />
                      </div>
                      {it.texte_arabe && (
                        <p dir="rtl" lang="ar" className="font-arabic text-xl leading-loose text-right text-ink line-clamp-2 whitespace-pre-wrap">{it.texte_arabe}</p>
                      )}
                      {it.texte_francais && <p className="text-sm text-muted mt-1 line-clamp-2 [unicode-bidi:plaintext]">{it.texte_francais}</p>}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 text-center">
          <button onClick={() => navigate('/invocations')} className="inline-flex items-center gap-2 text-green font-medium hover:underline">
            <ScrollText className="w-4 h-4" /> Voir toutes les invocations & évocations
          </button>
        </div>
      </main>
    </div>
  );
};

export default JourneeMusulman;
