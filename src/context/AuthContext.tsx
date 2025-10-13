import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Platform } from 'react-native';

type AuthValue = {
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  signup: (email: string, password: string) => boolean;
  signInWithCredentials: (email: string, password: string) => boolean;
};

const Ctx = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  // simple credential store; for web persist in localStorage so accounts survive reloads
  const [creds] = useState<Record<string, string>>(() => {
    if (Platform.OS === 'web') {
      try {
        const raw = window.localStorage.getItem('cc_creds');
        if (raw) return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem('cc_creds', JSON.stringify(creds));
      } catch (e) {
        // ignore
      }
    }
  }, [creds]);

  function signup(email: string, password: string) {
    if (creds[email]) return false; // already exists
    // eslint-disable-next-line no-param-reassign
    creds[email] = password;
    setEmail(email);
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem('cc_creds', JSON.stringify(creds)); } catch (e) {}
      try { window.localStorage.setItem('cc_user', email); } catch (e) {}
    }
    return true;
  }

  function signInWithCredentials(emailArg: string, password: string) {
    if (creds[emailArg] && creds[emailArg] === password) {
      setEmail(emailArg);
      if (Platform.OS === 'web') {
        try { window.localStorage.setItem('cc_user', emailArg); } catch (e) {}
      }
      return true;
    }
    return false;
  }

  const value = useMemo<AuthValue>(() => ({
    email,
    signIn: setEmail,
    signOut: () => setEmail(null),
    signup,
    signInWithCredentials,
  }), [email]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}


