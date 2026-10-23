import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { Loader2, Search, ArrowRight, HelpCircle } from 'lucide-react';
import { dataService } from '../services/DataService';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import { reportedQuestionTitle } from '../utils/questionTitle';
import type { QuestionCard } from '../types';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const AUTRES = '__autres';

/**
 * Index « Questions fréquentes » : contenu affiché par défaut (principe Phase 12),
 * regroupé par thème, avec recherche plein-texte + filtre par thème. Chaque item
 * = la question + un aperçu de la réponse courte. JSON-LD FAQPage pour le SEO.
 */
export const QuestionsIndex: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    dataService
      .getQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  // Thèmes présents (ordre de première rencontre, dédupliqués) pour le filtre.
  const themes = useMemo(() => {
    const seen = new Map<string, string>();
    questions.forEach((it) =>
      it.themes.forEach((t) => {
        if (!seen.has(t.slug)) seen.set(t.slug, t.nom);
      }),
    );
    return [...seen.entries()].map(([slug, nom]) => ({ slug, nom }));
  }, [questions]);

  const filtered = useMemo(() => {
    const term = norm(q.trim());
    return questions.filter(
      (it) =>
        (!theme || it.themes.some((t) => t.slug === theme)) &&
        (!term || norm(it.question).includes(term) || norm(it.reponse_courte ?? '').includes(term)),
    );
  }, [questions, q, theme]);

  // Regroupement par thème (une question peut apparaître sous plusieurs thèmes).
  // Quand un thème est sélectionné, on affiche une liste à plat (pas de doublons).
  const groups = useMemo(() => {
    if (theme) return [{ slug: theme, nom: themes.find((t) => t.slug === theme)?.nom ?? '', items: filtered }];
    const map = new Map<string, { nom: string; items: QuestionCard[] }>();
    const autres: QuestionCard[] = [];
    filtered.forEach((it) => {
      if (it.themes.length === 0) {
        autres.push(it);
        return;
      }
      it.themes.forEach((t) => {
        if (!map.has(t.slug)) map.set(t.slug, { nom: t.nom, items: [] });
        map.get(t.slug)!.items.push(it);
      });
    });
    const arr = [...map.entries()].map(([slug, v]) => ({ slug, nom: v.nom, items: v.items }));
    if (autres.length) arr.push({ slug: AUTRES, nom: 'Autres questions', items: autres });
    return arr;
  }, [filtered, theme, themes]);

  // JSON-LD FAQPage : l'ensemble des questions publiées (question + réponse courte).
  const jsonLd = useMemo(() => {
    if (questions.length === 0) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.slice(0, 50).map((it) => ({
        '@type': 'Question',
        name: reportedQuestionTitle(it.question),
        acceptedAnswer: { '@type': 'Answer', text: (it.reponse_courte ?? '').slice(0, 500) },
      })),
    };
  }, [questions]);

  useSeo({
    title: 'Questions fréquentes',
    description:
      'Des réponses claires et sourcées (Coran, Sunna, parole des savants) aux questions de croyance qu’on se pose vraiment.',
    jsonLd,
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="On me demande souvent…"
        title="Questions fréquentes"
        subtitle="Des réponses claires et sourcées aux questions de croyance qu’on se pose vraiment."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Questions fréquentes' }]}
      />

      <main className="max-w-5xl mx-auto px-5 py-8 pb-16">
        <div role="search" className="relative max-w-md mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-green" aria-hidden />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher une question…"
            aria-label="Chercher une question"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-green"
          />
        </div>

        {themes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrer par thème">
            <button
              type="button"
              onClick={() => setTheme(null)}
              aria-pressed={theme === null}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${theme === null ? 'bg-accent border-green-line text-white' : 'bg-glass border-line text-green hover:bg-glass-tint'}`}
            >
              Tous les thèmes
            </button>
            {themes.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTheme(t.slug)}
                aria-pressed={theme === t.slug}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green ${theme === t.slug ? 'bg-accent border-green-line text-white' : 'bg-glass border-line text-green hover:bg-glass-tint'}`}
              >
                {t.nom}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 text-green animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <p className="text-muted italic">Les questions arrivent bientôt, in shā’ Allah.</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted italic">Aucune question ne correspond.</p>
        ) : (
          groups.map((g) =>
            g.items.length === 0 ? null : (
              <section key={g.slug} className="mb-10">
                <h2 className="font-display font-semibold text-ink text-2xl mb-4">{g.nom}</h2>
                <div className="space-y-3">
                  {g.items.map((it) => (
                    <Link
                      key={it.slug}
                      to={`/questions/${it.slug}`}
                      className="group flex items-start gap-3.5 rounded-card border border-line bg-surface p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-green transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                    >
                      <HelpCircle className="w-5 h-5 text-green shrink-0 mt-0.5" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-ink leading-tight group-hover:text-green">
                          {reportedQuestionTitle(it.question)}
                        </h3>
                        {it.reponse_courte && (
                          <p className="text-sm text-muted mt-1 line-clamp-2">{it.reponse_courte}</p>
                        )}
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-green shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none"
                        aria-hidden
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ),
          )
        )}
      </main>
    </div>
  );
};

export default QuestionsIndex;
