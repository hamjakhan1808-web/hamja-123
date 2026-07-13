import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, Table, Trash2, Save, X } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { getCustomCharts, saveCustomChart, deleteCustomChart } from '@/src/data/repository';
import { emptyCustomChart, type CustomChart, type CustomColumn } from '@/src/data/models/CustomChart';

export function CustomChartModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const [charts, setCharts] = useState<CustomChart[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [form, setForm] = useState<CustomChart>(emptyCustomChart(patientId));

  const load = useCallback(async () => {
    const list = await getCustomCharts(patientId);
    setCharts(list);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    await saveCustomChart(form);
    setShowBuilder(false);
    setForm(emptyCustomChart(patientId));
    await load();
  };

  const addRow = (chart: CustomChart, setChart: (c: CustomChart) => void) => {
    setChart({ ...chart, rows: [...chart.rows, chart.columns.map(() => '')] });
  };

  const updateCell = (chart: CustomChart, setChart: (c: CustomChart) => void, rowIdx: number, colIdx: number, value: string) => {
    const rows = chart.rows.map((r, i) => i === rowIdx ? r.map((c, j) => j === colIdx ? value : c) : r);
    setChart({ ...chart, rows });
  };

  const addColumn = (chart: CustomChart, setChart: (c: CustomChart) => void) => {
    setChart({ ...chart, columns: [...chart.columns, { name: `Col ${chart.columns.length + 1}`, type: 'text' as const }], rows: chart.rows.map((r) => [...r, '']) });
  };

  const removeColumn = (chart: CustomChart, setChart: (c: CustomChart) => void, idx: number) => {
    setChart({ ...chart, columns: chart.columns.filter((_, i) => i !== idx), rows: chart.rows.map((r) => r.filter((_, j) => j !== idx)) });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Custom Charts</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {charts.length === 0 ? (
          <EmptyState icon={<Table size={36} color={theme.colors.muted} />} title="No custom charts" message="Build a custom table for this patient." />
        ) : (
          charts.map((c) => (
            <Card key={c.id} elevation="sm" style={{ marginBottom: 16 }} padding={0}>
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppTextBold variant="title">{c.name}</AppTextBold>
                  <Pressable onPress={async () => { await deleteCustomChart(c.id); await load(); }} hitSlop={8}>
                    <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                  </Pressable>
                </View>

                {/* Table */}
                <View style={{ marginTop: 10, borderWidth: 1, borderColor: theme.colors.outlineVariant, borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row', backgroundColor: theme.colors.primaryContainer }}>
                    {c.columns.map((col, i) => (
                      <View key={i} style={{ flex: 1, padding: 8, borderRightWidth: i < c.columns.length - 1 ? 1 : 0, borderRightColor: theme.colors.outlineVariant }}>
                        <AppTextBold variant="caption" color={theme.colors.onPrimaryContainer}>{col.name}</AppTextBold>
                      </View>
                    ))}
                  </View>
                  {c.rows.map((row, ri) => (
                    <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant, backgroundColor: ri % 2 ? theme.colors.surfaceVariant : theme.colors.surface }}>
                      {row.map((cell, ci) => (
                        <View key={ci} style={{ flex: 1, padding: 8, borderRightWidth: ci < row.length - 1 ? 1 : 0, borderRightColor: theme.colors.outlineVariant }}>
                          <TextInput
                            value={cell}
                            onChangeText={(v) => {
                              const updated = { ...c, rows: c.rows.map((r, i) => i === ri ? r.map((val, j) => j === ci ? v : val) : r) };
                              saveCustomChart(updated);
                              setCharts((prev) => prev.map((x) => x.id === c.id ? updated : x));
                            }}
                            style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: theme.colors.onSurface, padding: 0 }}
                            placeholder="—"
                            placeholderTextColor={theme.colors.muted}
                          />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Button label="Add Row" variant="tonal" onPress={async () => { const updated = { ...c, rows: [...c.rows, c.columns.map(() => '')] }; await saveCustomChart(updated); await load(); }} style={{ flex: 1 }} />
                  <Button label="Add Column" variant="outline" onPress={async () => { const updated = { ...c, columns: [...c.columns, { name: `Col ${c.columns.length + 1}`, type: 'text' as const }], rows: c.rows.map((r) => [...r, '']) }; await saveCustomChart(updated); await load(); }} style={{ flex: 1 }} />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptyCustomChart(patientId)); setShowBuilder(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      <Sheet visible={showBuilder} onClose={() => setShowBuilder(false)} title="Build Custom Chart">
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          <Field label="Chart Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="e.g. Wound Tracking" required />

          <AppText variant="label" color={theme.colors.onSurfaceVariant} style={{ marginTop: 12, marginBottom: 8 }}>Columns</AppText>
          {form.columns.map((col, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TextInput
                value={col.name}
                onChangeText={(v) => setForm({ ...form, columns: form.columns.map((c, j) => j === i ? { ...c, name: v } : c) })}
                style={[styles.colInput, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                placeholder={`Column ${i + 1}`}
              />
              {form.columns.length > 1 && (
                <Pressable onPress={() => removeColumn(form, setForm, i)} hitSlop={8}>
                  <X size={18} color={theme.colors.error} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          ))}
          <Button label="+ Add Column" variant="outline" onPress={() => addColumn(form, setForm)} style={{ marginTop: 4 }} />

          <View style={{ height: 16 }} />
          <Button label="Create Chart" onPress={handleSave} fullWidth icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />} />
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  colInput: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter-Regular' },
});
