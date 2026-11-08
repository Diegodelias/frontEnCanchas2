import { useEffect, useMemo, useState } from 'react';
import { ClubsApiError, clubsApi } from '../services/clubsApi';
import { toComplex } from '../services/complexAdapter';
import { Complex } from '../types/canchas';

/** Clubes ya pedidos, por identificador; `null` es un club que el backend dijo que no existe o no se muestra. */
const clubCache = new Map<string, Complex | null>();

/**
 * Los clubes con esos identificadores, pedidos de a uno al backend y guardados en memoria.
 * Un club que no se puede obtener (no existe, no tiene canchas activas o hubo un error) no figura en el resultado.
 */
export function useClubsById(ids: string[]): Map<string, Complex> {
  const [version, setVersion] = useState(0);
  const key = ids.join('|');

  useEffect(() => {
    const missing = key ? key.split('|').filter((id) => !clubCache.has(id)) : [];
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map(async (id) => {
        try {
          clubCache.set(id, toComplex(await clubsApi.fetchClub(id)));
        } catch (err) {
          // Un 404 es definitivo; un error de red se reintenta la próxima vez que se pida.
          if (err instanceof ClubsApiError && err.status === 404) clubCache.set(id, null);
        }
      }),
    ).then(() => {
      if (!cancelled) setVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return useMemo(() => {
    const found = new Map<string, Complex>();
    for (const id of key ? key.split('|') : []) {
      const complex = clubCache.get(id);
      if (complex) found.set(id, complex);
    }
    return found;
    // `version` cambia cuando llegan clubes nuevos al caché.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);
}
