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
  name: string;
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

function toAdminProfile(apiUser: ApiUser): UserProfile {
  const club = MOCK_COMPLEXES.find((c) => c.id === apiUser.clubId);
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar: initials(apiUser.name),
    role: 'club_admin',
    roleLabel: 'Administrador',
    clubId: apiUser.clubId ?? undefined,
    clubName: club?.name,
    joinedAt: '',
    savedMatchIds: [],
  };
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
   * Sesión actual del backend. Hoy solo existen sesiones de admin; sin sesión devuelve null.
   */
  async fetchSession(): Promise<UserProfile | null> {
    const res = await apiFetch('/api/auth/me');
    if (!res.ok) return null;
    const { user } = (await res.json()) as { user: ApiUser | null };
    return user && user.role === 'club_admin' ? toAdminProfile(user) : null;
  },

  /**
   * Cierra la sesión en el backend (invalida la cookie).
   */
  async logout(): Promise<void> {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  },

  /**
   * Envía un enlace de acceso al email del usuario.
   */
  async sendMagicLink(
    email: string
  ): Promise<{ success: boolean; message: string; email: string }> {
    await sleep(SIMULATED_LATENCY_MS);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Ingresá un correo electrónico válido');
    }

    return {
      success: true,
      message: 'Revisá tu email. Te enviamos un enlace de acceso seguro a Canchas3.',
      email: email.trim(),
    };
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
