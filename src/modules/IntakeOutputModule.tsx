import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, FlaskConical, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field, SelectField } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { getIO, saveIO, deleteIO } from '@/src/data/repository';
import { emptyIOEntry, totals, type IntakeOutputEntry, type IOType } from '@/src/data/models/IntakeOutput';

export function IntakeOutputModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const [entries, setEntries] = useState<IntakeOutputEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<IntakeOutputEntry>(emptyIOEntry(patientId));

  const load = useCallback(async () => {
    const list = await getIO(patientId);
    list.sort((a, b) => a.createdAt - b.createdAt);
    setEntries(list);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!form.amount.trim()) return;
    await saveIO(form);
    setShowAdd(false);
    setForm(emptyIOEntry(patientId));
    await load();
  };

  const t = totals(entries);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Intake / Output</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <SummaryCard icon={ArrowDownCircle} label="Total Intake" value={`${t.intake} mL`} color={theme.colors.tile5} theme={theme} />
          <SummaryCard icon={ArrowUpCircle} label="Total Output" value={`${t.output} mL`} color={theme.colors.tile6} theme={theme} />
          <SummaryCard icon={FlaskConical} label="Balance" value={`${t.balance} mL`} color={t.balance >= 0 ? theme.colors.success : theme.colors.error} theme={theme} />
        </View>

        {entries.length === 0 ? (
          <EmptyState icon={<FlaskConical size={36} color={theme.colors.muted} />} title="No entries yet" message="Tap + to record intake or output." />
        ) : (
          [...entries].reverse().map((e) => {
            const isIntake = e.type === 'Intake';
            const color = isIntake ? theme.colors.tile5 : theme.colors.tile6;
            return (
              <Card key={e.id} elevation="sm" style={{ marginBottom: 8 }} padding={0}>
                <View style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.typeDot, { backgroundColor: color }]} />
                      <AppTextBold variant="title">{e.type}</AppTextBold>
                      <AppText variant="caption" color={theme.colors.muted}>{e.time}</AppText>
                    </View>
                    <Pressable onPress={async () => { await deleteIO(e.id); await load(); }} hitSlop={8}>
                      <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <AppText variant="body" color={theme.colors.onSurface}>{e.details}</AppText>
                    <AppTextBold variant="body" color={color}>{e.amount} mL</AppTextBold>
                  </View>
                  {e.remarks ? <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 4 }}>{e.remarks}</AppText> : null}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptyIOEntry(patientId)); setShowAdd(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      <Sheet visible={showAdd} onClose={() => setShowAdd(false)} title="Add Intake / Output">
        <SelectField label="Type" value={form.type} options={['Intake', 'Output']} onSelect={(v) => setForm({ ...form, type: v as IOType })} />
        <Field label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="HH:mm" />
        <Field label="Details" value={form.details} onChangeText={(v) => setForm({ ...form, details: v })} placeholder="e.g. Oral, IV, Urine" />
        <Field label="Amount (mL)" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="0" keyboardType="numeric" required />
        <Field label="Remarks" value={form.remarks} onChangeText={(v) => setForm({ ...form, remarks: v })} placeholder="Optional notes" multiline />
        <Button label="Save Entry" onPress={handleSave} fullWidth style={{ marginTop: 8 }} />
      </Sheet>
    </SafeAreaView>
  );
}

function SummaryCard({ icon: Icon, label, value, color, theme }: { icon: any; label: string; value: string; color: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flex: 1 }}>
      <Card padding={12} elevation="sm">
        <Icon size={18} color={color} strokeWidth={2} />
        <AppTextBold variant="number" color={theme.colors.onSurface} style={{ fontSize: 18, marginTop: 6 }}>{value}</AppTextBold>
        <AppText variant="caption" color={theme.colors.muted}>{label}</AppText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
});
