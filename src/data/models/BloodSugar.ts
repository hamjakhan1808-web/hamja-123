export type SugarType =
  | 'FBS' | 'RBS' | 'PPBS'
  | 'BeforeBreakfast' | 'AfterBreakfast'
  | 'BeforeLunch' | 'AfterLunch'
  | 'BeforeDinner' | 'AfterDinner'
  | 'Bedtime' | 'HbA1c';

export type SugarLevel = 'Low' | 'Normal' | 'High';

export interface BloodSugarEntry {
  id: string;
  patientId: string;
  type: SugarType;
  value: string;
  date: string;
  time: string;
  remarks: string;
  createdAt: number;
}

export const SUGAR_TYPE_LABELS: Record<SugarType, string> = {
  FBS: 'Fasting (FBS)',
  RBS: 'Random (RBS)',
  PPBS: 'PPBS',
  BeforeBreakfast: 'Before Breakfast',
  AfterBreakfast: 'After Breakfast',
  BeforeLunch: 'Before Lunch',
  AfterLunch: 'After Lunch',
  BeforeDinner: 'Before Dinner',
  AfterDinner: 'After Dinner',
  Bedtime: 'Bedtime',
  HbA1c: 'HbA1c',
};

export function classifySugar(value: string, type: SugarType): SugarLevel {
  const v = parseFloat(value);
  if (isNaN(v)) return 'Normal';
  if (type === 'HbA1c') {
    if (v < 5.7) return 'Normal';
    if (v < 6.5) return 'High';
    return 'High';
  }
  if (type === 'FBS' || type === 'BeforeBreakfast' || type === 'Bedtime') {
    if (v < 70) return 'Low';
    if (v <= 100) return 'Normal';
    return 'High';
  }
  // post-meal / random
  if (v < 70) return 'Low';
  if (v <= 140) return 'Normal';
  return 'High';
}

export function emptySugarEntry(patientId: string): BloodSugarEntry {
  const now = new Date();
  return {
    id: '',
    patientId,
    type: 'FBS',
    value: '',
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    remarks: '',
    createdAt: Date.now(),
  };
}
