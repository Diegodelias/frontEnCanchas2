import React from 'react';
import { Clock, Star } from 'lucide-react';
import { Complex } from '../../types/canchas';
import { Button } from './Button';
import { ComplexImagePlaceholder } from './ComplexImagePlaceholder';

interface ComplexCardProps {
  complex: Complex;
  matchedHint?: string;
  onOpenBooking: (complex: Complex, mode: 'schedule' | 'book') => void;
}

export function formatCurrencyArs(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}

const DEFAULT_COURT_IMAGES: Record<string, string> = {
  'estacion-norte': '/assets/complejos/estacion-norte.jpg',
  'la-cantera-crespo': '/assets/complejos/la-cantera-villa-crespo.jpg',
  'polideportivo-belgrano': '/assets/complejos/polideportivo-belgrano.jpg',
  'parque-sur-caballito': '/assets/complejos/complejo-parque-sur.jpg',
  'arena-nunez': '/assets/complejos/arena-nunez.jpg',
  'terraza-colegiales': '/assets/complejos/terraza-colegiales.jpg',
};

export const ComplexCard: React.FC<ComplexCardProps> = ({
  complex,
  matchedHint,
  onOpenBooking,
}) => {
  const imageUrl = complex.imageUrl ?? DEFAULT_COURT_IMAGES[complex.id];

  return (
    <article className="complex-card group flex flex-col bg-surface border border-line rounded-xl overflow-hidden transition-colors duration-200 hover:border-line-strong">
      <ComplexImagePlaceholder
        imageUrl={imageUrl}
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
          <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink tabular-nums">
            <Star className="w-4 h-4 text-turf fill-turf shrink-0" aria-hidden="true" />
            {complex.rating.toFixed(1).replace('.', ',')}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="truncate">{complex.availabilitySummary}</span>
          </span>
        </div>

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
