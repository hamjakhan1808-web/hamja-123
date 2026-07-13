import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from './useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
}

export function Card({ children, style, onPress, elevation = 'sm', padding = 16 }: CardProps) {
  const theme = useTheme();
  const shadow = theme.shadows[elevation];

  const cardStyle = [
    styles.base,
    {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      ...shadow,
    },
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={cardStyle} android_ripple={{ color: theme.colors.primary + '14', radius: 0 }}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
