import React, { useRef, useState } from 'react';
import { Minus, Plus, Scissors } from 'lucide-react';
import { CLIP_STEP_SECONDS, MAX_CLIP_SECONDS, MIN_CLIP_SECONDS } from '../../types/play';
import { canMoveClipEdge, ClipEdge, ClipWindow, moveClipEdge, setClipEdge } from '../../utils/clip';
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
  'min-h-[44px] min-w-[44px] flex-1 px-2 rounded-lg border border-line bg-surface text-turf-ink font-semibold text-sm ' +
  'inline-flex items-center justify-center gap-1 transition-colors cursor-pointer select-none touch-manipulation ' +
  'hover:bg-turf-soft hover:border-turf/50 active:bg-turf-soft disabled:opacity-50 disabled:cursor-not-allowed ' +
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
  const trackRef = useRef<HTMLDivElement>(null);
  const activeEdgeRef = useRef<ClipEdge | null>(null);
  const [activeEdge, setActiveEdge] = useState<ClipEdge | null>(null);
  const knownVideoEnd = videoDuration !== undefined && Number.isFinite(videoDuration) && videoDuration > 0
    ? Math.floor(videoDuration)
    : undefined;
  const trackStart = Math.max(0, mark - MAX_CLIP_SECONDS);
  const trackEnd = Math.min(mark + MAX_CLIP_SECONDS, knownVideoEnd ?? mark + MAX_CLIP_SECONDS);
  const trackDuration = Math.max(1, trackEnd - trackStart);
  const getPercent = (second: number) => ((second - trackStart) / trackDuration) * 100;
  const getSecondAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return mark;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(trackStart + ratio * trackDuration);
  };
  const adjustEdge = (edge: ClipEdge, second: number) => {
    onChange(setClipEdge(clip, edge, second, timestamp, videoDuration));
  };
  const beginDrag = (edge: ClipEdge, event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    activeEdgeRef.current = edge;
    setActiveEdge(edge);
    event.currentTarget.setPointerCapture(event.pointerId);
    adjustEdge(edge, getSecondAt(event.clientX));
  };
  const moveDraggedEdge = (edge: ClipEdge, event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.buttons & 1) !== 0 && event.currentTarget.hasPointerCapture(event.pointerId)) {
      adjustEdge(edge, getSecondAt(event.clientX));
    }
  };
  const endDrag = () => {
    activeEdgeRef.current = null;
    setActiveEdge(null);
  };
  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const second = getSecondAt(event.clientX);
    const edge: ClipEdge = Math.abs(second - clip.start) <= Math.abs(second - clip.end) ? 'start' : 'end';
    event.currentTarget.setPointerCapture(event.pointerId);
    activeEdgeRef.current = edge;
    setActiveEdge(edge);
    adjustEdge(edge, second);
  };
  const handleTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.buttons & 1) !== 0 && activeEdgeRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      adjustEdge(activeEdgeRef.current, getSecondAt(event.clientX));
    }
  };
  const startMin = Math.max(0, clip.end - MAX_CLIP_SECONDS);
  const startMax = Math.min(mark, clip.end - MIN_CLIP_SECONDS);
  const endMin = Math.max(mark, clip.start + MIN_CLIP_SECONDS);
  const endMax = Math.min(clip.start + MAX_CLIP_SECONDS, knownVideoEnd ?? Infinity);
  const handleSliderKeyDown = (edge: ClipEdge, event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = edge === 'start' ? clip.start : clip.end;
    const minimum = edge === 'start' ? startMin : endMin;
    const maximum = edge === 'start' ? startMax : endMax;
    const step = event.shiftKey ? 10 : 1;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      adjustEdge(edge, current - step);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      adjustEdge(edge, current + step);
    } else if (event.key === 'Home') {
      event.preventDefault();
      adjustEdge(edge, minimum);
    } else if (event.key === 'End') {
      event.preventDefault();
      adjustEdge(edge, maximum);
    }
  };

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
      <div className="space-y-3 border-t border-line pt-3.5">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Marcá el inicio y el final del tramo</p>
        <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-medium tabular-nums text-ink-muted">
          <span>{formatVideoTime(trackStart)}</span>
          <span className="rounded-full bg-turf-soft px-2 py-1 text-turf-ink">Momento {formatVideoTime(mark)}</span>
          <span>{formatVideoTime(trackEnd)}</span>
        </div>
        <div
          ref={trackRef}
          role="group"
          aria-label="Ajuste del tramo del video"
          className="relative h-11 touch-pan-y select-none"
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-line-strong/50" />
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-volt"
            style={{ left: `${getPercent(clip.start)}%`, width: `${getPercent(clip.end) - getPercent(clip.start)}%` }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 z-10 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
            style={{ left: `${getPercent(mark)}%` }}
          />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Inicio del tramo"
            aria-valuemin={startMin}
            aria-valuemax={startMax}
            aria-valuenow={clip.start}
            aria-valuetext={`${formatVideoTime(clip.start)}, ${mark - clip.start} segundos antes del momento`}
            className={`absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none cursor-ew-resize place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf ${activeEdge === 'start' ? 'z-30' : 'z-20'}`}
            style={{ left: `${getPercent(clip.start)}%` }}
            onPointerDown={(event) => beginDrag('start', event)}
            onPointerMove={(event) => moveDraggedEdge('start', event)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            onKeyDown={(event) => handleSliderKeyDown('start', event)}
          >
            <span aria-hidden="true" className="h-5 w-5 rounded-full border-[3px] border-turf-ink bg-volt shadow-sm" />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Final del tramo"
            aria-valuemin={endMin}
            aria-valuemax={endMax}
            aria-valuenow={clip.end}
            aria-valuetext={`${formatVideoTime(clip.end)}, ${clip.end - mark} segundos después del momento`}
            className={`absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none cursor-ew-resize place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf ${activeEdge === 'end' ? 'z-30' : 'z-20'}`}
            style={{ left: `${getPercent(clip.end)}%` }}
            onPointerDown={(event) => beginDrag('end', event)}
            onPointerMove={(event) => moveDraggedEdge('end', event)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            onKeyDown={(event) => handleSliderKeyDown('end', event)}
          >
            <span aria-hidden="true" className="h-5 w-5 rounded-full border-[3px] border-turf-ink bg-volt shadow-sm" />
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
    </div>
  );
};
