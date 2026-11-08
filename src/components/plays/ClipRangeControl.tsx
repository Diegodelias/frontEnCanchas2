import React from 'react';
import { Minus, Plus, Scissors } from 'lucide-react';
import { CLIP_STEP_SECONDS } from '../../types/play';
import { canMoveClipEdge, ClipEdge, ClipWindow, moveClipEdge } from '../../utils/clip';
import { formatVideoTime } from '../../utils/sharing';

interface ClipRangeControlProps {
  clip: ClipWindow;
  /** Momento marcado, en segundos: siempre queda dentro del fragmento. */
  timestamp: number;
  /** Duración real del video, si ya se conoce: el fragmento no se pasa del final. */
  videoDuration?: number;
  onChange: (clip: ClipWindow) => void;
}

/** Botón grande (44 px como mínimo), pensado para tocarse con el pulgar y sin depender de pasar el mouse por encima. */
const STEP_BUTTON =
  'min-h-[44px] min-w-[44px] flex-1 px-2 rounded-xl border border-line bg-surface text-ink font-semibold text-sm ' +
  'inline-flex items-center justify-center gap-1 transition-colors cursor-pointer select-none touch-manipulation ' +
  'hover:bg-surface-muted active:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf';

interface EdgeRowProps {
  label: string;
  edge: ClipEdge;
  value: number;
  clip: ClipWindow;
  timestamp: number;
  videoDuration?: number;
  onChange: (clip: ClipWindow) => void;
}

const EdgeRow: React.FC<EdgeRowProps> = ({ label, edge, value, clip, timestamp, videoDuration, onChange }) => {
  const move = (direction: -1 | 1) => onChange(moveClipEdge(clip, edge, direction, timestamp, videoDuration));
  const can = (direction: -1 | 1) => canMoveClipEdge(clip, edge, direction, timestamp, videoDuration);
  const backLabel = edge === 'start' ? 'más temprano' : 'más corto';
  const forwardLabel = edge === 'start' ? 'más tarde' : 'más largo';

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</span>
        <span className="font-mono text-sm font-semibold text-ink tabular-nums" data-testid={`clip-${edge}-value`}>
          {formatVideoTime(value)}
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!can(-1)}
          aria-label={`${label}: ${CLIP_STEP_SECONDS} segundos ${backLabel}`}
          className={STEP_BUTTON}
        >
          <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{CLIP_STEP_SECONDS} s</span>
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!can(1)}
          aria-label={`${label}: ${CLIP_STEP_SECONDS} segundos ${forwardLabel}`}
          className={STEP_BUTTON}
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{CLIP_STEP_SECONDS} s</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Ajuste del fragmento de una jugada: dos botones de 5 segundos para el inicio y dos para el fin.
 * Respeta los límites (de 3 a 120 segundos, dentro del video y con el momento marcado adentro) deshabilitando
 * el botón que los rompería.
 */
export const ClipRangeControl: React.FC<ClipRangeControlProps> = ({ clip, timestamp, videoDuration, onChange }) => {
  const length = clip.end - clip.start;
  return (
    <div className="p-3.5 rounded-2xl bg-surface-muted border border-line space-y-3.5" role="group" aria-label="Fragmento de la jugada">
      <div className="flex items-start gap-2.5">
        <Scissors className="w-4 h-4 text-turf shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink" data-testid="clip-summary">
            Fragmento: {formatVideoTime(clip.start)} → {formatVideoTime(clip.end)} ({length} s)
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Es lo que se guarda y se descarga. Movelo de a {CLIP_STEP_SECONDS} segundos.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
        <EdgeRow label="Inicio" edge="start" value={clip.start} clip={clip} timestamp={timestamp} videoDuration={videoDuration} onChange={onChange} />
        <EdgeRow label="Fin" edge="end" value={clip.end} clip={clip} timestamp={timestamp} videoDuration={videoDuration} onChange={onChange} />
      </div>
    </div>
  );
};
