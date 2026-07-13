export type IOFrequency = 'MorningEvening' | 'Hourly' | 'Every2H' | 'Every3H' | 'Every4H' | 'Custom';
export type IOType = 'Intake' | 'Output';

export interface IntakeOutputEntry {
  id: string;
  patientId: string;
  time: string;
  type: IOType;
  details: string;
  amount: string;
  remarks: string;
  createdAt: number;
}

export function emptyIOEntry(patientId: string): IntakeOutputEntry {
  return {
    id: '',
    patientId,
    time: new Date().toTimeString().slice(0, 5),
    type: 'Intake',
    details: '',
    amount: '',
    remarks: '',
    createdAt: Date.now(),
  };
}

export function ioSlots(freq: IOFrequency, custom: string[]): string[] {
  switch (freq) {
    case 'MorningEvening': return ['08:00', '20:00'];
    case 'Hourly': return ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
    case 'Every2H': return ['08:00','10:00','12:00','14:00','16:00','18:00','20:00'];
    case 'Every3H': return ['08:00','11:00','14:00','17:00','20:00'];
    case 'Every4H': return ['08:00','12:00','16:00','20:00'];
    case 'Custom': return custom.length ? custom : ['08:00','20:00'];
    default: return ['08:00','20:00'];
  }
}

export function totals(entries: IntakeOutputEntry[]) {
  let intake = 0;
  let output = 0;
  for (const e of entries) {
    const v = parseFloat(e.amount) || 0;
    if (e.type === 'Intake') intake += v;
    else output += v;
  }
  return { intake, output, balance: intake - output };
}
