export type LiveCameraStatus = 'live' | 'connecting' | 'no_signal' | 'unavailable';

export interface LiveCamera {
  id: string;
  clubId: string;
  clubName: string;
  courtName: string;
  sport: string;
  location: string;
  status: LiveCameraStatus;
  videoUrl: string;
  posterUrl: string;
  lastUpdated: string; // ISO string, e.g. '2026-11-06T08:12:00Z'
  isDemo: boolean;
  visualVariant?: 'soccer-turf' | 'indoor-pitch' | 'night-stadium' | 'clubhouse-turf';
}
