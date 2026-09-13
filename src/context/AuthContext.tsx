import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';

/** Seul ce compte peut écrire (doit correspondre à public.is_admin() côté base). */
export const ADMIN_EMAIL = 'karimromdhane7@gmail.com';

interface AuthState {
  session: Session | null;
  email: string | null;
  isAdmin: boolean;
  loading: boolean;
  /** Envoie un code de connexion à 6 chiffres par e-mail. */
  requestCode: (email: string) => Promise<void>;
  /** Vérifie le code reçu et ouvre la session. */
  verifyCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const requestCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const email = session?.user?.email ?? null;
  const isAdmin = (email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthCtx.Provider value={{ session, email, isAdmin, loading, requestCode, verifyCode, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
};
