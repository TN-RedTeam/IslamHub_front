import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from '../lib/router';
import { Loader, Copy, Check, Share2, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import { dataService } from '../services/DataService';
import { ArticleBlocs } from '../components/ArticleBlocs';
import { PageHeader } from '../components/PageHeader';
import { useSeo } from '../hooks/useSeo';
import { copyToClipboard, withLink, shareContent } from '../utils/shareCopy';
import type { QuestionDetail, QuestionCard, Bloc } from '../types';
import { IconBadge } from '../components/Icon';

/**
 * Page réponse « Question fréquente » : question en <h1>, réponse courte en
 * encart accentué, puis développement sourcé (blocs composables réutilisés via
 * get_blocs('question', id)), « Aussi demandé » (variantes, indexable + SEO) et
 * maillage « Pour approfondir → » (dossiers + thèmes liés). JSON-LD QAPage.
 */
export const QuestionPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [data, setData] = useState<QuestionDetail | null>(null);
  const [blocs, setBlocs] = useState<Bloc[]>([]);
  const [siblings, setSiblings] = useState<QuestionCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    setBlocs([]);
    setSiblings([]);
    dataService
      .getQuestion(slug)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setIsLoading(false);
        if (d?.question?.id != null) {
          dataService
            .getBlocs('question', d.question.id)
            .then((bl) => {
              if (alive) setBlocs(bl);
            })
            .catch(() => {});
        }
        // Questions sœurs (Règle B « Pour approfondir ») : autres questions
        // publiées partageant un thème. Filtrage client (pas de requête dédiée).
        const myThemes = new Set((d?.themes ?? []).map((t) => t.slug));
        if (myThemes.size > 0) {
          dataService
            .getQuestions()
            .then((all) => {
              if (!alive) return;
              setSiblings(all.filter((x) => x.slug !== slug && x.themes.some((t) => myThemes.has(t.slug))).slice(0, 6));
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (alive) {
          setError('Erreur lors du chargement de la question.');
          setIsLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  // Le titre/H1/schéma affichent la question TELLE QU'ELLE EST SAISIE (aucun
  // préfixe automatique) ; l'auteur met une forme rapportée lui-même si besoin.
  const pageTitle = data?.question.question ?? undefined;

  // JSON-LD QAPage : une question par page.
  const jsonLd = useMemo(() => {
    if (!data) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: data.question.question,
        text: data.question.question,
        acceptedAnswer: { '@type': 'Answer', text: (data.question.reponse_courte ?? '').slice(0, 500) },
      },
    };
  }, [data]);

  useSeo({
    title: pageTitle,
    description: data?.question.reponse_courte ?? undefined,
    type: 'article',
    jsonLd,
  });

  const flash = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const questionText = () => [data?.question.question, data?.question.reponse_courte].filter(Boolean).join('\n\n');
  const share = async () => {
    if ((await shareContent({ title: data?.question.question || 'Ahl-Sunnah', text: questionText() })) === 'copied') flash();
  };
  const copy = async () => {
    if (await copyToClipboard(withLink(questionText()))) flash();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-12 w-12 text-green animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-glass rounded-card shadow-card">
          <IconBadge name="sad" />
          <h1 className="text-xl font-bold text-ink mb-2 font-display">Question introuvable</h1>
          <p className="text-muted mb-6">{error || "Cette question n'existe pas ou n'est pas encore publiée."}</p>
          <Link
            to="/questions"
            className="px-6 py-2 bg-accent-deep hover:brightness-110 text-white rounded-lg transition-colors"
          >
            Toutes les questions
          </Link>
        </div>
      </div>
    );
  }

  const { question, themes, dossiers } = data;
  const variantes = question.variantes ?? [];

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Question fréquente"
        title={question.question}
        crumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Questions fréquentes', to: '/questions' },
          { label: question.question },
        ]}
      />

      <main className="max-w-3xl mx-auto px-5 py-8 pb-16 space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-glass border border-line text-green hover:bg-glass-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copier
          </button>
          <button
            onClick={share}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-glass border border-line text-green hover:bg-glass-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          >
            <Share2 className="h-4 w-4" /> Partager
          </button>
        </div>

        {/* Réponse courte — encart accentué (carte verre) */}
        {question.reponse_courte && (
          <section aria-labelledby="en-bref" className="bg-glass-tint border border-green-line rounded-card p-6">
            <h2
              id="en-bref"
              className="text-sm font-bold uppercase tracking-wide text-green mb-2 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> En bref
            </h2>
            <p className="text-ink text-lg leading-relaxed whitespace-pre-wrap [unicode-bidi:plaintext]">
              {question.reponse_courte}
            </p>
          </section>
        )}

        {/* Développement sourcé — blocs composables réutilisés */}
        {blocs.length > 0 && (
          <section>
            <h2 className="sr-only">La réponse détaillée</h2>
            <ArticleBlocs blocs={blocs} showToc />
          </section>
        )}

        {/* Aussi demandé — variantes (recherche interne + contenu indexable SEO) */}
        {variantes.length > 0 && (
          <section className="bg-glass-tint border border-line rounded-card p-5">
            <h2 className="text-sm font-bold text-ink mb-3">Aussi demandé</h2>
            <ul className="flex flex-wrap gap-2">
              {variantes.map((v, i) => (
                <li
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-surface border border-line text-sm text-muted [unicode-bidi:plaintext]"
                >
                  {v}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pour approfondir → maillage dossiers + thèmes + questions sœurs */}
        {(dossiers.length > 0 || themes.length > 0 || siblings.length > 0) && (
          <section>
            <h2 className="text-lg font-bold text-ink mb-3">Pour approfondir</h2>
            <ul className="space-y-2">
              {dossiers.map((d) => (
                <li key={`d-${d.slug}`}>
                  <Link
                    to={`/dossiers/${d.slug}`}
                    className="inline-flex items-center gap-1.5 text-green hover:underline"
                  >
                    <ArrowRight className="h-4 w-4" /> {d.h1}
                  </Link>
                </li>
              ))}
            </ul>
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {themes.map((t) => (
                  <Link
                    key={`t-${t.slug}`}
                    to={`/themes/${t.slug}`}
                    className="px-3 py-1.5 rounded-full bg-glass border border-line text-sm text-green hover:bg-glass-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
                  >
                    {t.nom}
                  </Link>
                ))}
              </div>
            )}
            {/* Questions sœurs — autres questions du même thème (Règle B). */}
            {siblings.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-ink mb-2">Questions sœurs</p>
                <ul className="space-y-2">
                  {siblings.map((s) => (
                    <li key={`q-${s.slug}`}>
                      <Link
                        to={`/questions/${s.slug}`}
                        className="inline-flex items-center gap-1.5 text-green hover:underline [unicode-bidi:plaintext]"
                      >
                        <ArrowRight className="h-4 w-4 shrink-0" /> {s.question}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <div>
          <Link to="/questions" className="inline-flex items-center gap-1.5 text-muted hover:text-ink text-sm">
            <ArrowLeft className="h-4 w-4" /> Toutes les questions
          </Link>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;
