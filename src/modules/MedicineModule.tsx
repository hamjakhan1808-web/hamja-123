import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Pill, Check, Clock, AlarmClock, Bell } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field, SelectField } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/States';
import {
  getMedicines, saveMedicine, deleteMedicine,
} from '@/src/data/repository';
import {
  emptyMedicine, generateTimes, type Medicine, type MedicineDose, type DoseStatus,
} from '@/src/data/models/Medicine';
import { useSettings } from '@/src/providers/SettingsProvider';

export function MedicineModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const { settings } = useSettings();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [confirmDose, setConfirmDose] = useState<{ med: Medicine; dose: MedicineDose } | null>(null);

  const load = useCallback(async () => {
    const list = await getMedicines(patientId);
    setMeds(list);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Mark missed doses (pending & time passed)
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let changed = false;
    const updated = meds.map((m) => ({
      ...m,
      doses: m.doses.map((d) => {
        if (d.status === 'pending' && d.givenDate === today) {
          const [h, mi] = d.time.split(':').map(Number);
          if (h * 60 + mi + 30 < currentMins) {
            return { ...d, status: 'missed' as DoseStatus };
          }
        }
        return d;
      }),
    }));
    if (JSON.stringify(updated) !== JSON.stringify(meds)) {
      setMeds(updated);
      updated.forEach((m) => { if (m.doses.some((d) => d.status === 'missed')) saveMedicine(m); });
    }
  }, [meds]);

  const openNew = () => {
    setEditing(emptyMedicine(patientId));
    setSheetOpen(true);
  };

  const handleSaveMed = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return;
    const times = generateTimes(editing.frequency, editing.customTimes);
    const existingDoses = editing.doses.filter((d) => times.includes(d.time));
    const newDoses: MedicineDose[] = times.map((t) => {
      const existing = editing.doses.find((d) => d.time === t);
      return existing || {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        time: t,
        status: 'pending' as DoseStatus,
        givenAt: null,
        givenBy: '',
        givenDate: editing.startDate,
      };
    });
    const med = { ...editing, doses: newDoses };
    await saveMedicine(med);
    setSheetOpen(false);
    setEditing(null);
    await load();
  };

  const markGiven = async () => {
    if (!confirmDose) return;
    const { med, dose } = confirmDose;
    const now = new Date();
    const updatedDoses = med.doses.map((d) =>
      d.id === dose.id
        ? { ...d, status: 'given' as DoseStatus, givenAt: Date.now(), givenBy: settings.nurseName || 'Nurse', givenDate: now.toISOString().slice(0, 10) }
        : d
    );
    await saveMedicine({ ...med, doses: updatedDoses });
    setConfirmDose(null);
    await load();
  };

  const setDoseField = (key: keyof Medicine, value: any) => {
    setEditing((e) => e ? { ...e, [key]: value } : e);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => useRouter().back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Medicine Schedule</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {meds.length === 0 ? (
          <EmptyState icon={<Pill size={40} color={theme.colors.muted} />} title="No medicines yet" message="Add the first medicine for this patient." />
        ) : (
          meds.map((m) => <MedicineCard key={m.id} med={m} theme={theme} onMarkGiven={(dose) => setConfirmDose({ med: m, dose })} onDelete={async () => { await deleteMedicine(m.id); await load(); }} onEdit={() => { setEditing(m); setSheetOpen(true); }} />)
        )}
      </ScrollView>

      <Pressable onPress={openNew} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      {/* Add/Edit Sheet */}
      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id ? 'Edit Medicine' : 'Add Medicine'}>
        {editing && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
            <Field label="Medicine Name" value={editing.name} onChangeText={(v) => setDoseField('name', v)} placeholder="e.g. Paracetamol" required />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="Dose" value={editing.dose} onChangeText={(v) => setDoseField('dose', v)} placeholder="e.g. 1 tab" /></View>
              <View style={{ flex: 1 }}><Field label="Strength" value={editing.strength} onChangeText={(v) => setDoseField('strength', v)} placeholder="e.g. 500mg" /></View>
            </View>
            <SelectField label="Route" value={editing.route} options={['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Rectal', 'Other']} onSelect={(v) => setDoseField('route', v as any)} />
            <SelectField label="Frequency" value={editing.frequency} options={['OD', 'BD', 'TDS', 'QID', 'SOS', 'STAT', 'Custom']} onSelect={(v) => setDoseField('frequency', v as any)} />
            {editing.frequency === 'Custom' && (
              <View>
                <AppText variant="label" color={theme.colors.onSurfaceVariant} style={{ marginBottom: 6 }}>Custom Times (comma-separated, HH:mm)</AppText>
                <TextInput
                  value={editing.customTimes.join(', ')}
                  onChangeText={(v) => setDoseField('customTimes', v.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="08:00, 14:00, 20:00"
                  style={[styles.customInput, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, color: theme.colors.onSurface }]}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="Duration" value={editing.duration} onChangeText={(v) => setDoseField('duration', v)} placeholder="e.g. 5 days" /></View>
              <View style={{ flex: 1 }}><Field label="Start Date" value={editing.startDate} onChangeText={(v) => setDoseField('startDate', v)} placeholder="YYYY-MM-DD" /></View>
            </View>
            <Field label="End Date" value={editing.endDate} onChangeText={(v) => setDoseField('endDate', v)} placeholder="YYYY-MM-DD" />
            <Field label="Remarks" value={editing.remarks} onChangeText={(v) => setDoseField('remarks', v)} placeholder="Notes" multiline />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 }}>
              <Bell size={18} color={theme.colors.primary} strokeWidth={2} />
              <AppText variant="body">Alarm & Reminder</AppText>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => setDoseField('alarm', !editing.alarm)}>
                <View style={[styles.switch, { backgroundColor: editing.alarm ? theme.colors.primary : theme.colors.outline }]}>
                  <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '600' }}>{editing.alarm ? 'ON' : 'OFF'}</AppText>
                </View>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <AppText variant="label" color={theme.colors.onSurfaceVariant}>Snooze:</AppText>
              {[5, 10].map((min) => (
                <Pressable key={min} onPress={() => setDoseField('snoozeMinutes', min)}>
                  <View style={[styles.snoozeChip, { backgroundColor: editing.snoozeMinutes === min ? theme.colors.primaryContainer : theme.colors.surfaceVariant, borderColor: editing.snoozeMinutes === min ? theme.colors.primary : theme.colors.outline }]}>
                    <AppText variant="caption" color={editing.snoozeMinutes === min ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant} style={{ fontWeight: '600' }}>{min} min</AppText>
                  </View>
                </Pressable>
              ))}
            </View>

            <Button label="Save Medicine" onPress={handleSaveMed} fullWidth icon={<Check size={18} color="#FFFFFF" strokeWidth={2} />} />
          </ScrollView>
        )}
      </Sheet>

      <ConfirmDialog
        visible={!!confirmDose}
        title="Mark as Given?"
        message={`Confirm dose at ${confirmDose?.dose.time} was administered.`}
        confirmLabel="Mark Given"
        onConfirm={markGiven}
        onCancel={() => setConfirmDose(null)}
      />
    </SafeAreaView>
  );
}

function MedicineCard({ med, theme, onMarkGiven, onDelete, onEdit }: {
  med: Medicine;
  theme: ReturnType<typeof useTheme>;
  onMarkGiven: (dose: MedicineDose) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <Card elevation="sm" style={{ marginBottom: 12 }} padding={0}>
      <Pressable onPress={onEdit} style={{ padding: 16 }} android_ripple={{ color: theme.colors.primary + '10' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppTextBold variant="title">{med.name}</AppTextBold>
              <View style={[styles.freqTag, { backgroundColor: theme.colors.primaryContainer }]}>
                <AppText variant="caption" color={theme.colors.onPrimaryContainer} style={{ fontWeight: '700' }}>{med.frequency}</AppText>
              </View>
            </View>
            <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 2 }}>
              {med.dose} {med.strength} • {med.route} • {med.duration || 'ongoing'}
            </AppText>
          </View>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Trash2 size={18} color={theme.colors.muted} strokeWidth={2} />
          </Pressable>
        </View>
      </Pressable>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
        {med.doses.map((dose) => {
          const color = dose.status === 'given' ? theme.colors.success : dose.status === 'missed' ? theme.colors.error : theme.colors.warning;
          const bg = dose.status === 'given' ? theme.colors.successContainer : dose.status === 'missed' ? theme.colors.errorContainer : theme.colors.warningContainer;
          return (
            <View key={dose.id} style={[styles.doseRow, { backgroundColor: bg, borderColor: color + '30' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Clock size={16} color={color} strokeWidth={2} />
                <AppTextBold variant="body" color={color}>{dose.time}</AppTextBold>
                {med.alarm && <AlarmClock size={14} color={color} strokeWidth={2} />}
              </View>
              {dose.status === 'given' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Check size={16} color={theme.colors.success} strokeWidth={2.5} />
                  <AppText variant="caption" color={theme.colors.successText}>
                    {dose.givenBy} • {dose.givenDate}
                  </AppText>
                </View>
              ) : dose.status === 'missed' ? (
                <AppText variant="caption" color={theme.colors.errorText} style={{ fontWeight: '600' }}>MISSED</AppText>
              ) : (
                <Pressable onPress={() => onMarkGiven(dose)} hitSlop={8}>
                  <View style={[styles.givenBtn, { backgroundColor: theme.colors.success }]}>
                    <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>GIVEN</AppText>
                  </View>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  freqTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  doseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  givenBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  customInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter-Regular' },
  switch: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  snoozeChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5 },
});
