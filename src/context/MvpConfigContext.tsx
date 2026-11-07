import React, { createContext, useContext, useState } from 'react';
import { INITIAL_MVP_CONFIG, MvpPlatformConfig } from '../data/mockMvpConfig';

interface MvpConfigContextValue {
  config: MvpPlatformConfig;
  updateConfig: (patch: Partial<MvpPlatformConfig>) => void;
  resetConfig: () => void;
}

const MvpConfigContext = createContext<MvpConfigContextValue | undefined>(undefined);

export const MvpConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MvpPlatformConfig>(() => {
    try {
      const stored = localStorage.getItem('canchas3-mvp-config');
      if (stored) {
        return { ...INITIAL_MVP_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return INITIAL_MVP_CONFIG;
  });

  const updateConfig = (patch: Partial<MvpPlatformConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem('canchas3-mvp-config', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetConfig = () => {
    setConfig(INITIAL_MVP_CONFIG);
    try {
      localStorage.removeItem('canchas3-mvp-config');
    } catch {
      // ignore
    }
  };

  return (
    <MvpConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </MvpConfigContext.Provider>
  );
};

export function useMvpConfig(): MvpConfigContextValue {
  const ctx = useContext(MvpConfigContext);
  if (!ctx) {
    throw new Error('useMvpConfig must be used within a MvpConfigProvider');
  }
  return ctx;
}
