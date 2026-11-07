import { SavedPlay, SavePlayInput } from '../types/play';
import { ApiPlay, defaultPlayTitle, toSavedPlay } from './playContext';

/** Error de la API de jugadas con el mensaje listo para mostrar. */
export class PlaysApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'PlaysApiError';
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new PlaysApiError('network_error', 'No pudimos conectar con el servidor. Probá de nuevo en un momento.', 0);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new PlaysApiError(
      body?.error?.code ?? 'unknown_error',
      body?.error?.message ?? 'No pudimos completar la operación. Probá de nuevo.',
      res.status
    );
  }
  return res;
}

/** Jugadas del jugador con sesión real, guardadas en el backend. */
export const playsApi = {
  async list(userId?: string): Promise<SavedPlay[]> {
    const res = await request('/api/plays');
    const { plays } = (await res.json()) as { plays: ApiPlay[] };
    return plays.map((p) => toSavedPlay(p, userId));
  },

  /** Guarda la jugada. Solo viajan el partido, el título, la categoría, el modo y el momento marcado. */
  async create(input: SavePlayInput, userId?: string): Promise<SavedPlay> {
    const res = await request('/api/plays', {
      method: 'POST',
      body: JSON.stringify({
        matchId: input.matchId,
        title: defaultPlayTitle(input),
        category: input.category ?? null,
        captureMode: input.captureMode ?? 'video',
        timestamp: Math.max(0, Math.floor(input.timestamp)),
        isLiveMoment: Boolean(input.isLiveMoment),
      }),
    });
    const { play } = (await res.json()) as { play: ApiPlay };
    return toSavedPlay(play, userId);
  },

  async update(playId: string, updates: Partial<SavedPlay>, userId?: string): Promise<SavedPlay | null> {
    const body: { title?: string; category?: string | null } = {};
    if (updates.title !== undefined) body.title = updates.title;
    if ('category' in updates) body.category = updates.category ?? null;
    try {
      const res = await request(`/api/plays/${encodeURIComponent(playId)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      const { play } = (await res.json()) as { play: ApiPlay };
      return toSavedPlay(play, userId);
    } catch (err) {
      if (err instanceof PlaysApiError && err.status === 404) return null;
      throw err;
    }
  },

  async remove(playId: string): Promise<boolean> {
    try {
      await request(`/api/plays/${encodeURIComponent(playId)}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      if (err instanceof PlaysApiError && err.status === 404) return false;
      throw err;
    }
  },
};
