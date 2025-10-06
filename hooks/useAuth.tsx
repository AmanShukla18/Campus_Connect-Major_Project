import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isAuthenticated: boolean;
  pendingWelcome: boolean;
  userEmail: string | null;
  profilePicUri: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  finishOnboarding: () => void;
  signOut: () => void;
  setProfilePic: (uri: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_PIC_KEY = 'user_profile_pic';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingWelcome, setPendingWelcome] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const uri = await AsyncStorage.getItem(PROFILE_PIC_KEY);
        if (uri) setProfilePicUri(uri);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Dev credentials
    const DEV_EMAIL = 'demo@gmail.com';
    const DEV_PASS = 'demo123';

    // Simple validation
    if (email.trim().toLowerCase() === DEV_EMAIL && password === DEV_PASS) {
      setUserEmail(email.trim().toLowerCase());
      setPendingWelcome(true); // show welcome screen next
      return { success: true };
    }

    return { success: false, message: 'Invalid credentials' };
  };

  const finishOnboarding = () => {
    setPendingWelcome(false);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setPendingWelcome(false);
    setUserEmail(null);
    setProfilePicUri(null);
    AsyncStorage.removeItem(PROFILE_PIC_KEY).catch(() => {});
  };

  const setProfilePic = async (uri: string | null) => {
    setProfilePicUri(uri);
    try {
      if (uri) await AsyncStorage.setItem(PROFILE_PIC_KEY, uri);
      else await AsyncStorage.removeItem(PROFILE_PIC_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, pendingWelcome, userEmail, profilePicUri, signIn, finishOnboarding, signOut, setProfilePic }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}