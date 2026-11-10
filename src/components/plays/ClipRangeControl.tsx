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
  'min-h-[44px] min-w-[44px] flex-1 px-2 rounded-lg border border-line bg-surface text-ink font-semibold text-sm ' +
  'inline-flex items-center justify-center gap-1 transition-colors cursor-pointer select-none touch-manipulation ' +
  'hover:bg-surface-muted active:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf';

interface SpanRowProps {
  /** «Antes del momento» o «Después del momento». */
  label: string;
  /** Borde del fragmento que se mueve: el inicio para «antes» y el fin para «después». */
  edge: ClipEdge;
  /** Segundos del fragmento que quedan de ese lado del momento marcado. */
  seconds: number;
  clip: ClipWindow;
  timestamp: number;
  videoDuration?: number;
  onChange: (clip: ClipWindow) => void;
}

/**
 * Una fila del ajuste: los segundos que se guardan antes (o después) del momento marcado, con un botón para
 * acortarlos y otro para alargarlos. «+» siempre alarga el fragmento y «−» siempre lo acorta, en cualquiera de las dos
 * filas: por dentro se mueve el inicio (hacia atrás para alargar) o el fin (hacia adelante para alargar).
 */
const SpanRow: React.FC<SpanRowProps> = ({ label, edge, seconds, clip, timestamp, videoDuration, onChange }) => {
  const lengthen = edge === 'start' ? -1 : 1;
  const shorten = edge === 'start' ? 1 : -1;
  const move = (direction: -1 | 1) => onChange(moveClipEdge(clip, edge, direction, timestamp, videoDuration));
  const can = (direction: -1 | 1) => canMoveClipEdge(clip, edge, direction, timestamp, videoDuration);

  return (
    <div className="min-w-0 space-y-2">
      <div className="min-h-10 flex items-end justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</span>
        <span className="font-mono text-sm font-semibold text-ink tabular-nums whitespace-nowrap shrink-0" data-testid={`clip-${edge}-value`}>
          {seconds} s
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => move(shorten)}
          disabled={!can(shorten)}
          aria-label={`${label}: restar ${CLIP_STEP_SECONDS} segundos`}
          className={STEP_BUTTON}
        >
          <Minus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{CLIP_STEP_SECONDS} s</span>
        </button>
        <button
          type="button"
          onClick={() => move(lengthen)}
          disabled={!can(lengthen)}
          aria-label={`${label}: sumar ${CLIP_STEP_SECONDS} segundos`}
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
 * Ajuste del fragmento de una jugada respecto del momento marcado: cuántos segundos se guardan antes y cuántos después,
 * de a 5 segundos. Respeta los límites (de 3 a 120 segundos, dentro del video y con el momento marcado adentro)
 * deshabilitando el botón que los rompería.
 */
export const ClipRangeControl: React.FC<ClipRangeControlProps> = ({ clip, timestamp, videoDuration, onChange }) => {
  const length = clip.end - clip.start;
  const mark = Math.max(0, Math.floor(timestamp));
  return (
    <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-4" role="group" aria-label="Fragmento de la jugada">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg bg-turf/10 text-turf shrink-0 inline-flex items-center justify-center">
          <Scissors className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Esto es lo que se guarda</p>
          <p className="text-base font-semibold text-ink mt-0.5 tabular-nums" data-testid="clip-summary">
            De {formatVideoTime(clip.start)} a {formatVideoTime(clip.end)} · {length} segundos
          </p>
          <p className="text-xs leading-relaxed text-ink-muted mt-1">
            Incluye el momento que marcaste ({formatVideoTime(mark)}). Elegí cuántos segundos querés antes y después.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-3.5">
        <SpanRow
          label="Antes del momento"
          edge="start"
          seconds={mark - clip.start}
          clip={clip}
          timestamp={timestamp}
          videoDuration={videoDuration}
          onChange={onChange}
        />
        <SpanRow
          label="Después del momento"
          edge="end"
          seconds={clip.end - mark}
          clip={clip}
          timestamp={timestamp}
          videoDuration={videoDuration}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
