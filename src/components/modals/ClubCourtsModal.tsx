import React, { useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Complex } from '../../types/canchas';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';

interface ClubCourtsModalProps {
  complex: Complex | null;
  onClose: () => void;
  /** «Ver horarios» de una cancha: abre el modal de reserva del club con esa cancha elegida. */
  onViewSchedule: (complex: Complex, courtId: string) => void;
}

/** Detalle de un club: la lista de sus canchas activas con nombre, deporte y precio. */
export const ClubCourtsModal: React.FC<ClubCourtsModalProps> = ({ complex, onClose, onViewSchedule }) => {
  useEffect(() => {
    if (!complex) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complex, onClose]);

  if (!complex) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-courts-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg max-h-[90vh] flex flex-col bg-surface text-ink border border-line rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <MapPin className="w-3.5 h-3.5 text-turf shrink-0" aria-hidden="true" />
              <span className="truncate">{complex.zone}</span>
            </span>
            <h2 id="club-courts-title" className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
              {complex.name}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{complex.availabilitySummary}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el detalle del club"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-2 overflow-y-auto divide-y divide-line">
          {complex.courts.map((court) => (
            <li key={court.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink break-words">{court.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {court.sport} ·{' '}
                  <span className="font-mono tabular-nums text-ink">{formatCurrencyArs(court.price)}</span> por turno
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewSchedule(complex, court.id)}
                aria-label={`Ver horarios de ${court.name}`}
              >
                Ver horarios
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
