import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Download, Upload, Cloud, Trash2, FileJson } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { exportAll, importAll, clearAll } from '@/src/data/repository';
import { usePatients } from '@/src/providers/PatientsProvider';

export default function BackupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { refresh } = usePatients();
  const [busy, setBusy] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBackup = async () => {
    setBusy(true);
    try {
      const json = await exportAll();
      const filename = `nursing-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: 'utf8' });
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Save Backup' });
    } catch (e) {
      Alert.alert('Backup Failed', String(e));
    }
    setBusy(false);
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    setBusy(true);
    try {
      await importAll(confirmRestore);
      await refresh();
      Alert.alert('Restore Complete', 'All data has been restored successfully.');
    } catch (e) {
      Alert.alert('Restore Failed', 'Invalid backup file.');
    }
    setConfirmRestore(null);
    setBusy(false);
  };

  const handleClear = async () => {
    setBusy(true);
    await clearAll();
    await refresh();
    setConfirmClear(false);
    setBusy(false);
    Alert.alert('Data Cleared', 'All patient data has been removed.');
  };

  const pickRestoreFile = async () => {
    // On web, we use a file input via document
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const text = await file.text();
          setConfirmRestore(text);
        }
      };
      input.click();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Backup & Restore</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {busy && (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <AppText variant="body" color={theme.colors.muted} style={{ marginTop: 8 }}>Processing…</AppText>
          </View>
        )}

        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
              <Download size={22} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="title">Local Backup</AppTextBold>
              <AppText variant="caption" color={theme.colors.muted}>Export all patient data as a JSON file.</AppText>
            </View>
          </View>
          <Button label="Create Backup" variant="filled" onPress={handleBackup} fullWidth icon={<FileJson size={16} color="#FFFFFF" strokeWidth={2} />} />
        </Card>

        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.successContainer }]}>
              <Upload size={22} color={theme.colors.success} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="title">Restore Backup</AppTextBold>
              <AppText variant="caption" color={theme.colors.muted}>Import data from a backup JSON file.</AppText>
            </View>
          </View>
          <Button label="Select Backup File" variant="tonal" onPress={pickRestoreFile} fullWidth icon={<FileJson size={16} color={theme.colors.onPrimaryContainer} strokeWidth={2} />} />
        </Card>

        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.infoContainer }]}>
              <Cloud size={22} color={theme.colors.info} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="title">Cloud Sync</AppTextBold>
              <AppText variant="caption" color={theme.colors.muted}>Future feature — sync data to the cloud across devices.</AppText>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.accentContainer }]}>
            <AppText variant="caption" color={theme.colors.warningText} style={{ fontWeight: '600' }}>Coming Soon</AppText>
          </View>
        </Card>

        <Card elevation="sm" style={{ marginBottom: 12, borderColor: theme.colors.errorContainer, borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.errorContainer }]}>
              <Trash2 size={22} color={theme.colors.error} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="title" color={theme.colors.error}>Clear All Data</AppTextBold>
              <AppText variant="caption" color={theme.colors.muted}>Permanently delete all patient records.</AppText>
            </View>
          </View>
          <Button label="Clear Data" variant="danger" onPress={() => setConfirmClear(true)} fullWidth />
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={!!confirmRestore}
        title="Restore Backup?"
        message="This will replace all current data with the backup contents. This cannot be undone."
        confirmLabel="Restore"
        danger
        onConfirm={handleRestore}
        onCancel={() => setConfirmRestore(null)}
      />
      <ConfirmDialog
        visible={confirmClear}
        title="Clear All Data?"
        message="This will permanently delete ALL patient records. This cannot be undone."
        confirmLabel="Delete All"
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});
