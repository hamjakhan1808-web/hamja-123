export interface CustomColumn {
  name: string;
  type: 'text' | 'number';
}

export interface CustomChart {
  id: string;
  patientId: string;
  name: string;
  columns: CustomColumn[];
  rows: string[][]; // each row is array of cell values matching columns length
  createdAt: number;
  updatedAt: number;
}

export function emptyCustomChart(patientId: string): CustomChart {
  const now = Date.now();
  return {
    id: '',
    patientId,
    name: '',
    columns: [{ name: 'Time', type: 'text' }, { name: 'Value', type: 'text' }],
    rows: [],
    createdAt: now,
    updatedAt: now,
  };
}
