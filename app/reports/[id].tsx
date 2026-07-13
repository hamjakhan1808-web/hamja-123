import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, FileText, Share2, Printer, Activity } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from '@/src/components/useTheme';
import { AppText, AppTextBold } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { LineChart } from '@/src/components/LineChart';
import { usePatients } from '@/src/providers/PatientsProvider';
import { getVitals, getSugar, getIO, getMedicines, getNotes } from '@/src/data/repository';
import { totals } from '@/src/data/models/IntakeOutput';
import { classifySugar, SUGAR_TYPE_LABELS } from '@/src/data/models/BloodSugar';

export default function ReportsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = usePatients();
  const patient = id ? getById(id) : undefined;
  const [vitals, setVitals] = useState<any[]>([]);
  const [sugar, setSugar] = useState<any[]>([]);
  const [io, setIO] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!id) return;
    (async () => {
      const [v, s, i, m, n] = await Promise.all([
        getVitals(id), getSugar(id), getIO(id), getMedicines(id), getNotes(id),
      ]);
      v.sort((a, b) => a.timestamp - b.timestamp);
      s.sort((a, b) => a.createdAt - b.createdAt);
      setVitals(v); setSugar(s); setIO(i); setMeds(m); setNotes(n);
    })();
  }, [id]));

  const ioTotals = useMemo(() => totals(io), [io]);

  const chartData = {
    pulse: vitals.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.pulse) || 0 })).filter((d) => d.value > 0),
    temp: vitals.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.temperature) || 0 })).filter((d) => d.value > 0),
    bp: vitals.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.bpSystolic) || 0 })).filter((d) => d.value > 0),
    spo2: vitals.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.spo2) || 0 })).filter((d) => d.value > 0),
    sugar: sugar.map((e) => ({ label: e.date.slice(5), value: parseFloat(e.value) || 0 })).filter((d) => d.value > 0),
    weight: vitals.map((e) => ({ label: new Date(e.timestamp).toTimeString().slice(0, 5), value: parseFloat(e.weight) || 0 })).filter((d) => d.value > 0),
  };

  const generateHTML = () => {
    if (!patient) return '';
    const p = patient;
    const vitalsRows = vitals.map((v) => `<tr><td>${new Date(v.timestamp).toLocaleString()}</td><td>${v.temperature || '-'}</td><td>${v.pulse || '-'}</td><td>${v.respiration || '-'}</td><td>${v.bpSystolic || '-'}/${v.bpDiastolic || '-'}</td><td>${v.spo2 || '-'}</td></tr>`).join('');
    const sugarRows = sugar.map((s) => `<tr><td>${s.date} ${s.time}</td><td>${SUGAR_TYPE_LABELS[s.type as keyof typeof SUGAR_TYPE_LABELS]}</td><td>${s.value}</td><td>${classifySugar(s.value, s.type)}</td><td>${s.remarks || ''}</td></tr>`).join('');
    const ioRows = io.map((e) => `<tr><td>${e.time}</td><td>${e.type}</td><td>${e.details}</td><td>${e.amount} mL</td><td>${e.remarks || ''}</td></tr>`).join('');
    const medRows = meds.map((m) => `<tr><td>${m.name}</td><td>${m.dose} ${m.strength}</td><td>${m.route}</td><td>${m.frequency}</td><td>${m.startDate} - ${m.endDate || 'ongoing'}</td></tr>`).join('');
    const noteRows = notes.map((n) => `<tr><td>${n.date} ${n.time}</td><td>${n.assessment}</td><td>${n.intervention}</td><td>${n.evaluation}</td><td>${n.nurseSignature}</td></tr>`).join('');

    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Helvetica,Arial,sans-serif;color:#0F1B2A;margin:32px;}
      h1{color:#0B6E99;font-size:22px;margin-bottom:4px;}
      h2{color:#0B6E99;font-size:16px;margin-top:24px;margin-bottom:8px;border-bottom:2px solid #E6F2F9;padding-bottom:4px;}
      .sub{color:#5A6B7E;font-size:12px;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;}
      th{background:#E6F2F9;color:#0A3D55;padding:8px;text-align:left;}
      td{padding:6px 8px;border-bottom:1px solid #EAEFF4;}
      .info{display:flex;gap:24px;margin-bottom:16px;flex-wrap:wrap;}
      .info div{font-size:13px;}
      .info b{color:#0B6E99;}
      .totals{background:#F4F7FA;padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;}
    </style></head><body>
      <h1>Patient Care Report</h1>
      <div class="sub">Generated: ${new Date().toLocaleString()}</div>
      <div class="info">
        <div><b>Name:</b> ${p.name}</div>
        <div><b>UHID:</b> ${p.uhid}</div>
        <div><b>Age:</b> ${p.age}</div>
        <div><b>Gender:</b> ${p.gender}</div>
        <div><b>Diagnosis:</b> ${p.diagnosis}</div>
        <div><b>Doctor:</b> ${p.doctorName}</div>
        <div><b>Nurse:</b> ${p.nurseName}</div>
        <div><b>Blood Group:</b> ${p.bloodGroup}</div>
        <div><b>Allergy:</b> ${p.allergy || 'None'}</div>
        <div><b>Admission:</b> ${p.admissionDate}</div>
        <div><b>Discharge:</b> ${p.dischargeDate || '—'}</div>
      </div>
      <h2>Vital Signs (${vitals.length})</h2>
      <table><tr><th>Date/Time</th><th>Temp</th><th>Pulse</th><th>Resp</th><th>BP</th><th>SpO₂</th></tr>${vitalsRows || '<tr><td colspan="6">No records</td></tr>'}</table>
      <h2>Blood Sugar (${sugar.length})</h2>
      <table><tr><th>Date/Time</th><th>Type</th><th>Value</th><th>Level</th><th>Remarks</th></tr>${sugarRows || '<tr><td colspan="5">No records</td></tr>'}</table>
      <h2>Intake / Output (${io.length})</h2>
      <div class="totals"><b>Total Intake:</b> ${ioTotals.intake} mL | <b>Total Output:</b> ${ioTotals.output} mL | <b>Balance:</b> ${ioTotals.balance} mL</div>
      <table><tr><th>Time</th><th>Type</th><th>Details</th><th>Amount</th><th>Remarks</th></tr>${ioRows || '<tr><td colspan="5">No records</td></tr>'}</table>
      <h2>Medicines (${meds.length})</h2>
      <table><tr><th>Name</th><th>Dose</th><th>Route</th><th>Frequency</th><th>Duration</th></tr>${medRows || '<tr><td colspan="5">No records</td></tr>'}</table>
      <h2>Nursing Notes (${notes.length})</h2>
      <table><tr><th>Date/Time</th><th>Assessment</th><th>Intervention</th><th>Evaluation</th><th>Nurse</th></tr>${noteRows || '<tr><td colspan="5">No records</td></tr>'}</table>
    </body></html>`;
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML() });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Patient Report' });
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const handlePrint = async () => {
    setGenerating(true);
    try {
      await Print.printAsync({ html: generateHTML() });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleShare = async () => {
    setGenerating(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML() });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Patient Report' });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  if (!patient) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>
        <AppTextBold variant="h3" style={{ flex: 1, marginLeft: 8 }}>Reports & Graphs</AppTextBold>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <Button label="Generate PDF" variant="filled" onPress={handleGeneratePDF} loading={generating} style={{ flex: 1 }} icon={<FileText size={16} color="#FFFFFF" strokeWidth={2} />} />
          <Button label="Print" variant="tonal" onPress={handlePrint} style={{ flex: 1 }} icon={<Printer size={16} color={theme.colors.onPrimaryContainer} strokeWidth={2} />} />
          <Button label="Share" variant="outline" onPress={handleShare} style={{ flex: 1 }} icon={<Share2 size={16} color={theme.colors.primary} strokeWidth={2} />} />
        </View>

        {/* Graphs */}
        <AppTextBold variant="title" style={{ marginBottom: 12 }}>Clinical Graphs</AppTextBold>

        {chartData.pulse.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>Pulse (bpm)</AppTextBold>
            <LineChart data={chartData.pulse} color={theme.colors.tile2} unit="bpm" />
          </Card>
        )}
        {chartData.temp.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>Temperature (°F)</AppTextBold>
            <LineChart data={chartData.temp} color={theme.colors.tile3} unit="°F" />
          </Card>
        )}
        {chartData.bp.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>Blood Pressure Systolic (mmHg)</AppTextBold>
            <LineChart data={chartData.bp} color={theme.colors.tile6} unit="mmHg" />
          </Card>
        )}
        {chartData.spo2.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>SpO₂ (%)</AppTextBold>
            <LineChart data={chartData.spo2} color={theme.colors.tile5} unit="%" min={80} max={100} />
          </Card>
        )}
        {chartData.sugar.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>Blood Sugar (mg/dL)</AppTextBold>
            <LineChart data={chartData.sugar} color={theme.colors.tile6} unit="mg/dL" />
          </Card>
        )}
        {chartData.weight.length > 0 && (
          <Card elevation="sm" style={{ marginBottom: 12 }}>
            <AppTextBold variant="body" style={{ marginBottom: 8 }}>Weight (kg)</AppTextBold>
            <LineChart data={chartData.weight} color={theme.colors.tile7} unit="kg" />
          </Card>
        )}

        {/* Fluid Balance Summary */}
        <Card elevation="sm" style={{ marginBottom: 12 }}>
          <AppTextBold variant="title" style={{ marginBottom: 8 }}>Fluid Balance</AppTextBold>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <FluidStat label="Intake" value={`${ioTotals.intake} mL`} color={theme.colors.tile5} theme={theme} />
            <FluidStat label="Output" value={`${ioTotals.output} mL`} color={theme.colors.tile6} theme={theme} />
            <FluidStat label="Balance" value={`${ioTotals.balance} mL`} color={ioTotals.balance >= 0 ? theme.colors.success : theme.colors.error} theme={theme} />
          </View>
        </Card>

        {/* Record counts */}
        <Card elevation="sm">
          <AppTextBold variant="title" style={{ marginBottom: 8 }}>Record Summary</AppTextBold>
          <SummaryRow label="Vital Signs" count={vitals.length} theme={theme} />
          <SummaryRow label="Blood Sugar" count={sugar.length} theme={theme} />
          <SummaryRow label="Intake/Output" count={io.length} theme={theme} />
          <SummaryRow label="Medicines" count={meds.length} theme={theme} />
          <SummaryRow label="Nursing Notes" count={notes.length} theme={theme} last />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function FluidStat({ label, value, color, theme }: { label: string; value: string; color: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ flex: 1 }}>
      <AppTextBold variant="number" color={color} style={{ fontSize: 18 }}>{value}</AppTextBold>
      <AppText variant="caption" color={theme.colors.muted}>{label}</AppText>
    </View>
  );
}

function SummaryRow({ label, count, theme, last }: { label: string; count: number; theme: ReturnType<typeof useTheme>; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.outlineVariant }}>
      <AppText variant="body">{label}</AppText>
      <AppTextBold variant="body" color={theme.colors.primary}>{count}</AppTextBold>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
});
