import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from '../constants/colors';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ColorTokens;
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  themePreference: 'system',
  setThemePreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
  onPreferenceChange?: (pref: ThemePreference) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialPreference = 'system',
  onPreferenceChange,
}) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(initialPreference);

  const isDark =
    themePreference === 'system'
      ? systemScheme === 'dark'
      : themePreference === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const setThemePreference = useCallback(
    (pref: ThemePreference) => {
      setThemePreferenceState(pref);
      onPreferenceChange?.(pref);
    },
    [onPreferenceChange],
  );

  useEffect(() => {
    setThemePreferenceState(initialPreference);
  }, [initialPreference]);

  return (
    <ThemeContext.Provider value={{ colors, isDark, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};
