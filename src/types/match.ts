export type MatchRecordingStatus =
  | 'available'
  | 'processing'
  | 'unavailable'
  | 'error';

export interface Match {
  id: string;
  title: string;
  clubId: string;
  clubName: string;
  courtId: string;
  courtName: string;
  dayId: string;
  dateLabel: string;
  timeSlot: string; // e.g. "19:00"
  status: MatchRecordingStatus;
  videoSrc: string | null;
  poster: string;
  duration: number; // in seconds
  score?: string; // e.g. "5 - 3"
  recordedAt: string;
  tournamentOrCategory?: string; // e.g. "Torneo Nocturno · Fecha 4"
  statusMessage?: string; // e.g. "Grabación disponible en HD", "Video en procesamiento"
}

export interface MatchFilterParams {
  clubId?: string;
  courtId?: string;
  dayId?: string;
  slotId?: string;
}
