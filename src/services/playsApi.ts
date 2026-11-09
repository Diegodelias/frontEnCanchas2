import { SavedPlay, SavePlayInput } from '../types/play';
import type { PlayerQuotaInfo, PlayPayment, ResolvedPayment } from '../types/quota';
import { ApiPlay, defaultPlayTitle, toSavedPlay } from './playContext';

/** Error de la API de jugadas con el mensaje listo para mostrar. */
export class PlaysApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'PlaysApiError';
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new PlaysApiError('network_error', 'No pudimos conectar con el servidor. Probá de nuevo en un momento.', 0);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new PlaysApiError(
      body?.error?.code ?? 'unknown_error',
      body?.error?.message ?? 'No pudimos completar la operación. Probá de nuevo.',
      res.status
    );
  }
  return res;
}

/** Jugadas del jugador con sesión real, guardadas en el backend. */
export const playsApi = {
  async list(userId?: string): Promise<SavedPlay[]> {
    const res = await request('/api/plays');
    const { plays } = (await res.json()) as { plays: ApiPlay[] };
    return plays.map((p) => toSavedPlay(p, userId));
  },

  /** Guarda la jugada. Solo viajan el partido, el título, la categoría, el modo y el momento marcado. */
  async create(input: SavePlayInput, userId?: string): Promise<SavedPlay> {
    const res = await request('/api/plays', {
      method: 'POST',
      body: JSON.stringify({
        matchId: input.matchId,
        title: defaultPlayTitle(input),
        category: input.category ?? null,
        captureMode: input.captureMode ?? 'video',
        timestamp: Math.max(0, Math.floor(input.timestamp)),
        isLiveMoment: Boolean(input.isLiveMoment),
        // El fragmento ajustado; una jugada en vivo no lo tiene y sin él el servidor usa el de siempre.
        ...(!input.isLiveMoment && input.clipStart !== undefined && input.clipEnd !== undefined
          ? { clipStart: Math.floor(input.clipStart), clipEnd: Math.floor(input.clipEnd) }
          : {}),
      }),
    });
    const { play } = (await res.json()) as { play: ApiPlay };
    return toSavedPlay(play, userId);
  },

  /** El uso y el cupo del jugador con sesión y el paquete de jugadas extra vigente. */
  async quota(): Promise<PlayerQuotaInfo> {
    const res = await request('/api/plays/quota');
    return (await res.json()) as PlayerQuotaInfo;
  },

  /** Inicia la compra (de demostración) del paquete: un intento pendiente con la cantidad y el precio vigentes. */
  async startPackPurchase(): Promise<PlayPayment> {
    const res = await request('/api/plays/pack-purchases', { method: 'POST' });
    return ((await res.json()) as { payment: PlayPayment }).payment;
  },

  /** Aprueba o rechaza el intento (una sola vez): aprobar suma las jugadas del paquete al cupo. */
  async resolvePackPurchase(paymentId: string, outcome: 'approve' | 'reject'): Promise<ResolvedPayment> {
    const res = await request(`/api/plays/pack-purchases/${encodeURIComponent(paymentId)}/${outcome}`, { method: 'POST' });
    return (await res.json()) as ResolvedPayment;
  },

  async update(playId: string, updates: Partial<SavedPlay>, userId?: string): Promise<SavedPlay | null> {
    const body: { title?: string; category?: string | null } = {};
    if (updates.title !== undefined) body.title = updates.title;
    if ('category' in updates) body.category = updates.category ?? null;
    try {
      const res = await request(`/api/plays/${encodeURIComponent(playId)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      const { play } = (await res.json()) as { play: ApiPlay };
      return toSavedPlay(play, userId);
    } catch (err) {
      if (err instanceof PlaysApiError && err.status === 404) return null;
      throw err;
    }
  },

  async remove(playId: string): Promise<boolean> {
    try {
      await request(`/api/plays/${encodeURIComponent(playId)}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      if (err instanceof PlaysApiError && err.status === 404) return false;
      throw err;
    }
  },

  /**
   * Descarga el fragmento de una jugada: pide el mp4 (el servidor lo corta del video de la grabación, puede tardar unos
   * segundos) y lo baja con el nombre que indica el servidor. Falla con el mensaje del servidor si está ocupado,
   * si el corte tarda de más o si la jugada no se puede descargar.
   */
  async downloadClip(playId: string): Promise<string> {
    const res = await request(`/api/plays/${encodeURIComponent(playId)}/clip`);
    const blob = await res.blob();
    const fileName = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'jugada.mp4';
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      // El navegador ya tomó el archivo: se libera la copia en memoria un momento después.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
    return fileName;
  },
};
