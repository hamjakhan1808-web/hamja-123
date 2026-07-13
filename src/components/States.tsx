import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from './useTheme';
import { AppText } from './AppText';

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <AppText variant="body" color={theme.colors.onSurfaceVariant} style={{ marginTop: 16 }}>{message}</AppText>
    </View>
  );
}

export function EmptyState({ icon, title, message }: { icon?: React.ReactNode; title: string; message?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background, padding: 32 }]}>
      {icon && <View style={{ marginBottom: 16, opacity: 0.6 }}>{icon}</View>}
      <AppText variant="h3" color={theme.colors.onSurface} style={{ textAlign: 'center' }}>{title}</AppText>
      {message && <AppText variant="body" color={theme.colors.muted} style={{ textAlign: 'center', marginTop: 8 }}>{message}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
