import { MOCK_SAVED_PLAYS } from '../data/mockPlays';
import {
  CAPTURE_POST_SECONDS,
  CAPTURE_PRE_SECONDS,
  CAPTURE_TOTAL_SECONDS,
  SavedPlay,
  SavePlayInput,
} from '../types/play';

const STORAGE_KEY = 'canchas3-saved-plays';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSecondsToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function loadPlaysFromStorage(): SavedPlay[] {
  if (typeof window === 'undefined') return [...MOCK_SAVED_PLAYS];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading saved plays from localStorage:', err);
  }
  return [...MOCK_SAVED_PLAYS];
}

function persistPlaysToStorage(plays: SavedPlay[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plays));
  } catch (err) {
    console.warn('Error saving plays to localStorage:', err);
  }
}

export const playsService = {
  /**
   * Obtiene todas las jugadas guardadas desde localStorage.
   */
  async getSavedPlays(userId?: string): Promise<SavedPlay[]> {
    await sleep(80);
    const all = loadPlaysFromStorage();
    if (!userId) return all;
    // Si hay usuario, incluir jugadas del usuario y jugadas de sesión actual
    return all.filter((p) => !p.userId || p.userId === userId);
  },

  /**
   * Obtiene una jugada específica por ID.
   */
  async getPlayById(playId: string): Promise<SavedPlay | null> {
    await sleep(80);
    const all = loadPlaysFromStorage();
    const found = all.find((p) => p.id === playId);
    return found ? { ...found } : null;
  },

  /**
   * Obtiene jugadas pertenecientes a un partido o cámara.
   */
  async getPlaysByMatchId(matchId: string): Promise<SavedPlay[]> {
    await sleep(80);
    const all = loadPlaysFromStorage();
    return all.filter((p) => p.matchId === matchId);
  },

  /**
   * Guarda una jugada simulando procesamiento (500-1200ms).
   * Si la URL incluye ?guardado=error, lanza un error para simular fallo.
   */
  async savePlay(
    input: SavePlayInput,
    userId?: string,
    options?: { forceError?: boolean; simulatedDelayMs?: number }
  ): Promise<SavedPlay> {
    const delay = options?.simulatedDelayMs ?? (600 + Math.floor(Math.random() * 500));
    await sleep(delay);

    // Verificar si se fuerza error vía parámetro URL o flag
    const urlParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;
    const shouldError =
      options?.forceError || urlParams?.get('guardado') === 'error';

    if (shouldError) {
      throw new Error('No se pudo guardar la jugada. Intentá nuevamente.');
    }

    const timestampSec = Math.max(0, Math.floor(input.timestamp));
    const timestampLabel =
      input.timestampLabel ||
      (input.isLiveMoment ? 'Momento en vivo' : formatSecondsToMMSS(timestampSec));

    // Si no hay nombre ni categoría: "Jugada de 00:19" o "Jugada en vivo"
    const defaultTitle = input.isLiveMoment
      ? 'Jugada en vivo'
      : `Jugada de ${timestampLabel}`;
    const title = input.title?.trim() || (input.category ? `${input.category}` : defaultTitle);

    const startTime = Math.max(0, timestampSec - CAPTURE_PRE_SECONDS);
    const endTime = timestampSec + CAPTURE_POST_SECONDS;

    const newPlay: SavedPlay = {
      id: `jugada-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      matchId: input.matchId,
      title,
      category: input.category,
      captureMode: input.captureMode || 'video',
      timestamp: timestampSec,
      timestampLabel,
      startTime,
      endTime,
      duration: CAPTURE_TOTAL_SECONDS,
      status: 'ready',
      clubName: input.clubName,
      courtName: input.courtName,
      dateLabel: input.dateLabel,
      timeSlot: input.timeSlot,
      thumbnailUrl: input.thumbnailUrl || '/assets/aistudio/ref_6fe9ff42.mp4',
      videoSrc: input.videoSrc || '/assets/aistudio/ref_6fe9ff42.mp4',
      createdAt: new Date().toISOString(),
      userId,
      savedToProfile: Boolean(userId),
      isLiveMoment: input.isLiveMoment,
    };

    const currentPlays = loadPlaysFromStorage();
    const updated = [newPlay, ...currentPlays];
    persistPlaysToStorage(updated);

    return newPlay;
  },

  /**
   * Actualiza una jugada existente (ej. editar título o categoría).
   */
  async updatePlay(playId: string, updates: Partial<SavedPlay>): Promise<SavedPlay | null> {
    await sleep(100);
    const current = loadPlaysFromStorage();
    const index = current.findIndex((p) => p.id === playId);
    if (index === -1) return null;

    const updatedPlay = { ...current[index], ...updates };
    current[index] = updatedPlay;
    persistPlaysToStorage(current);
    return updatedPlay;
  },

  /**
   * Elimina una jugada.
   */
  async deletePlay(playId: string): Promise<boolean> {
    await sleep(80);
    const current = loadPlaysFromStorage();
    const filtered = current.filter((p) => p.id !== playId);
    persistPlaysToStorage(filtered);
    return filtered.length < current.length;
  },

  /**
   * Asocia jugadas anónimas al perfil del usuario.
   */
  async assignPlaysToUser(userId: string): Promise<void> {
    await sleep(100);
    const current = loadPlaysFromStorage();
    const updated = current.map((p) => ({
      ...p,
      userId,
      savedToProfile: true,
    }));
    persistPlaysToStorage(updated);
  },

  /**
   * Restablece las jugadas a los mocks iniciales.
   */
  async resetPlays(): Promise<void> {
    persistPlaysToStorage([...MOCK_SAVED_PLAYS]);
  },
};
