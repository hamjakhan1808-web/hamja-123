import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stethoscope, Lock, Delete, Fingerprint } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { useAuth } from '@/src/providers/AuthProvider';
import { useSettings } from '@/src/providers/SettingsProvider';

export default function LockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { unlock, verifyPin } = useAuth();
  const { settings } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = (key: string) => {
    if (pin.length >= 6) return;
    const next = pin + key;
    setPin(next);
    setError(false);
    if (next.length >= settings.pin.length) {
      setTimeout(() => {
        if (verifyPin(next)) {
          unlock();
        } else {
          setError(true);
          setPin('');
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View entering={FadeIn.duration(theme.animations.slow)} style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <Stethoscope size={36} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <AppTextBold variant="h2" style={{ marginTop: 16 }}>{settings.hospitalName}</AppTextBold>
          <AppText variant="bodySmall" color={theme.colors.muted} style={{ marginTop: 4 }}>Nursing Patient Management</AppText>
        </Animated.View>

        {/* PIN dots */}
        <Animated.View entering={FadeIn.delay(200).duration(theme.animations.slow)} style={styles.pinSection}>
          <Lock size={20} color={theme.colors.muted} strokeWidth={2} />
          <AppText variant="body" color={theme.colors.muted} style={{ marginTop: 8 }}>Enter PIN to unlock</AppText>
          <Animated.View key={error ? 'err' : 'ok'} style={[styles.dotsRow, { transform: [{ translateX: error ? 5 : 0 }] }]}>
            {Array.from({ length: settings.pin.length || 4 }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i < pin.length ? theme.colors.primary : 'transparent', borderColor: i < pin.length ? theme.colors.primary : theme.colors.outline }]} />
            ))}
          </Animated.View>
          {error && <AppText variant="caption" color={theme.colors.error} style={{ marginTop: 8 }}>Incorrect PIN. Try again.</AppText>}
        </Animated.View>

        {/* Keypad */}
        <Animated.View entering={FadeIn.delay(400).duration(theme.animations.slow)} style={styles.keypad}>
          {keys.map((key, i) => {
            if (key === '') return <View key={i} style={styles.key} />;
            if (key === 'del') {
              return (
                <Pressable key={i} onPress={handleDelete} style={styles.key} android_ripple={{ color: theme.colors.primary + '15', radius: 30 }}>
                  <Delete size={26} color={theme.colors.onSurface} strokeWidth={2} />
                </Pressable>
              );
            }
            return (
              <Pressable key={i} onPress={() => handleKey(key)} style={styles.key} android_ripple={{ color: theme.colors.primary + '15', radius: 30 }}>
                <AppTextBold variant="h1" color={theme.colors.onSurface} style={{ fontSize: 28 }}>{key}</AppTextBold>
              </Pressable>
            );
          })}
        </Animated.View>

        {settings.biometricEnabled && (
          <Pressable onPress={unlock} style={styles.bioBtn}>
            <Fingerprint size={24} color={theme.colors.primary} strokeWidth={2} />
            <AppText variant="body" color={theme.colors.primary} style={{ marginLeft: 8 }}>Use Fingerprint</AppText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginTop: 20 },
  logoCircle: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  pinSection: { alignItems: 'center' },
  dotsRow: { flexDirection: 'row', gap: 16, marginTop: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, justifyContent: 'center' },
  key: { width: 72, height: 72, justifyContent: 'center', alignItems: 'center', margin: 4, borderRadius: 36 },
  bioBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
});
