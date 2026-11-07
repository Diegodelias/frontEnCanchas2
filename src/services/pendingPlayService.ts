import { SavePlayInput } from '../types/play';

const STORAGE_KEY = 'canchas3-pending-play';

/** Cuánto espera la jugada que un invitado marcó mientras llega el mail de acceso. */
export const PENDING_PLAY_TTL_MS = 30 * 60 * 1000;

interface PendingPlay {
  input: SavePlayInput;
  savedAt: number;
}

/**
 * Jugada que un invitado marcó y todavía no pudo guardar porque necesita ingresar.
 * Vive en el almacenamiento local del navegador (común a todas sus pestañas): sirve si el link del mail
 * se abre en este mismo navegador. Se descarta a los 30 minutos.
 */
export const pendingPlayService = {
  save(input: SavePlayInput, now: number = Date.now()): void {
    try {
      const pending: PendingPlay = { input, savedAt: now };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    } catch {
      // Sin almacenamiento local no hay jugada pendiente: el jugador ingresa igual.
    }
  },

  /** Devuelve la jugada pendiente vigente y la borra. Una vencida se descarta. */
  take(now: number = Date.now()): SavePlayInput | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      if (!raw) return null;
      const pending = JSON.parse(raw) as PendingPlay;
      if (!pending?.input || typeof pending.savedAt !== 'number') return null;
      if (now - pending.savedAt > PENDING_PLAY_TTL_MS) return null;
      return pending.input;
    } catch {
      return null;
    }
  },

  /** Borra la jugada pendiente sin devolverla. */
  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // nada que borrar
    }
  },
};
