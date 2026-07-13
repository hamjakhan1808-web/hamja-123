import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, Activity, Trash2, Settings2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field, SelectField } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { LineChart } from '@/src/components/LineChart';
import {
  getVitals, saveVital, deleteVital, getVitalsConfig, setVitalsConfig,
} from '@/src/data/repository';
import {
  emptyVitalEntry, defaultVitalsConfig, calcBMI, vitalsSlots,
  type VitalEntry, type VitalsConfig, type VitalsFrequency,
} from '@/src/data/models/Vitals';
import { useSettings } from '@/src/providers/SettingsProvider';

export function VitalsModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const { settings } = useSettings();
  const router = useRouter();
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [config, setConfig] = useState<VitalsConfig>(defaultVitalsConfig());
  const [showConfig, setShowConfig] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<VitalEntry>(emptyVitalEntry(patientId));

  const load = useCallback(async () => {
    const list = await getVitals(patientId);
    list.sort((a, b) => a.timestamp - b.timestamp);
    setEntries(list);
    const cfg = await getVitalsConfig(patientId);
    if (cfg) setConfig(cfg);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const updateForm = (key: keyof VitalEntry, value: any) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'weight' || key === 'height') {
        next.bmi = calcBMI(next.weight, next.height);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const entry = { ...form, nurseName: form.nurseName || settings.nurseName || 'Nurse' };
    await saveVital(entry);
    setShowAdd(false);
    setForm(emptyVitalEntry(patientId));
    await load();
  };

  const toggleParam = (key: keyof VitalsConfig['enabled']) => {
    const next = { ...config, enabled: { ...config.enabled, [key]: !config.enabled[key] } };
    setConfig(next);
    setVitalsConfig(patientId, next);
  };

  const setFreq = (freq: VitalsFrequency) => {
    const next = { ...config, frequency: freq };
    setConfig(next);
    setVitalsConfig(patientId, next);
  };

  // chart data
  const pulseData = entries.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.pulse) || 0 })).filter((d) => d.value > 0);
  const tempData = entries.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.temperature) || 0 })).filter((d) => d.value > 0);
  const bpData = entries.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.bpSystolic) || 0 })).filter((d) => d.value > 0);
  const spo2Data = entries.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.spo2) || 0 })).filter((d) => d.value > 0);

  const slots = vitalsSlots(config.frequency, config.customSlots);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Vital Signs</AppTextBold>
        <Pressable onPress={() => setShowConfig(true)} hitSlop={8}>
          <Settings2 size={22} color={theme.colors.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Frequency info */}
        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color={theme.colors.primary} strokeWidth={2} />
            <AppText variant="body">Frequency: <AppTextBold variant="body">{config.frequency}</AppTextBold></AppText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {slots.slice(0, 8).map((s) => (
              <View key={s} style={[styles.slotTag, { backgroundColor: theme.colors.primaryContainer }]}>
                <AppText variant="caption" color={theme.colors.onPrimaryContainer}>{s}</AppText>
              </View>
            ))}
            {slots.length > 8 && <AppText variant="caption" color={theme.colors.muted}>+{slots.length - 8} more</AppText>}
          </View>
        </Card>

        {/* Charts */}
        {pulseData.length > 0 && config.enabled.pulse && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="title" style={{ marginBottom: 8 }}>Pulse (bpm)</AppTextBold>
            <LineChart data={pulseData} color={theme.colors.tile2} unit="bpm" />
          </Card>
        )}
        {tempData.length > 0 && config.enabled.temperature && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="title" style={{ marginBottom: 8 }}>Temperature (°F)</AppTextBold>
            <LineChart data={tempData} color={theme.colors.tile3} unit="°F" />
          </Card>
        )}
        {bpData.length > 0 && config.enabled.bp && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="title" style={{ marginBottom: 8 }}>BP Systolic (mmHg)</AppTextBold>
            <LineChart data={bpData} color={theme.colors.tile6} unit="mmHg" />
          </Card>
        )}
        {spo2Data.length > 0 && config.enabled.spo2 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="title" style={{ marginBottom: 8 }}>SpO₂ (%)</AppTextBold>
            <LineChart data={spo2Data} color={theme.colors.tile5} unit="%" min={80} max={100} />
          </Card>
        )}

        {/* Entries */}
        <AppTextBold variant="title" style={{ marginTop: 8, marginBottom: 8 }}>Recorded Entries</AppTextBold>
        {entries.length === 0 ? (
          <EmptyState icon={<Activity size={36} color={theme.colors.muted} />} title="No vitals recorded" message="Tap + to add the first reading." />
        ) : (
          [...entries].reverse().map((e) => (
            <Card key={e.id} elevation="sm" style={{ marginBottom: 8 }} padding={0}>
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppTextBold variant="body">{new Date(e.timestamp).toLocaleString()}</AppTextBold>
                  <Pressable onPress={async () => { await deleteVital(e.id); await load(); }} hitSlop={8}>
                    <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {e.temperature && <VitalChip label="Temp" value={`${e.temperature}°F`} theme={theme} />}
                  {e.pulse && <VitalChip label="Pulse" value={`${e.pulse} bpm`} theme={theme} />}
                  {e.respiration && <VitalChip label="Resp" value={`${e.respiration}/min`} theme={theme} />}
                  {e.bpSystolic && <VitalChip label="BP" value={`${e.bpSystolic}/${e.bpDiastolic}`} theme={theme} />}
                  {e.spo2 && <VitalChip label="SpO₂" value={`${e.spo2}%`} theme={theme} />}
                  {e.bmi && <VitalChip label="BMI" value={e.bmi} theme={theme} />}
                </View>
                {e.notes ? <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 6 }}>{e.notes}</AppText> : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptyVitalEntry(patientId)); setShowAdd(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      {/* Config Sheet */}
      <Sheet visible={showConfig} onClose={() => setShowConfig(false)} title="Vitals Configuration">
        <AppText variant="label" color={theme.colors.onSurfaceVariant} style={{ marginBottom: 8 }}>Frequency</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(['MorningEvening', 'Hourly', 'Every2H', 'Every3H', 'Every4H', 'Custom'] as VitalsFrequency[]).map((f) => (
            <Pressable key={f} onPress={() => setFreq(f)}>
              <View style={[styles.freqChip, { backgroundColor: config.frequency === f ? theme.colors.primaryContainer : theme.colors.surfaceVariant, borderColor: config.frequency === f ? theme.colors.primary : theme.colors.outline }]}>
                <AppText variant="bodySmall" color={config.frequency === f ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant} style={{ fontWeight: '600' }}>{f === 'MorningEvening' ? 'Morning & Evening' : f === 'Every2H' ? 'Every 2 Hrs' : f === 'Every3H' ? 'Every 3 Hrs' : f === 'Every4H' ? 'Every 4 Hrs' : f}</AppText>
              </View>
            </Pressable>
          ))}
        </View>
        {config.frequency === 'Custom' && (
          <TextInput
            value={config.customSlots.join(', ')}
            onChangeText={(v) => setConfig({ ...config, customSlots: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="08:00, 14:00, 20:00"
            style={[styles.customInput, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
          />
        )}
        <AppText variant="label" color={theme.colors.onSurfaceVariant} style={{ marginTop: 16, marginBottom: 8 }}>Parameters</AppText>
        {([
          ['temperature', 'Temperature'], ['pulse', 'Pulse'], ['respiration', 'Respiration'],
          ['bp', 'Blood Pressure'], ['spo2', 'SpO₂'], ['pain', 'Pain Score'],
          ['weight', 'Weight'], ['height', 'Height'], ['bmi', 'BMI (auto)'], ['custom', 'Custom Vital'],
        ] as [keyof VitalsConfig['enabled'], string][]).map(([key, label]) => (
          <View key={key} style={[styles.paramRow, { borderBottomColor: theme.colors.outlineVariant }]}>
            <AppText variant="body">{label}</AppText>
            <Switch value={config.enabled[key]} onValueChange={() => toggleParam(key)} trackColor={{ false: theme.colors.outline, true: theme.colors.primary }} thumbColor="#FFFFFF" />
          </View>
        ))}
        <Button label="Done" onPress={() => setShowConfig(false)} fullWidth style={{ marginTop: 16 }} />
      </Sheet>

      {/* Add Entry Sheet */}
      <Sheet visible={showAdd} onClose={() => setShowAdd(false)} title="Record Vitals">
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          {config.enabled.temperature && <Field label="Temperature (°F)" value={form.temperature} onChangeText={(v) => updateForm('temperature', v)} placeholder="98.6" keyboardType="numeric" />}
          {config.enabled.pulse && <Field label="Pulse (bpm)" value={form.pulse} onChangeText={(v) => updateForm('pulse', v)} placeholder="72" keyboardType="numeric" />}
          {config.enabled.respiration && <Field label="Respiration (/min)" value={form.respiration} onChangeText={(v) => updateForm('respiration', v)} placeholder="16" keyboardType="numeric" />}
          {config.enabled.bp && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="BP Systolic" value={form.bpSystolic} onChangeText={(v) => updateForm('bpSystolic', v)} placeholder="120" keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Field label="BP Diastolic" value={form.bpDiastolic} onChangeText={(v) => updateForm('bpDiastolic', v)} placeholder="80" keyboardType="numeric" /></View>
            </View>
          )}
          {config.enabled.spo2 && <Field label="SpO₂ (%)" value={form.spo2} onChangeText={(v) => updateForm('spo2', v)} placeholder="98" keyboardType="numeric" />}
          {config.enabled.pain && <Field label="Pain Score (0-10)" value={form.painScore} onChangeText={(v) => updateForm('painScore', v)} placeholder="0" keyboardType="numeric" />}
          {config.enabled.weight && <Field label="Weight (kg)" value={form.weight} onChangeText={(v) => updateForm('weight', v)} placeholder="70" keyboardType="numeric" />}
          {config.enabled.height && <Field label="Height (cm)" value={form.height} onChangeText={(v) => updateForm('height', v)} placeholder="170" keyboardType="numeric" />}
          {config.enabled.bmi && <Field label="BMI (auto)" value={form.bmi} onChangeText={() => {}} placeholder="Auto-calculated" />}
          {config.enabled.custom && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="Custom Vital Name" value={form.customVitalName} onChangeText={(v) => updateForm('customVitalName', v)} placeholder="e.g. Glucose" /></View>
              <View style={{ flex: 1 }}><Field label="Value" value={form.customVitalValue} onChangeText={(v) => updateForm('customVitalValue', v)} placeholder="Value" /></View>
            </View>
          )}
          <Field label="Notes" value={form.notes} onChangeText={(v) => updateForm('notes', v)} placeholder="Optional notes" multiline />
          <Button label="Save Reading" onPress={handleSave} fullWidth style={{ marginTop: 8 }} />
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

function VitalChip({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
      <AppText variant="caption" color={theme.colors.muted}>{label}: <AppTextBold variant="caption" color={theme.colors.onSurface}>{value}</AppTextBold></AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  slotTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  freqChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
  paramRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  customInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter-Regular', marginBottom: 8 },
});
