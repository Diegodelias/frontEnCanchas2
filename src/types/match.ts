export type MatchRecordingStatus =
  | 'available'
  | 'processing'
  | 'unavailable'
  | 'error';

/**
 * Una grabación tal como la usa la interfaz. Sale de `GET /api/recordings` (ver `recordingAdapter.ts`).
 * No tiene marcador ni torneo: no son datos reales.
 */
export interface Match {
  id: string;
  /** Texto corto para encabezados («Turno de las 19:00 hs»); el club y la cancha van aparte. */
  title: string;
  clubId: string;
  clubName: string;
  courtId: string;
  courtName: string;
  /** Fecha del turno en Argentina, `AAAA-MM-DD`. */
  dayId: string;
  /** «Mié 4/3/2026». */
  dateLabel: string;
  timeSlot: string; // e.g. "19:00"
  status: MatchRecordingStatus;
  videoSrc: string | null;
  duration: number; // in seconds
  recordedAt: string;
}
