import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, FileBarChart, Users, Activity, Droplet } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { getVitals, getSugar, getIO, getMedicines } from '@/src/data/repository';

export default function ReportsTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patients, refresh } = usePatients();
  const [stats, setStats] = useState({ vitals: 0, sugar: 0, io: 0, meds: 0 });

  useFocusEffect(useCallback(() => {
    refresh();
    (async () => {
      let v = 0, s = 0, io = 0, m = 0;
      for (const p of patients) {
        v += (await getVitals(p.id)).length;
        s += (await getSugar(p.id)).length;
        io += (await getIO(p.id)).length;
        m += (await getMedicines(p.id)).length;
      }
      setStats({ vitals: v, sugar: s, io, meds: m });
    })();
  }, [refresh, patients.length]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <AppTextBold variant="h1">Reports</AppTextBold>
        <AppText variant="bodySmall" color={theme.colors.muted}>Overview & patient reports</AppText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Global stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <StatCard icon={Users} label="Patients" value={String(patients.length)} color={theme.colors.tile2} theme={theme} />
          <StatCard icon={Activity} label="Vitals" value={String(stats.vitals)} color={theme.colors.tile3} theme={theme} />
          <StatCard icon={Droplet} label="Sugar" value={String(stats.sugar)} color={theme.colors.tile6} theme={theme} />
          <StatCard icon={FileBarChart} label="Meds" value={String(stats.meds)} color={theme.colors.tile1} theme={theme} />
        </View>

        <AppTextBold variant="title" style={{ marginBottom: 12 }}>Patient Reports</AppTextBold>
        {patients.length === 0 ? (
          <Card elevation="sm"><AppText variant="body" color={theme.colors.muted} style={{ textAlign: 'center', padding: 20 }}>No patients yet. Register a patient to generate reports.</AppText></Card>
        ) : (
          patients.map((p) => (
            <Card key={p.id} onPress={() => router.push(`/reports/${p.id}`)} elevation="sm" style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <AppTextBold variant="h3" color={theme.colors.onPrimaryContainer}>{p.name.charAt(0).toUpperCase()}</AppTextBold>
                </View>
                <View style={{ flex: 1 }}>
                  <AppTextBold variant="title">{p.name}</AppTextBold>
                  <AppText variant="caption" color={theme.colors.muted}>UHID: {p.uhid}</AppText>
                </View>
                <FileBarChart size={20} color={theme.colors.primary} strokeWidth={2} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon: Icon, label, value, color, theme }: { icon: any; label: string; value: string; color: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flex: 1 }}>
      <Card padding={12} elevation="sm">
        <Icon size={16} color={color} strokeWidth={2} />
        <AppTextBold variant="number" color={theme.colors.onSurface} style={{ fontSize: 18, marginTop: 4 }}>{value}</AppTextBold>
        <AppText variant="caption" color={theme.colors.muted}>{label}</AppText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
