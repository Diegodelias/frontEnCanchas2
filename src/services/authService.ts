import { UserProfile } from '../types/user';

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
  const name = apiUser.name ?? shortEmailName(apiUser.email);
  return {
    id: apiUser.id,
    name,
    email: apiUser.email,
    avatar: initials(name),
    role: 'club_admin',
    roleLabel: 'Administrador',
    clubId: apiUser.clubId ?? undefined,
    joinedAt: '',
    savedMatchIds: [],
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
    // Los partidos guardados siguen fuera del backend: no hay forma de guardar un partido todavía.
    savedMatchIds: [],
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

/** Todo el acceso es real: lo que devuelve este servicio sale siempre de una sesión del backend. */
export const authService = {
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
      const error = await readError(res, 'No pudimos iniciar la sesión. Probá de nuevo.');
      throw res.status === 400 ? new AuthError(error.code, 'Ingresá tu mail y tu contraseña.') : error;
    }
    const { user } = (await res.json()) as { user: ApiUser };
    return toAdminProfile(user);
  },

  /**
   * Pide el link para elegir una contraseña nueva (admin). La respuesta es la misma sea cual sea el mail,
   * así que no dice nada sobre quién tiene cuenta. Lanza `AuthError` con el mensaje a mostrar.
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const res = await apiFetch('/api/auth/admin/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      throw await readError(res, 'No pudimos enviar el link. Probá de nuevo en un momento.');
    }
    return (await res.json()) as { message: string };
  },

  /**
   * Cambia la contraseña con el link del mail. No abre sesión: el admin ingresa con la contraseña nueva.
   * Lanza `AuthError` con código `link_used` o `link_expired` si el link ya no sirve.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    const res = await apiFetch('/api/auth/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      throw await readError(res, 'No pudimos cambiar la contraseña. Pedí un link nuevo.');
    }
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
};
