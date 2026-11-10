import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isLogoColor, type LogoColor } from '../data/logoPalette';
import { DEFAULT_SITE_NAME, siteApi, type SiteInfo } from '../services/siteApi';

interface SiteContextValue {
  /** El nombre del sitio: el configurado por el superadmin, o «Canchas3» mientras no llegue o si no se puede leer. */
  name: string;
  /** El color del logo, o null para el predeterminado (también mientras no llegue o si no se puede leer). */
  logoColor: LogoColor | null;
  /**
   * true cuando el nombre y el color de arriba son los verdaderos (o ya se agotó la espera y se usan los de siempre).
   * Mientras sea false, el nombre es el predeterminado solo de relleno: el logo no debe mostrarlo como si fuera el real.
   */
  ready: boolean;
  /** Cambia el nombre y el color en pantalla al instante (lo usa el panel después de guardar). */
  setSite: (site: SiteInfo) => void;
}

// Con un valor por defecto, los componentes funcionan igual fuera del proveedor.
const SiteContext = createContext<SiteContextValue>({
  name: DEFAULT_SITE_NAME,
  logoColor: null,
  ready: true,
  setSite: () => {},
});

/** Dónde se guarda, en el navegador, el último nombre y color recibidos. */
const STORAGE_KEY = 'canchas3-site';

/** Máximo que se espera la respuesta del sitio, sin nada guardado, antes de usar «Canchas3» y el color predeterminado. */
const READY_TIMEOUT_MS = 1500;

/** Lo último que se recibió, si el navegador lo guardó y sigue siendo válido; si no, null. */
function readStoredSite(): SiteInfo | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown; logoColor?: unknown } | null;
    if (!parsed || typeof parsed.name !== 'string' || !parsed.name.trim()) return null;
    const logoColor = parsed.logoColor === null || parsed.logoColor === undefined ? null : parsed.logoColor;
    if (logoColor !== null && !isLogoColor(logoColor)) return null;
    return { name: parsed.name, logoColor };
  } catch {
    // El almacenamiento puede estar bloqueado o el valor roto: se sigue como una primera visita.
    return null;
  }
}

function storeSite(site: SiteInfo): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(site));
  } catch {
    // Sin almacenamiento el sitio funciona igual; solo no se recuerda para la próxima visita.
  }
}

/**
 * Lee el nombre y el color del logo al cargar. Si el navegador guardó los últimos recibidos, arranca con ellos; si no,
 * arranca con «Canchas3» y el color predeterminado de relleno y avisa con `ready` que todavía no son los verdaderos.
 * Nunca hay una pantalla en blanco ni un error si la lectura falla: pasado un tope de espera se usan los de siempre.
 * También mantiene el título de la pestaña del navegador.
 */
export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stored] = useState<SiteInfo | null>(readStoredSite);
  const [site, setSiteState] = useState<SiteInfo>(stored ?? { name: DEFAULT_SITE_NAME, logoColor: null });
  const [ready, setReady] = useState<boolean>(stored !== null);

  const setSite = useCallback((next: SiteInfo) => {
    setSiteState(next);
    storeSite(next);
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Sin nada guardado, la espera tiene tope: una API lenta o caída no deja el logo vacío.
    const timer = stored === null ? window.setTimeout(() => setReady(true), READY_TIMEOUT_MS) : null;

    siteApi
      .fetchSite()
      .then((loaded) => {
        if (cancelled) return;
        setSiteState(loaded);
        storeSite(loaded);
        setReady(true);
      })
      .catch(() => {
        // Sin configuración a mano: se queda lo guardado, o «Canchas3» y el color predeterminado, y el sitio funciona.
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [stored]);

  useEffect(() => {
    document.title = `${site.name} — Reservá tu cancha de fútbol`;
  }, [site.name]);

  const value = useMemo(
    () => ({ name: site.name, logoColor: site.logoColor, ready, setSite }),
    [site, ready, setSite]
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite(): SiteContextValue {
  return useContext(SiteContext);
}
