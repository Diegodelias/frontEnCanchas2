import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, Video } from 'lucide-react';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';
import { matchesService } from '../services/matchesService';
import { playsApi } from '../services/playsApi';
import { Match } from '../types/match';
import { SavedPlay } from '../types/play';

interface PlayerPageProps {
  mode: 'match' | 'play';
}

export const PlayerPage: React.FC<PlayerPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { matchId, playId } = useParams<{ matchId?: string; playId?: string }>();

  const [match, setMatch] = useState<Match | null>(null);
  const [highlightedPlay, setHighlightedPlay] = useState<SavedPlay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Una jugada se abre desde la cuenta del jugador: hay que saber primero si hay sesión.
      if (mode === 'play' && isAuthLoading) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (mode === 'play' && playId) {
          // Sin sesión, o si no es del jugador, es lo mismo que si no existiera.
          const plays = user?.role === 'player' ? await playsApi.list(user.id).catch(() => []) : [];
          const play = plays.find((p) => p.id === playId) ?? null;
          if (!play) {
            if (!cancelled) setErrorMessage('La jugada solicitada no existe o fue eliminada.');
            return;
          }
          // Una jugada cuya grabación ya no existe (o todavía no tiene video) no se reproduce.
          if (play.recordingUnavailable) {
            if (!cancelled) setErrorMessage('La grabación de esta jugada no está disponible.');
            return;
          }
          const loadedMatch = await matchesService.getMatchById(play.matchId);
          if (!cancelled) {
            setHighlightedPlay(play);
            // Una jugada en vivo no tiene grabación: se reproduce con el video de la cámara que trae la jugada.
            setMatch(loadedMatch || {
              id: play.matchId,
              title: play.title,
              clubId: '',
              clubName: play.clubName,
              courtId: '',
              courtName: play.courtName,
              dayId: '',
              dateLabel: play.dateLabel,
              timeSlot: play.timeSlot,
              status: 'available',
              videoSrc: play.videoSrc ?? null,
              duration: 60,
              recordedAt: play.createdAt,
            });
          }
        } else if (mode === 'match' && matchId) {
          const loadedMatch = await matchesService.getMatchById(matchId);
          if (!loadedMatch) {
            if (!cancelled) setErrorMessage('El partido solicitado no se encuentra registrado.');
            return;
          }
          if (!cancelled) {
            setMatch(loadedMatch);
            setHighlightedPlay(null);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMessage(err?.message || 'Error al cargar los datos del partido.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [mode, matchId, playId, user, isAuthLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] bg-pitch text-pitch-ink flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-volt animate-spin mb-4" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-pitch-ink">
          Cargando grabación...
        </h2>
        <p className="mt-1 text-sm text-pitch-muted">
          Conectando con la cámara del complejo deportivo
        </p>
      </div>
    );
  }

  if (errorMessage || !match) {
    return (
      <div className="w-full h-[100dvh] bg-pitch text-pitch-ink flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-alert/20 text-alert flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-pitch-ink">
          No pudimos abrir la grabación
        </h2>
        <p className="mt-2 text-sm text-pitch-muted max-w-md">
          {errorMessage || 'El enlace puede haber cambiado o el partido ya no está disponible.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="volt"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Volver a la página principal</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VideoPlayer
      match={match}
      highlightedPlay={highlightedPlay}
    />
  );
};
