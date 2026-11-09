import { isLogoColor, type LogoColor } from '../data/logoPalette';
import { request } from './clubsApi';

/** Nombre del sitio mientras no se pueda leer el configurado (y valor inicial hasta que llega la respuesta). */
export const DEFAULT_SITE_NAME = 'Canchas3';

export interface SiteInfo {
  name: string;
  /** El color del logo, o null para el predeterminado. */
  logoColor: LogoColor | null;
}

/**
 * El nombre del sitio y el color de su logo, públicos (`GET /api/site`). Lo que no llegue usable cae al valor de
 * siempre: «Canchas3» y el color predeterminado.
 */
export const siteApi = {
  async fetchSite(): Promise<SiteInfo> {
    const res = await request('/api/site');
    const body = (await res.json()) as { name?: unknown; logoColor?: unknown };
    return {
      name: typeof body.name === 'string' && body.name.trim() ? body.name : DEFAULT_SITE_NAME,
      logoColor: isLogoColor(body.logoColor) ? body.logoColor : null,
    };
  },
};
