import React from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ENTITIES: { to: string; label: string; soon?: boolean }[] = [
  { to: '/admin/hadiths', label: 'Hadiths' },
  { to: '/admin/paroles', label: 'Paroles de savants' },
  { to: '/admin/equivoques', label: 'Versets/hadiths équivoques', soon: true },
  { to: '/admin/recits', label: 'Récits' },
];

/** Shell de l'espace admin : garde d'accès (admin only) + barre latérale. */
export const AdminLayout: React.FC = () => {
  const { isAdmin, loading, email, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-ground grid place-items-center"><Loader2 className="w-10 h-10 text-green animate-spin" /></div>;
  }
  if (!isAdmin) {
    // Non connecté ou non autorisé → page de connexion (on garde l'origine).
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-[14.5px] transition-colors ${
      isActive ? 'bg-green text-white' : 'text-ink hover:bg-green-soft hover:text-green-deep'
    }`;

  return (
    <div className="min-h-screen bg-ground">
      <header className="sticky top-0 z-20 flex items-center gap-3 h-14 px-5 bg-green-deep text-[#f3ede0]">
        <span className="font-display font-semibold text-xl">Islam<span className="text-[#e6c877]">Hub</span></span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-[#bcd3c6] border border-[#2e5c49] rounded-full px-2.5 py-0.5">Admin</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden sm:block text-[13px] text-[#cfe0d6]">{email}</span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] bg-white text-green-deep rounded-lg px-3 py-1.5 font-semibold"><ExternalLink className="w-4 h-4" /> Voir le site</Link>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-[13px] text-[#cfe0d6] hover:text-white"><LogOut className="w-4 h-4" /> Déconnexion</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr]">
        <nav className="hidden md:block border-r border-line bg-[#fbf8f1] p-3">
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted font-semibold px-2 py-2">Contenus</p>
          {ENTITIES.map((e) => (
            <NavLink key={e.to} to={e.to} className={linkCls}>
              {e.label}{e.soon && <span className="text-[10px] text-muted">bientôt</span>}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
