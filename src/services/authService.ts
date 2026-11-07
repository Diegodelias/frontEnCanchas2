import { DEMO_CLUB_ADMIN, DEMO_REGISTERED_USER, MOCK_USERS } from '../data/mockUsers';
import { AuthMode, UserProfile, UserRole } from '../types/user';

const SIMULATED_LATENCY_MS = 60;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let activeUser: UserProfile = { ...DEMO_REGISTERED_USER };

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
   * Cambia el rol y usuario activo directamente.
   */
  async switchRole(role: UserRole | 'guest'): Promise<UserProfile | null> {
    await sleep(SIMULATED_LATENCY_MS);
    if (role === 'guest') {
      return null;
    }
    if (role === 'club_admin') {
      activeUser = { ...DEMO_CLUB_ADMIN };
    } else {
      activeUser = { ...DEMO_REGISTERED_USER };
    }
    return { ...activeUser };
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
