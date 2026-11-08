import React from 'react';
import { Clock } from 'lucide-react';
import { clubHasRealLiveCamera, LIVE_DEMO_NOTICE } from '../../data/mockLiveCameras';
import { Complex } from '../../types/canchas';
import { Button } from './Button';
import { ComplexImagePlaceholder } from './ComplexImagePlaceholder';

interface ComplexCardProps {
  complex: Complex;
  matchedHint?: string;
  onOpenBooking: (complex: Complex, mode: 'schedule' | 'book') => void;
  onOpenCourts: (complex: Complex) => void;
}

export function formatCurrencyArs(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

export const ComplexCard: React.FC<ComplexCardProps> = ({
  complex,
  matchedHint,
  onOpenBooking,
  onOpenCourts,
}) => {
  return (
    <article className="complex-card group flex flex-col bg-surface border border-line rounded-xl overflow-hidden transition-colors duration-200 hover:border-line-strong">
      <ComplexImagePlaceholder
        imageUrl={complex.imageUrl}
        name={complex.name}
        zone={complex.zone}
        sports={complex.sports}
        variant={complex.visualVariant}
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Quiet 1-line unboxed metadata kicker */}
        <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          <span>{complex.zone}</span>
          <span aria-hidden="true">·</span>
          <span>{complex.sports.join(' / ')}</span>
        </div>

        <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink leading-snug">
          {complex.name}
        </h3>

        <div className="mt-2.5 flex items-center gap-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="truncate">{complex.availabilitySummary}</span>
          </span>
        </div>

        {clubHasRealLiveCamera(complex.id) && (
          <p className="mt-2 inline-flex items-center gap-1.5 self-start rounded-md bg-surface-muted px-2 py-1 text-[11px] font-medium text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-alert shrink-0" aria-hidden="true" />
            <span>{LIVE_DEMO_NOTICE}</span>
          </p>
        )}

        <button
          type="button"
          onClick={() => onOpenCourts(complex)}
          aria-label={`Ver las canchas de ${complex.name}`}
          className="mt-2 self-start text-sm font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
        >
          Ver canchas
        </button>

        {matchedHint && (
          <p className="mt-2.5 text-xs font-medium text-turf-ink">
            {matchedHint}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-xs text-ink-muted">Desde</span>
              <span className="font-mono text-lg font-semibold text-ink tabular-nums">
                {formatCurrencyArs(complex.minPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenBooking(complex, 'schedule')}
              >
                Ver horarios
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenBooking(complex, 'book')}
              >
                Reservar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
