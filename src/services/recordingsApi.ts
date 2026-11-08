import { ClubsApiError, request } from './clubsApi';

export type ApiRecordingStatus = 'available' | 'processing' | 'unavailable' | 'error';

/** Grabación tal como la devuelve la API. `videoUrl` solo viene si está disponible. */
export interface ApiRecording {
  id: string;
  club: { id: string; name: string };
  court: { id: string; name: string };
  /** Inicio del turno (ISO 8601). */
  startsAt: string;
  /** Fecha del turno en Argentina, `AAAA-MM-DD`. */
  date: string;
  /** Hora de inicio en Argentina, `HH:MM`. */
  time: string;
  status: ApiRecordingStatus;
  durationSeconds: number;
  videoUrl: string | null;
}

export interface RecordingFilter {
  clubId?: string;
  courtId?: string;
  date?: string;
}

/** Grabaciones: lectura pública y lista del club. */
export const recordingsApi = {
  /** Grabaciones reproducibles, de la más reciente a la más antigua. Público. */
  async listPlayable(filter: RecordingFilter = {}): Promise<ApiRecording[]> {
    const params = new URLSearchParams();
    if (filter.clubId) params.set('clubId', filter.clubId);
    if (filter.courtId) params.set('courtId', filter.courtId);
    if (filter.date) params.set('date', filter.date);
    const query = params.toString();
    const res = await request(`/api/recordings${query ? `?${query}` : ''}`);
    return ((await res.json()) as { recordings: ApiRecording[] }).recordings;
  },

  /** Una grabación en cualquier estado, o null si no existe. Público. */
  async get(id: string): Promise<ApiRecording | null> {
    try {
      const res = await request(`/api/recordings/${encodeURIComponent(id)}`);
      return ((await res.json()) as { recording: ApiRecording }).recording;
    } catch (err) {
      if (err instanceof ClubsApiError && err.status === 404) return null;
      throw err;
    }
  },

  /** Todas las grabaciones del club del admin con sesión, en cualquier estado. */
  async listOwnClub(): Promise<ApiRecording[]> {
    const res = await request('/api/club/recordings');
    return ((await res.json()) as { recordings: ApiRecording[] }).recordings;
  },
};
