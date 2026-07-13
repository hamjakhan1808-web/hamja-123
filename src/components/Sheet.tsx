import React, { useEffect } from 'react';
import { Modal, View, Pressable, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { useTheme } from './useTheme';
import { AppTextBold } from './AppText';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number;
}

export function Sheet({ visible, onClose, title, children, maxHeight }: SheetProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;

  useEffect(() => {
    if (!visible) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              maxHeight: maxHeight ?? Dimensions.get('window').height * 0.85,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.outline }]} />
          {title && (
            <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
              <AppTextBold variant="h3">{title}</AppTextBold>
            </View>
          )}
          <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { width: '100%', paddingTop: 12 },
  handle: { width: 40, height: 5, borderRadius: 999, alignSelf: 'center', marginBottom: 16 },
});
