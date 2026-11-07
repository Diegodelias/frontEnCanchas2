import { MOCK_COMPLEXES } from '../data/mockComplexes';
import { DEMO_REGISTERED_USER } from '../data/mockUsers';
import { AuthMode, UserProfile } from '../types/user';

const SIMULATED_LATENCY_MS = 60;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let activeUser: UserProfile = { ...DEMO_REGISTERED_USER };

/** Usuario tal como lo devuelve la API (`/api/auth/*`). */
interface ApiUser {
  id: string;
  email: string;
  /** null en los jugadores, que se crean solo con el mail. */
  name: string | null;
  role: 'player' | 'club_admin';
  clubId: string | null;
}

/** Error de ingreso con el mensaje listo para mostrar. */
export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const NETWORK_ERROR_MESSAGE = 'No pudimos conectar con el servidor. Probá de nuevo en un momento.';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/** Nombre a mostrar de un jugador sin nombre: la parte del mail anterior a la arroba. */
export function shortEmailName(email: string): string {
  return email.split('@')[0] || email;
}

function toAdminProfile(apiUser: ApiUser): UserProfile {
  const club = MOCK_COMPLEXES.find((c) => c.id === apiUser.clubId);
  const name = apiUser.name ?? shortEmailName(apiUser.email);
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    avatar: initials(name),
    role: 'club_admin',
    roleLabel: 'Administrador',
    clubId: apiUser.clubId ?? undefined,
    clubName: club?.name,
    joinedAt: '',
    savedMatchIds: [],
    isRealSession: true,
  };
}

function toPlayerProfile(apiUser: ApiUser): UserProfile {
  const name = apiUser.name ?? shortEmailName(apiUser.email);
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    avatar: initials(name),
    role: 'player',
    roleLabel: 'Jugador',
    joinedAt: '',
    // Los partidos guardados siguen simulados: quedan fuera de este change.
    savedMatchIds: [],
    isRealSession: true,
  };
}

function toProfile(apiUser: ApiUser): UserProfile {
  return apiUser.role === 'club_admin' ? toAdminProfile(apiUser) : toPlayerProfile(apiUser);
}

async function readError(res: Response, fallback: string): Promise<AuthError> {
  const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  return new AuthError(body?.error?.code ?? 'unknown_error', body?.error?.message ?? fallback);
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new AuthError('network_error', NETWORK_ERROR_MESSAGE);
  }
}

export const authService = {
  /**
   * Obtiene el perfil del usuario actual según el modo de autenticación.
   */
  async getCurrentUser(mode: AuthMode): Promise<UserProfile | null> {
    await sleep(SIMULATED_LATENCY_MS);
    if (mode === 'guest') return null;
    return { ...activeUser };
  },

  /**
   * Cambia al jugador demo o a invitado. El admin solo entra con `loginAdmin`.
   */
  async switchRole(role: 'player' | 'guest'): Promise<UserProfile | null> {
    await sleep(SIMULATED_LATENCY_MS);
    if (role === 'guest') {
      return null;
    }
    activeUser = { ...DEMO_REGISTERED_USER };
    return { ...activeUser };
  },

  /**
   * Ingreso de admin de club con mail y contraseña. El backend deja la cookie de sesión.
   * Lanza `AuthError` con el mensaje del backend si falla.
   */
  async loginAdmin(email: string, password: string): Promise<UserProfile> {
    const res = await apiFetch('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: { code?: string; message?: string } }
        | null;
      const code = body?.error?.code ?? 'unknown_error';
      const message =
        res.status === 400
          ? 'Ingresá tu mail y tu contraseña.'
          : body?.error?.message ?? 'No pudimos iniciar la sesión. Probá de nuevo.';
      throw new AuthError(code, message);
    }
    const { user } = (await res.json()) as { user: ApiUser };
    return toAdminProfile(user);
  },

  /**
   * Sesión actual del backend (admin o jugador); sin sesión devuelve null.
   */
  async fetchSession(): Promise<UserProfile | null> {
    const res = await apiFetch('/api/auth/me');
    if (!res.ok) return null;
    const { user } = (await res.json()) as { user: ApiUser | null };
    return user ? toProfile(user) : null;
  },

  /**
   * Cierra la sesión en el backend (invalida la cookie).
   */
  async logout(): Promise<void> {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  },

  /**
   * Pide el link de acceso al backend. La respuesta es la misma tenga o no cuenta el mail,
   * así que no dice nada sobre si el mail está registrado. Lanza `AuthError` con el mensaje a mostrar.
   */
  async sendMagicLink(
    email: string
  ): Promise<{ success: boolean; message: string; email: string }> {
    const res = await apiFetch('/api/auth/player/request-link', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      throw await readError(res, 'No pudimos enviar el link. Probá de nuevo en un momento.');
    }
    const { message } = (await res.json()) as { message: string };
    return { success: true, message, email: email.trim() };
  },

  /**
   * Confirma el link de acceso y abre la sesión del jugador (cookie del backend).
   * Lanza `AuthError` con código `link_used` o `link_expired` si el link ya no sirve.
   */
  async confirmLink(token: string): Promise<UserProfile> {
    const res = await apiFetch('/api/auth/player/confirm', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw await readError(res, 'No pudimos iniciar la sesión. Pedí un link nuevo.');
    }
    const { user } = (await res.json()) as { user: ApiUser };
    return toProfile(user);
  },

  /**
   * Alterna el guardado de un partido para el usuario registrado.
   */
  async toggleSavedMatch(matchId: string): Promise<{ saved: boolean; ids: string[] }> {
    await sleep(SIMULATED_LATENCY_MS);
    const exists = activeUser.savedMatchIds.includes(matchId);
    if (exists) {
      activeUser.savedMatchIds = activeUser.savedMatchIds.filter((id) => id !== matchId);
    } else {
      activeUser.savedMatchIds = [matchId, ...activeUser.savedMatchIds];
    }
    return {
      saved: !exists,
      ids: [...activeUser.savedMatchIds],
    };
  },

  /**
   * Inicia sesión con email.
   */
  async loginWithEmail(email: string): Promise<UserProfile> {
    await sleep(SIMULATED_LATENCY_MS);
    activeUser = {
      ...DEMO_REGISTERED_USER,
      email: email.trim(),
    };
    return { ...activeUser };
  },
};
