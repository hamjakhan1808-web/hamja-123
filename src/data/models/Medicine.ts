export type Frequency = 'OD' | 'BD' | 'TDS' | 'QID' | 'SOS' | 'STAT' | 'Custom';
export type Route = 'Oral' | 'IV' | 'IM' | 'SC' | 'Topical' | 'Inhalation' | 'Rectal' | 'Other';
export type DoseStatus = 'pending' | 'given' | 'missed' | 'skipped';

export interface MedicineDose {
  id: string;
  time: string; // HH:mm
  status: DoseStatus;
  givenAt: number | null; // epoch ms
  givenBy: string;
  givenDate: string; // YYYY-MM-DD
}

export interface Medicine {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  strength: string;
  route: Route;
  frequency: Frequency;
  duration: string;
  startDate: string;
  endDate: string;
  remarks: string;
  customTimes: string[]; // for Custom frequency
  doses: MedicineDose[];
  alarm: boolean;
  snoozeMinutes: number;
  createdAt: number;
  updatedAt: number;
}

// Generate scheduled times from a frequency.
export function generateTimes(frequency: Frequency, customTimes: string[]): string[] {
  switch (frequency) {
    case 'OD': return ['09:00'];
    case 'BD': return ['08:00', '20:00'];
    case 'TDS': return ['08:00', '14:00', '20:00'];
    case 'QID': return ['08:00', '12:00', '16:00', '20:00'];
    case 'SOS': return ['09:00'];
    case 'STAT': return ['09:00'];
    case 'Custom': return customTimes.length ? customTimes : ['09:00'];
    default: return ['09:00'];
  }
}

export function emptyMedicine(patientId: string): Medicine {
  const now = Date.now();
  return {
    id: '',
    patientId,
    name: '',
    dose: '',
    strength: '',
    route: 'Oral',
    frequency: 'BD',
    duration: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    remarks: '',
    customTimes: [],
    doses: [],
    alarm: true,
    snoozeMinutes: 5,
    createdAt: now,
    updatedAt: now,
  };
}
