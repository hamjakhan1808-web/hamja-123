import React, { useEffect } from 'react';
import { Modal, View, Pressable, StyleSheet, BackHandler } from 'react-native';
import { useTheme } from './useTheme';
import { AppTextBold, AppText } from './AppText';
import { Button } from './Button';

interface ConfirmProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger }: ConfirmProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.surface, borderRadius: radius.xl }]}
          onPress={(e) => e.stopPropagation()}
        >
          <AppTextBold variant="h3" style={{ marginBottom: spacing.sm }}>{title}</AppTextBold>
          <AppText variant="body" color={colors.onSurfaceVariant} style={{ marginBottom: spacing.xl }}>{message}</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button label={cancelLabel} variant="text" onPress={onCancel} style={{ flex: 1 }} />
            <Button label={confirmLabel} variant={danger ? 'danger' : 'filled'} onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 32 },
  dialog: { width: '100%', padding: 24 },
});
