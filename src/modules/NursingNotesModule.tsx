import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, Plus, NotebookPen, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Field } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Sheet } from '@/src/components/Sheet';
import { EmptyState } from '@/src/components/States';
import { getNotes, saveNote, deleteNote } from '@/src/data/repository';
import { emptyNote, type NursingNote } from '@/src/data/models/NursingNote';

export function NursingNotesModule({ patientId }: { patientId: string }) {
  const theme = useTheme();
  const router = useRouter();
  const [notes, setNotes] = useState<NursingNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NursingNote>(emptyNote(patientId));

  const load = useCallback(async () => {
    const list = await getNotes(patientId);
    list.sort((a, b) => b.createdAt - a.createdAt);
    setNotes(list);
  }, [patientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!form.assessment.trim()) return;
    await saveNote(form);
    setShowAdd(false);
    setForm(emptyNote(patientId));
    await load();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Nursing Notes</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {notes.length === 0 ? (
          <EmptyState icon={<NotebookPen size={36} color={theme.colors.muted} />} title="No notes yet" message="Tap + to add a nursing note." />
        ) : (
          notes.map((n) => (
            <Card key={n.id} elevation="sm" style={{ marginBottom: 10 }} padding={0}>
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppTextBold variant="title">{n.date} {n.time}</AppTextBold>
                  <Pressable onPress={async () => { await deleteNote(n.id); await load(); }} hitSlop={8}>
                    <Trash2 size={16} color={theme.colors.muted} strokeWidth={2} />
                  </Pressable>
                </View>
                <NoteField label="Assessment" value={n.assessment} theme={theme} />
                <NoteField label="Intervention" value={n.intervention} theme={theme} />
                <NoteField label="Evaluation" value={n.evaluation} theme={theme} />
                {n.nurseSignature ? <AppText variant="caption" color={theme.colors.muted} style={{ marginTop: 6 }}>— {n.nurseSignature}</AppText> : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Pressable onPress={() => { setForm(emptyNote(patientId)); setShowAdd(true); }} style={({ pressed }) => [styles.fab, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.88 : 1 }]} android_ripple={{ color: theme.colors.primaryDark, radius: 28 }}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2} />
      </Pressable>

      <Sheet visible={showAdd} onClose={() => setShowAdd(false)} title="Add Nursing Note">
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><Field label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="HH:mm" /></View>
          </View>
          <Field label="Assessment" value={form.assessment} onChangeText={(v) => setForm({ ...form, assessment: v })} placeholder="Patient assessment" multiline required />
          <Field label="Intervention" value={form.intervention} onChangeText={(v) => setForm({ ...form, intervention: v })} placeholder="Action taken" multiline />
          <Field label="Evaluation" value={form.evaluation} onChangeText={(v) => setForm({ ...form, evaluation: v })} placeholder="Response / outcome" multiline />
          <Field label="Nurse Signature" value={form.nurseSignature} onChangeText={(v) => setForm({ ...form, nurseSignature: v })} placeholder="Nurse name" />
          <Button label="Save Note" onPress={handleSave} fullWidth style={{ marginTop: 8 }} />
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

function NoteField({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  if (!value) return null;
  return (
    <View style={{ marginTop: 6 }}>
      <AppText variant="caption" color={theme.colors.muted} style={{ fontWeight: '600' }}>{label}</AppText>
      <AppText variant="bodySmall" color={theme.colors.onSurface} style={{ marginTop: 2 }}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
