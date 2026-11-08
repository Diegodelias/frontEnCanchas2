import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw } from 'lucide-react';
import { buildMatchPath } from '../../routes/paths';
import { formatRecordingDate } from '../../services/recordingAdapter';
import { ApiRecording, ApiRecordingStatus, recordingsApi } from '../../services/recordingsApi';
import { Button } from '../ui/Button';

const STATUS_LABEL: Record<ApiRecordingStatus, string> = {
  available: 'Disponible',
  processing: 'En proceso',
  unavailable: 'Sin cámara',
  error: 'Con error',
};

const STATUS_STYLE: Record<ApiRecordingStatus, string> = {
  available: 'bg-turf-soft text-turf-ink',
  processing: 'bg-warning-soft text-ink',
  unavailable: 'bg-surface-muted text-ink-muted',
  error: 'bg-surface-muted text-alert',
};

/** «1:00» o «0:45» a partir de segundos; «—» si no hay duración. */
function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')} min`;
}

interface RecordingsListProps {
  /** Informa cuántas grabaciones hay, para el contador de la pestaña. */
  onCountChange?: (count: number) => void;
}

/** Grabaciones de las canchas del club del admin con sesión, solo lectura: cancha, fecha, hora, estado y duración. */
export const RecordingsList: React.FC<RecordingsListProps> = ({ onCountChange }) => {
  const [recordings, setRecordings] = useState<ApiRecording[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setRecordings(null);
    setError(null);
    recordingsApi
      .listOwnClub()
      .then((list) => {
        if (cancelled) return;
        setRecordings(list);
        onCountChange?.(list.length);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No pudimos cargar las grabaciones.');
      });
    return () => {
      cancelled = true;
    };
    // `onCountChange` cambia de identidad en cada render del padre; solo se vuelve a pedir al reintentar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (error) {
    return (
      <div role="alert" className="p-8 rounded-xl bg-surface border border-line text-center space-y-4">
        <p className="text-sm text-ink">{error}</p>
        <Button variant="volt" size="sm" onClick={retry}>
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Reintentar</span>
        </Button>
      </div>
    );
  }

  if (!recordings) {
    return (
      <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
        Cargando las grabaciones de tu club...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Historial de partidos grabados</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Las grabaciones de las canchas de tu club, de la más reciente a la más antigua. Es solo una lista: por ahora los
          videos son de demostración.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        {recordings.length === 0 ? (
          <p className="p-6 text-sm text-ink-muted">
            Todavía no hay grabaciones. Cuando una cancha de tu club grabe un turno, aparece acá.
          </p>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Cancha</th>
                <th className="py-3 px-4">Fecha y turno</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Duración</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recordings.map((recording) => (
                <tr key={recording.id}>
                  <td className="py-3.5 px-4 font-semibold text-ink">{recording.court.name}</td>
                  <td className="py-3.5 px-4 font-mono text-ink-muted whitespace-nowrap">
                    <p className="text-ink font-semibold">{formatRecordingDate(recording.date)}</p>
                    <p className="text-xs">{recording.time} hs</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${STATUS_STYLE[recording.status]}`}
                    >
                      {STATUS_LABEL[recording.status]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-ink whitespace-nowrap">
                    {formatDuration(recording.durationSeconds)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {recording.status === 'available' ? (
                      <Link to={buildMatchPath(recording.id)}>
                        <Button variant="volt" size="sm">
                          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>Ver</span>
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
