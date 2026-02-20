import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../styles/theme';

const THEME_STORAGE_KEY = '@tuky_theme_mode';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemDark = useColorScheme() === 'dark';
  const [themeMode, setThemeModeState] = useState('system'); // 'dark' | 'light' | 'system'

  const isDark = themeMode === 'system' ? systemDark : themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && ['dark', 'light', 'system'].includes(saved)) {
        setThemeModeState(saved);
      }
    });
  }, []);

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      themeMode: 'system',
      setThemeMode: () => {},
      isDark: true,
      colors: darkColors,
    };
  }
  return ctx;
}
