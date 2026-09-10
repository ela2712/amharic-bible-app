import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { THEMES, type AppColors } from './themes';
import { useStudy } from '../context/StudyContext';

const ThemeColorsContext = createContext<AppColors>(THEMES.light);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useStudy();
  const colors = useMemo(() => THEMES[settings.theme] ?? THEMES.light, [settings.theme]);
  return (
    <ThemeColorsContext.Provider value={colors}>{children}</ThemeColorsContext.Provider>
  );
}

export function useAppTheme(): AppColors {
  return useContext(ThemeColorsContext);
}
