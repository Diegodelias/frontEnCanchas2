import type { Match } from '../types/match';

/** Dónde se guarda, en el navegador, la última lista de grabaciones reproducibles recibida. */
const STORAGE_KEY = 'canchas3-recordings';

const TEXT_FIELDS = [
  'id',
  'title',
  'clubId',
  'clubName',
  'courtId',
  'courtName',
  'dayId',
  'dateLabel',
  'timeSlot',
  'status',
  'recordedAt',
] as const;

/** true si el valor tiene la forma de un `Match` que el buscador puede usar sin romperse. */
function isMatch(value: unknown): value is Match {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (!TEXT_FIELDS.every((field) => typeof record[field] === 'string')) return false;
  if (record.videoSrc !== null && typeof record.videoSrc !== 'string') return false;
  return typeof record.duration === 'number' && Number.isFinite(record.duration);
}

/**
 * La última lista guardada, o null si no hay, el navegador no deja leer o lo guardado no tiene la forma esperada
 * (en ese caso el buscador se comporta como en una primera visita). Una lista vacía válida se devuelve vacía.
 */
export function readCachedMatches(): Match[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isMatch)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda la lista recibida para la próxima visita. Si el navegador no deja guardar, no pasa nada. */
export function writeCachedMatches(matches: Match[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // Sin almacenamiento el buscador funciona igual; solo no recuerda la lista para la próxima visita.
  }
}
