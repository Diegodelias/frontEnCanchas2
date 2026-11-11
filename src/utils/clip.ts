import {
  CAPTURE_POST_SECONDS,
  CAPTURE_PRE_SECONDS,
  CLIP_STEP_SECONDS,
  MAX_CLIP_SECONDS,
  MIN_CLIP_SECONDS,
} from '../types/play';

export interface ClipWindow {
  /** Inicio del fragmento en segundos del video. */
  start: number;
  /** Fin del fragmento en segundos del video. */
  end: number;
}

/** Fin más lejano que permite el video: su duración real entera, o ninguno si todavía no se conoce. */
const latestEnd = (videoDuration?: number): number =>
  videoDuration !== undefined && Number.isFinite(videoDuration) && videoDuration > 0 ? Math.floor(videoDuration) : Infinity;

/**
 * Fragmento que se propone al marcar un momento: 15 s antes y 5 s después, sin salirse del video, con al menos
 * 3 segundos y conteniendo siempre el momento marcado.
 */
export function defaultClip(timestamp: number, videoDuration?: number): ClipWindow {
  const mark = Math.max(0, Math.floor(timestamp));
  const end = Math.max(mark, Math.min(mark + CAPTURE_POST_SECONDS, latestEnd(videoDuration)));
  const start = Math.max(0, Math.min(mark - CAPTURE_PRE_SECONDS, end - MIN_CLIP_SECONDS));
  return { start, end: Math.max(end, start + MIN_CLIP_SECONDS) };
}

export type ClipEdge = 'start' | 'end';

/** Sets a clip boundary to an exact second while preserving the timestamp and server limits. */
export function setClipEdge(
  clip: ClipWindow,
  edge: ClipEdge,
  value: number,
  timestamp: number,
  videoDuration?: number
): ClipWindow {
  const mark = Math.max(0, Math.floor(timestamp));
  const next = Math.floor(value);

  if (edge === 'start') {
    const lowest = Math.max(0, clip.end - MAX_CLIP_SECONDS);
    const highest = Math.min(mark, clip.end - MIN_CLIP_SECONDS);
    if (highest < lowest) return clip;
    return { ...clip, start: Math.min(Math.max(next, lowest), highest) };
  }

  const lowest = Math.max(mark, clip.start + MIN_CLIP_SECONDS);
  const highest = Math.min(clip.start + MAX_CLIP_SECONDS, latestEnd(videoDuration));
  if (highest < lowest) return clip;
  return { ...clip, end: Math.min(Math.max(next, lowest), highest) };
}

/**
 * Mueve un borde del fragmento `CLIP_STEP_SECONDS` hacia atrás (-1) o adelante (+1), respetando los límites:
 * desde 0 hasta el final del video, de 3 a 120 segundos y con el momento marcado siempre adentro.
 * Si el movimiento no es posible devuelve el mismo fragmento (el botón se muestra deshabilitado).
 * Cuando falta menos de un paso para el límite, se mueve hasta el límite.
 */
export function moveClipEdge(
  clip: ClipWindow,
  edge: ClipEdge,
  direction: -1 | 1,
  timestamp: number,
  videoDuration?: number
): ClipWindow {
  const mark = Math.max(0, Math.floor(timestamp));
  const wanted = (edge === 'start' ? clip.start : clip.end) + CLIP_STEP_SECONDS * direction;

  if (edge === 'start') {
    const lowest = Math.max(0, clip.end - MAX_CLIP_SECONDS);
    const highest = Math.min(mark, clip.end - MIN_CLIP_SECONDS);
    if (highest < lowest) return clip;
    const start = Math.min(Math.max(wanted, lowest), highest);
    // Un movimiento hacia atrás nunca avanza el borde, ni uno hacia adelante lo retrocede.
    if (start === clip.start || (direction === -1 && start > clip.start) || (direction === 1 && start < clip.start)) return clip;
    return { ...clip, start };
  }

  const lowest = Math.max(mark, clip.start + MIN_CLIP_SECONDS);
  const highest = Math.min(clip.start + MAX_CLIP_SECONDS, latestEnd(videoDuration));
  if (highest < lowest) return clip;
  const end = Math.min(Math.max(wanted, lowest), highest);
  if (end === clip.end || (direction === -1 && end > clip.end) || (direction === 1 && end < clip.end)) return clip;
  return { ...clip, end };
}

/** true si el botón de ese borde y dirección tiene algún movimiento posible. */
export function canMoveClipEdge(
  clip: ClipWindow,
  edge: ClipEdge,
  direction: -1 | 1,
  timestamp: number,
  videoDuration?: number
): boolean {
  const moved = moveClipEdge(clip, edge, direction, timestamp, videoDuration);
  return moved.start !== clip.start || moved.end !== clip.end;
}
