import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { LogoColor } from '../data/logoPalette';
import { DEFAULT_SITE_NAME, siteApi, type SiteInfo } from '../services/siteApi';

interface SiteContextValue {
  /** El nombre del sitio: el configurado por el superadmin, o «Canchas3» mientras no llegue o si no se puede leer. */
  name: string;
  /** El color del logo, o null para el predeterminado (también mientras no llegue o si no se puede leer). */
  logoColor: LogoColor | null;
  /** Cambia el nombre y el color en pantalla al instante (lo usa el panel después de guardar). */
  setSite: (site: SiteInfo) => void;
}

// Con un valor por defecto, los componentes funcionan igual fuera del proveedor.
const SiteContext = createContext<SiteContextValue>({ name: DEFAULT_SITE_NAME, logoColor: null, setSite: () => {} });

/**
 * Lee el nombre y el color del logo al cargar. Arranca con «Canchas3» y el color predeterminado, así que nunca hay
 * una pantalla en blanco ni un error si la lectura falla. También mantiene el título de la pestaña del navegador.
 */
export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [site, setSite] = useState<SiteInfo>({ name: DEFAULT_SITE_NAME, logoColor: null });

  useEffect(() => {
    let cancelled = false;
    siteApi
      .fetchSite()
      .then((loaded) => {
        if (!cancelled) setSite(loaded);
      })
      .catch(() => {
        // Sin configuración a mano: se queda «Canchas3» y el color predeterminado, y el resto del sitio funciona.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = `${site.name} — Reservá tu cancha de fútbol`;
  }, [site.name]);

  const value = useMemo(() => ({ name: site.name, logoColor: site.logoColor, setSite }), [site]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite(): SiteContextValue {
  return useContext(SiteContext);
}
