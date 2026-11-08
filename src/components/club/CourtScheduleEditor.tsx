import React, { useEffect, useId, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ScheduleDay } from '../../services/bookingsApi';
import { Button } from '../ui/Button';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DEFAULT_START = 16;
const DEFAULT_END = 23;

const FIELD_CLASS =
  'px-2 py-1.5 text-sm rounded-lg border border-line bg-canvas text-ink font-mono focus:outline-none focus:border-turf disabled:opacity-50';

interface DayDraft {
  open: boolean;
  startHour: number;
  endHour: number;
}

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** Un borrador por día de la semana (lunes = índice 0), a partir del horario guardado. */
function toDrafts(days: ScheduleDay[]): DayDraft[] {
  return WEEKDAYS.map((_, index) => {
    const saved = days.find((d) => d.weekday === index + 1);
    return saved
      ? { open: true, startHour: saved.startHour, endHour: saved.endHour }
      : { open: false, startHour: DEFAULT_START, endHour: DEFAULT_END };
  });
}

interface CourtScheduleEditorProps {
  courtName: string;
  load: () => Promise<ScheduleDay[]>;
  save: (days: ScheduleDay[]) => Promise<ScheduleDay[]>;
  /** Se llama con el horario guardado, para que la lista de canchas sepa si ya tiene horarios. */
  onSaved: (days: ScheduleDay[]) => void;
  onClose: () => void;
}

/** Editor del horario semanal de una cancha: por día, abierto o cerrado y un rango de horas enteras. */
export const CourtScheduleEditor: React.FC<CourtScheduleEditorProps> = ({ courtName, load, save, onSaved, onClose }) => {
  const errorId = useId();
  const [drafts, setDrafts] = useState<DayDraft[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDrafts(null);
    setLoadError(null);
    load()
      .then((days) => {
        if (!cancelled) setDrafts(toDrafts(days));
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'No pudimos cargar el horario.');
      });
    return () => {
      cancelled = true;
    };
    // `load` cambia de identidad en cada render del padre; solo se vuelve a pedir al reintentar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const change = (index: number, patch: Partial<DayDraft>) => {
    setDrafts((current) => current && current.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!drafts || isSaving) return;
    const problem = drafts.findIndex((d) => d.open && d.endHour <= d.startHour);
    if (problem >= 0) {
      setError(`${WEEKDAYS[problem]}: el cierre tiene que ser posterior a la apertura.`);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const days: ScheduleDay[] = drafts.flatMap((d, index) =>
        d.open ? [{ weekday: index + 1, startHour: d.startHour, endHour: d.endHour }] : []
      );
      const result = await save(days);
      setDrafts(toDrafts(result));
      setSaved(true);
      onSaved(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el horario. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadError) {
    return (
      <div role="alert" className="p-4 space-y-3">
        <p className="text-sm text-ink">{loadError}</p>
        <Button variant="volt" size="sm" onClick={() => setAttempt((n) => n + 1)}>
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Reintentar</span>
        </Button>
      </div>
    );
  }

  if (!drafts) {
    return (
      <p role="status" className="p-4 text-sm text-ink-muted">
        Cargando el horario...
      </p>
    );
  }

  const hasOpenDay = drafts.some((d) => d.open);

  return (
    <div className="p-4 space-y-3 max-w-xl" aria-label={`Horario de ${courtName}`}>
      <div>
        <h4 className="font-display text-base font-bold text-ink">Horario de «{courtName}»</h4>
        <p className="text-xs text-ink-muted">
          Cada día abre en un rango de horas en punto (hora de Argentina); de 00:00 a 24:00 abre las 24 horas. Los turnos
          son de 1 hora. Un día cerrado no tiene turnos. Cambiar el horario no toca las reservas ya hechas.
        </p>
      </div>

      {!hasOpenDay && (
        <p role="status" className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Sin días abiertos, esta cancha no tiene turnos y no se puede reservar.
        </p>
      )}

      <ul className="space-y-2">
        {drafts.map((draft, index) => (
          <li key={WEEKDAYS[index]} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <label className="flex items-center gap-2 w-32 text-sm font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.open}
                onChange={(e) => change(index, { open: e.target.checked })}
                aria-label={`${WEEKDAYS[index]} abierto`}
                className="w-4 h-4 accent-turf"
              />
              <span>{WEEKDAYS[index]}</span>
            </label>
            {draft.open ? (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <label className="flex items-center gap-1.5">
                  <span>Abre</span>
                  <select
                    value={draft.startHour}
                    onChange={(e) => change(index, { startHour: Number(e.target.value) })}
                    aria-label={`${WEEKDAYS[index]}: hora de apertura`}
                    className={FIELD_CLASS}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {hourLabel(hour)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-1.5">
                  <span>Cierra</span>
                  <select
                    value={draft.endHour}
                    onChange={(e) => change(index, { endHour: Number(e.target.value) })}
                    aria-label={`${WEEKDAYS[index]}: hora de cierre`}
                    className={FIELD_CLASS}
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
                      <option key={hour} value={hour}>
                        {hourLabel(hour)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <span className="text-xs text-ink-muted">Cerrado</span>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="text-sm text-turf-ink font-medium">
          Horario guardado.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="button" variant="volt" size="sm" onClick={handleSave} disabled={isSaving}>
          <span>{isSaving ? 'Guardando...' : 'Guardar horario'}</span>
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
          <span>Cerrar</span>
        </Button>
      </div>
    </div>
  );
};
