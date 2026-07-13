import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  UserPlus, Users, Search, Pill, Bell, Settings as SettingsIcon,
  DatabaseBackup, Stethoscope, Activity, Droplet, type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { useSettings } from '@/src/providers/SettingsProvider';
import { getMedicines } from '@/src/data/repository';
import { useFocusEffect } from 'expo-router';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patients, loading, refresh } = usePatients();
  const { settings } = useSettings();
  const [medsDue, setMedsDue] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  // count today's medicine due
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const today = new Date().toISOString().slice(0, 10);
        let count = 0;
        for (const p of patients) {
          const meds = await getMedicines(p.id);
          for (const m of meds) {
            for (const d of m.doses) {
              if (d.status === 'pending' && d.givenDate === today) count++;
            }
          }
        }
        setMedsDue(count);
      })();
    }, [patients])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const tiles = useMemo(() => ([
    { key: 'register', label: 'Register Patient', icon: UserPlus, color: theme.colors.tile1, route: '/patient/register' as const },
    { key: 'list', label: 'Patient List', icon: Users, color: theme.colors.tile2, route: '/patients' as const },
    { key: 'search', label: 'Search Patient', icon: Search, color: theme.colors.tile5, route: '/patients' as const },
    { key: 'meds', label: "Today's Medicine Due", icon: Pill, color: theme.colors.tile3, badge: medsDue, route: '/patients' as const },
    { key: 'reminders', label: "Today's Reminders", icon: Bell, color: theme.colors.tile4, badge: medsDue, route: '/patients' as const },
    { key: 'settings', label: 'Settings', icon: SettingsIcon, color: theme.colors.tile7, route: '/settings' as const },
    { key: 'backup', label: 'Backup & Restore', icon: DatabaseBackup, color: theme.colors.tile12, route: '/backup' as const },
  ]), [theme, medsDue]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(theme.animations.normal)} style={styles.header}>
          <View>
            <AppText variant="caption" color={theme.colors.onSurfaceVariant}>{settings.hospitalName}</AppText>
            <AppTextBold variant="h1" color={theme.colors.onBackground} style={{ marginTop: 2 }}>Nursing Care</AppTextBold>
            <AppText variant="bodySmall" color={theme.colors.muted}>Patient Management System</AppText>
          </View>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <Stethoscope size={26} color={theme.colors.primary} strokeWidth={2} />
          </View>
        </Animated.View>

        {/* Stats summary */}
        <Animated.View entering={FadeInDown.delay(80).duration(theme.animations.normal)}>
          <View style={[styles.statsRow, { gap: theme.spacing.md }]}>
            <StatCard icon={Users} label="Patients" value={String(patients.length)} color={theme.colors.tile2} theme={theme} />
            <StatCard icon={Pill} label="Meds Due" value={String(medsDue)} color={theme.colors.tile3} theme={theme} />
            <StatCard icon={Activity} label="Active" value={String(patients.filter(p => !p.dischargeDate).length)} color={theme.colors.tile1} theme={theme} />
          </View>
        </Animated.View>

        {/* Module grid */}
        <View style={[styles.grid, { gap: theme.spacing.md, marginTop: theme.spacing.xl }]}>
          {tiles.map((tile, i) => (
            <Animated.View key={tile.key} entering={FadeInDown.delay(120 + i * 50).duration(theme.animations.normal)} style={{ flex: '48%' }}>
              <Card
                onPress={() => router.push(tile.route)}
                padding={0}
                elevation="md"
                style={{ overflow: 'hidden' }}
              >
                <View style={{ padding: theme.spacing.lg }}>
                  <View style={[styles.tileIcon, { backgroundColor: tile.color + '18' }]}>
                    <tile.icon size={24} color={tile.color} strokeWidth={2} />
                  </View>
                  <AppTextBold variant="title" color={theme.colors.onSurface} style={{ marginTop: 12 }}>{tile.label}</AppTextBold>
                  {'badge' in tile && tile.badge ? (
                    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                      <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>{tile.badge}</AppText>
                    </View>
                  ) : null}
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon: Icon, label, value, color, theme }: { icon: LucideIcon; label: string; value: string; color: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flex: 1 }}>
      <Card padding={14} elevation="sm">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.tileIcon, { backgroundColor: color + '18' }]}>
            <Icon size={18} color={color} strokeWidth={2} />
          </View>
          <View>
            <AppText variant="number" color={theme.colors.onSurface}>{value}</AppText>
            <AppText variant="caption" color={theme.colors.muted}>{label}</AppText>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tileIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 14, right: 14, minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
});
