import { MOCK_LIVE_CAMERAS } from '../data/mockLiveCameras';
import { MOCK_MATCHES } from '../data/mockMatches';
import {
  CAPTURE_POST_SECONDS,
  CAPTURE_PRE_SECONDS,
  CAPTURE_TOTAL_SECONDS,
  PlayCategory,
  SavedPlay,
  SavePlayInput,
} from '../types/play';

export const DEFAULT_PLAY_MEDIA = '/assets/aistudio/ref_6fe9ff42.mp4';

/** Jugada tal como la guarda y devuelve el backend (`/api/plays`). */
export interface ApiPlay {
  id: string;
  matchId: string;
  title: string;
  category: PlayCategory | null;
  captureMode: 'video' | 'voice_commentary';
  timestamp: number;
  isLiveMoment: boolean;
  createdAt: string;
}

export function formatSecondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Título de una jugada sin nombre: la categoría, o «Jugada de 00:19» / «Jugada en vivo». */
export function defaultPlayTitle(input: Pick<SavePlayInput, 'title' | 'category' | 'timestamp' | 'timestampLabel' | 'isLiveMoment'>): string {
  const typed = input.title?.trim();
  if (typed) return typed;
  if (input.category) return input.category;
  if (input.isLiveMoment) return 'Jugada en vivo';
  const label = input.timestampLabel || formatSecondsToMMSS(Math.max(0, Math.floor(input.timestamp)));
  return `Jugada de ${label}`;
}

interface PlayContext {
  clubName: string;
  courtName: string;
  dateLabel: string;
  timeSlot: string;
  thumbnailUrl: string;
  videoSrc: string;
}

/**
 * Datos del club, la cancha, el horario y el video de una jugada. El backend no los guarda: salen del
 * partido (o de la cámara, en una jugada en vivo) a partir de `matchId`, que siguen siendo datos de ejemplo.
 */
export function resolvePlayContext(matchId: string, createdAt: string): PlayContext {
  const match = MOCK_MATCHES.find((m) => m.id === matchId);
  if (match) {
    return {
      clubName: match.clubName,
      courtName: match.courtName,
      dateLabel: match.dateLabel,
      timeSlot: match.timeSlot,
      thumbnailUrl: match.poster || DEFAULT_PLAY_MEDIA,
      videoSrc: match.videoSrc || DEFAULT_PLAY_MEDIA,
    };
  }
  const camera = MOCK_LIVE_CAMERAS.find((c) => c.id === matchId);
  if (camera) {
    return {
      clubName: camera.clubName,
      courtName: camera.courtName,
      dateLabel: 'En vivo · Ahora',
      timeSlot: new Date(createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      thumbnailUrl: camera.posterUrl,
      videoSrc: camera.videoUrl,
    };
  }
  // El partido o la cámara ya no existen: se muestra la jugada con datos genéricos.
  return {
    clubName: 'Jugada guardada',
    courtName: '',
    dateLabel: '',
    timeSlot: '',
    thumbnailUrl: DEFAULT_PLAY_MEDIA,
    videoSrc: DEFAULT_PLAY_MEDIA,
  };
}

/** Arma la `SavedPlay` que usa la interfaz a partir de la jugada del backend. */
export function toSavedPlay(play: ApiPlay, userId?: string): SavedPlay {
  const context = resolvePlayContext(play.matchId, play.createdAt);
  const timestamp = play.timestamp;
  return {
    id: play.id,
    matchId: play.matchId,
    title: play.title,
    category: play.category ?? undefined,
    captureMode: play.captureMode,
    timestamp,
    timestampLabel: play.isLiveMoment ? 'Momento en vivo' : formatSecondsToMMSS(timestamp),
    startTime: Math.max(0, timestamp - CAPTURE_PRE_SECONDS),
    endTime: timestamp + CAPTURE_POST_SECONDS,
    duration: CAPTURE_TOTAL_SECONDS,
    status: 'ready',
    ...context,
    createdAt: play.createdAt,
    userId,
    savedToProfile: true,
    isLiveMoment: play.isLiveMoment,
  };
}
