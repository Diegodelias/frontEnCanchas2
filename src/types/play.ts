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

export interface SavedPlay {
  id: string;
  matchId: string;
  title: string;
  category?: PlayCategory;
  captureMode: CaptureMode;
  timestamp: number; // segundos exactos del momento marcado
  timestampLabel: string; // "00:19" o "Momento en vivo"
  startTime: number; // inicio del clip simulado (timestamp - 15)
  endTime: number; // fin del clip simulado (timestamp + 5)
  duration: number; // duración en segundos (ej. 20)
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
}
