import { SportType } from '../types/canchas';

/** Cancha tal como la devuelve la API. `active` solo viene en las rutas del admin. */
export interface ApiCourt {
  id: string;
  name: string;
  sport: SportType;
  price: number;
  active?: boolean;
}

/** Datos de un club, que el admin solo puede ver (no editar). */
export interface ApiClubInfo {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
}

/** Club del listado público, con sus canchas activas. */
export interface ApiClub extends ApiClubInfo {
  courts: ApiCourt[];
}

export interface CourtInput {
  name: string;
  sport: SportType;
  price: number;
}

/** Error de la API de clubes y canchas con el mensaje listo para mostrar. */
export class ClubsApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ClubsApiError';
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new ClubsApiError('network_error', 'No pudimos conectar con el servidor. Probá de nuevo en un momento.', 0);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new ClubsApiError(
      body?.error?.code ?? 'unknown_error',
      body?.error?.message ?? 'No pudimos completar la operación. Probá de nuevo.',
      res.status
    );
  }
  return res;
}

export const clubsApi = {
  /** Clubes con sus canchas activas. Público: no pide sesión. */
  async fetchClubs(): Promise<ApiClub[]> {
    const res = await request('/api/clubs');
    return ((await res.json()) as { clubs: ApiClub[] }).clubs;
  },

  /** El club del admin con sesión y todas sus canchas, activas o no. */
  async fetchMyCourts(): Promise<{ club: ApiClubInfo; courts: ApiCourt[] }> {
    const res = await request('/api/club/courts');
    return (await res.json()) as { club: ApiClubInfo; courts: ApiCourt[] };
  },

  async createCourt(input: CourtInput): Promise<ApiCourt> {
    const res = await request('/api/club/courts', { method: 'POST', body: JSON.stringify(input) });
    return ((await res.json()) as { court: ApiCourt }).court;
  },

  async updateCourt(id: string, patch: Partial<CourtInput> & { active?: boolean }): Promise<ApiCourt> {
    const res = await request(`/api/club/courts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return ((await res.json()) as { court: ApiCourt }).court;
  },
};
