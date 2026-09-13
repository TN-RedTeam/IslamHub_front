import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';

/** Connexion admin par e-mail + mot de passe (aucun e-mail envoyé → pas de rate limit). */
export const AdminLogin: React.FC = () => {
  const { isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await signIn(email, password); navigate('/admin', { replace: true }); }
    catch (err) {
      const msg = (err as Error).message || 'Connexion impossible.';
      setError(/invalid login/i.test(msg) ? 'E-mail ou mot de passe incorrect.' : msg);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-ground grid place-items-center px-5">
      <div className="w-full max-w-sm bg-surface border border-line rounded-panel shadow-card p-7">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Espace d’administration</p>
        <h1 className="font-display font-semibold text-green-deep text-2xl mb-1">IslamHub — Connexion</h1>
        <p className="text-muted text-sm mb-5">Réservé à l’auteur.</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1" htmlFor="em">E-mail</label>
            <input id="em" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-green" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1" htmlFor="pw">Mot de passe</label>
            <input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-green" />
          </div>
          <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green text-white font-semibold py-2.5 hover:bg-green-deep transition-colors disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Se connecter
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-6 pt-4 border-t border-line text-center">
          <Link to="/" className="text-sm text-green font-medium hover:underline">← Retour au site</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
