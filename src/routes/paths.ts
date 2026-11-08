/**
 * Definición centralizada de rutas de Canchas3.
 * Modificables desde este único archivo.
 */
export const ROUTES = {
  HOME: '/',
  SEARCH: '/buscar',
  MATCH: '/partido/:matchId',
  PLAY: '/jugada/:playId',
  PROFILE: '/perfil',
  ACCESS: '/acceso',
  RESET_PASSWORD: '/recuperar',
  LIVE: '/en-vivo',
  LIVE_STREAM: '/en-vivo/:cameraId',
  CLUB_ADMIN: '/panel-club',
  PLATFORM_ADMIN: '/panel-plataforma',
  ADMIN_INVITATION: '/invitacion',
  QR_SCAN: '/qr/:courtId',
} as const;

export function buildQrScanPath(courtId: string): string {
  return `/qr/${encodeURIComponent(courtId)}`;
}

export function buildMatchPath(matchId: string): string {
  return `/partido/${encodeURIComponent(matchId)}`;
}

export function buildPlayPath(playId: string): string {
  return `/jugada/${encodeURIComponent(playId)}`;
}

export function buildLiveStreamPath(cameraId: string, forceError = false): string {
  const base = `/en-vivo/${encodeURIComponent(cameraId)}`;
  return forceError ? `${base}?estado=error` : base;
}

export function buildSearchPath(params?: {
  complexId?: string;
  courtId?: string;
  dayId?: string;
  slotId?: string;
}): string {
  if (!params) return ROUTES.HOME;
  const searchParams = new URLSearchParams();
  if (params.complexId) searchParams.set('club', params.complexId);
  if (params.courtId) searchParams.set('cancha', params.courtId);
  if (params.dayId) searchParams.set('fecha', params.dayId);
  if (params.slotId) searchParams.set('horario', params.slotId);
  const query = searchParams.toString();
  return query ? `${ROUTES.HOME}?${query}#buscador` : ROUTES.HOME;
}
