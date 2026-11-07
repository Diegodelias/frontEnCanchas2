import { useCallback, useEffect, useState } from 'react';
import { ApiClubInfo, ApiCourt, clubsApi } from '../../services/clubsApi';

export type MyCourtsStatus = 'loading' | 'ready' | 'error';

/**
 * El club del admin con sesión y todas sus canchas (activas o no), desde el backend.
 * Solo pide los datos cuando `enabled` es true (es decir, cuando ya se sabe que hay un admin).
 */
export function useMyCourts(enabled: boolean) {
  const [club, setClub] = useState<ApiClubInfo | null>(null);
  const [courts, setCourts] = useState<ApiCourt[]>([]);
  const [status, setStatus] = useState<MyCourtsStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus('loading');
    clubsApi
      .fetchMyCourts()
      .then((data) => {
        if (cancelled) return;
        setClub(data.club);
        setCourts(data.courts);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { club, courts, setCourts, status, reload };
}
