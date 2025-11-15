import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import api from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthValue = {
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
  signup: (email: string, password: string) => Promise<boolean>;
  signInWithCredentials: (email: string, password: string) => Promise<boolean>;
};

const Ctx = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (Platform.OS === 'web') {
          const u = window.localStorage.getItem('cc_user');
          if (u) setEmail(u);
        } else {
          const u = await AsyncStorage.getItem('cc_user');
          if (u) setEmail(u);
        }
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  async function signup(emailArg: string, password: string) {
    try {
      const res = await api.post('/signup', { email: emailArg, password });
      if (res.status === 201) {
        setEmail(emailArg);
        if (Platform.OS === 'web') window.localStorage.setItem('cc_user', emailArg);
        else await AsyncStorage.setItem('cc_user', emailArg);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async function signInWithCredentials(emailArg: string, password: string) {
    try {
      const res = await api.post('/login', { email: emailArg, password });
      if (res.status === 200) {
        setEmail(emailArg);
        if (Platform.OS === 'web') window.localStorage.setItem('cc_user', emailArg);
        else await AsyncStorage.setItem('cc_user', emailArg);
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  const value = useMemo<AuthValue>(() => ({
    email,
    signIn: setEmail,
    signOut: () => {
      setEmail(null);
      if (Platform.OS === 'web') {
        try { window.localStorage.removeItem('cc_user'); } catch (e) {}
      } else {
        AsyncStorage.removeItem('cc_user').catch(() => {});
      }
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


