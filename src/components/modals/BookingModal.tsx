import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiSlot, bookingsApi, CreatedBooking } from '../../services/bookingsApi';
import { ClubsApiError } from '../../services/clubsApi';
import { Complex, SearchSelection } from '../../types/canchas';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';

interface BookingModalProps {
  complex: Complex | null;
  initialSelection?: Partial<SearchSelection>;
  onClose: () => void;
}

/** Se puede reservar desde hoy hasta 14 días después (lo valida el servidor; acá se arman los 15 días). */
const DAYS_AHEAD = 14;
const AR_TZ = 'America/Argentina/Buenos_Aires';

/** Hoy en Argentina, como `AAAA-MM-DD`. */
function todayInArgentina(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: AR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10);
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Hoy», «Mañana» o «Mié 4/3». */
function dayLabel(date: string, today: string): string {
  if (date === today) return 'Hoy';
  if (date === addDays(today, 1)) return 'Mañana';
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
  return capitalize(text.replace('.', '').replace(',', ''));
}

/** «Miércoles 4 de marzo». */
function longDay(date: string): string {
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString('es-AR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return capitalize(text);
}

type SlotsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; slots: ApiSlot[] };

interface FormErrors {
  slot?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BookingModal: React.FC<BookingModalProps> = ({ complex, initialSelection, onClose }) => {
  const { user } = useAuth();
  const player = user?.role === 'player' ? user : null;

  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [today, setToday] = useState<string>(todayInArgentina);
  const [selectedDate, setSelectedDate] = useState<string>(todayInArgentina);
  const [slotsState, setSlotsState] = useState<SlotsState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedBooking | null>(null);
  const [suggestion, setSuggestion] = useState<{ status: 'idle' | 'searching' | 'none' } | { status: 'found'; date: string }>({ status: 'idle' });
  const latestSlots = useRef(0);

  // Al abrir (o cambiar de club o de cancha inicial) se reinicia todo.
  useEffect(() => {
    if (!complex) return;
    const matchingCourt = complex.courts.find((c) => c.id === initialSelection?.courtId) ?? complex.courts[0];
    const now = todayInArgentina();
    setSelectedCourtId(matchingCourt?.id ?? '');
    setToday(now);
    setSelectedDate(now);
    setSelectedStartsAt('');
    setPlayerName('');
    setEmail('');
    setPhone('');
    setErrors({});
    setSubmitError(null);
    setResult(null);
    setSuggestion({ status: 'idle' });
  }, [complex, initialSelection]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!complex) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [complex, onClose]);

  // Turnos libres reales de la cancha y el día elegidos.
  useEffect(() => {
    if (!complex || !selectedCourtId) return;
    const seq = ++latestSlots.current;
    setSlotsState({ status: 'loading' });
    bookingsApi
      .fetchSlots(selectedCourtId, selectedDate)
      .then((data) => {
        if (seq !== latestSlots.current) return;
        setSlotsState({ status: 'ready', slots: data.slots });
      })
      .catch((err: unknown) => {
        if (seq !== latestSlots.current) return;
        setSlotsState({
          status: 'error',
          message: err instanceof Error ? err.message : 'No pudimos cargar los turnos. Probá de nuevo.',
        });
      });
  }, [complex, selectedCourtId, selectedDate, reloadKey]);

  const activeCourt = useMemo(
    () => complex?.courts.find((c) => c.id === selectedCourtId) ?? complex?.courts[0],
    [complex, selectedCourtId]
  );

  const days = useMemo(() => Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => addDays(today, i)), [today]);

  const selectedSlot = slotsState.status === 'ready' ? slotsState.slots.find((s) => s.startsAt === selectedStartsAt) : undefined;

  const handleSelectCourt = useCallback((courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedStartsAt('');
    setSuggestion({ status: 'idle' });
    setErrors((prev) => ({ ...prev, slot: undefined }));
    setSubmitError(null);
  }, []);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedStartsAt('');
    setSuggestion({ status: 'idle' });
    setErrors((prev) => ({ ...prev, slot: undefined }));
    setSubmitError(null);
  }, []);

  /** Busca, día por día, el próximo con turnos libres para esta cancha. */
  const searchNextDay = async () => {
    if (!activeCourt) return;
    setSuggestion({ status: 'searching' });
    const from = days.indexOf(selectedDate);
    for (const date of days.slice(from + 1)) {
      try {
        const data = await bookingsApi.fetchSlots(activeCourt.id, date);
        if (data.slots.length > 0) {
          setSuggestion({ status: 'found', date });
          return;
        }
      } catch {
        break;
      }
    }
    setSuggestion({ status: 'none' });
  };

  if (!complex) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !activeCourt) return;
    const nextErrors: FormErrors = {};

    if (!selectedSlot) nextErrors.slot = 'Elegí un horario disponible para continuar.';

    if (!player) {
      if (playerName.trim().length < 2) nextErrors.name = 'Ingresá tu nombre (al menos 2 caracteres).';
      if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = 'Ingresá un mail válido, donde te mandamos la confirmación.';
      const digits = phone.replace(/\D/g, '');
      if (phone.trim() !== '' && digits.length < 6) nextErrors.phone = 'El teléfono es muy corto. Podés dejarlo vacío.';
    }

    if (Object.keys(nextErrors).length > 0 || !selectedSlot) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await bookingsApi.createBooking(
        activeCourt.id,
        player
          ? { startsAt: selectedSlot.startsAt }
          : {
              startsAt: selectedSlot.startsAt,
              name: playerName.trim(),
              email: email.trim(),
              ...(phone.trim() ? { phone: phone.trim() } : {}),
            }
      );
      setResult(created);
    } catch (err) {
      if (err instanceof ClubsApiError && err.code === 'slot_taken') {
        // Otra persona lo tomó antes: se actualiza la lista y se pide elegir otro.
        setSelectedStartsAt('');
        setErrors({ slot: err.message });
        setReloadKey((n) => n + 1);
      } else {
        setSubmitError(err instanceof Error ? err.message : 'No pudimos guardar la reserva. Probá de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setResult(null);
    setSelectedStartsAt('');
    setSubmitError(null);
    setReloadKey((n) => n + 1);
  };

  const booking = result?.booking;

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
            <h2 id="booking-modal-title" className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
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

        {result && booking ? (
          <div className="pt-5 space-y-5" data-testid="booking-confirmed">
            <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-bold text-ink">¡Reserva confirmada!</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  {result.emailSent
                    ? `Te mandamos la confirmación a ${booking.email}. El pago se hace en el club.`
                    : 'Tu turno quedó reservado, pero no pudimos mandarte el mail de confirmación. Guardá estos datos. El pago se hace en el club.'}
                </p>
              </div>
            </div>

            <dl className="divide-y divide-line border border-line rounded-xl bg-canvas px-4 text-sm">
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Complejo</dt>
                <dd className="font-medium text-ink text-right">{booking.club.name}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Cancha</dt>
                <dd className="font-medium text-ink text-right">{booking.court.name}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Día y horario</dt>
                <dd className="font-mono font-semibold text-ink tabular-nums text-right">
                  {longDay(booking.date)} · {booking.time} hs
                </dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Valor del turno</dt>
                <dd className="font-mono font-semibold text-ink tabular-nums text-right">{formatCurrencyArs(booking.price)}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">A nombre de</dt>
                <dd className="font-medium text-ink text-right">{booking.name}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Mail</dt>
                <dd className="font-mono text-ink text-right break-all">{booking.email}</dd>
              </div>
            </dl>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Button variant="secondary" fullWidth onClick={handleBookAnother}>
                Reservar otro turno
              </Button>
              <Button variant="primary" fullWidth onClick={onClose}>
                Listo, cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="pt-5 space-y-5">
            {/* Paso 1: cancha */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">1. Elegí la cancha</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {complex.courts.map((court) => {
                  const selected = court.id === activeCourt?.id;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => handleSelectCourt(court.id)}
                      className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        selected ? 'bg-ink text-surface border-ink' : 'bg-canvas text-ink border-line hover:border-line-strong'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-snug">{court.name}</span>
                      <span className={`block mt-0.5 text-xs ${selected ? 'text-pitch-muted' : 'text-ink-muted'}`}>{court.sport}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 2: día */}
            {activeCourt && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">2. Elegí el día</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.map((date) => {
                    const selected = date === selectedDate;
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleSelectDate(date)}
                        aria-pressed={selected}
                        className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          selected ? 'bg-turf text-surface border-turf' : 'bg-surface text-ink border-line hover:border-line-strong'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{dayLabel(date, today)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paso 3: turnos libres reales */}
            {activeCourt && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">3. Horarios disponibles</span>
                  {selectedSlot && (
                    <span className="font-mono text-xs font-semibold text-turf-ink tabular-nums">
                      Seleccionado: {selectedSlot.time} hs ({formatCurrencyArs(activeCourt.price)})
                    </span>
                  )}
                </div>

                {slotsState.status === 'loading' && (
                  <p role="status" className="p-4 rounded-lg bg-canvas border border-line text-sm text-ink-muted">
                    Cargando los turnos...
                  </p>
                )}

                {slotsState.status === 'error' && (
                  <div role="alert" className="p-4 rounded-lg bg-warning-soft border border-warning/30 text-sm text-ink">
                    <p className="font-medium">{slotsState.message}</p>
                    <button
                      type="button"
                      onClick={() => setReloadKey((n) => n + 1)}
                      className="mt-2 text-xs font-semibold text-turf-ink underline underline-offset-4 cursor-pointer"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {slotsState.status === 'ready' && slotsState.slots.length === 0 && (
                  <div className="p-4 rounded-lg bg-warning-soft border border-warning/30 text-sm text-ink">
                    <p className="font-medium">Sin turnos disponibles para {longDay(selectedDate).toLowerCase()}.</p>
                    {suggestion.status === 'found' ? (
                      <button
                        type="button"
                        onClick={() => handleSelectDate(suggestion.date)}
                        className="mt-2 text-xs font-semibold text-turf-ink underline underline-offset-4 cursor-pointer"
                      >
                        Ver turnos del {longDay(suggestion.date).toLowerCase()}
                      </button>
                    ) : suggestion.status === 'none' ? (
                      <p className="mt-2 text-xs text-ink-muted">Esta cancha no tiene turnos en los próximos días.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={searchNextDay}
                        disabled={suggestion.status === 'searching'}
                        className="mt-2 text-xs font-semibold text-turf-ink underline underline-offset-4 cursor-pointer disabled:opacity-60"
                      >
                        {suggestion.status === 'searching' ? 'Buscando...' : 'Buscar el próximo día con turnos'}
                      </button>
                    )}
                  </div>
                )}

                {slotsState.status === 'ready' && slotsState.slots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slotsState.slots.map((slot) => {
                      const selected = slot.startsAt === selectedStartsAt;
                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          onClick={() => {
                            setSelectedStartsAt(slot.startsAt);
                            setErrors((prev) => ({ ...prev, slot: undefined }));
                          }}
                          aria-pressed={selected}
                          className={`min-h-[48px] px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                            selected ? 'bg-volt text-volt-ink border-ink font-semibold' : 'bg-canvas text-ink border-line hover:border-line-strong'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums">
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            {slot.time} hs
                          </span>
                          <span className={`block mt-0.5 font-mono text-xs tabular-nums ${selected ? 'text-volt-ink' : 'text-ink-muted'}`}>
                            {formatCurrencyArs(activeCourt.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {errors.slot && (
                  <p role="alert" className="mt-2 text-xs font-medium text-alert flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{errors.slot}</span>
                  </p>
                )}
              </div>
            )}

            {/* Paso 4: datos de quien reserva */}
            {player ? (
              <p className="pt-2 border-t border-line text-sm text-ink-muted">
                Reservás con tu cuenta: <span className="font-mono text-ink break-all">{player.email}</span>. Ahí te mandamos la confirmación.
              </p>
            ) : (
              <div className="pt-2 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="booking-player-name" className="block text-xs font-semibold text-ink mb-1.5">
                    Tu nombre
                  </label>
                  <input
                    id="booking-player-name"
                    type="text"
                    value={playerName}
                    maxLength={80}
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
                  <label htmlFor="booking-player-email" className="block text-xs font-semibold text-ink mb-1.5">
                    Tu mail
                  </label>
                  <input
                    id="booking-player-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Ej. martin@mail.com"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="booking-player-phone" className="block text-xs font-semibold text-ink mb-1.5">
                    Tu teléfono <span className="font-normal text-ink-muted">(opcional)</span>
                  </label>
                  <input
                    id="booking-player-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    maxLength={30}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="Ej. 11 5432 1098"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-line-strong text-sm font-mono text-ink placeholder:font-sans placeholder:text-ink-muted/70"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <p role="alert" className="text-sm font-medium text-alert flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{submitError}</span>
              </p>
            )}

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button type="button" variant="secondary" fullWidth onClick={onClose} className="order-2 sm:order-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="volt"
                fullWidth
                disabled={isSubmitting}
                className="order-1 sm:order-2 font-display uppercase tracking-wider font-extrabold"
              >
                {isSubmitting ? 'Reservando...' : 'Confirmar reserva'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
