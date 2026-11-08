import { ApiCourt, CourtInput, CreatePlayerInput, CreatePlayerResult, request } from './clubsApi';

/** Club tal como lo ve el superadmin: con su estado y los conteos de canchas activas y admins vigentes. */
export interface PlatformClub {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
  active: boolean;
  activeCourts: number;
  admins: number;
}

export interface PlatformClubsPage {
  clubs: PlatformClub[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Datos para crear un club. El identificador no se puede cambiar después. */
export interface ClubCreateInput {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
}

export type ClubPatch = Partial<Omit<ClubCreateInput, 'id'>> & { active?: boolean };

/** Estado de un admin de club: Invitado (sin contraseña todavía), Activo o Dado de baja. */
export type PlatformAdminStatus = 'invited' | 'active' | 'deactivated';

export interface PlatformAdmin {
  id: string;
  email: string;
  name: string | null;
  status: PlatformAdminStatus;
  /** Solo para un Invitado: su link venció y hay que reenviar la invitación. */
  invitationExpired: boolean;
}

export interface InviteResult {
  admin: PlatformAdmin;
  /** false si el mail no se pudo enviar: la cuenta queda creada y se puede reenviar. */
  emailSent: boolean;
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** API del panel de la plataforma (`/api/platform/...`), solo para el superadmin con sesión. */
export const platformApi = {
  /** Crea un jugador por mail como superadmin (o saca un link nuevo para uno existente) y devuelve el link. */
  async createPlayer(input: CreatePlayerInput): Promise<CreatePlayerResult> {
    const res = await request('/api/platform/players', { method: 'POST', ...json(input) });
    return (await res.json()) as CreatePlayerResult;
  },

  async listClubs(query: { q?: string; page: number; limit?: number }): Promise<PlatformClubsPage> {
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.limit) params.set('limit', String(query.limit));
    if (query.q?.trim()) params.set('q', query.q.trim());
    const res = await request(`/api/platform/clubs?${params.toString()}`);
    return (await res.json()) as PlatformClubsPage;
  },

  async createClub(input: ClubCreateInput): Promise<PlatformClub> {
    const res = await request('/api/platform/clubs', { method: 'POST', ...json(input) });
    return ((await res.json()) as { club: PlatformClub }).club;
  },

  async updateClub(id: string, patch: ClubPatch): Promise<PlatformClub> {
    const res = await request(`/api/platform/clubs/${encodeURIComponent(id)}`, { method: 'PATCH', ...json(patch) });
    return ((await res.json()) as { club: PlatformClub }).club;
  },

  async listCourts(clubId: string): Promise<ApiCourt[]> {
    const res = await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/courts`);
    return ((await res.json()) as { courts: ApiCourt[] }).courts;
  },

  async createCourt(clubId: string, input: CourtInput): Promise<ApiCourt> {
    const res = await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/courts`, { method: 'POST', ...json(input) });
    return ((await res.json()) as { court: ApiCourt }).court;
  },

  async updateCourt(clubId: string, courtId: string, patch: Partial<CourtInput> & { active?: boolean }): Promise<ApiCourt> {
    const res = await request(
      `/api/platform/clubs/${encodeURIComponent(clubId)}/courts/${encodeURIComponent(courtId)}`,
      { method: 'PATCH', ...json(patch) },
    );
    return ((await res.json()) as { court: ApiCourt }).court;
  },

  async deleteCourt(clubId: string, courtId: string): Promise<void> {
    await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/courts/${encodeURIComponent(courtId)}`, { method: 'DELETE' });
  },

  async listAdmins(clubId: string): Promise<PlatformAdmin[]> {
    const res = await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/admins`);
    return ((await res.json()) as { admins: PlatformAdmin[] }).admins;
  },

  async inviteAdmin(clubId: string, input: { email: string; name: string }): Promise<InviteResult> {
    const res = await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/admins`, { method: 'POST', ...json(input) });
    return (await res.json()) as InviteResult;
  },

  async resendInvitation(clubId: string, adminId: string): Promise<InviteResult> {
    const res = await request(
      `/api/platform/clubs/${encodeURIComponent(clubId)}/admins/${encodeURIComponent(adminId)}/invitation`,
      { method: 'POST' },
    );
    return (await res.json()) as InviteResult;
  },

  async removeAdmin(clubId: string, adminId: string): Promise<void> {
    await request(`/api/platform/clubs/${encodeURIComponent(clubId)}/admins/${encodeURIComponent(adminId)}`, { method: 'DELETE' });
  },
};
