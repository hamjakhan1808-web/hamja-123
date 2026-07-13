import React, { useMemo } from 'react';
import { ThemeContext } from './ThemeProvider';
import { buildTheme, type Theme } from '../theme';

export function useTheme(): Theme {
  const ctx = React.useContext(ThemeContext);
  const dark = ctx?.dark ?? false;
  return useMemo(() => buildTheme(dark), [dark]);
}
