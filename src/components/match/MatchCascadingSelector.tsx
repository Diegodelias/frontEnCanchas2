import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Play,
  Search,
  Video,
} from 'lucide-react';
import { buildMatchPath } from '../../routes/paths';
import { matchesService } from '../../services/matchesService';
import { Match } from '../../types/match';
import { Button } from '../ui/Button';
import { useClubsById } from '../../hooks/useClubsById';

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
  const [clubId, setClubId] = useState<string>(initialClubId);
  const [courtId, setCourtId] = useState<string>(initialCourtId);
  const [dayId, setDayId] = useState<string>(initialDayId);
  const [slotId, setSlotId] = useState<string>(initialSlotId);

  const [playableMatches, setPlayableMatches] = useState<Match[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState<boolean>(true);
  const [recordingsLoadError, setRecordingsLoadError] = useState<boolean>(false);
  const [recordingsLoadAttempt, setRecordingsLoadAttempt] = useState<number>(0);
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

  useEffect(() => {
    let isCancelled = false;

    setIsLoadingRecordings(true);
    setRecordingsLoadError(false);
    matchesService
      .getPlayableMatches()
      .then((matches) => {
        if (!isCancelled) setPlayableMatches(matches);
      })
      .catch(() => {
        if (!isCancelled) setRecordingsLoadError(true);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingRecordings(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [recordingsLoadAttempt]);

  const availableClubs = useMemo(
    () => Array.from(new Map(playableMatches.map((match) => [match.clubId, match])).values()),
    [playableMatches]
  );

  // Nombre y zona de cada club con grabaciones: se piden de a uno al backend (sin cargar el listado completo).
  const clubIds = useMemo(() => availableClubs.map((match) => match.clubId), [availableClubs]);
  const complexes = useClubsById(clubIds);

  const matchesForClub = useMemo(
    () => playableMatches.filter((match) => match.clubId === clubId),
    [playableMatches, clubId]
  );

  const availableCourts = useMemo(
    () => Array.from(new Map(matchesForClub.map((match) => [match.courtId, match])).values()),
    [matchesForClub]
  );

  const selectedCourt = availableCourts.find((match) => match.courtId === courtId);

  const matchesForCourt = useMemo(
    () => matchesForClub.filter((match) => match.courtId === courtId),
    [matchesForClub, courtId]
  );

  const availableDays = useMemo(
    () => Array.from(new Map(matchesForCourt.map((match) => [match.dayId, match])).values()),
    [matchesForCourt]
  );

  const selectedDay = availableDays.find((match) => match.dayId === dayId);

  const matchesForDay = useMemo(
    () => matchesForCourt.filter((match) => match.dayId === dayId),
    [matchesForCourt, dayId]
  );

  const availableSlots = useMemo(
    () => Array.from(new Set(matchesForDay.map((match) => match.timeSlot))),
    [matchesForDay]
  );

  const selectedSlot = useMemo(
    () => matchesForDay.find((match) => match.timeSlot === slotId),
    [matchesForDay, slotId]
  );

  const isHero = variant === 'hero';
  const isComplete = Boolean(clubId && courtId && dayId && slotId);
  const activeHeroStep = !clubId ? 1 : !courtId ? 2 : !dayId ? 3 : !slotId ? 4 : 0;
  const displayedHeroStep = activeHeroStep || 4;
  const isHeroSelectionComplete = isComplete;
  const heroStepGuidance = [
    '',
    'Empezá por elegir un complejo.',
    'Ahora elegí la cancha donde jugaste.',
    'Después, seleccioná la fecha.',
    'Por último, elegí el horario del partido.',
  ][activeHeroStep];
  const heroStepMarker = (step: number) =>
    activeHeroStep === step ? 'bg-volt shadow-[0_0_10px_rgba(196,242,54,0.6)]' :
    activeHeroStep > step || activeHeroStep === 0 ? 'bg-white/60' : 'bg-white/35';
  const heroStepField = (step: number) =>
    isHero && activeHeroStep === step ? 'ring-1 ring-volt/50 border-volt/70' : '';

  // Check matching match asynchronously via matchesService
  useEffect(() => {
    let isCancelled = false;

    async function check() {
      if (isHero || !isComplete || isLoadingRecordings || recordingsLoadError) {
        setFoundMatch(null);
        setIsCheckingMatch(false);
        return;
      }
      setIsCheckingMatch(true);
      setUserPromptMessage('');
      try {
        const timeSlotString = selectedSlot?.timeSlot || slotId;
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
          if (!match) {
            setUserPromptMessage(
              'No encontramos un video para esa selección. Revisá los filtros e intentá nuevamente.'
            );
          }
        }
      } catch {
        if (!isCancelled) {
          setFoundMatch(null);
          setUserPromptMessage(
            'No pudimos comprobar esa grabación. Conservamos tu selección para que puedas intentarlo de nuevo.'
          );
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
  }, [
    clubId,
    courtId,
    dayId,
    slotId,
    selectedSlot,
    isComplete,
    isHero,
    isLoadingRecordings,
    recordingsLoadError,
    onSelectionChange,
  ]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) {
      if (!clubId) setUserPromptMessage('Elegí primero un club o complejo.');
      else if (!courtId) setUserPromptMessage('Seleccioná la cancha.');
      else if (!dayId) setUserPromptMessage('Elegí el día.');
      else if (!slotId) {
        setUserPromptMessage(
          availableSlots.length === 0
            ? 'No hay videos disponibles para ese día.'
            : 'Seleccioná el horario del partido.'
        );
      }
      return;
    }

    if (isLoadingRecordings || recordingsLoadError) return;
    if (isCheckingMatch) return;

    const submittedSelection = { clubId, courtId, dayId, slotId };
    setIsCheckingMatch(true);
    setUserPromptMessage('');
    try {
      const exactMatch = await matchesService.findMatchBySelection(
        clubId,
        courtId,
        dayId,
        slotId
      );

      if (
        clubId !== submittedSelection.clubId ||
        courtId !== submittedSelection.courtId ||
        dayId !== submittedSelection.dayId ||
        slotId !== submittedSelection.slotId
      ) {
        return;
      }

      if (!exactMatch) {
        setFoundMatch(null);
        setUserPromptMessage(
          'No encontramos un video para esa selección. Revisá los filtros e intentá nuevamente.'
        );
        return;
      }

      setFoundMatch(exactMatch);
      onSelectionChange?.({ ...submittedSelection, match: exactMatch });
      navigate(buildMatchPath(exactMatch.id));
    } catch {
      if (
        clubId === submittedSelection.clubId &&
        courtId === submittedSelection.courtId &&
        dayId === submittedSelection.dayId &&
        slotId === submittedSelection.slotId
      ) {
        setUserPromptMessage(
          'No pudimos comprobar esa grabación. Conservamos tu selección para que puedas intentarlo de nuevo.'
        );
      }
    } finally {
      setIsCheckingMatch(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isLoadingRecordings || isCheckingMatch}
      className={`rounded-2xl transition-all ${
        isHero
          ? 'bg-[#09110c]/95 backdrop-blur-xl text-white border border-white/25 p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] ring-1 ring-white/15'
          : 'bg-surface text-ink border border-line p-5 sm:p-6 shadow-sm'
      } ${className}`}
    >
      {isHero && (
        <p role="status" aria-live="polite" className="mb-3 text-xs sm:text-sm text-white/85">
          <span className="font-semibold text-volt">
            {isHeroSelectionComplete ? 'Listo para buscar' : `Paso ${displayedHeroStep} de 4`}
          </span>
          <span className="mx-1.5 text-white/50" aria-hidden="true">·</span>
          {isHeroSelectionComplete ? 'Buscá el video de tu partido.' : heroStepGuidance}
        </p>
      )}
      <div
        className={`grid grid-cols-1 ${
          isHero
            ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3.5 xl:gap-3 xl:items-end'
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
            {isHero && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${heroStepMarker(1)}`} />}
            <span>1. Club o complejo</span>
          </label>
          <div className="relative">
            <select
              id={`selector-club-${variant}`}
              value={clubId}
              disabled={isLoadingRecordings || recordingsLoadError}
              onChange={(e) => handleClubChange(e.target.value)}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                ? `bg-black/50 hover:bg-black/60 border border-white/20 hover:border-white/30 text-white focus:border-volt focus:ring-1 focus:ring-volt focus-visible:ring-2 focus-visible:ring-volt ${heroStepField(1)}`
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf focus-visible:ring-2 focus-visible:ring-turf focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
              }`}
            >
              <option value="">
                {isLoadingRecordings
                  ? 'Cargando grabaciones…'
                  : recordingsLoadError
                  ? 'No se pudieron cargar los videos'
                  : availableClubs.length === 0
                  ? 'No hay videos disponibles'
                  : 'Elegí un complejo'}
              </option>
              {availableClubs.map((match) => {
                const complex = complexes.get(match.clubId);
                return (
                <option key={match.clubId} value={match.clubId} className="bg-[#121c15] text-white">
                  {complex ? `${complex.name} (${complex.zone})` : match.clubName}
                </option>
                );
              })}
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
            {isHero && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${heroStepMarker(2)}`} />}
            <span>2. Cancha</span>
          </label>
          <div className="relative">
            <select
              id={`selector-court-${variant}`}
              value={courtId}
              onChange={(e) => handleCourtChange(e.target.value)}
              disabled={isLoadingRecordings || recordingsLoadError || !clubId || availableCourts.length === 0}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? `bg-black/65 hover:bg-black/70 border border-white/25 hover:border-white/35 text-white focus:border-volt focus:ring-1 focus:ring-volt focus-visible:ring-2 focus-visible:ring-volt disabled:bg-black/35 disabled:text-white/80 disabled:border-white/40 disabled:cursor-not-allowed ${heroStepField(2)}`
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf focus-visible:ring-2 focus-visible:ring-turf focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:bg-surface-muted disabled:text-ink-muted disabled:border-line-strong disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {!clubId
                  ? 'Elegí complejo'
                  : availableCourts.length === 0
                  ? 'No hay videos disponibles'
                  : 'Elegí una cancha'}
              </option>
              {availableCourts.map((match) => (
                <option key={match.courtId} value={match.courtId} className="bg-[#121c15] text-white">
                  {match.courtName}
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
            {isHero && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${heroStepMarker(3)}`} />}
            <span>3. Fecha</span>
          </label>
          <div className="relative">
            <select
              id={`selector-day-${variant}`}
              value={dayId}
              onChange={(e) => handleDayChange(e.target.value)}
              disabled={isLoadingRecordings || recordingsLoadError || !selectedCourt}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? `bg-black/65 hover:bg-black/70 border border-white/25 hover:border-white/35 text-white focus:border-volt focus:ring-1 focus:ring-volt focus-visible:ring-2 focus-visible:ring-volt disabled:bg-black/35 disabled:text-white/80 disabled:border-white/40 disabled:cursor-not-allowed ${heroStepField(3)}`
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf focus-visible:ring-2 focus-visible:ring-turf focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:bg-surface-muted disabled:text-ink-muted disabled:border-line-strong disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {selectedCourt ? 'Elegí fecha' : 'Elegí cancha'}
              </option>
              {availableDays.map((match) => (
                <option key={match.dayId} value={match.dayId} className="bg-[#121c15] text-white">
                  {match.dateLabel}
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
            {isHero && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${heroStepMarker(4)}`} />}
            <span>4. Horario del partido</span>
          </label>
          <div className="relative">
            <select
              id={`selector-slot-${variant}`}
              value={slotId}
              onChange={(e) => handleSlotChange(e.target.value)}
              disabled={isLoadingRecordings || recordingsLoadError || !selectedDay || availableSlots.length === 0}
              className={`w-full min-h-[48px] appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-mono font-medium cursor-pointer focus:outline-none transition-all ${
                isHero
                  ? `bg-black/65 hover:bg-black/70 border border-white/25 hover:border-white/35 text-white focus:border-volt focus:ring-1 focus:ring-volt focus-visible:ring-2 focus-visible:ring-volt disabled:font-sans disabled:bg-black/35 disabled:text-white/80 disabled:border-white/40 disabled:cursor-not-allowed ${heroStepField(4)}`
                  : 'bg-canvas border border-line-strong text-ink focus:border-turf focus-visible:ring-2 focus-visible:ring-turf focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:font-sans disabled:bg-surface-muted disabled:text-ink-muted disabled:border-line-strong disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {!selectedDay
                  ? 'Elegí fecha'
                  : availableSlots.length === 0
                  ? 'Sin videos disponibles'
                  : 'Elegí un horario'}
              </option>
              {availableSlots.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot} className="bg-[#121c15] text-white">
                  {timeSlot} hs
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
        <div className={isHero ? 'xl:self-end' : 'sm:col-span-2 lg:col-span-4 mt-2'}>
          <Button
            type="submit"
            aria-label={isCheckingMatch ? 'Buscando video…' : undefined}
            variant="volt"
            size="lg"
            disabled={
              isLoadingRecordings ||
              recordingsLoadError ||
              isCheckingMatch ||
              (!isHero && !isComplete)
            }
            className={`w-full ${
              isHero
                ? 'lg:w-auto min-h-[48px] font-bold px-6 shadow-[0_4px_20px_rgba(196,242,54,0.35)] hover:shadow-[0_4px_28px_rgba(196,242,54,0.55)]'
                : 'min-h-[48px]'
            }`}
          >
            {isCheckingMatch ? (
              <>
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
                <span>{isHero ? 'Buscar video' : 'Buscando video…'}</span>
              </>
            ) : isHero ? (
              <>
                <Search className="w-4 h-4 shrink-0 stroke-[2.5]" aria-hidden="true" />
                <span>Buscar video</span>
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
      {isLoadingRecordings && (
        <div
          role="status"
          className="mt-3.5 p-3 rounded-lg bg-surface-muted border border-line flex items-center gap-2 text-xs sm:text-sm text-ink font-medium"
        >
          <Loader2 className="w-4 h-4 text-turf shrink-0 animate-spin" aria-hidden="true" />
          <span>Cargando videos disponibles…</span>
        </div>
      )}

      {!isLoadingRecordings && !recordingsLoadError && playableMatches.length === 0 && (
        <div
          role="status"
          className="mt-3.5 p-3 rounded-lg bg-surface-muted border border-line flex items-center gap-2 text-xs sm:text-sm text-ink font-medium"
        >
          <Video className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
          <span>Todavía no hay partidos con video disponible.</span>
        </div>
      )}

      {recordingsLoadError && (
        <div
          role="alert"
          className="mt-3.5 p-3 rounded-lg bg-surface-muted border border-line flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-ink font-medium"
        >
          <span>No pudimos cargar los videos disponibles.</span>
          <button
            type="button"
            onClick={() => setRecordingsLoadAttempt((attempt) => attempt + 1)}
            className="min-h-10 rounded-lg border border-line-strong px-3 font-semibold text-ink hover:bg-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turf"
          >
            Reintentar
          </button>
        </div>
      )}

      {userPromptMessage && (
        <div
          role="alert"
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
