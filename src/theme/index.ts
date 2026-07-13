import { lightColors, darkColors, type ThemeColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '700' as const, lineHeight: 40 },
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 23 },
  title: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  number: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  numberLarge: { fontSize: 30, fontWeight: '700' as const, lineHeight: 36 },
} as const;

export const shadows = {
  none: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  sm: { shadowColor: '#0F1B2A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  md: { shadowColor: '#0F1B2A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 },
  lg: { shadowColor: '#0F1B2A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  xl: { shadowColor: '#0F1B2A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 20, elevation: 6 },
} as const;

export const animations = {
  fast: 180,
  normal: 260,
  slow: 400,
  spring: { damping: 18, stiffness: 220, mass: 0.9 },
} as const;

export function getColors(dark: boolean): ThemeColors {
  return dark ? darkColors : lightColors;
}

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  animations: typeof animations;
  dark: boolean;
};

export function buildTheme(dark: boolean): Theme {
  return { colors: getColors(dark), spacing, radius, typography, shadows, animations, dark };
}
