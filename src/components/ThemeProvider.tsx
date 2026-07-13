import React, { createContext, useContext } from 'react';
import { useSettings } from '../providers/SettingsProvider';

export const ThemeContext = createContext<{ dark: boolean } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  return (
    <ThemeContext.Provider value={{ dark: settings.darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
