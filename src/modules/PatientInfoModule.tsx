import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Pencil, Phone, MapPin, Stethoscope, Droplet, Calendar, User } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { enabledModuleKeys, MODULE_META } from '@/src/data/modules';

export function PatientInfoModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { getById, refresh } = usePatients();
  const patient = getById(patientId);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!patient) return null;

  const enabled = enabledModuleKeys(patient.modules);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Patient Information</AppTextBold>
        <Pressable onPress={() => router.push(`/patient/register?id=${patient.id}`)} hitSlop={8}>
          <Pencil size={22} color={theme.colors.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card elevation="md" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <AppTextBold variant="h1" color={theme.colors.onPrimaryContainer}>{patient.name.charAt(0).toUpperCase()}</AppTextBold>
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="h2">{patient.name}</AppTextBold>
              <AppText variant="bodySmall" color={theme.colors.muted}>UHID: {patient.uhid}</AppText>
            </View>
          </View>
        </Card>

        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <InfoRow icon={User} label="Age" value={patient.age ? `${patient.age} years` : '—'} theme={theme} />
          <InfoRow icon={User} label="Gender" value={patient.gender || '—'} theme={theme} />
          <InfoRow icon={Droplet} label="Blood Group" value={patient.bloodGroup || '—'} theme={theme} />
          <InfoRow icon={MapPin} label="Address" value={patient.address || '—'} theme={theme} />
        </Card>

        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <InfoRow icon={Stethoscope} label="Diagnosis" value={patient.diagnosis || '—'} theme={theme} />
          <InfoRow icon={User} label="Doctor" value={patient.doctorName || '—'} theme={theme} />
          <InfoRow icon={User} label="Nurse" value={patient.nurseName || '—'} theme={theme} />
          <InfoRow icon={Phone} label="Mobile" value={patient.mobile || '—'} theme={theme} />
          <InfoRow icon={Calendar} label="Admission" value={patient.admissionDate || '—'} theme={theme} />
          <InfoRow icon={Calendar} label="Discharge" value={patient.dischargeDate || '—'} theme={theme} />
          <InfoRow icon={Droplet} label="Allergy" value={patient.allergy || 'None'} theme={theme} valueColor={patient.allergy ? theme.colors.error : undefined} last />
        </Card>

        <AppTextBold variant="title" style={{ marginTop: 8, marginBottom: 8 }}>Active Modules ({enabled.length})</AppTextBold>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {enabled.map((k) => (
            <View key={k} style={[styles.moduleTag, { backgroundColor: theme.colors.primaryContainer }]}>
              <AppText variant="caption" color={theme.colors.onPrimaryContainer} style={{ fontWeight: '600' }}>{MODULE_META[k].label}</AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor, theme, last }: { icon: any; label: string; value: string; valueColor?: string; theme: ReturnType<typeof useTheme>; last?: boolean }) {
  return (
    <View style={[styles.infoRow, { borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.outlineVariant }]}>
      <View style={{ width: 28, alignItems: 'center' }}><Icon size={16} color={theme.colors.muted} strokeWidth={2} /></View>
      <AppText variant="caption" color={theme.colors.muted} style={{ width: 90 }}>{label}</AppText>
      <AppText variant="body" color={valueColor ?? theme.colors.onSurface} style={{ flex: 1 }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  moduleTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
});
