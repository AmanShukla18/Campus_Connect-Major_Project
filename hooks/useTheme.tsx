// new file: hooks/useTheme.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../lib/theme';

type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colors: typeof lightTheme.colors;
  scheme: 'light' | 'dark';
};

const STORAGE_KEY = 'app_theme_mode';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [system, setSystem] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    // load saved mode
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
      } catch (e) {
        // ignore
      }
    })();

    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme));
    return () => sub.remove();
  }, []);

  const setMode = async (m: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, m);
    } catch (e) {
      // ignore
    }
    setModeState(m);
  };

  const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = resolved === 'dark' ? darkTheme.colors : lightTheme.colors;

  return <ThemeContext.Provider value={{ mode, setMode, colors, scheme: resolved }}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}