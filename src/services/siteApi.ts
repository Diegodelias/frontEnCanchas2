import { request } from './clubsApi';

/** Nombre del sitio mientras no se pueda leer el configurado (y valor inicial hasta que llega la respuesta). */
export const DEFAULT_SITE_NAME = 'Canchas3';

/** El nombre del sitio, público (`GET /api/site`). Si la respuesta no trae un nombre usable, devuelve el de siempre. */
export const siteApi = {
  async fetchSiteName(): Promise<string> {
    const res = await request('/api/site');
    const body = (await res.json()) as { name?: unknown };
    return typeof body.name === 'string' && body.name.trim() ? body.name : DEFAULT_SITE_NAME;
  },
};
