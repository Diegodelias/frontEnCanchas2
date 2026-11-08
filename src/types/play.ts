export type PlayCategory =
  | 'Gol'
  | 'Caño / Galleta'
  | 'Atajada'
  | 'Buena jugada'
  | 'Bloopers'
  | 'Otro';

export type CaptureMode = 'video' | 'voice_commentary';

export type PlayProcessingStatus =
  | 'idle'
  | 'preparing'
  | 'processing'
  | 'ready'
  | 'error';

export const PLAY_CATEGORIES: PlayCategory[] = [
  'Gol',
  'Caño / Galleta',
  'Atajada',
  'Buena jugada',
  'Bloopers',
  'Otro',
];

// Constantes de captura retroactiva
export const CAPTURE_PRE_SECONDS = 15;
export const CAPTURE_POST_SECONDS = 5;
export const CAPTURE_TOTAL_SECONDS = CAPTURE_PRE_SECONDS + CAPTURE_POST_SECONDS; // 20 segundos

/** Límites del fragmento de una jugada (los mismos que valida el servidor) y cuánto mueve cada botón. */
export const MIN_CLIP_SECONDS = 3;
export const MAX_CLIP_SECONDS = 120;
export const CLIP_STEP_SECONDS = 5;

export interface SavedPlay {
  id: string;
  matchId: string;
  title: string;
  category?: PlayCategory;
  captureMode: CaptureMode;
  timestamp: number; // segundos exactos del momento marcado
  timestampLabel: string; // "00:19" o "Momento en vivo"
  startTime: number; // inicio del fragmento (por defecto, timestamp - 15)
  endTime: number; // fin del fragmento (por defecto, timestamp + 5)
  duration: number; // duración del fragmento en segundos (ej. 20)
  status: PlayProcessingStatus;
  clubName: string;
  courtName: string;
  dateLabel: string;
  timeSlot: string;
  thumbnailUrl?: string;
  videoSrc?: string;
  createdAt: string;
  userId?: string;
  savedToProfile?: boolean;
  isLiveMoment?: boolean;
  /** true si la grabación de la jugada ya no existe o no tiene video: se muestra como «Grabación no disponible». */
  recordingUnavailable?: boolean;
}

export interface SavePlayInput {
  matchId: string;
  timestamp: number;
  timestampLabel?: string;
  title?: string;
  category?: PlayCategory;
  captureMode?: CaptureMode;
  clubName: string;
  courtName: string;
  dateLabel: string;
  timeSlot: string;
  thumbnailUrl?: string;
  videoSrc?: string;
  isLiveMoment?: boolean;
  /** Fragmento ajustado por el jugador, en segundos del video; sin él, el servidor usa 15 s antes y 5 s después. */
  clipStart?: number;
  clipEnd?: number;
}
