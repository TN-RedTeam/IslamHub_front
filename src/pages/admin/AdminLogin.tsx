import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';

/** Connexion admin par code à 6 chiffres reçu par e-mail (robuste sous HashRouter). */
export const AdminLogin: React.FC = () => {
  const { isAdmin, loading, requestCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAdmin) return <Navigate to="/admin" replace />;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await requestCode(email); setStep('code'); }
    catch (err) { setError((err as Error).message || 'Impossible d’envoyer le code.'); }
    finally { setBusy(false); }
  };
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await verifyCode(email, code); navigate('/admin', { replace: true }); }
    catch (err) { setError((err as Error).message || 'Code invalide ou expiré.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-ground grid place-items-center px-5">
      <div className="w-full max-w-sm bg-surface border border-line rounded-panel shadow-card p-7">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-gold mb-1">Espace d’administration</p>
        <h1 className="font-display font-semibold text-green-deep text-2xl mb-1">IslamHub — Connexion</h1>
        <p className="text-muted text-sm mb-5">Réservé à l’auteur. Un code à 6 chiffres est envoyé par e-mail.</p>

        {step === 'email' ? (
          <form onSubmit={submitEmail} className="space-y-3">
            <label className="block text-sm font-semibold text-ink" htmlFor="em">E-mail</label>
            <input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-green" />
            <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green text-white font-semibold py-2.5 hover:bg-green-deep transition-colors disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Recevoir le code
            </button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-3">
            <label className="block text-sm font-semibold text-ink" htmlFor="cd">Code reçu par e-mail</label>
            <input id="cd" inputMode="numeric" autoComplete="one-time-code" required value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456"
              className="w-full text-center tracking-[0.4em] text-lg rounded-lg border border-line bg-surface px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-green" />
            <button disabled={busy || code.length < 6} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green text-white font-semibold py-2.5 hover:bg-green-deep transition-colors disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Se connecter
            </button>
            <button type="button" onClick={() => { setStep('email'); setError(null); }} className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-green-deep">
              <ArrowLeft className="w-4 h-4" /> Changer d’e-mail
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}
        <div className="mt-6 pt-4 border-t border-line text-center">
          <Link to="/" className="text-sm text-green font-medium hover:underline">← Retour au site</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
