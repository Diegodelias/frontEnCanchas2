import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Play,
  Search,
  Video,
} from 'lucide-react';
import { buildMatchPath } from '../../routes/paths';
import { matchesService } from '../../services/matchesService';
import { Complex } from '../../types/canchas';
import { Match } from '../../types/match';
import { Button } from '../ui/Button';
import { useComplexes } from '../../context/ComplexesContext';

interface MatchCascadingSelectorProps {
  variant?: 'hero' | 'page';
  initialClubId?: string;
  initialCourtId?: string;
  initialDayId?: string;
  initialSlotId?: string;
  onSelectionChange?: (selection: {
    clubId: string;
    courtId: string;
    dayId: string;
    slotId: string;
    match: Match | null;
  }) => void;
  className?: string;
}

export const MatchCascadingSelector: React.FC<MatchCascadingSelectorProps> = ({
  variant = 'page',
  initialClubId = '',
  initialCourtId = '',
  initialDayId = '',
  initialSlotId = '',
  onSelectionChange,
  className = '',
}) => {
  const navigate = useNavigate();
  const { complexes } = useComplexes();

  const [clubId, setClubId] = useState<string>(initialClubId);
  const [courtId, setCourtId] = useState<string>(initialCourtId);
  const [dayId, setDayId] = useState<string>(initialDayId);
  const [slotId, setSlotId] = useState<string>(initialSlotId);

  const [foundMatch, setFoundMatch] = useState<Match | null>(null);
  const [isCheckingMatch, setIsCheckingMatch] = useState<boolean>(false);
  const [userPromptMessage, setUserPromptMessage] = useState<string>('');

  // Sync initial props if they arrive later (e.g. from URL search params)
  useEffect(() => {
    if (initialClubId) setClubId(initialClubId);
    if (initialCourtId) setCourtId(initialCourtId);
    if (initialDayId) setDayId(initialDayId);
    if (initialSlotId) setSlotId(initialSlotId);
  }, [initialClubId, initialCourtId, initialDayId, initialSlotId]);

  const selectedComplex: Complex | undefined = useMemo(
    () => complexes.find((c) => c.id === clubId),
    [complexes, clubId]
  );

  const selectedCourt = useMemo(
    () => selectedComplex?.courts.find((c) => c.id === courtId),
    [selectedComplex, courtId]
  );

  const selectedDay = useMemo(
    () => selectedCourt?.availabilityByDay.find((d) => d.id === dayId),
    [selectedCourt, dayId]
  );

  const availableSlots = useMemo(
    () => selectedDay?.slots ?? [],
    [selectedDay]
  );

  const selectedSlot = useMemo(
    () => availableSlots.find((s) => s.id === slotId),
    [availableSlots, slotId]
  );

  const isComplete = Boolean(clubId && courtId && dayId && slotId);

  // Check matching match asynchronously via matchesService
  useEffect(() => {
    let isCancelled = false;

    async function check() {
      if (!clubId) {
        setFoundMatch(null);
        return;
      }
      setIsCheckingMatch(true);
      try {
        const timeSlotString = selectedSlot?.time || slotId;
        const match = await matchesService.findMatchBySelection(
          clubId,
          courtId,
          dayId,
          timeSlotString
        );
        if (!isCancelled) {
          setFoundMatch(match);
          if (onSelectionChange) {
            onSelectionChange({
              clubId,
              courtId,
              dayId,
              slotId,
              match,
            });
          }
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingMatch(false);
        }
      }
    }

    check();

    return () => {
      isCancelled = true;
    };
  }, [clubId, courtId, dayId, slotId, selectedSlot, onSelectionChange]);

  const handleClubChange = (nextClubId: string) => {
    setClubId(nextClubId);
    setCourtId('');
    setDayId('');
    setSlotId('');
    setUserPromptMessage('');
  };

  const handleCourtChange = (nextCourtId: string) => {
    setCourtId(nextCourtId);
    setDayId('');
    setSlotId('');
    setUserPromptMessage('');
  };

  const handleDayChange = (nextDayId: string) => {
    setDayId(nextDayId);
    setSlotId('');
    setUserPromptMessage('');
  };

  const handleSlotChange = (nextSlotId: string) => {
    setSlotId(nextSlotId);
    setUserPromptMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) {
      if (!clubId) setUserPromptMessage('Elegí primero un club o complejo.');
      else if (!courtId) setUserPromptMessage('Seleccioná la cancha.');
      else if (!dayId) setUserPromptMessage('Elegí el día.');
      else if (!slotId) setUserPromptMessage('Seleccioná el horario del partido.');
      return;
    }

    if (foundMatch) {
      navigate(buildMatchPath(foundMatch.id));
    } else {
      // Fallback: navigate to first active match or show error
      navigate(buildMatchPath('match-en-f5-1900'));
    }
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl transition-all ${
        isHero
          ? 'bg-[#0d1611]/85 backdrop-blur-xl text-white border-t border-white/20 border-b border-white/5 border-x border-white/10 p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.65)] ring-1 ring-white/10'
          : 'bg-surface text-ink border border-line p-5 sm:p-6 shadow-sm'
      } ${className}`}
    >
      <div
        className={`grid grid-cols-1 ${
          isHero
            ? 'lg:grid-cols-[1.25fr_1.15fr_1fr_1fr_auto] gap-3.5 lg:gap-3 lg:items-end'
            : 'sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end'
        }`}
      >
        {/* 1. Club / Complejo */}
        <div>
          <label
            htmlFor={`selector-club-${variant}`}
            className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isHero ? 'text-white/75 flex items-center gap-1.5' : 'text-ink-muted'
            }`}
          >
            {isHero && <span className="w-1.5 h-1.5 rounded-full bg-volt shrink-0" />}
            <span>1. Club o complejo</span>
          </label>
          <div className="relative">
            <select
              id={`selector-club-${variant}`}
              value={clubId}
              onChange={(e) => handleClubChange(e.target.value)}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? 'bg-black/50 hover:bg-black/60 border border-white/20 hover:border-white/30 text-white focus:border-volt focus:ring-1 focus:ring-volt'
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf'
              }`}
            >
              <option value="">Elegí un complejo</option>
              {complexes.map((complex) => (
                <option key={complex.id} value={complex.id} className="bg-[#121c15] text-white">
                  {complex.name} ({complex.zone})
                </option>
              ))}
            </select>
            <ChevronDown
              className={`w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                isHero ? 'text-white/60' : 'text-ink-muted'
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 2. Cancha (deshabilitada hasta elegir club) */}
        <div>
          <label
            htmlFor={`selector-court-${variant}`}
            className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isHero ? 'text-white/75 flex items-center gap-1.5' : 'text-ink-muted'
            }`}
          >
            {isHero && <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />}
            <span>2. Cancha</span>
          </label>
          <div className="relative">
            <select
              id={`selector-court-${variant}`}
              value={courtId}
              onChange={(e) => handleCourtChange(e.target.value)}
              disabled={!selectedComplex}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? 'bg-black/50 hover:bg-black/60 border border-white/20 hover:border-white/30 text-white focus:border-volt focus:ring-1 focus:ring-volt disabled:bg-black/25 disabled:text-white/35 disabled:border-white/10 disabled:cursor-not-allowed'
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf disabled:bg-surface-muted disabled:text-ink-muted/60 disabled:border-line disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {selectedComplex ? 'Elegí una cancha' : 'Primero elegí complejo'}
              </option>
              {selectedComplex?.courts.map((court) => (
                <option key={court.id} value={court.id} className="bg-[#121c15] text-white">
                  {court.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                isHero ? 'text-white/60' : 'text-ink-muted'
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 3. Fecha (deshabilitada hasta elegir cancha) */}
        <div>
          <label
            htmlFor={`selector-day-${variant}`}
            className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isHero ? 'text-white/75 flex items-center gap-1.5' : 'text-ink-muted'
            }`}
          >
            {isHero && <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />}
            <span>3. Fecha</span>
          </label>
          <div className="relative">
            <select
              id={`selector-day-${variant}`}
              value={dayId}
              onChange={(e) => handleDayChange(e.target.value)}
              disabled={!selectedCourt}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? 'bg-black/50 hover:bg-black/60 border border-white/20 hover:border-white/30 text-white focus:border-volt focus:ring-1 focus:ring-volt disabled:bg-black/25 disabled:text-white/35 disabled:border-white/10 disabled:cursor-not-allowed'
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf disabled:bg-surface-muted disabled:text-ink-muted/60 disabled:border-line disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {selectedCourt ? 'Elegí una fecha' : 'Primero elegí cancha'}
              </option>
              {selectedCourt?.availabilityByDay.map((day) => (
                <option key={day.id} value={day.id} className="bg-[#121c15] text-white">
                  {day.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                isHero ? 'text-white/60' : 'text-ink-muted'
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 4. Horario (deshabilitado hasta elegir fecha) */}
        <div>
          <label
            htmlFor={`selector-slot-${variant}`}
            className={`block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
              isHero ? 'text-white/75 flex items-center gap-1.5' : 'text-ink-muted'
            }`}
          >
            {isHero && <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />}
            <span>4. Horario</span>
          </label>
          <div className="relative">
            <select
              id={`selector-slot-${variant}`}
              value={slotId}
              onChange={(e) => handleSlotChange(e.target.value)}
              disabled={!selectedDay || availableSlots.length === 0}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-mono font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? 'bg-black/50 hover:bg-black/60 border border-white/20 hover:border-white/30 text-white focus:border-volt focus:ring-1 focus:ring-volt disabled:font-sans disabled:bg-black/25 disabled:text-white/35 disabled:border-white/10 disabled:cursor-not-allowed'
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf disabled:font-sans disabled:bg-surface-muted disabled:text-ink-muted/60 disabled:border-line disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {!selectedDay
                  ? 'Primero elegí fecha'
                  : availableSlots.length === 0
                  ? 'Sin turnos registrados'
                  : 'Elegí un horario'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id} className="bg-[#121c15] text-white">
                  {slot.time} hs
                </option>
              ))}
            </select>
            <ChevronDown
              className={`w-4 h-4 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                isHero ? 'text-white/60' : 'text-ink-muted'
              }`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Botón de acción */}
        <div className={isHero ? '' : 'sm:col-span-2 lg:col-span-4 mt-2'}>
          <Button
            type="submit"
            variant="volt"
            size="lg"
            disabled={!isHero && !isComplete}
            className={`w-full ${
              isHero
                ? 'lg:w-auto min-h-[48px] font-bold px-6 shadow-[0_4px_20px_rgba(196,242,54,0.35)] hover:shadow-[0_4px_28px_rgba(196,242,54,0.55)]'
                : 'min-h-[48px]'
            }`}
          >
            {isHero ? (
              <>
                <Search className="w-4 h-4 shrink-0 stroke-[2.5]" aria-hidden="true" />
                <span>Buscar canchas</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 shrink-0 fill-volt-ink" aria-hidden="true" />
                <span>Ver partido</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation or status notifications */}
      {userPromptMessage && (
        <div
          role="status"
          className="mt-3.5 p-3 rounded-lg bg-surface-muted border border-line flex items-center gap-2 text-xs sm:text-sm text-ink font-medium"
        >
          <AlertCircle className="w-4 h-4 text-turf shrink-0" aria-hidden="true" />
          <span>{userPromptMessage}</span>
        </div>
      )}

      {/* Detailed Match status on Search Page */}
      {!isHero && isComplete && foundMatch && (
        <div className="mt-4 pt-4 border-t border-line">
          {foundMatch.status === 'available' && (
            <div className="p-3.5 rounded-lg bg-turf-soft border border-turf/25 flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />
                <div>
                  <span className="block font-semibold text-sm text-ink">
                    Grabación en HD lista para reproducir
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {foundMatch.title} ({foundMatch.courtName} · {foundMatch.timeSlot} hs)
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded bg-turf text-surface font-semibold shrink-0">
                HD DISPONIBLE
              </span>
            </div>
          )}

          {foundMatch.status === 'processing' && (
            <div className="p-3.5 rounded-lg bg-warning-soft border border-warning/30 flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block font-semibold">Video en procesamiento</span>
                <span className="block text-ink-muted mt-0.5">
                  {foundMatch.statusMessage ||
                    'La cámara finalizó de grabar hace poco. El video estará listo en aproximadamente 15 minutos.'}
                </span>
              </div>
            </div>
          )}

          {foundMatch.status === 'unavailable' && (
            <div className="p-3.5 rounded-lg bg-surface-muted border border-line flex items-start gap-2.5 text-xs sm:text-sm text-ink">
              <AlertCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block font-semibold">Grabación no disponible</span>
                <span className="block text-ink-muted mt-0.5">
                  {foundMatch.statusMessage ||
                    'Este turno no contó con cámara automática activa durante el horario seleccionado.'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When selection is incomplete on page */}
      {!isHero && !isComplete && (
        <p className="mt-3 text-xs text-ink-muted">
          Completá club, cancha, fecha y horario para verificar la disponibilidad de la grabación.
        </p>
      )}
    </form>
  );
};
