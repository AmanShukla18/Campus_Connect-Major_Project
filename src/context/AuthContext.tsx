import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

type AuthValue = {
  email: string | null;
  signOut: () => void;
  signup: (email: string, password: string) => Promise<boolean>;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
};

const Ctx = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email ?? null);
    });
    return unsub;
  }, []);

  async function signup(emailArg: string, password: string) {
    try {
      await createUserWithEmailAndPassword(auth, emailArg, password);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function signInWithCredentials(emailArg: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, emailArg, password);
      return true;
    } catch (e) {
      return false;
    }
  }

  const value = useMemo<AuthValue>(() => ({
    email,
    signOut: () => {
      firebaseSignOut(auth).catch(() => {});
    },
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


