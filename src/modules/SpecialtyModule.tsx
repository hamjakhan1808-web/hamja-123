import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { useSettings } from '@/src/providers/SettingsProvider';
import { getClinical, saveClinical, deleteClinical } from '@/src/data/repository';
import {
  emptyClinicalRecord, SPECIALTY_FIELDS, gcsTotal, bradenTotal, type ClinicalRecord,
} from '@/src/data/models/ClinicalRecord';
import { MODULE_META, type ModuleKey } from '@/src/data/modules';

export function SpecialtyModule({ patientId, module }: { patientId: string; module: ModuleKey }) {
  const theme = useTheme();
  const router = useRouter();
  const { settings } = useSettings();
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ClinicalRecord>(emptyClinicalRecord(patientId, module));

  const fields = SPECIALTY_FIELDS[module] || [];
  const label = MODULE_META[module].label;

  const load = useCallback(async () => {
    const list = await getClinical(patientId, module);
    list.sort((a, b) => b.createdAt - a.createdAt);
    setRecords(list);
  }, [patientId, module]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    await saveClinical({ ...form, nurseName: form.nurseName || settings.nurseName || 'Nurse' });
    setShowAdd(false);
    setForm(emptyClinicalRecord(patientId, module));
    await load();
  };

  const setField = (key: string, value: string) => {
    setForm((f) => ({ ...f, fields: { ...f.fields, [key]: value } }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>{label}</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {records.length === 0 ? (
          <EmptyState title="No records yet" message={`Tap + to add a ${label} record.`} />
        ) : (
          records.map((r) => (
            <Card key={r.id} elevation="sm" style={{ marginBottom: 10 }} padding={0}>
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppTextBold variant="title">{r.date} {r.time}</AppTextBold>
                  <Pressable onPress={async () => { await deleteClinical(r.id); await load(); }} hitSlop={8}>
                    <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                  </Pressable>
                </View>
                <View style={{ marginTop: 8, gap: 4 }}>
                  {fields.map((f) => (
                    <View key={f.key} style={{ flexDirection: 'row' }}>
                      <AppText variant="caption" color={theme.colors.muted} style={{ width: 120 }}>{f.label}:</AppText>
                      <AppText variant="bodySmall" color={theme.colors.onSurface}>{r.fields[f.key] || '—'}</AppText>
                    </View>
                  ))}
                  {module === 'gcs' && r.fields.eye && (
                    <View style={{ flexDirection: 'row' }}>
                      <AppText variant="caption" color={theme.colors.muted} style={{ width: 120 }}>GCS Total:</AppText>
                      <AppTextBold variant="bodySmall" color={theme.colors.primary}>{gcsTotal(r.fields)} / 15</AppTextBold>
                    </View>
                  )}
                  {module === 'bradenScale' && r.fields.sensory && (
                    <View style={{ flexDirection: 'row' }}>
                      <AppText variant="caption" color={theme.colors.muted} style={{ width: 120 }}>Braden Total:</AppText>
                      <AppTextBold variant="bodySmall" color={theme.colors.primary}>{bradenTotal(r.fields)} / 23</AppTextBold>
                    </View>
                  )}
                </View>
                {r.notes ? <AppText variant="caption" color={theme.colors.onSurfaceVariant} style={{ marginTop: 6 }}>{r.notes}</AppText> : null}
                {r.nurseName ? <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 4 }}>— {r.nurseName}</AppText> : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptyClinicalRecord(patientId, module)); setShowAdd(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      <Sheet visible={showAdd} onClose={() => setShowAdd(false)} title={`Add ${label} Record`}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><Field label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="HH:mm" /></View>
          </View>
          {fields.map((f) => {
            if (f.type === 'select' && f.options) {
              return (
                <View key={f.key} style={{ marginBottom: 12 }}>
                  <AppText variant="label" color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }}>{f.label}</AppText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {f.options.map((opt) => {
                      const selected = form.fields[f.key] === opt;
                      return (
                        <Pressable key={opt} onPress={() => setField(f.key, opt)}>
                          <View style={[styles.chip, { backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surfaceVariant, borderColor: selected ? theme.colors.primary : theme.colors.outline }]}>
                            <AppText variant="bodySmall" color={selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant} style={{ fontWeight: '600' }}>{opt}</AppText>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            }
            return (
              <Field
                key={f.key}
                label={f.label}
                value={form.fields[f.key] || ''}
                onChangeText={(v) => setField(f.key, v)}
                placeholder={f.label}
                keyboardType={f.type === 'number' ? 'numeric' : 'default'}
              />
            );
          })}
          {module === 'gcs' && form.fields.eye && (
            <View style={{ marginBottom: 12 }}>
              <AppTextBold variant="title" color={theme.colors.primary}>GCS Total: {gcsTotal(form.fields)} / 15</AppTextBold>
            </View>
          )}
          {module === 'bradenScale' && form.fields.sensory && (
            <View style={{ marginBottom: 12 }}>
              <AppTextBold variant="title" color={theme.colors.primary}>Braden Total: {bradenTotal(form.fields)} / 23</AppTextBold>
            </View>
          )}
          <Field label="Notes" value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} placeholder="Optional notes" multiline />
          <Field label="Nurse Name" value={form.nurseName} onChangeText={(v) => setForm({ ...form, nurseName: v })} placeholder={settings.nurseName || 'Nurse'} />
          <Button label="Save Record" onPress={handleSave} fullWidth style={{ marginTop: 8 }} />
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, marginBottom: 4 },
});
