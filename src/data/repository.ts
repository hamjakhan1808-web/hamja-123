import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Patient } from '../models/Patient';
import type { Medicine } from '../models/Medicine';
import type { VitalEntry, VitalsConfig } from '../models/Vitals';
import type { BloodSugarEntry } from '../models/BloodSugar';
import type { IntakeOutputEntry } from '../models/IntakeOutput';
import type { NursingNote } from '../models/NursingNote';
import type { CustomChart } from '../models/CustomChart';
import type { ClinicalRecord } from '../models/ClinicalRecord';

// AsyncStorage-based offline repository.
// Keys are namespaced like SQLite tables; structure is sync-ready for Supabase.

const K = {
  patients: 'nurse.patients',
  medicines: 'nurse.medicines',
  vitals: 'nurse.vitals',
  vitalsConfig: 'nurse.vitalsConfig',
  sugar: 'nurse.bloodSugar',
  io: 'nurse.intakeOutput',
  notes: 'nurse.nursingNotes',
  customCharts: 'nurse.customCharts',
  clinical: 'nurse.clinicalRecords',
  settings: 'nurse.settings',
  pin: 'nurse.pin',
  backupMeta: 'nurse.backupMeta',
};

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

async function read<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function write<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---------- Patients ----------
export async function getPatients(): Promise<Patient[]> {
  return read<Patient[]>(K.patients, []);
}

export async function savePatient(p: Patient): Promise<Patient> {
  const patients = await getPatients();
  const idx = patients.findIndex((x) => x.id === p.id);
  const now = Date.now();
  if (idx >= 0) {
    patients[idx] = { ...patients[idx], ...p, updatedAt: now };
  } else {
    p.id = p.id || uid();
    p.createdAt = now;
    p.updatedAt = now;
    patients.push(p);
  }
  await write(K.patients, patients);
  return p;
}

export async function deletePatient(id: string): Promise<void> {
  const patients = (await getPatients()).filter((p) => p.id !== id);
  await write(K.patients, patients);
  // cascade delete related records
  const [meds, vits, sugar, io, notes, charts, clinical] = await Promise.all([
    getMedicines(id), getVitals(id), getSugar(id), getIO(id),
    getNotes(id), getCustomCharts(id), getClinical(id),
  ]);
  await Promise.all([
    write(K.medicines, (await getMedicines()).filter((m) => m.patientId !== id)),
    write(K.vitals, (await getVitals()).filter((v) => v.patientId !== id)),
    write(K.sugar, (await getSugar()).filter((s) => s.patientId !== id)),
    write(K.io, (await getIO()).filter((e) => e.patientId !== id)),
    write(K.notes, (await getNotes()).filter((n) => n.patientId !== id)),
    write(K.customCharts, (await getCustomCharts()).filter((c) => c.patientId !== id)),
    write(K.clinical, (await getClinical()).filter((r) => r.patientId !== id)),
  ]);
}

// ---------- Medicines ----------
async function getAllMedicines(): Promise<Medicine[]> {
  return read<Medicine[]>(K.medicines, []);
}
export async function getMedicines(patientId?: string): Promise<Medicine[]> {
  const all = await getAllMedicines();
  return patientId ? all.filter((m) => m.patientId === patientId) : all;
}

export async function saveMedicine(m: Medicine): Promise<Medicine> {
  const all = await getAllMedicines();
  const idx = all.findIndex((x) => x.id === m.id);
  m.updatedAt = Date.now();
  if (idx >= 0) all[idx] = m;
  else { m.id = m.id || uid(); m.createdAt = Date.now(); all.push(m); }
  await write(K.medicines, all);
  return m;
}

export async function deleteMedicine(id: string): Promise<void> {
  await write(K.medicines, (await getAllMedicines()).filter((m) => m.id !== id));
}

// ---------- Vitals ----------
async function getAllVitals(): Promise<VitalEntry[]> {
  return read<VitalEntry[]>(K.vitals, []);
}
export async function getVitals(patientId?: string): Promise<VitalEntry[]> {
  const all = await getAllVitals();
  return patientId ? all.filter((v) => v.patientId === patientId) : all;
}
export async function saveVital(v: VitalEntry): Promise<VitalEntry> {
  const all = await getAllVitals();
  v.id = v.id || uid();
  all.push(v);
  await write(K.vitals, all);
  return v;
}
export async function deleteVital(id: string): Promise<void> {
  await write(K.vitals, (await getAllVitals()).filter((v) => v.id !== id));
}

// Vitals config stored per-patient
export async function getVitalsConfig(patientId: string): Promise<VitalsConfig | null> {
  const all = await read<Record<string, VitalsConfig>>(K.vitalsConfig, {});
  return all[patientId] || null;
}
export async function setVitalsConfig(patientId: string, cfg: VitalsConfig): Promise<void> {
  const all = await read<Record<string, VitalsConfig>>(K.vitalsConfig, {});
  all[patientId] = cfg;
  await write(K.vitalsConfig, all);
}

// ---------- Blood Sugar ----------
async function getAllSugar(): Promise<BloodSugarEntry[]> {
  return read<BloodSugarEntry[]>(K.sugar, []);
}
export async function getSugar(patientId?: string): Promise<BloodSugarEntry[]> {
  const all = await getAllSugar();
  return patientId ? all.filter((s) => s.patientId === patientId) : all;
}
export async function saveSugar(s: BloodSugarEntry): Promise<BloodSugarEntry> {
  const all = await getAllSugar();
  s.id = s.id || uid();
  all.push(s);
  await write(K.sugar, all);
  return s;
}
export async function deleteSugar(id: string): Promise<void> {
  await write(K.sugar, (await getAllSugar()).filter((s) => s.id !== id));
}

// ---------- Intake/Output ----------
async function getAllIO(): Promise<IntakeOutputEntry[]> {
  return read<IntakeOutputEntry[]>(K.io, []);
}
export async function getIO(patientId?: string): Promise<IntakeOutputEntry[]> {
  const all = await getAllIO();
  return patientId ? all.filter((e) => e.patientId === patientId) : all;
}
export async function saveIO(e: IntakeOutputEntry): Promise<IntakeOutputEntry> {
  const all = await getAllIO();
  e.id = e.id || uid();
  all.push(e);
  await write(K.io, all);
  return e;
}
export async function deleteIO(id: string): Promise<void> {
  await write(K.io, (await getAllIO()).filter((e) => e.id !== id));
}

// ---------- Nursing Notes ----------
async function getAllNotes(): Promise<NursingNote[]> {
  return read<NursingNote[]>(K.notes, []);
}
export async function getNotes(patientId?: string): Promise<NursingNote[]> {
  const all = await getAllNotes();
  return patientId ? all.filter((n) => n.patientId === patientId) : all;
}
export async function saveNote(n: NursingNote): Promise<NursingNote> {
  const all = await getAllNotes();
  n.id = n.id || uid();
  all.push(n);
  await write(K.notes, all);
  return n;
}
export async function deleteNote(id: string): Promise<void> {
  await write(K.notes, (await getAllNotes()).filter((n) => n.id !== id));
}

// ---------- Custom Charts ----------
async function getAllCharts(): Promise<CustomChart[]> {
  return read<CustomChart[]>(K.customCharts, []);
}
export async function getCustomCharts(patientId?: string): Promise<CustomChart[]> {
  const all = await getAllCharts();
  return patientId ? all.filter((c) => c.patientId === patientId) : all;
}
export async function saveCustomChart(c: CustomChart): Promise<CustomChart> {
  const all = await getAllCharts();
  const idx = all.findIndex((x) => x.id === c.id);
  c.updatedAt = Date.now();
  if (idx >= 0) all[idx] = c;
  else { c.id = c.id || uid(); c.createdAt = Date.now(); all.push(c); }
  await write(K.customCharts, all);
  return c;
}
export async function deleteCustomChart(id: string): Promise<void> {
  await write(K.customCharts, (await getAllCharts()).filter((c) => c.id !== id));
}

// ---------- Clinical Records (specialty modules) ----------
async function getAllClinical(): Promise<ClinicalRecord[]> {
  return read<ClinicalRecord[]>(K.clinical, []);
}
export async function getClinical(patientId?: string, module?: string): Promise<ClinicalRecord[]> {
  const all = await getAllClinical();
  return all.filter((r) =>
    (!patientId || r.patientId === patientId) && (!module || r.module === module)
  );
}
export async function saveClinical(r: ClinicalRecord): Promise<ClinicalRecord> {
  const all = await getAllClinical();
  r.id = r.id || uid();
  all.push(r);
  await write(K.clinical, all);
  return r;
}
export async function deleteClinical(id: string): Promise<void> {
  await write(K.clinical, (await getAllClinical()).filter((r) => r.id !== id));
}

// ---------- Settings ----------
export interface AppSettings {
  darkMode: boolean;
  notificationSound: boolean;
  reminderVolume: number; // 0-100
  hospitalName: string;
  hospitalLogoUri: string;
  pinEnabled: boolean;
  pin: string;
  biometricEnabled: boolean;
  nurseName: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  notificationSound: true,
  reminderVolume: 70,
  hospitalName: 'City Care Hospital',
  hospitalLogoUri: '',
  pinEnabled: false,
  pin: '',
  biometricEnabled: false,
  nurseName: '',
};

export async function getSettings(): Promise<AppSettings> {
  return read<AppSettings>(K.settings, DEFAULT_SETTINGS);
}
export async function saveSettings(s: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const merged = { ...current, ...s };
  await write(K.settings, merged);
  return merged;
}

// ---------- Backup / Restore ----------
export async function exportAll(): Promise<string> {
  const keys = [K.patients, K.medicines, K.vitals, K.vitalsConfig, K.sugar, K.io, K.notes, K.customCharts, K.clinical, K.settings];
  const pairs = await AsyncStorage.multiGet(keys);
  const data: Record<string, string> = {};
  pairs.forEach(([k, v]) => { if (v !== null) data[k] = v; });
  const payload = { version: 1, exportedAt: Date.now(), data };
  return JSON.stringify(payload, null, 2);
}

export async function importAll(json: string): Promise<void> {
  const parsed = JSON.parse(json);
  if (!parsed.data) throw new Error('Invalid backup file');
  const entries = Object.entries(parsed.data) as [string, string][];
  await AsyncStorage.multiSet(entries);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    K.patients, K.medicines, K.vitals, K.vitalsConfig, K.sugar,
    K.io, K.notes, K.customCharts, K.clinical,
  ]);
}
