import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getPatients, savePatient as repoSave, deletePatient as repoDelete } from '../data/repository';
import type { Patient } from '../data/models/Patient';

interface PatientsCtx {
  patients: Patient[];
  loading: boolean;
  refresh: () => Promise<void>;
  save: (p: Patient) => Promise<Patient>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Patient | undefined;
}

const Ctx = createContext<PatientsCtx | null>(null);

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await getPatients();
    setPatients(list);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (p: Patient) => {
    const saved = await repoSave(p);
    await refresh();
    return saved;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await repoDelete(id);
    await refresh();
  }, [refresh]);

  const getById = useCallback((id: string) => patients.find((p) => p.id === id), [patients]);

  return (
    <Ctx.Provider value={{ patients, loading, refresh, save, remove, getById }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePatients() {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePatients must be used within PatientsProvider');
  return c;
}
