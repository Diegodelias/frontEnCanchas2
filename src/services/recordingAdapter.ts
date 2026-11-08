import { Match } from '../types/match';
import { ApiRecording } from './recordingsApi';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Mié 4/3/2026» a partir de `AAAA-MM-DD` (el día de la semana de esa fecha, sin depender de la zona del navegador). */
export function formatRecordingDate(date: string): string {
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  return capitalize(text.replace('.', '').replace(',', ''));
}

/** Arma la `Match` que usa la interfaz a partir de una grabación de la API. */
export function toMatch(recording: ApiRecording): Match {
  return {
    id: recording.id,
    title: `Turno de las ${recording.time} hs`,
    clubId: recording.club.id,
    clubName: recording.club.name,
    courtId: recording.court.id,
    courtName: recording.court.name,
    dayId: recording.date,
    dateLabel: formatRecordingDate(recording.date),
    timeSlot: recording.time,
    status: recording.status,
    videoSrc: recording.videoUrl,
    duration: recording.durationSeconds,
    recordedAt: recording.startsAt,
  };
}
