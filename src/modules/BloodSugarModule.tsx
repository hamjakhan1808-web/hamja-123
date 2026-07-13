import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, Droplet, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field, SelectField } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { LineChart } from '@/src/components/LineChart';
import { getSugar, saveSugar, deleteSugar } from '@/src/data/repository';
import {
  emptySugarEntry, classifySugar, SUGAR_TYPE_LABELS, type BloodSugarEntry, type SugarType,
} from '@/src/data/models/BloodSugar';

export function BloodSugarModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const [entries, setEntries] = useState<BloodSugarEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<BloodSugarEntry>(emptySugarEntry(patientId));

  const load = useCallback(async () => {
    const list = await getSugar(patientId);
    list.sort((a, b) => a.createdAt - b.createdAt);
    setEntries(list);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!form.value.trim()) return;
    await saveSugar(form);
    setShowAdd(false);
    setForm(emptySugarEntry(patientId));
    await load();
  };

  const chartData = entries.map((e) => ({ label: e.date.slice(5), value: parseFloat(e.value) || 0 })).filter((d) => d.value > 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Blood Sugar</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {chartData.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="title" style={{ marginBottom: 8 }}>Trend Graph</AppTextBold>
            <LineChart data={chartData} color={theme.colors.tile6} unit="mg/dL" />
          </Card>
        )}

        {entries.length === 0 ? (
          <EmptyState icon={<Droplet size={36} color={theme.colors.muted} />} title="No readings yet" message="Tap + to add a blood sugar reading." />
        ) : (
          [...entries].reverse().map((e) => {
            const level = classifySugar(e.value, e.type);
            const color = level === 'Low' ? theme.colors.warning : level === 'High' ? theme.colors.error : theme.colors.success;
            const bg = level === 'Low' ? theme.colors.warningContainer : level === 'High' ? theme.colors.errorContainer : theme.colors.successContainer;
            return (
              <Card key={e.id} elevation="sm" style={{ marginBottom: 8 }} padding={0}>
                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.levelDot, { backgroundColor: color }]} />
                      <AppTextBold variant="title">{e.value} {e.type === 'HbA1c' ? '%' : 'mg/dL'}</AppTextBold>
                    </View>
                    <Pressable onPress={async () => { await deleteSugar(e.id); await load(); }} hitSlop={8}>
                      <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <View style={[styles.tag, { backgroundColor: bg }]}>
                      <AppText variant="caption" color={color} style={{ fontWeight: '700' }}>{level}</AppText>
                    </View>
                    <AppText variant="caption" color={theme.colors.muted}>{SUGAR_TYPE_LABELS[e.type]}</AppText>
                    <AppText variant="caption" color={theme.colors.muted}>{e.date} {e.time}</AppText>
                  </View>
                  {e.remarks ? <AppText variant="caption" color={theme.colors.onSurfaceVariant} style={{ marginTop: 6 }}>{e.remarks}</AppText> : null}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptySugarEntry(patientId)); setShowAdd(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      <Sheet visible={showAdd} onClose={() => setShowAdd(false)} title="Add Blood Sugar Reading">
        <SelectField label="Type" value={form.type} options={Object.keys(SUGAR_TYPE_LABELS) as SugarType[]} onSelect={(v) => setForm({ ...form, type: v as SugarType })} />
        <Field label="Sugar Value" value={form.value} onChangeText={(v) => setForm({ ...form, value: v })} placeholder={form.type === 'HbA1c' ? 'e.g. 6.2' : 'e.g. 110'} keyboardType="numeric" required />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><Field label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" /></View>
          <View style={{ flex: 1 }}><Field label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="HH:mm" /></View>
        </View>
        <Field label="Remarks" value={form.remarks} onChangeText={(v) => setForm({ ...form, remarks: v })} placeholder="Optional notes" multiline />
        <Button label="Save Reading" onPress={handleSave} fullWidth style={{ marginTop: 8 }} />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
