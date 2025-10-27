
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../firebase';

type AuthValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  changePassword: (password: string) => Promise<void>;
};

const Ctx = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signOut: () => firebaseSignOut(auth),
    signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    changePassword: (password: string) => {
      if (auth.currentUser) {
        return updatePassword(auth.currentUser, password);
      }
      return Promise.reject(new Error('No user is signed in.'));
    }
  }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
