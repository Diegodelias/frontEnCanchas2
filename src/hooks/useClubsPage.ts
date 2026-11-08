import { useCallback, useEffect, useRef, useState } from 'react';
import { clubsApi } from '../services/clubsApi';
import { toComplex } from '../services/complexAdapter';
import { Complex, SportType } from '../types/canchas';

/** Clave donde la versión anterior guardaba los clubes y canchas en el navegador; ya no se usa y se borra. */
const LEGACY_COMPLEXES_STORAGE_KEY = 'canchas3_complexes_data';

/** Clubes por página de la landing. */
export const CLUBS_PER_PAGE = 6;

export type ClubsPageStatus = 'loading' | 'ready' | 'error';

interface ClubsPageQuery {
  page: number;
  city: string;
  /** `undefined` = todos los deportes. */
  sport?: SportType;
}

/**
 * Una página de clubes del listado público del backend, ya filtrada por ciudad y deporte.
 * No hay respaldo de datos de ejemplo: si el backend no responde, el estado es `error`.
 * Solo se aplica la respuesta del último pedido: una atrasada no pisa a una más nueva.
 */
export function useClubsPage({ page, city, sport }: ClubsPageQuery) {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<ClubsPageStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_COMPLEXES_STORAGE_KEY);
    } catch {
      // sin almacenamiento local no hay nada que borrar
    }
  }, []);

  useEffect(() => {
    const seq = ++latest.current;
    setStatus('loading');
    clubsApi
      .fetchClubsPage({ page, limit: CLUBS_PER_PAGE, city, sport })
      .then((result) => {
        if (seq !== latest.current) return;
        const now = new Date();
        setComplexes(result.clubs.map((club) => toComplex(club, now)));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setStatus('ready');
      })
      .catch(() => {
        if (seq !== latest.current) return;
        setStatus('error');
      });
  }, [page, city, sport, attempt]);

  /** Vuelve a pedir la página mostrando el estado de carga (el «Reintentar» de la landing). */
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { complexes, total, totalPages, status, reload };
}
