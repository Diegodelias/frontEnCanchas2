import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { Complex, SearchSelection } from '../../types/canchas';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';

interface BookingModalProps {
  complex: Complex | null;
  initialSelection?: Partial<SearchSelection>;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  complex,
  initialSelection,
  onClose,
}) => {
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [errors, setErrors] = useState<{
    slot?: string;
    name?: string;
    whatsapp?: string;
  }>({});
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Sync initial court/day/slot when complex opens
  useEffect(() => {
    if (!complex) return;

    const matchingCourt =
      complex.courts.find((c) => c.id === initialSelection?.courtId) ??
      complex.courts[0];
    const courtId = matchingCourt?.id ?? '';

    const matchingDay =
      matchingCourt?.availabilityByDay.find(
        (d) => d.id === initialSelection?.dayId
      ) ?? matchingCourt?.availabilityByDay[0];
    const dayId = matchingDay?.id ?? '';

    const matchingSlot =
      matchingDay?.slots.find((s) => s.id === initialSelection?.slotId) ??
      matchingDay?.slots[0];
    const slotId = matchingSlot?.id ?? '';

    setSelectedCourtId(courtId);
    setSelectedDayId(dayId);
    setSelectedSlotId(slotId);
    setPlayerName('');
    setWhatsapp('');
    setErrors({});
    setIsConfirmed(false);
  }, [complex, initialSelection]);

  // Close on Escape key
  useEffect(() => {
    if (!complex) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complex, onClose]);

  const activeCourt = useMemo(
    () => complex?.courts.find((c) => c.id === selectedCourtId) ?? complex?.courts[0],
    [complex, selectedCourtId]
  );

  const activeDay = useMemo(
    () =>
      activeCourt?.availabilityByDay.find((d) => d.id === selectedDayId) ??
      activeCourt?.availabilityByDay[0],
    [activeCourt, selectedDayId]
  );

  const activeSlot = useMemo(
    () => activeDay?.slots.find((s) => s.id === selectedSlotId),
    [activeDay, selectedSlotId]
  );

  if (!complex) return null;

  const handleSelectCourt = (courtId: string) => {
    const nextCourt = complex.courts.find((c) => c.id === courtId);
    const firstDay = nextCourt?.availabilityByDay[0];
    const firstSlot = firstDay?.slots[0];
    setSelectedCourtId(courtId);
    setSelectedDayId(firstDay?.id ?? '');
    setSelectedSlotId(firstSlot?.id ?? '');
    setErrors((prev) => ({ ...prev, slot: undefined }));
  };

  const handleSelectDay = (dayId: string) => {
    const nextDay = activeCourt?.availabilityByDay.find((d) => d.id === dayId);
    const firstSlot = nextDay?.slots[0];
    setSelectedDayId(dayId);
    setSelectedSlotId(firstSlot?.id ?? '');
    setErrors((prev) => ({ ...prev, slot: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { slot?: string; name?: string; whatsapp?: string } = {};

    if (!activeSlot) {
      nextErrors.slot = 'Elegí un horario disponible para continuar.';
    }

    const trimmedName = playerName.trim();
    if (trimmedName.length < 2) {
      nextErrors.name = 'Ingresá tu nombre (al menos 2 caracteres).';
    }

    const digitsOnly = whatsapp.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      nextErrors.whatsapp = 'Ingresá un número de WhatsApp válido (mínimo 8 dígitos).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsConfirmed(true);
  };

  const alternativeDay = activeCourt?.availabilityByDay.find(
    (d) => d.id !== activeDay?.id && d.slots.length > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)] animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto overflow-x-hidden bg-surface text-ink border border-line rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-modal-content">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <p className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-turf shrink-0" aria-hidden="true" />
              <span>{complex.address}</span>
            </p>
            <h2
              id="booking-modal-title"
              className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink"
            >
              {complex.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de reserva"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {isConfirmed && activeCourt && activeDay && activeSlot ? (
          <div className="pt-5 space-y-5">
            <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
              <CheckCircle2
                className="w-5 h-5 text-turf shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-xl font-bold text-ink">
                  ¡Turno pre-reservado!
                </h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  Reserva simulada: esta es una demostración visual y no se guarda ningún
                  dato ni se realiza una reserva real.
                </p>
              </div>
            </div>

            <dl className="divide-y divide-line border border-line rounded-xl bg-canvas px-4 text-sm">
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Complejo</dt>
                <dd className="font-medium text-ink text-right">{complex.name}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Cancha</dt>
                <dd className="font-medium text-ink text-right">{activeCourt.name}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Día y horario</dt>
                <dd className="font-mono font-semibold text-ink tabular-nums text-right">
                  {activeDay.label} · {activeSlot.time} hs
                </dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Valor del turno</dt>
                <dd className="font-mono font-semibold text-ink tabular-nums text-right">
                  {formatCurrencyArs(activeSlot.price)}
                </dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">A nombre de</dt>
                <dd className="font-medium text-ink text-right">{playerName.trim()}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">WhatsApp</dt>
                <dd className="font-mono text-ink tabular-nums text-right">
                  {whatsapp.trim()}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setIsConfirmed(false)}
              >
                Elegir otro horario
              </Button>
              <Button variant="primary" fullWidth onClick={onClose}>
                Listo, cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="pt-5 space-y-5">
            {/* Step 1: Court Selection */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                1. Elegí la cancha
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {complex.courts.map((court) => {
                  const selected = court.id === activeCourt?.id;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => handleSelectCourt(court.id)}
                      className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-ink text-surface border-ink'
                          : 'bg-canvas text-ink border-line hover:border-line-strong'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-snug">
                        {court.name}
                      </span>
                      <span
                        className={`block mt-0.5 text-xs ${
                          selected ? 'text-pitch-muted' : 'text-ink-muted'
                        }`}
                      >
                        {court.surface}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Day Selection */}
            {activeCourt && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  2. Elegí el día
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeCourt.availabilityByDay.map((day) => {
                    const selected = day.id === activeDay?.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleSelectDay(day.id)}
                        className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                          selected
                            ? 'bg-turf text-surface border-turf'
                            : 'bg-surface text-ink border-line hover:border-line-strong'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Time Slot Selection */}
            {activeDay && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    3. Horarios disponibles
                  </span>
                  {activeSlot && (
                    <span className="font-mono text-xs font-semibold text-turf-ink tabular-nums">
                      Seleccionado: {activeSlot.time} hs ({formatCurrencyArs(activeSlot.price)})
                    </span>
                  )}
                </div>

                {activeDay.slots.length === 0 ? (
                  <div className="p-4 rounded-lg bg-warning-soft border border-warning/30 text-sm text-ink">
                    <p className="font-medium">
                      No quedan horarios disponibles para {activeDay.label.toLowerCase()}.
                    </p>
                    {alternativeDay && (
                      <button
                        type="button"
                        onClick={() => handleSelectDay(alternativeDay.id)}
                        className="mt-2 text-xs font-semibold text-turf-ink underline underline-offset-4 cursor-pointer"
                      >
                        Ver turnos disponibles para {alternativeDay.label}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activeDay.slots.map((slot) => {
                      const selected = slot.id === selectedSlotId;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setErrors((prev) => ({ ...prev, slot: undefined }));
                          }}
                          className={`min-h-[48px] px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                            selected
                              ? 'bg-volt text-volt-ink border-ink font-semibold'
                              : 'bg-canvas text-ink border-line hover:border-line-strong'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums">
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            {slot.time} hs
                          </span>
                          <span
                            className={`block mt-0.5 font-mono text-xs tabular-nums ${
                              selected ? 'text-volt-ink' : 'text-ink-muted'
                            }`}
                          >
                            {formatCurrencyArs(slot.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {errors.slot && (
                  <p className="mt-2 text-xs font-medium text-alert flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{errors.slot}</span>
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Minimal Validated Form (Name & WhatsApp) */}
            <div className="pt-2 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="booking-player-name"
                  className="block text-xs font-semibold text-ink mb-1.5"
                >
                  Tu nombre
                </label>
                <input
                  id="booking-player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Ej. Martín González"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-player-whatsapp"
                  className="block text-xs font-semibold text-ink mb-1.5"
                >
                  Tu WhatsApp
                </label>
                <input
                  id="booking-player-whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (errors.whatsapp)
                      setErrors((prev) => ({ ...prev, whatsapp: undefined }));
                  }}
                  placeholder="Ej. 11 5432 1098"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-line-strong text-sm font-mono text-ink placeholder:font-sans placeholder:text-ink-muted/70"
                />
                {errors.whatsapp && (
                  <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errors.whatsapp}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="volt"
                fullWidth
                className="order-1 sm:order-2 font-display uppercase tracking-wider font-extrabold"
              >
                Confirmar reserva
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
