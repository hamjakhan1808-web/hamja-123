import type { ModuleConfig } from '../modules';

export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: Gender | '';
  address: string;
  diagnosis: string;
  uhid: string;
  doctorName: string;
  nurseName: string;
  mobile: string;
  admissionDate: string;
  dischargeDate: string;
  bloodGroup: string;
  allergy: string;
  photoUri: string;
  modules: ModuleConfig;
  createdAt: number;
  updatedAt: number;
}

export function emptyPatient(): Patient {
  const now = Date.now();
  return {
    id: '',
    name: '',
    age: '',
    gender: '',
    address: '',
    diagnosis: '',
    uhid: '',
    doctorName: '',
    nurseName: '',
    mobile: '',
    admissionDate: '',
    dischargeDate: '',
    bloodGroup: '',
    allergy: '',
    photoUri: '',
    modules: {} as ModuleConfig,
    createdAt: now,
    updatedAt: now,
  };
}
