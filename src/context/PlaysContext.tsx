import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { pendingPlayService } from '../services/pendingPlayService';
import { PlaysApiError, playsApi } from '../services/playsApi';
import { SavedPlay, SavePlayInput } from '../types/play';
import type { PlayerQuotaInfo } from '../types/quota';
import { PackPurchaseModal } from '../components/plays/PackPurchaseModal';
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
  /** El uso y el cupo del jugador con sesión (y el paquete vigente), o null si no hay sesión de jugador o no se pudo leer. */
  quota: PlayerQuotaInfo | null;
  refreshQuota: () => Promise<void>;
  /** Abre la oferta del paquete de jugadas extra (también se abre sola al llegar al límite). */
  openPackOffer: () => void;
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
  const [quota, setQuota] = useState<PlayerQuotaInfo | null>(null);
  // La oferta del paquete vive acá para abrirse desde cualquier pantalla donde se guarde una jugada.
  const [offerOpen, setOfferOpen] = useState(false);

  // Solo se aplica la lista del último pedido: una respuesta atrasada no pisa a una más nueva.
  const latestFetch = useRef(0);
  const latestQuotaFetch = useRef(0);

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

  /** Lee el uso y el cupo del jugador; si no se puede, conserva lo último que se sabía. */
  const refreshQuota = async () => {
    const seq = ++latestQuotaFetch.current;
    if (!isPlayer) {
      setQuota(null);
      return;
    }
    try {
      const next = await playsApi.quota();
      if (seq === latestQuotaFetch.current) setQuota(next);
    } catch {
      // sin cupo conocido, la oferta igual avisa del límite y se puede borrar una jugada
    }
  };

  useEffect(() => {
    fetchPlays();
    void refreshQuota();
  }, [user]);

  const savePlay = async (input: SavePlayInput): Promise<SavedPlay> => {
    try {
      const play = await playsApi.create(input, user?.id);
      setSavedPlays((prev) => [play, ...prev.filter((p) => p.id !== play.id)]);
      void refreshQuota();
      return play;
    } catch (err) {
      // Al llegar al límite se ofrece el paquete; quien llamó recibe igual el error y cierra lo suyo.
      if (err instanceof PlaysApiError && err.code === 'plays_limit_reached') {
        setOfferOpen(true);
        void refreshQuota();
      }
      throw err;
    }
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
      void refreshQuota();
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
    void refreshQuota();
    if (result.status === 'limit') setOfferOpen(true);
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
        quota,
        refreshQuota,
        openPackOffer: () => {
          void refreshQuota();
          setOfferOpen(true);
        },
        resumePendingPlay,
      }}
    >
      {children}
      {offerOpen && isPlayer && (
        <PackPurchaseModal quota={quota} onClose={() => setOfferOpen(false)} onResolved={() => void refreshQuota()} />
      )}
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
