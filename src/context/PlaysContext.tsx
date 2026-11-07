import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';
import { pendingPlayService } from '../services/pendingPlayService';
import { PlaysApiError, playsApi } from '../services/playsApi';
import { playsService } from '../services/playsService';
import { SavedPlay, SavePlayInput } from '../types/play';
import { useAuth } from './AuthContext';

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
  savePlay: (input: SavePlayInput, options?: { forceError?: boolean }) => Promise<SavedPlay>;
  updatePlay: (playId: string, updates: Partial<SavedPlay>) => Promise<SavedPlay | null>;
  deletePlay: (playId: string) => Promise<boolean>;
  toggleSaveMatch: (matchId: string) => Promise<boolean>;
  isMatchSaved: (matchId: string) => boolean;
  refreshPlays: () => Promise<void>;
  assignAllPlaysToUser: () => Promise<void>;
  /**
   * Guarda en la cuenta, recién ingresada, la jugada que el invitado dejó pendiente en este navegador.
   * No depende del usuario del render: se llama justo después de confirmar el link.
   */
  resumePendingPlay: () => Promise<ResumePendingResult>;
}

const PlaysContext = createContext<PlaysContextValue | undefined>(undefined);

export const PlaysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedPlays, setSavedPlays] = useState<SavedPlay[]>([]);
  const [savedMatchIds, setSavedMatchIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Solo se aplica la lista del último pedido: una respuesta atrasada no pisa a una más nueva.
  const latestFetch = useRef(0);

  // Con sesión real las jugadas viven en el backend; el jugador de ejemplo sigue con el almacenamiento local.
  const isRealPlayer = Boolean(user?.isRealSession && user.role === 'player');

  const fetchPlaysAndMatches = async () => {
    const seq = ++latestFetch.current;
    setIsLoading(true);
    try {
      if (isRealPlayer) {
        // Un jugador real arranca sin jugadas: ni las de ejemplo ni las del almacenamiento local viejo.
        const plays = await playsApi.list(user?.id).catch(() => [] as SavedPlay[]);
        if (seq !== latestFetch.current) return;
        setSavedPlays(plays);
        setSavedMatchIds(user?.savedMatchIds ?? []);
      } else {
        const plays = await playsService.getSavedPlays(user?.id);
        if (seq !== latestFetch.current) return;
        setSavedPlays(plays);
        setSavedMatchIds(user?.savedMatchIds || ['match-en-f5-1900', 'match-lc-f5-1900']);
      }
    } finally {
      if (seq === latestFetch.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaysAndMatches();
  }, [user]);

  const savePlay = async (
    input: SavePlayInput,
    options?: { forceError?: boolean }
  ): Promise<SavedPlay> => {
    const play = isRealPlayer
      ? await playsApi.create(input, user?.id)
      : await playsService.savePlay(input, user?.id, options);
    setSavedPlays((prev) => [play, ...prev.filter((p) => p.id !== play.id)]);
    return play;
  };

  const updatePlay = async (
    playId: string,
    updates: Partial<SavedPlay>
  ): Promise<SavedPlay | null> => {
    const updated = isRealPlayer
      ? await playsApi.update(playId, updates, user?.id)
      : await playsService.updatePlay(playId, updates);
    if (updated) {
      setSavedPlays((prev) => prev.map((p) => (p.id === playId ? updated : p)));
    }
    return updated;
  };

  const deletePlay = async (playId: string): Promise<boolean> => {
    const success = isRealPlayer
      ? await playsApi.remove(playId)
      : await playsService.deletePlay(playId);
    if (success) {
      setSavedPlays((prev) => prev.filter((p) => p.id !== playId));
    }
    return success;
  };

  const assignAllPlaysToUser = async (): Promise<void> => {
    // Las jugadas de un jugador real ya son suyas desde que se guardan; esto es solo del modo demo.
    if (!user || isRealPlayer) return;
    await playsService.assignPlaysToUser(user.id);
    await fetchPlaysAndMatches();
  };

  const toggleSaveMatch = async (matchId: string): Promise<boolean> => {
    const { saved, ids } = await authService.toggleSavedMatch(matchId);
    setSavedMatchIds(ids);
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
        refreshPlays: fetchPlaysAndMatches,
        assignAllPlaysToUser,
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
