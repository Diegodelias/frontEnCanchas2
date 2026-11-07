import { LiveCamera } from '../types/liveCamera';

export const LIVE_VIDEO_SOURCE = '/assets/live-demo.mp4';

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
  {
    id: 'la-cantera-crespo-c1',
    clubId: 'la-cantera-crespo',
    clubName: 'La Cantera Villa Crespo',
    courtName: 'Cancha A · Fútbol 5 Techada',
    sport: 'Fútbol 5',
    location: 'Villa Crespo, CABA',
    status: 'connecting',
    videoUrl: LIVE_VIDEO_SOURCE,
    posterUrl: DEFAULT_LIVE_POSTER,
    lastUpdated: '2026-11-06T08:22:00Z',
    isDemo: true,
    visualVariant: 'indoor-pitch',
  },
  {
    id: 'arena-nunez-c2',
    clubId: 'arena-nunez',
    clubName: 'Arena Núñez Deportivo',
    courtName: 'Cancha 2 · Fútbol 8',
    sport: 'Fútbol 8',
    location: 'Núñez, CABA',
    status: 'no_signal',
    videoUrl: LIVE_VIDEO_SOURCE,
    posterUrl: DEFAULT_LIVE_POSTER,
    lastUpdated: '2026-11-06T08:12:00Z', // 13 minutos atrás
    isDemo: true,
    visualVariant: 'night-stadium',
  },
  {
    id: 'polideportivo-belgrano-c1',
    clubId: 'polideportivo-belgrano',
    clubName: 'Polideportivo Belgrano',
    courtName: 'Cancha 1 · Fútbol 5 Cubierta',
    sport: 'Fútbol 5',
    location: 'Belgrano, CABA',
    status: 'unavailable',
    videoUrl: LIVE_VIDEO_SOURCE,
    posterUrl: DEFAULT_LIVE_POSTER,
    lastUpdated: '2026-11-06T05:00:00Z',
    isDemo: true,
    visualVariant: 'clubhouse-turf',
  },
];
