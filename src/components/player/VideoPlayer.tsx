import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Share2,
  User,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlays } from '../../context/PlaysContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../routes/paths';
import { Match } from '../../types/match';
import { SavedPlay, SavePlayInput } from '../../types/play';
import { formatVideoTime } from '../../utils/sharing';
import { pendingPlayService } from '../../services/pendingPlayService';
import { AccessEmailModal } from '../auth/AccessEmailModal';
import { PlaysPanel } from '../plays/PlaysPanel';
import { SaveButtonVisualState, SavePlayButton } from '../plays/SavePlayButton';
import { SavePlaySheet } from '../plays/SavePlaySheet';
import { ShareModal } from '../sharing/ShareModal';
import { Button } from '../ui/Button';

interface VideoPlayerProps {
  match: Match;
  highlightedPlay?: SavedPlay | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  match,
  highlightedPlay,
}) => {
  const navigate = useNavigate();
  const { authMode, user } = useAuth();
  const { savedPlays, savePlay, deletePlay } = usePlays();
  const { showToast } = useToast();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(highlightedPlay?.startTime ?? 0);
  const [duration, setDuration] = useState<number>(match.duration || 60);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Muted by default for autoplay compliance
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  // Modals & Panels state
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeSharePlay, setActiveSharePlay] = useState<SavedPlay | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [isPlaysPanelOpen, setIsPlaysPanelOpen] = useState<boolean>(false);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState<boolean>(false);

  // Marked moment data for the current capture session
  const [markedMoment, setMarkedMoment] = useState<{
    timestamp: number;
    timestampLabel: string;
    matchId: string;
    clubName: string;
    courtName: string;
    dateLabel: string;
    timeSlot: string;
    thumbnailUrl?: string;
    videoSrc?: string;
  } | null>(null);

  const [saveButtonState, setSaveButtonState] = useState<SaveButtonVisualState>('idle');
  const [lastSavedPlayId, setLastSavedPlayId] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Filter plays for current match
  const matchPlays = savedPlays.filter((p) => p.matchId === match.id);

  // If highlighted play provided, seek video to its startTime
  useEffect(() => {
    if (highlightedPlay && videoRef.current) {
      videoRef.current.currentTime = highlightedPlay.startTime;
      setCurrentTime(highlightedPlay.startTime);
    }
  }, [highlightedPlay]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement ||
          (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleTriggerSavePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, currentTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setControlsVisible(true);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || match.duration || 60);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const seekRelative = (delta: number) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) setVolume(0.8);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {}
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current !== null) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !isSaveSheetOpen && !isPlaysPanelOpen && !isShareModalOpen) {
        setControlsVisible(false);
      }
    }, 3800);
  };

  // --- SAVE PLAY FLOW (Prompt 5 + Beelup Auth Gate) ---
  const handleTriggerSavePlay = () => {
    // Si el usuario no tiene cuenta iniciada (invitado/público), solicitarle crear cuenta para guardar
    // Crucial: Video KEEPS PLAYING (no pausing)
    const timestampSec = Math.floor(currentTime);
    const formatted = formatVideoTime(timestampSec);

    const moment = {
      timestamp: timestampSec,
      timestampLabel: formatted,
      matchId: match.id,
      clubName: match.clubName,
      courtName: match.courtName,
      dateLabel: match.dateLabel,
      timeSlot: match.timeSlot,
      thumbnailUrl: match.poster || '/assets/aistudio/ref_6fe9ff42.mp4',
      videoSrc: match.videoSrc || '/assets/aistudio/ref_6fe9ff42.mp4',
    };

    if (authMode === 'guest' || !user) {
      // El momento marcado queda pendiente en este navegador (30 minutos) y se guarda al ingresar con el link.
      pendingPlayService.save(moment);
      setIsAccessModalOpen(true);
      showToast({
        type: 'info',
        title: 'Creá tu cuenta para guardar jugadas',
        message: 'Acceso gratuito con tu email para guardar clips de 20s y compartirlos.',
        durationMs: 4000,
      });
      return;
    }

    setMarkedMoment(moment);
    setSaveButtonState('marked');

    // Show non-intrusive toast with "Deshacer"
    showToast({
      type: 'info',
      title: '¡Momento marcado!',
      message: `Registramos el momento en ${formatted}. El video sigue reproduciéndose.`,
      action: {
        label: 'Deshacer',
        onClick: () => {
          if (lastSavedPlayId) {
            deletePlay(lastSavedPlayId);
          }
          setIsSaveSheetOpen(false);
          setSaveButtonState('idle');
          showToast({
            type: 'info',
            title: 'Jugada deshecha',
            message: 'El momento marcado fue cancelado.',
            durationMs: 2500,
          });
        },
      },
      durationMs: 5000,
    });

    // Open configuration sheet
    setIsSaveSheetOpen(true);
  };

  // User explicitly confirmed in the sheet
  const handleSaveConfirmed = (play: SavedPlay) => {
    setLastSavedPlayId(play.id);
    setSaveButtonState('saved');
    setTimeout(() => {
      setSaveButtonState('idle');
    }, 3500);
  };

  // User closed sheet without clicking save: save with defaults so play is never lost!
  const handleSaveWithDefaultsAndClose = async (input: SavePlayInput) => {
    try {
      const play = await savePlay(input);
      setLastSavedPlayId(play.id);
      setIsSaveSheetOpen(false);
      setSaveButtonState('saved');
      showToast({
        type: 'success',
        title: 'Jugada guardada por defecto',
        message: `Guardamos 20s en "${play.title}". Podés editarla en tu lista de jugadas.`,
        durationMs: 4000,
      });
      setTimeout(() => setSaveButtonState('idle'), 3500);
    } catch (err) {
      setIsSaveSheetOpen(false);
      setSaveButtonState('error');
      setTimeout(() => setSaveButtonState('idle'), 3500);
    }
  };

  const handlePlaySelected = (play: SavedPlay) => {
    if (videoRef.current) {
      videoRef.current.currentTime = play.startTime;
      setCurrentTime(play.startTime);
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    setIsPlaysPanelOpen(false);
  };

  const handleShareSelected = (play: SavedPlay) => {
    setActiveSharePlay(play);
    setIsShareModalOpen(true);
  };

  const hasVideoSource = Boolean(match.videoSrc && match.status === 'available');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      className="relative w-full h-[100dvh] bg-pitch text-pitch-ink overflow-hidden select-none flex flex-col justify-between"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* Video Element */}
      <div className="absolute inset-0 flex items-center justify-center bg-pitch overflow-hidden">
        {hasVideoSource ? (
          <video
            ref={videoRef}
            src={match.videoSrc!}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-pitch-surface">
            <div className="w-16 h-16 rounded-2xl bg-pitch-elevated border border-pitch-line flex items-center justify-center text-volt mb-4">
              <Zap className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-pitch-ink">
              {match.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-pitch-muted max-w-md">
              {match.statusMessage || 'La grabación automática no está disponible para este horario.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(ROUTES.HOME)}
              >
                Volver a la página principal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Top Header Bar */}
      <div
        className={`relative z-20 w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-200 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
              aria-label="Volver a la página principal"
              className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-black/50 text-pitch-ink hover:bg-black/70 border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-volt font-medium">
                <span className="truncate">{match.clubName}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{match.courtName}</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight truncate leading-tight">
                {match.title}
              </h1>
            </div>
          </div>

          {/* Top Right Utilities: Plays Panel Badge Button & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Plays Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlaysPanelOpen(true)}
              aria-label={`Ver jugadas guardadas (${matchPlays.length})`}
              className="min-h-[38px] px-3 rounded-lg bg-black/60 hover:bg-black/80 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-volt" aria-hidden="true" />
              <span className="hidden sm:inline">Jugadas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-volt text-volt-ink text-[11px] font-bold font-mono">
                {matchPlays.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.PROFILE)}
              aria-label="Ir a mi perfil"
              className="min-w-[38px] min-h-[38px] px-2.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/15 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-white" aria-hidden="true" />
              <span className="hidden md:inline">
                {authMode === 'registered' && user ? user.name.split(' ')[0] : 'Perfil'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Pause Indicator */}
      {!isPlaying && hasVideoSource && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reanudar reproducción"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-volt text-volt-ink flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <Play className="w-7 h-7 fill-volt-ink translate-x-0.5" aria-hidden="true" />
        </button>
      )}

      {/* FLOATING ACTION: Prominent Main Save Button (Prompt 5) */}
      <div
        className={`absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 pointer-events-auto ${
          controlsVisible ? 'opacity-100 scale-100' : 'opacity-85 scale-95'
        }`}
      >
        <SavePlayButton
          status={saveButtonState}
          onClick={handleTriggerSavePlay}
          className="shadow-2xl"
        />
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`relative z-20 w-full px-4 sm:px-6 pb-4 sm:pb-6 pt-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-200 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-medium text-white tabular-nums shrink-0">
              {formatVideoTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 60}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Barra de progreso del video"
                className="w-full h-1.5 rounded-lg appearance-none bg-white/25 accent-volt cursor-pointer focus:outline-none"
              />
            </div>

            <span className="font-mono text-xs font-medium text-white/70 tabular-nums shrink-0">
              {formatVideoTime(duration)}
            </span>
          </div>

          {/* Controls Bar Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Left Controls: Play/Pause, Seek 5s, Volume */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" aria-hidden="true" />
                ) : (
                  <Play className="w-5 h-5 fill-white" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => seekRelative(-5)}
                aria-label="Retroceder 5 segundos"
                className="hidden sm:inline-flex min-w-[36px] min-h-[36px] items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
                  className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-alert" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Control de volumen"
                  className="hidden md:inline-block w-16 h-1 rounded-lg appearance-none bg-white/20 accent-volt cursor-pointer"
                />
              </div>
            </div>

            {/* Right Controls: Share + Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveSharePlay(null);
                  setIsShareModalOpen(true);
                }}
                aria-label="Compartir partido completo"
                className="min-h-[38px] px-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Compartir</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Maximize className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Play Sheet / Bottom Sheet (Prompt 5) */}
      <SavePlaySheet
        isOpen={isSaveSheetOpen}
        momentData={markedMoment}
        onSaveConfirmed={handleSaveConfirmed}
        onSaveWithDefaultsAndClose={handleSaveWithDefaultsAndClose}
        onViewPlay={handlePlaySelected}
        onSharePlay={handleShareSelected}
        onClose={() => {
          setIsSaveSheetOpen(false);
          setSaveButtonState('idle');
        }}
      />

      {/* Plays Panel Sidebar Modal */}
      <PlaysPanel
        isOpen={isPlaysPanelOpen}
        onClose={() => setIsPlaysPanelOpen(false)}
        onPlaySelected={handlePlaySelected}
        onShareSelected={handleShareSelected}
        onTriggerSavePlay={handleTriggerSavePlay}
        matchId={match.id}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setActiveSharePlay(null);
        }}
        match={match}
        activePlay={activeSharePlay}
        currentTimestamp={currentTime}
      />

      {/* Access Email Modal for Guests */}
      <AccessEmailModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onSuccessRegistered={() => {
          setIsAccessModalOpen(false);
          handleTriggerSavePlay();
        }}
      />
    </div>
  );
};
