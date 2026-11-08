import { LiveCamera } from '../types/liveCamera';

/** Aclaración de la cámara en vivo real: es una cámara de demostración y puede cortarse. */
export const LIVE_DEMO_NOTICE = 'Cámara en vivo de demostración · puede cortarse';

const LIVE_POSTER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" fill="none">
  <rect width="1280" height="720" fill="#09100c"/>
  <rect x="140" y="80" width="1000" height="560" rx="6" fill="#156e39" fill-opacity="0.22" stroke="#f4f7f4" stroke-opacity="0.4" stroke-width="2.5"/>
  <line x1="640" y1="80" x2="640" y2="640" stroke="#f4f7f4" stroke-opacity="0.4" stroke-width="2"/>
  <circle cx="640" cy="360" r="90" stroke="#c4f236" stroke-opacity="0.6" stroke-width="2.5"/>
  <circle cx="640" cy="360" r="5" fill="#c4f236"/>
  <rect x="140" y="210" width="160" height="300" stroke="#f4f7f4" stroke-opacity="0.4" stroke-width="2"/>
  <rect x="980" y="210" width="160" height="300" stroke="#f4f7f4" stroke-opacity="0.4" stroke-width="2"/>
</svg>
`.trim();

export const DEFAULT_LIVE_POSTER = `data:image/svg+xml;utf8,${encodeURIComponent(LIVE_POSTER_SVG)}`;

export const MOCK_LIVE_CAMERAS: LiveCamera[] = [
  {
    id: 'estacion-norte-c1',
    clubId: 'estacion-norte',
    clubName: 'Estación Norte Club',
    courtName: 'Cancha 1 · Fútbol 5',
    sport: 'Fútbol 5',
    location: 'Palermo, CABA',
    status: 'live',
    // Cámara real: el video llega por el backend (GET /api/live/:cameraId/stream).
    videoUrl: '/api/live/estacion-norte-c1/stream',
    posterUrl: DEFAULT_LIVE_POSTER,
    lastUpdated: '2026-11-06T08:24:00Z',
    isDemo: false,
    visualVariant: 'soccer-turf',
  },
];

/** La cámara en vivo real del club (la que se sirve por el backend), o null si no tiene. */
export function realLiveCameraOf(clubId: string): LiveCamera | null {
  return MOCK_LIVE_CAMERAS.find((camera) => camera.clubId === clubId && !camera.isDemo) ?? null;
}

/** true si el club tiene la cámara en vivo real: lleva la aclaración de demostración. */
export function clubHasRealLiveCamera(clubId: string): boolean {
  return realLiveCameraOf(clubId) !== null;
}
