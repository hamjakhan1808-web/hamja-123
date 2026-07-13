import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft, Pencil, FileText, Pill, Activity, Droplet, NotebookPen,
  FlaskConical, Wind, Stethoscope, CircleDot, Syringe, Bandage,
  Brain, Scale, ShieldAlert, Table, ChevronRight, type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { MODULE_KEYS, MODULE_META, enabledModuleKeys, type ModuleKey } from '@/src/data/modules';

const ICONS: Record<ModuleKey, LucideIcon> = {
  patientInfo: FileText,
  medicine: Pill,
  vitals: Activity,
  bloodSugar: Droplet,
  intakeOutput: FlaskConical,
  nursingNotes: NotebookPen,
  ivFluid: Syringe,
  oxygen: Wind,
  nebulization: Stethoscope,
  tracheostomy: CircleDot,
  rylesTube: CircleDot,
  suction: CircleDot,
  catheter: CircleDot,
  woundDressing: Bandage,
  gcs: Brain,
  painAssessment: Scale,
  bradenScale: ShieldAlert,
  fallRisk: ShieldAlert,
  customChart: Table,
};

export default function PatientDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, refresh } = usePatients();
  const patient = id ? getById(id) : undefined;

  useFocusEffect(React.useCallback(() => { refresh(); }, [refresh]));

  if (!patient) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <AppText variant="body" color={theme.colors.muted}>Patient not found.</AppText>
      </SafeAreaView>
    );
  }

  const enabled = enabledModuleKeys(patient.modules);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>{patient.name}</AppTextBold>
        <Pressable onPress={() => router.push(`/patient/register?id=${patient.id}`)} hitSlop={8}>
          <Pencil size={22} color={theme.colors.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Patient summary card */}
        <Card elevation="md" style={{ overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <AppTextBold variant="h2" color={theme.colors.onPrimaryContainer}>{patient.name.charAt(0).toUpperCase()}</AppTextBold>
            </View>
            <View style={{ flex: 1 }}>
              <AppTextBold variant="h2">{patient.name}</AppTextBold>
              <AppText variant="caption" color={theme.colors.muted}>UHID: {patient.uhid}</AppText>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                {patient.age ? <Tag theme={theme} label={`${patient.age} yrs`} /> : null}
                {patient.gender ? <Tag theme={theme} label={patient.gender} /> : null}
                {patient.bloodGroup ? <Tag theme={theme} label={`Blood ${patient.bloodGroup}`} /> : null}
              </View>
            </View>
          </View>
          {(patient.diagnosis || patient.doctorName) && (
            <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant }}>
              {patient.diagnosis ? <InfoRow theme={theme} label="Diagnosis" value={patient.diagnosis} /> : null}
              {patient.doctorName ? <InfoRow theme={theme} label="Doctor" value={patient.doctorName} /> : null}
              {patient.nurseName ? <InfoRow theme={theme} label="Nurse" value={patient.nurseName} /> : null}
              {patient.allergy ? <InfoRow theme={theme} label="Allergy" value={patient.allergy} valueColor={theme.colors.error} /> : null}
            </View>
          )}
        </Card>

        {/* Module grid */}
        <View style={[styles.sectionTitleRow, { marginTop: 24, marginBottom: 12 }]}>
          <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: theme.colors.primary }} />
          <AppTextBold variant="title">Clinical Modules</AppTextBold>
          <AppText variant="caption" color={theme.colors.muted}>{enabled.length} active</AppText>
        </View>

        <View style={styles.grid}>
          {enabled.map((key, i) => {
            const Icon = ICONS[key];
            const tileColor = (theme.colors as any)[MODULE_META[key].tile] as string;
            return (
              <Animated.View key={key} entering={FadeInDown.delay(i * 40).duration(theme.animations.normal)} style={{ flex: '48%' }}>
                <Card
                  onPress={() => router.push(`/module/${patient.id}/${key}`)}
                  elevation="sm"
                  style={{ overflow: 'hidden' }}
                >
                  <View style={{ padding: 16 }}>
                    <View style={[styles.tileIcon, { backgroundColor: tileColor + '18' }]}>
                      <Icon size={22} color={tileColor} strokeWidth={2} />
                    </View>
                    <AppTextBold variant="body" style={{ marginTop: 10 }}>{MODULE_META[key].label}</AppTextBold>
                    <ChevronRight size={16} color={theme.colors.muted} strokeWidth={2} style={{ marginTop: 4 }} />
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push(`/reports/${patient.id}`)}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.secondary, opacity: pressed ? 0.88 : 1 }]}
        android_ripple={{ color: theme.colors.secondary, radius: 28 }}
      >
        <FileText size={24} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </SafeAreaView>
  );
}

function Tag({ label, theme }: { label: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
      <AppText variant="caption" color={theme.colors.onSurfaceVariant}>{label}</AppText>
    </View>
  );
}

function InfoRow({ label, value, valueColor, theme }: { label: string; value: string; valueColor?: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
      <AppText variant="caption" color={theme.colors.muted} style={{ width: 80 }}>{label}</AppText>
      <AppText variant="bodySmall" color={valueColor ?? theme.colors.onSurface} style={{ flex: 1 }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tileIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
