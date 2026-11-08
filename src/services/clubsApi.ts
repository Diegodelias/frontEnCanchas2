import { SportType } from '../types/canchas';

/** Cancha tal como la devuelve la API. `active` solo viene en las rutas del admin. */
export interface ApiCourt {
  id: string;
  name: string;
  sport: SportType;
  price: number;
  active?: boolean;
  /** Solo en el listado público; nula si la cancha no tiene imagen. */
  imageUrl?: string | null;
}

/** Datos de un club, que el admin de club solo puede ver (no editar). */
export interface ApiClubInfo {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
  /** false si el superadmin desactivó el club: no se muestra en el sitio. Solo viene en las rutas del admin. */
  active?: boolean;
}

/** Club del listado público, con sus canchas activas. */
export interface ApiClub extends ApiClubInfo {
  /** Imagen propia del club; nula si no tiene (la landing usa la de siempre o el placeholder). */
  imageUrl: string | null;
  courts: ApiCourt[];
}

/** Una página del listado público de clubes. */
export interface ApiClubsPage {
  clubs: ApiClub[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClubsPageQuery {
  page: number;
  limit?: number;
  city?: string;
  sport?: SportType;
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

export async function request(path: string, init?: RequestInit): Promise<Response> {
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
  /** Una página de clubes con sus canchas activas, filtrada por ciudad y deporte. Público: no pide sesión. */
  async fetchClubsPage(query: ClubsPageQuery): Promise<ApiClubsPage> {
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.limit) params.set('limit', String(query.limit));
    if (query.city) params.set('city', query.city);
    if (query.sport) params.set('sport', query.sport);
    const res = await request(`/api/clubs?${params.toString()}`);
    return (await res.json()) as ApiClubsPage;
  },

  /** Un club con sus canchas activas. Público. Falla con 404 si no existe o no tiene canchas activas. */
  async fetchClub(id: string): Promise<ApiClub> {
    const res = await request(`/api/clubs/${encodeURIComponent(id)}`);
    return ((await res.json()) as { club: ApiClub }).club;
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

  /** Borra una cancha del club (borrado lógico: deja de verse en todos lados). */
  async deleteCourt(id: string): Promise<void> {
    await request(`/api/club/courts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
