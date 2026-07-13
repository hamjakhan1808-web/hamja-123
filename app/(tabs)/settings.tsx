import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Save, Bell, Moon, Sun, Building2, User, ShieldCheck, Volume2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { useSettings } from '@/src/providers/SettingsProvider';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, update } = useSettings();
  const [pinInput, setPinInput] = useState(settings.pin);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await update({
      pin: pinInput,
      pinEnabled: pinInput.length >= 4,
    });
    setSaving(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Settings</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <SectionTitle theme={theme}>Appearance</SectionTitle>
        <Card elevation="sm">
          <SettingRow icon={settings.darkMode ? Moon : Sun} label="Dark Mode" theme={theme}>
            <Switch value={settings.darkMode} onValueChange={(v) => update({ darkMode: v })} trackColor={{ false: theme.colors.outline, true: theme.colors.primary }} thumbColor="#FFFFFF" />
          </SettingRow>
        </Card>

        {/* Hospital */}
        <SectionTitle theme={theme}>Hospital</SectionTitle>
        <Card elevation="sm">
          <Field label="Hospital Name" value={settings.hospitalName} onChangeText={(v) => update({ hospitalName: v })} placeholder="Hospital name" />
          <Field label="Hospital Logo URL" value={settings.hospitalLogoUri} onChangeText={(v) => update({ hospitalLogoUri: v })} placeholder="Logo image URL (optional)" />
        </Card>

        {/* Nurse */}
        <SectionTitle theme={theme}>Nurse Profile</SectionTitle>
        <Card elevation="sm">
          <Field label="Default Nurse Name" value={settings.nurseName} onChangeText={(v) => update({ nurseName: v })} placeholder="Your name" />
        </Card>

        {/* Notifications */}
        <SectionTitle theme={theme}>Notifications</SectionTitle>
        <Card elevation="sm">
          <SettingRow icon={Bell} label="Notification Sound" theme={theme}>
            <Switch value={settings.notificationSound} onValueChange={(v) => update({ notificationSound: v })} trackColor={{ false: theme.colors.outline, true: theme.colors.primary }} thumbColor="#FFFFFF" />
          </SettingRow>
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Volume2 size={18} color={theme.colors.muted} strokeWidth={2} />
              <AppText variant="body">Reminder Volume</AppText>
              <AppTextBold variant="body" color={theme.colors.primary} style={{ marginLeft: 'auto' }}>{settings.reminderVolume}%</AppTextBold>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[0, 25, 50, 70, 100].map((v) => (
                <Pressable key={v} onPress={() => update({ reminderVolume: v })}>
                  <View style={[styles.volChip, { backgroundColor: settings.reminderVolume === v ? theme.colors.primaryContainer : theme.colors.surfaceVariant, borderColor: settings.reminderVolume === v ? theme.colors.primary : theme.colors.outline }]}>
                    <AppText variant="caption" color={settings.reminderVolume === v ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant} style={{ fontWeight: '600' }}>{v}%</AppText>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        {/* Security */}
        <SectionTitle theme={theme}>Security</SectionTitle>
        <Card elevation="sm">
          <SettingRow icon={ShieldCheck} label="PIN Lock" theme={theme}>
            <Switch value={settings.pinEnabled} onValueChange={(v) => update({ pinEnabled: v })} trackColor={{ false: theme.colors.outline, true: theme.colors.primary }} thumbColor="#FFFFFF" />
          </SettingRow>
          {settings.pinEnabled && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <Field label="PIN (4-6 digits)" value={pinInput} onChangeText={(v) => setPinInput(v.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="Enter PIN" keyboardType="numeric" />
              <Button label="Save PIN" onPress={handleSave} loading={saving} style={{ marginTop: 8 }} icon={<Save size={16} color="#FFFFFF" strokeWidth={2} />} />
            </View>
          )}
          <SettingRow icon={ShieldCheck} label="Fingerprint Lock" theme={theme} last>
            <Switch value={settings.biometricEnabled} onValueChange={(v) => update({ biometricEnabled: v })} trackColor={{ false: theme.colors.outline, true: theme.colors.primary }} thumbColor="#FFFFFF" />
          </SettingRow>
        </Card>

        <View style={{ height: 24 }} />
        <AppText variant="caption" color={theme.colors.muted} style={{ textAlign: 'center' }}>Nursing Patient Management v1.0</AppText>
        <AppText variant="caption" color={theme.colors.muted} style={{ textAlign: 'center', marginTop: 4 }}>Offline-first • Cloud-sync ready</AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
      <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: theme.colors.primary }} />
      <AppTextBold variant="title" color={theme.colors.onBackground}>{children}</AppTextBold>
    </View>
  );
}

function SettingRow({ icon: Icon, label, children, theme, last }: { icon: any; label: string; children: React.ReactNode; theme: ReturnType<typeof useTheme>; last?: boolean }) {
  return (
    <View style={[styles.settingRow, { borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.outlineVariant }]}>
      <Icon size={20} color={theme.colors.primary} strokeWidth={2} />
      <AppText variant="body" style={{ flex: 1, marginLeft: 12 }}>{label}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  volChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5 },
});
