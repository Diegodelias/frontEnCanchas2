import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { pendingPlayService } from '../services/pendingPlayService';
import { PlaysApiError, playsApi } from '../services/playsApi';
import { SavedPlay, SavePlayInput } from '../types/play';
import { useAuth } from './AuthContext';

/** Clave donde la versión anterior guardaba las jugadas en el navegador; ya no se usa y se borra. */
const LEGACY_PLAYS_STORAGE_KEY = 'canchas3-saved-plays';

/** Qué pasó con la jugada que un invitado dejó pendiente antes de ingresar. */
export type ResumePendingResult =
  | { status: 'none' }
  | { status: 'saved'; title: string }
  | { status: 'limit'; message: string }
  | { status: 'error'; message: string };

export interface PlaysContextValue {
  savedPlays: SavedPlay[];
  savedMatchIds: string[];
  isLoading: boolean;
  savePlay: (input: SavePlayInput) => Promise<SavedPlay>;
  updatePlay: (playId: string, updates: Partial<SavedPlay>) => Promise<SavedPlay | null>;
  deletePlay: (playId: string) => Promise<boolean>;
  toggleSaveMatch: (matchId: string) => Promise<boolean>;
  isMatchSaved: (matchId: string) => boolean;
  refreshPlays: () => Promise<void>;
  /**
   * Guarda en la cuenta, recién ingresada, la jugada que el invitado dejó pendiente en este navegador.
   * No depende del usuario del render: se llama justo después de confirmar el link.
   */
  resumePendingPlay: () => Promise<ResumePendingResult>;
}

const PlaysContext = createContext<PlaysContextValue | undefined>(undefined);

/**
 * Las jugadas viven en el backend, en la cuenta del jugador. Un invitado o un admin no tienen jugadas.
 */
export const PlaysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedPlays, setSavedPlays] = useState<SavedPlay[]>([]);
  // Los partidos guardados siguen fuera del backend y no hay forma de guardar un partido: queda vacío.
  const [savedMatchIds, setSavedMatchIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Solo se aplica la lista del último pedido: una respuesta atrasada no pisa a una más nueva.
  const latestFetch = useRef(0);

  const isPlayer = user?.role === 'player';

  // Las jugadas guardadas en el navegador por la versión anterior no se importan: se borran.
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_PLAYS_STORAGE_KEY);
    } catch {
      // sin almacenamiento local no hay nada que borrar
    }
  }, []);

  const fetchPlays = async () => {
    const seq = ++latestFetch.current;
    if (!isPlayer) {
      setSavedPlays([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const plays = await playsApi.list(user?.id).catch(() => [] as SavedPlay[]);
      if (seq !== latestFetch.current) return;
      setSavedPlays(plays);
    } finally {
      if (seq === latestFetch.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlays();
  }, [user]);

  const savePlay = async (input: SavePlayInput): Promise<SavedPlay> => {
    const play = await playsApi.create(input, user?.id);
    setSavedPlays((prev) => [play, ...prev.filter((p) => p.id !== play.id)]);
    return play;
  };

  const updatePlay = async (
    playId: string,
    updates: Partial<SavedPlay>
  ): Promise<SavedPlay | null> => {
    const updated = await playsApi.update(playId, updates, user?.id);
    if (updated) {
      setSavedPlays((prev) => prev.map((p) => (p.id === playId ? updated : p)));
    }
    return updated;
  };

  const deletePlay = async (playId: string): Promise<boolean> => {
    const success = await playsApi.remove(playId);
    if (success) {
      setSavedPlays((prev) => prev.filter((p) => p.id !== playId));
    }
    return success;
  };

  const toggleSaveMatch = async (matchId: string): Promise<boolean> => {
    const saved = !savedMatchIds.includes(matchId);
    setSavedMatchIds((prev) => (saved ? [matchId, ...prev] : prev.filter((id) => id !== matchId)));
    return saved;
  };

  const isMatchSaved = (matchId: string): boolean => {
    return savedMatchIds.includes(matchId);
  };

  const resumePendingPlay = async (): Promise<ResumePendingResult> => {
    const input = pendingPlayService.take();
    if (!input) return { status: 'none' };

    // Este pedido pasa a ser el último: la lista que se cargó al cambiar de usuario ya no se aplica.
    const seq = ++latestFetch.current;
    let result: ResumePendingResult;
    try {
      const play = await playsApi.create(input);
      result = { status: 'saved', title: play.title };
    } catch (err) {
      result =
        err instanceof PlaysApiError && err.code === 'plays_limit_reached'
          ? { status: 'limit', message: err.message }
          : {
              status: 'error',
              message: err instanceof Error ? err.message : 'No pudimos guardar la jugada.',
            };
    }
    const plays = await playsApi.list().catch(() => null);
    if (plays && seq === latestFetch.current) {
      setSavedPlays(plays);
      setIsLoading(false);
    }
    return result;
  };

  return (
    <PlaysContext.Provider
      value={{
        savedPlays,
        savedMatchIds,
        isLoading,
        savePlay,
        updatePlay,
        deletePlay,
        toggleSaveMatch,
        isMatchSaved,
        refreshPlays: fetchPlays,
        resumePendingPlay,
      }}
    >
      {children}
    </PlaysContext.Provider>
  );
};

export function usePlays(): PlaysContextValue {
  const ctx = useContext(PlaysContext);
  if (!ctx) {
    throw new Error('usePlays must be used within a PlaysProvider');
  }
  return ctx;
}
