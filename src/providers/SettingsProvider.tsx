import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSettings, saveSettings, type AppSettings, DEFAULT_SETTINGS } from '../data/repository';

interface SettingsCtx {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      setLoading(false);
    })();
  }, []);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const merged = await saveSettings(patch);
    setSettings(merged);
  }, []);

  return (
    <Ctx.Provider value={{ settings, update, loading }}>{children}</Ctx.Provider>
  );
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSettings must be used within SettingsProvider');
  return c;
}
