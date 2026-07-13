// Simple clinical record model used by the remaining specialty modules
// (IV Fluid, Oxygen, Nebulization, Tracheostomy, Ryles Tube, Suction,
//  Catheter, Wound Dressing, GCS, Pain, Braden, Fall Risk).
export interface ClinicalRecord {
  id: string;
  patientId: string;
  module: string; // ModuleKey
  date: string;
  time: string;
  fields: Record<string, string>; // flexible key-value
  notes: string;
  nurseName: string;
  createdAt: number;
}

export function emptyClinicalRecord(patientId: string, module: string): ClinicalRecord {
  const now = new Date();
  return {
    id: '',
    patientId,
    module,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    fields: {},
    notes: '',
    nurseName: '',
    createdAt: Date.now(),
  };
}

// Field definitions per specialty module for dynamic form rendering.
export const SPECIALTY_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[]> = {
  ivFluid: [
    { key: 'fluidName', label: 'Fluid Name', type: 'text' },
    { key: 'volume', label: 'Volume (mL)', type: 'number' },
    { key: 'rate', label: 'Rate (drops/min)', type: 'number' },
    { key: 'duration', label: 'Duration', type: 'text' },
  ],
  oxygen: [
    { key: 'method', label: 'Method', type: 'select', options: ['Nasal Cannula', 'Face Mask', 'Non-Rebreather', 'Venturi', 'High Flow'] },
    { key: 'flowRate', label: 'Flow Rate (L/min)', type: 'number' },
    { key: 'spo2', label: 'SpO₂ (%)', type: 'number' },
  ],
  nebulization: [
    { key: 'medication', label: 'Medication', type: 'text' },
    { key: 'dose', label: 'Dose', type: 'text' },
    { key: 'duration', label: 'Duration (min)', type: 'number' },
  ],
  tracheostomy: [
    { key: 'careType', label: 'Care Type', type: 'select', options: ['Suction', 'Cleaning', 'Inner Cannula Change', 'Dressing'] },
    { key: 'tubeSize', label: 'Tube Size', type: 'text' },
  ],
  rylesTube: [
    { key: 'action', label: 'Action', type: 'select', options: ['Insertion', 'Removal', 'Feeding', 'Aspiration'] },
    { key: 'volume', label: 'Volume (mL)', type: 'number' },
  ],
  suction: [
    { key: 'pressure', label: 'Pressure (mmHg)', type: 'number' },
    { key: 'secretions', label: 'Secretions', type: 'text' },
  ],
  catheter: [
    { key: 'careType', label: 'Care Type', type: 'select', options: ['Insertion', 'Removal', 'Cleaning', 'Bag Change'] },
    { key: 'urineOutput', label: 'Urine Output (mL)', type: 'number' },
  ],
  woundDressing: [
    { key: 'woundSite', label: 'Wound Site', type: 'text' },
    { key: 'dressingType', label: 'Dressing Type', type: 'text' },
    { key: 'woundCondition', label: 'Condition', type: 'select', options: ['Clean', 'Infected', 'Healing', 'Dehisced'] },
  ],
  gcs: [
    { key: 'eye', label: 'Eye Opening (1-4)', type: 'number' },
    { key: 'verbal', label: 'Verbal (1-5)', type: 'number' },
    { key: 'motor', label: 'Motor (1-6)', type: 'number' },
  ],
  painAssessment: [
    { key: 'scale', label: 'Pain Score (0-10)', type: 'number' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'intervention', label: 'Intervention', type: 'text' },
  ],
  bradenScale: [
    { key: 'sensory', label: 'Sensory Perception (1-4)', type: 'number' },
    { key: 'moisture', label: 'Moisture (1-4)', type: 'number' },
    { key: 'activity', label: 'Activity (1-4)', type: 'number' },
    { key: 'mobility', label: 'Mobility (1-4)', type: 'number' },
    { key: 'nutrition', label: 'Nutrition (1-4)', type: 'number' },
    { key: 'friction', label: 'Friction (1-3)', type: 'number' },
  ],
  fallRisk: [
    { key: 'score', label: 'Fall Risk Score', type: 'number' },
    { key: 'category', label: 'Category', type: 'select', options: ['Low', 'Moderate', 'High'] },
  ],
};

export function gcsTotal(fields: Record<string, string>): string {
  const e = parseInt(fields.eye || '0', 10) || 0;
  const v = parseInt(fields.verbal || '0', 10) || 0;
  const m = parseInt(fields.motor || '0', 10) || 0;
  if (!e && !v && !m) return '';
  return String(e + v + m);
}

export function bradenTotal(fields: Record<string, string>): string {
  const keys = ['sensory', 'moisture', 'activity', 'mobility', 'nutrition', 'friction'];
  let sum = 0;
  let any = false;
  for (const k of keys) {
    const v = parseInt(fields[k] || '0', 10) || 0;
    if (v) any = true;
    sum += v;
  }
  return any ? String(sum) : '';
}
