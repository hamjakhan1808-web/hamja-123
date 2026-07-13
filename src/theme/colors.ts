// Premium hospital theme — Medical Blue primary, white background.
// Material 3 inspired tonal ramps.

export const lightColors = {
  // Brand
  primary: '#0B6E99',
  primaryDark: '#085A7F',
  primaryLight: '#E6F2F9',
  primaryContainer: '#D4EAF5',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0A3D55',

  // Secondary (teal accent)
  secondary: '#2A9D8F',
  secondaryContainer: '#CFF0EB',
  onSecondaryContainer: '#0A3D38',

  // Accent (amber for warnings/reminders)
  accent: '#E9A23B',
  accentContainer: '#FBEFD3',

  // Status ramps
  success: '#2E9B5A',
  successContainer: '#D6F3DF',
  successText: '#0E5A2C',
  warning: '#E08A2E',
  warningContainer: '#FBE8CF',
  warningText: '#7A4A0E',
  error: '#D14545',
  errorContainer: '#F8D7D7',
  errorText: '#7A1E1E',
  info: '#3A7BD5',
  infoContainer: '#DCEAFB',

  // Neutrals
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F4F7FA',
  surfaceElevated: '#FFFFFF',
  outline: '#D6DEE6',
  outlineVariant: '#EAEFF4',
  onBackground: '#0F1B2A',
  onSurface: '#0F1B2A',
  onSurfaceVariant: '#5A6B7E',
  muted: '#8A9AAE',
  inverseSurface: '#0F1B2A',
  inverseOnSurface: '#EAF1F8',

  // Module tile accents (used across dashboard + module hub)
  tile1: '#0B6E99',
  tile2: '#2A9D8F',
  tile3: '#E9A23B',
  tile4: '#8E5CD9',
  tile5: '#3A7BD5',
  tile6: '#D14545',
  tile7: '#1F8A70',
  tile8: '#C0392B',
  tile9: '#16A085',
  tile10: '#D97706',
  tile11: '#7E57C2',
  tile12: '#2E86C1',
  tile13: '#B03A2E',
  tile14: '#117A65',
  tile15: '#884EA0',
  tile16: '#CB4335',
  tile17: '#1ABC9C',
  tile18: '#5DADE2',
  tile19: '#F39C12',
};

export const darkColors = {
  primary: '#5BB4DD',
  primaryDark: '#3E97C2',
  primaryLight: '#133A4F',
  primaryContainer: '#133A4F',
  onPrimary: '#003044',
  onPrimaryContainer: '#CDE8F5',

  secondary: '#7FD9CC',
  secondaryContainer: '#0F3A35',
  onSecondaryContainer: '#BFEDE6',

  accent: '#F0BD5E',
  accentContainer: '#4A3717',

  success: '#7FD99E',
  successContainer: '#0E3D24',
  successText: '#A8E9BC',
  warning: '#F0BD5E',
  warningContainer: '#4A3717',
  warningText: '#F5D89A',
  error: '#F08A8A',
  errorContainer: '#4A1A1A',
  errorText: '#F5C0C0',
  info: '#7FB0F0',
  infoContainer: '#11264A',

  background: '#0B1219',
  surface: '#111B26',
  surfaceVariant: '#16222F',
  surfaceElevated: '#1A2836',
  outline: '#2A3B4D',
  outlineVariant: '#1F2D3D',
  onBackground: '#E6EDF4',
  onSurface: '#E6EDF4',
  onSurfaceVariant: '#A4B4C6',
  muted: '#6B7E92',
  inverseSurface: '#E6EDF4',
  inverseOnSurface: '#111B26',

  tile1: '#5BB4DD',
  tile2: '#7FD9CC',
  tile3: '#F0BD5E',
  tile4: '#B58FE6',
  tile5: '#7FB0F0',
  tile6: '#F08A8A',
  tile7: '#5FD0B0',
  tile8: '#E07A6E',
  tile9: '#5FD0B0',
  tile10: '#F0BD5E',
  tile11: '#A98EE0',
  tile12: '#6FB8E8',
  tile13: '#E88A7E',
  tile14: '#5FD0B0',
  tile15: '#A98EE0',
  tile16: '#E88A7E',
  tile17: '#5FD0B0',
  tile18: '#7FB0F0',
  tile19: '#F0BD5E',
};

export type ThemeColors = typeof lightColors;
