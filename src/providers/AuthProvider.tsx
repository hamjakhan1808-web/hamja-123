import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSettings } from './SettingsProvider';

interface AuthCtx {
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
  verifyPin: (pin: string) => boolean;
  hasPin: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [unlocked, setUnlocked] = useState(!settings.pinEnabled);

  useEffect(() => {
    setUnlocked(!settings.pinEnabled);
  }, [settings.pinEnabled]);

  const unlock = useCallback(() => setUnlocked(true), []);
  const lock = useCallback(() => setUnlocked(false), []);
  const verifyPin = useCallback((pin: string) => {
    return settings.pinEnabled && pin === settings.pin;
  }, [settings.pinEnabled, settings.pin]);

  return (
    <Ctx.Provider value={{ unlocked, unlock, lock, verifyPin, hasPin: settings.pinEnabled }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
