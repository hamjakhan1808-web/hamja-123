export interface NursingNote {
  id: string;
  patientId: string;
  date: string;
  time: string;
  assessment: string;
  intervention: string;
  evaluation: string;
  nurseSignature: string;
  createdAt: number;
}

export function emptyNote(patientId: string): NursingNote {
  const now = new Date();
  return {
    id: '',
    patientId,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    assessment: '',
    intervention: '',
    evaluation: '',
    nurseSignature: '',
    createdAt: Date.now(),
  };
}
