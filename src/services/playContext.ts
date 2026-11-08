import { MOCK_LIVE_CAMERAS } from '../data/mockLiveCameras';
import {
  CAPTURE_POST_SECONDS,
  CAPTURE_PRE_SECONDS,
  PlayCategory,
  SavedPlay,
  SavePlayInput,
} from '../types/play';
import { formatRecordingDate } from './recordingAdapter';
import { ApiRecording } from './recordingsApi';

/** Jugada tal como la guarda y devuelve el backend (`/api/plays`). */
export interface ApiPlay {
  id: string;
  matchId: string;
  title: string;
  category: PlayCategory | null;
  captureMode: 'video' | 'voice_commentary';
  timestamp: number;
  isLiveMoment: boolean;
  /** Fragmento de la jugada en segundos del video; null en una jugada en vivo. */
  clipStart: number | null;
  clipEnd: number | null;
  createdAt: string;
  /** La grabación de la jugada, o null si es una jugada en vivo o su grabación ya no existe. */
  recording: ApiRecording | null;
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
  thumbnailUrl?: string;
  videoSrc?: string;
  /** true si la jugada no tiene un video que reproducir: su grabación ya no existe o todavía no está disponible. */
  recordingUnavailable: boolean;
}

/**
 * Datos del club, la cancha, el horario y el video de una jugada. Salen de su grabación (`play.recording`, que trae
 * el backend) o, en una jugada en vivo, de la cámara. Sin ninguna de las dos, la jugada se muestra como «Grabación
 * no disponible», sin borrarla.
 */
export function resolvePlayContext(matchId: string, createdAt: string, recording: ApiRecording | null): PlayContext {
  if (recording) {
    return {
      clubName: recording.club.name,
      courtName: recording.court.name,
      dateLabel: formatRecordingDate(recording.date),
      timeSlot: recording.time,
      videoSrc: recording.videoUrl ?? undefined,
      recordingUnavailable: recording.videoUrl === null,
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
      recordingUnavailable: false,
    };
  }
  return {
    clubName: 'Grabación no disponible',
    courtName: '',
    dateLabel: '',
    timeSlot: '',
    recordingUnavailable: true,
  };
}

/** Arma la `SavedPlay` que usa la interfaz a partir de la jugada del backend. */
export function toSavedPlay(play: ApiPlay, userId?: string): SavedPlay {
  const context = resolvePlayContext(play.matchId, play.createdAt, play.recording);
  const timestamp = play.timestamp;
  // El fragmento que guardó el backend; sin él (una jugada en vivo), el de siempre: 15 s antes y 5 s después.
  const startTime = play.clipStart ?? Math.max(0, timestamp - CAPTURE_PRE_SECONDS);
  const endTime = play.clipEnd ?? timestamp + CAPTURE_POST_SECONDS;
  return {
    id: play.id,
    matchId: play.matchId,
    title: play.title,
    category: play.category ?? undefined,
    captureMode: play.captureMode,
    timestamp,
    timestampLabel: play.isLiveMoment ? 'Momento en vivo' : formatSecondsToMMSS(timestamp),
    startTime,
    endTime,
    duration: endTime - startTime,
    status: 'ready',
    ...context,
    createdAt: play.createdAt,
    userId,
    savedToProfile: true,
    isLiveMoment: play.isLiveMoment,
  };
}
