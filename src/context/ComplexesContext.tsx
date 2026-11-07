import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clubsApi } from '../services/clubsApi';
import { toComplex } from '../services/complexAdapter';
import { Complex } from '../types/canchas';

/** Clave donde la versión anterior guardaba los clubes y canchas en el navegador; ya no se usa y se borra. */
const LEGACY_COMPLEXES_STORAGE_KEY = 'canchas3_complexes_data';

export type ComplexesStatus = 'loading' | 'ready' | 'error';

interface ComplexesContextValue {
  /** Los clubes con canchas activas que publica el backend, en su orden. */
  complexes: Complex[];
  status: ComplexesStatus;
  /** Vuelve a pedir los complejos mostrando el estado de carga (el «Reintentar» de la landing). */
  reload: () => void;
  /** Los vuelve a pedir sin mostrar carga si ya hay datos: así un cambio del admin se ve al volver a la landing. */
  refresh: () => void;
}

const ComplexesContext = createContext<ComplexesContextValue | undefined>(undefined);

/**
 * Los complejos salen del listado público del backend. No hay respaldo de datos de ejemplo: si el backend
 * no responde, el estado es `error` y la landing lo muestra con un botón para reintentar.
 */
export const ComplexesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [status, setStatus] = useState<ComplexesStatus>('loading');
  const hasData = useRef(false);
  // Solo se aplica la respuesta del último pedido: una atrasada no pisa a una más nueva.
  const latest = useRef(0);

  const load = useCallback(async (silent: boolean) => {
    const seq = ++latest.current;
    if (!silent || !hasData.current) setStatus('loading');
    try {
      const clubs = await clubsApi.fetchClubs();
      if (seq !== latest.current) return;
      const now = new Date();
      setComplexes(clubs.map((club) => toComplex(club, now)));
      hasData.current = true;
      setStatus('ready');
    } catch {
      if (seq !== latest.current) return;
      // Un refresco silencioso que falla conserva lo que ya se mostraba.
      if (!hasData.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_COMPLEXES_STORAGE_KEY);
    } catch {
      // sin almacenamiento local no hay nada que borrar
    }
    void load(false);
  }, [load]);

  const reload = useCallback(() => void load(false), [load]);
  const refresh = useCallback(() => void load(true), [load]);

  return (
    <ComplexesContext.Provider value={{ complexes, status, reload, refresh }}>
      {children}
    </ComplexesContext.Provider>
  );
};

export function useComplexes(): ComplexesContextValue {
  const ctx = useContext(ComplexesContext);
  if (!ctx) {
    throw new Error('useComplexes must be used within a ComplexesProvider');
  }
  return ctx;
}
