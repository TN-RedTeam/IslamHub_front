import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Tableau de bord de l'espace admin (accueil). */
export const AdminHome: React.FC = () => (
  <div className="max-w-3xl px-6 py-8">
    <h1 className="font-display font-semibold text-green-deep text-3xl">Espace d’administration</h1>
    <p className="text-muted mt-2 max-w-[62ch]">
      Saisis et modifie les contenus sans passer par Supabase. Le texte arabe collé ici est enregistré tel quel
      (UTF-8, aucune transformation). Choisis une entité pour commencer.
    </p>
    <div className="grid sm:grid-cols-2 gap-3.5 mt-6">
      <Link to="/admin/hadiths/nouveau" className="group flex flex-col gap-1 rounded-card border border-line bg-surface p-5 shadow-card hover:border-green transition-colors">
        <span className="font-display font-semibold text-green-deep text-lg">Nouveau hadith</span>
        <span className="text-sm text-muted">Texte, authenticité, narrateur, sources, thèmes — en un écran.</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-green text-sm font-semibold group-hover:gap-2.5 transition-all">Créer <ArrowRight className="w-4 h-4" /></span>
      </Link>
      <Link to="/admin/hadiths" className="group flex flex-col gap-1 rounded-card border border-line bg-surface p-5 shadow-card hover:border-green transition-colors">
        <span className="font-display font-semibold text-green-deep text-lg">Liste des hadiths</span>
        <span className="text-sm text-muted">Rechercher et modifier un hadith existant.</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-green text-sm font-semibold group-hover:gap-2.5 transition-all">Ouvrir <ArrowRight className="w-4 h-4" /></span>
      </Link>
    </div>
  </div>
);

export default AdminHome;
