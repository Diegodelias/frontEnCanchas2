import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SITE_NAME, siteApi } from '../services/siteApi';

interface SiteContextValue {
  /** El nombre del sitio: el configurado por el superadmin, o «Canchas3» mientras no llegue o si no se puede leer. */
  name: string;
  /** Cambia el nombre en pantalla al instante (lo usa el panel después de guardar). */
  setName: (name: string) => void;
}

// Con un valor por defecto, los componentes funcionan igual fuera del proveedor.
const SiteContext = createContext<SiteContextValue>({ name: DEFAULT_SITE_NAME, setName: () => {} });

/**
 * Lee el nombre del sitio al cargar. Arranca con «Canchas3», así que nunca hay una pantalla en blanco ni un error si
 * la lectura falla. También mantiene el título de la pestaña del navegador.
 */
export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string>(DEFAULT_SITE_NAME);

  useEffect(() => {
    let cancelled = false;
    siteApi
      .fetchSiteName()
      .then((loaded) => {
        if (!cancelled) setName(loaded);
      })
      .catch(() => {
        // Sin nombre configurado a mano: se queda «Canchas3» y el resto del sitio funciona.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = `${name} — Reservá tu cancha de fútbol`;
  }, [name]);

  const value = useMemo(() => ({ name, setName }), [name]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite(): SiteContextValue {
  return useContext(SiteContext);
}
