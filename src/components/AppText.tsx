import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from './useTheme';
import type { TextStyle } from 'react-native';

type Variant = keyof ReturnType<typeof useTheme>['typography'];

interface AppTextProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function AppText({ children, variant = 'body', color, align, style, numberOfLines }: AppTextProps) {
  const theme = useTheme();
  const t = theme.typography[variant];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: 'Inter-Regular', color: color ?? theme.colors.onSurface, textAlign: align },
        t,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function AppTextBold({ children, variant = 'title', color, align, style, numberOfLines }: AppTextProps) {
  const theme = useTheme();
  const t = theme.typography[variant];
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: 'Inter-Bold', color: color ?? theme.colors.onSurface, textAlign: align },
        t,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
