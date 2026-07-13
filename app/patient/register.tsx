import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Field, SelectField } from '@/src/components/Field';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { usePatients } from '@/src/providers/PatientsProvider';
import { useSettings } from '@/src/providers/SettingsProvider';
import { emptyPatient, type Patient } from '@/src/data/models/Patient';
import { MODULE_KEYS, MODULE_META, defaultModules, type ModuleKey } from '@/src/data/modules';

export default function RegisterPatientScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { save, getById } = usePatients();
  const { settings } = useSettings();

  const existing = id ? getById(id) : undefined;
  const [form, setForm] = useState<Patient>(() => {
    if (existing) return { ...existing };
    const p = emptyPatient();
    p.modules = defaultModules();
    p.nurseName = settings.nurseName;
    return p;
  });
  const [saving, setSaving] = useState(false);

  const set = useCallback(<K extends keyof Patient>(key: K, value: Patient[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const toggleModule = (key: ModuleKey) => {
    setForm((f) => ({ ...f, modules: { ...f.modules, [key]: !f.modules[key] } }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Patient name is required';
    if (!form.uhid.trim()) return 'UHID / Patient ID is required';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setForm((f) => f);
      return;
    }
    setSaving(true);
    await save(form);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>{existing ? 'Edit Patient' : 'Register Patient'}</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <SectionTitle theme={theme}>Patient Information</SectionTitle>
        <Card elevation="sm">
          <Field label="Patient Name" value={form.name} onChangeText={(v) => set('name', v)} placeholder="Full name" required />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Age" value={form.age} onChangeText={(v) => set('age', v)} placeholder="Years" keyboardType="numeric" /></View>
            <View style={{ flex: 1.4 }}>
              <SelectField label="Gender" value={form.gender} options={['Male', 'Female', 'Other']} onSelect={(v) => set('gender', v as Patient['gender'])} />
            </View>
          </View>
          <Field label="Address" value={form.address} onChangeText={(v) => set('address', v)} placeholder="Home address" multiline />
          <Field label="Diagnosis" value={form.diagnosis} onChangeText={(v) => set('diagnosis', v)} placeholder="Primary diagnosis" />
          <Field label="UHID / Patient ID" value={form.uhid} onChangeText={(v) => set('uhid', v)} placeholder="Unique ID" required />
        </Card>

        {/* Care Team */}
        <SectionTitle theme={theme}>Care Team</SectionTitle>
        <Card elevation="sm">
          <Field label="Doctor Name" value={form.doctorName} onChangeText={(v) => set('doctorName', v)} placeholder="Attending doctor" />
          <Field label="Nurse Name" value={form.nurseName} onChangeText={(v) => set('nurseName', v)} placeholder="Assigned nurse" />
          <Field label="Mobile Number" value={form.mobile} onChangeText={(v) => set('mobile', v)} placeholder="Contact number" keyboardType="phone-pad" />
        </Card>

        {/* Admission */}
        <SectionTitle theme={theme}>Admission Details</SectionTitle>
        <Card elevation="sm">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Field label="Admission Date" value={form.admissionDate} onChangeText={(v) => set('admissionDate', v)} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><Field label="Discharge Date" value={form.dischargeDate} onChangeText={(v) => set('dischargeDate', v)} placeholder="YYYY-MM-DD" /></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <SelectField label="Blood Group" value={form.bloodGroup} options={['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} onSelect={(v) => set('bloodGroup', v)} />
            </View>
            <View style={{ flex: 1 }}><Field label="Allergy" value={form.allergy} onChangeText={(v) => set('allergy', v)} placeholder="Known allergies" /></View>
          </View>
        </Card>

        {/* Module Selection */}
        <SectionTitle theme={theme}>Enable Clinical Modules</SectionTitle>
        <AppText variant="caption" color={theme.colors.muted} style={{ marginBottom: 8 }}>Toggle which charts are active for this patient. Editable anytime.</AppText>
        <Card elevation="sm" padding={8}>
          {MODULE_KEYS.map((key) => (
            <View key={key} style={[styles.moduleRow, { borderBottomColor: theme.colors.outlineVariant }]}>
              <View style={{ flex: 1 }}>
                <AppText variant="body">{MODULE_META[key].label}</AppText>
              </View>
              <Switch
                value={form.modules[key]}
                onValueChange={() => toggleModule(key)}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </Card>

        <View style={{ height: 24 }} />
        <Button label={existing ? 'Update Patient' : 'Save Patient'} onPress={handleSave} loading={saving} fullWidth icon={<Save size={18} color="#FFFFFF" strokeWidth={2} />} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children, theme }: { children: React.ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
      <View style={{ width: 4, height: 18, borderRadius: 2, backgroundColor: theme.colors.primary }} />
      <AppTextBold variant="title" color={theme.colors.onBackground}>{children}</AppTextBold>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  moduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1 },
});
