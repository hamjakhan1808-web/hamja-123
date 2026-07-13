import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import { AppTextBold } from './AppText';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'filled' | 'tonal' | 'outline' | 'text' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = 'filled', loading, disabled, icon, style, fullWidth }: ButtonProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;

  const getStyle = () => {
    switch (variant) {
      case 'filled':
        return { backgroundColor: colors.primary, borderWidth: 0 };
      case 'tonal':
        return { backgroundColor: colors.primaryContainer, borderWidth: 0 };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'text':
        return { backgroundColor: 'transparent', borderWidth: 0 };
      case 'danger':
        return { backgroundColor: colors.error, borderWidth: 0 };
    }
  };

  const textColor = () => {
    switch (variant) {
      case 'filled': return colors.onPrimary;
      case 'tonal': return colors.onPrimaryContainer;
      case 'outline': return colors.primary;
      case 'text': return colors.primary;
      case 'danger': return '#FFFFFF';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getStyle(),
        { borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        fullWidth && { width: '100%' as const },
        style,
      ]}
      android_ripple={{ color: colors.primary + '22', radius: 200 }}
    >
      {loading ? (
        <ActivityIndicator color={textColor()} size="small" />
      ) : (
        <React.Fragment>
          {icon}
          <AppTextBold variant="button" color={textColor()} style={{ marginLeft: icon ? 8 : 0 }}>
            {label}
          </AppTextBold>
        </React.Fragment>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
