import { Match } from '../types/match';
import { toMatch } from './recordingAdapter';
import { recordingsApi } from './recordingsApi';

/** Grabaciones de partidos, leídas del backend (`/api/recordings`). */
export const matchesService = {
  /** Solo las grabaciones listas para reproducir. */
  async getPlayableMatches(): Promise<Match[]> {
    return (await recordingsApi.listPlayable()).map(toMatch);
  },

  /** Un partido por su id, en cualquier estado; null si no existe. */
  async getMatchById(id: string): Promise<Match | null> {
    const recording = await recordingsApi.get(id);
    return recording ? toMatch(recording) : null;
  },

  /** La grabación que coincide exactamente con club, cancha, fecha (`AAAA-MM-DD`) y horario (`HH:MM`). */
  async findMatchBySelection(clubId: string, courtId: string, date: string, timeSlot: string): Promise<Match | null> {
    if (!clubId || !courtId || !date || !timeSlot) return null;
    const recordings = await recordingsApi.listPlayable({ clubId, courtId, date });
    const found = recordings.find((recording) => recording.time === timeSlot);
    return found ? toMatch(found) : null;
  },

  /** Los partidos guardados de una lista de ids (los inexistentes se descartan). */
  async getSavedMatches(ids: string[]): Promise<Match[]> {
    const matches = await Promise.all(ids.map((id) => this.getMatchById(id).catch(() => null)));
    return matches.filter((match): match is Match => match !== null);
  },
};
