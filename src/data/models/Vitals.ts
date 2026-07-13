export type VitalsFrequency =
  | 'MorningEvening' | 'Hourly' | 'Every2H' | 'Every3H' | 'Every4H' | 'Custom';

export interface VitalEntry {
  id: string;
  patientId: string;
  timestamp: number;
  temperature: string;
  pulse: string;
  respiration: string;
  bpSystolic: string;
  bpDiastolic: string;
  spo2: string;
  painScore: string;
  weight: string;
  height: string;
  bmi: string;
  customVitalName: string;
  customVitalValue: string;
  notes: string;
  nurseName: string;
}

export interface VitalsConfig {
  frequency: VitalsFrequency;
  customSlots: string[];
  enabled: {
    temperature: boolean;
    pulse: boolean;
    respiration: boolean;
    bp: boolean;
    spo2: boolean;
    pain: boolean;
    weight: boolean;
    height: boolean;
    bmi: boolean;
    custom: boolean;
  };
}

export function defaultVitalsConfig(): VitalsConfig {
  return {
    frequency: 'Every4H',
    customSlots: [],
    enabled: {
      temperature: true,
      pulse: true,
      respiration: true,
      bp: true,
      spo2: true,
      pain: false,
      weight: false,
      height: false,
      bmi: false,
      custom: false,
    },
  };
}

export function calcBMI(weightKg: string, heightCm: string): string {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  if (!w || !h) return '';
  const m = h / 100;
  const bmi = w / (m * m);
  return bmi.toFixed(1);
}

export function emptyVitalEntry(patientId: string): VitalEntry {
  return {
    id: '',
    patientId,
    timestamp: Date.now(),
    temperature: '',
    pulse: '',
    respiration: '',
    bpSystolic: '',
    bpDiastolic: '',
    spo2: '',
    painScore: '',
    weight: '',
    height: '',
    bmi: '',
    customVitalName: '',
    customVitalValue: '',
    notes: '',
    nurseName: '',
  };
}

export function vitalsSlots(freq: VitalsFrequency, custom: string[]): string[] {
  switch (freq) {
    case 'MorningEvening': return ['08:00', '20:00'];
    case 'Hourly': return ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
    case 'Every2H': return ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
    case 'Every3H': return ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00'];
    case 'Every4H': return ['00:00','04:00','08:00','12:00','16:00','20:00'];
    case 'Custom': return custom.length ? custom : ['08:00','20:00'];
    default: return ['08:00','20:00'];
  }
}
