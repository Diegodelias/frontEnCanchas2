import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ApiBookingListItem } from '../../services/bookingsApi';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';

interface BookingsListProps {
  /** Cómo se piden las reservas: las del propio club (admin de club) o las de un club elegido (superadmin). */
  load: () => Promise<ApiBookingListItem[]>;
  /** Cómo se llama al club en los textos: «tu club» o el nombre del club. */
  clubLabel?: string;
  /** Informa cuántas reservas hay, para el contador de la pestaña. */
  onCountChange?: (count: number) => void;
}

/** «Mié 4/3/2026» a partir de `AAAA-MM-DD`. */
function formatDate(date: string): string {
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1).replace('.', '').replace(',', '');
}

/** Reservas de las canchas de un club, solo lectura: fecha, hora, cancha y quién reservó. */
export const BookingsList: React.FC<BookingsListProps> = ({ load, clubLabel = 'tu club', onCountChange }) => {
  const [bookings, setBookings] = useState<ApiBookingListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBookings(null);
    setError(null);
    load()
      .then((list) => {
        if (cancelled) return;
        setBookings(list);
        onCountChange?.(list.length);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No pudimos cargar las reservas.');
      });
    return () => {
      cancelled = true;
    };
    // `load` y `onCountChange` cambian de identidad en cada render del padre; solo se vuelve a pedir al reintentar.
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

  if (!bookings) {
    return (
      <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
        Cargando las reservas de {clubLabel}...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Reservas de {clubLabel}</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Los turnos reservados en las canchas de {clubLabel}, del más lejano al más cercano. Es solo una lista: todavía
          no se pueden cancelar desde acá. El pago se hace en el club.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface overflow-x-auto">
        {bookings.length === 0 ? (
          <p className="p-6 text-sm text-ink-muted">Todavía no hay reservas. Cuando alguien reserve un turno, aparece acá.</p>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Cancha</th>
                <th className="py-3 px-4">Reservó</th>
                <th className="py-3 px-4">Mail</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-3 px-4 whitespace-nowrap text-ink">{formatDate(booking.date)}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-ink whitespace-nowrap">{booking.time} hs</td>
                  <td className="py-3 px-4 font-semibold text-ink">{booking.court.name}</td>
                  <td className="py-3 px-4 text-ink">
                    {booking.name}
                    {booking.fromPlayer && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-turf-soft text-turf-ink">
                        Con cuenta
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-ink-muted break-all">{booking.email}</td>
                  <td className="py-3 px-4 font-mono text-ink-muted whitespace-nowrap">{booking.phone ?? '—'}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-ink text-right whitespace-nowrap">
                    {formatCurrencyArs(booking.price)}
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
