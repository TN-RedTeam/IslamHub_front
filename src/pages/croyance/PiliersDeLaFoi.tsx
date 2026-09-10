import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Markdown } from '../../components/Markdown';
import { dataService } from '../../services/DataService';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Exposé « Les piliers de la foi » — contenu Markdown piloté par la base
 * (table `exposes`, slug « piliers-de-la-foi »). L'auteur édite le texte dans
 * Supabase, la page suit.
 */
export const PiliersDeLaFoi: React.FC = () => {
  usePageTitle('Les piliers de la foi');
  const [contenu, setContenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getExpose('piliers-de-la-foi')
      .then((e) => setContenu(e?.contenu_md ?? ''))
      .catch(() => setContenu(''))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ground">
      <PageHeader
        eyebrow="Aqida"
        title="Les piliers de la foi"
        subtitle="Les six fondements de la croyance."
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Croyance', to: '/croyance' }, { label: 'Piliers de la foi' }]}
      />
      <main className="max-w-3xl mx-auto px-5 py-10">
        <article className="rounded-card border border-line bg-surface p-6 sm:p-8 shadow-card">
          {loading ? (
            <div className="flex justify-center py-10"><Loader className="w-7 h-7 text-green animate-spin" /></div>
          ) : contenu ? (
            <Markdown>{contenu}</Markdown>
          ) : (
            <p className="text-muted italic">Contenu à venir.</p>
          )}
        </article>
      </main>
    </div>
  );
};

export default PiliersDeLaFoi;
