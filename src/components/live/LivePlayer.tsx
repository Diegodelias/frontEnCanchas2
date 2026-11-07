import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Maximize,
  Minimize,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlays } from '../../context/PlaysContext';
import { useToast } from '../../context/ToastContext';
import { pendingPlayService } from '../../services/pendingPlayService';
import { ROUTES } from '../../routes/paths';
import { Match } from '../../types/match';
import { LiveCamera, LiveCameraStatus } from '../../types/liveCamera';
import { SavedPlay, SavePlayInput } from '../../types/play';
import { AccessEmailModal } from '../auth/AccessEmailModal';
import { PlaysPanel } from '../plays/PlaysPanel';
import { SaveButtonVisualState, SavePlayButton } from '../plays/SavePlayButton';
import { SavePlaySheet } from '../plays/SavePlaySheet';
import { ShareModal } from '../sharing/ShareModal';
import { Button } from '../ui/Button';
import { CameraSwitcher } from './CameraSwitcher';
import { LiveStatusBadge } from './LiveStatusBadge';

const MAX_PLAYBACK_RETRIES = 3;
const PLAYBACK_RETRY_DELAY_MS = 2000;

interface LivePlayerProps {
  camera: LiveCamera;
  allCameras: LiveCamera[];
  onSelectCamera: (cameraId: string) => void;
  forceError?: boolean;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  camera,
  allCameras,
  onSelectCamera,
  forceError = false,
}) => {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Dynamic state for simulating transition from 'connecting' to 'live'
  const [currentStatus, setCurrentStatus] = useState<LiveCameraStatus>(camera.status);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);

  // Playback loading and autoplay blocked states
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(forceError);

  // Play saving state (Prompt 5)
  const { authMode, user } = useAuth();
  const { savedPlays, savePlay, deletePlay } = usePlays();
  const { showToast } = useToast();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeSharePlay, setActiveSharePlay] = useState<SavedPlay | null>(null);
  const [isPlaysPanelOpen, setIsPlaysPanelOpen] = useState(false);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [saveButtonState, setSaveButtonState] = useState<SaveButtonVisualState>('idle');
  const [lastSavedPlayId, setLastSavedPlayId] = useState<string | null>(null);

  const [markedMoment, setMarkedMoment] = useState<{
    timestamp: number;
    timestampLabel: string;
    matchId: string;
    clubName: string;
    courtName: string;
    dateLabel: string;
    timeSlot: string;
    isLiveMoment?: boolean;
    thumbnailUrl?: string;
    videoSrc?: string;
  } | null>(null);

  const cameraPlays = savedPlays.filter((p) => p.matchId === camera.id || p.isLiveMoment);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Reintentos automáticos ante fallos transitorios del stream en vivo
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<number | null>(null);

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const code = video.error?.code;
    const isRecoverable =
      code === MediaError.MEDIA_ERR_DECODE || code === MediaError.MEDIA_ERR_NETWORK;

    if (isRecoverable && retryCountRef.current < MAX_PLAYBACK_RETRIES) {
      retryCountRef.current += 1;
      setIsVideoLoading(true);
      clearRetryTimeout();
      retryTimeoutRef.current = window.setTimeout(() => {
        retryTimeoutRef.current = null;
        video.load();
      }, PLAYBACK_RETRY_DELAY_MS);
      return;
    }

    setHasPlaybackError(true);
  };

  // Cancelar un reintento pendiente al desmontar
  useEffect(() => clearRetryTimeout, []);

  // Sync state whenever camera changes
  useEffect(() => {
    retryCountRef.current = 0;
    clearRetryTimeout();
    setCurrentStatus(camera.status);
    setHasPlaybackError(forceError);
    setIsVideoLoading(true);
    setAutoplayBlocked(false);

    // If initial status is 'connecting', simulate live connection after 2.5s
    if (camera.status === 'connecting') {
      const timer = window.setTimeout(() => {
        setCurrentStatus('live');
      }, 2500);
      return () => window.clearTimeout(timer);
    }
  }, [camera, forceError]);

  // Fullscreen change events
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setAutoplayBlocked(true);
        });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) setVolume(0.5);
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
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          // iOS Safari fallback
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Ignored if browser rejects
    }
  };

  // --- LIVE PLAY CAPTURE FLOW (Prompt 5 + Beelup Auth Gate) ---
  const handleTriggerSavePlay = () => {
    // Si el usuario no tiene cuenta iniciada (invitado/público), solicitarle crear cuenta para guardar
    const currentVideoTime = videoRef.current?.currentTime ?? 10;
    const moment = {
      timestamp: Math.floor(currentVideoTime),
      timestampLabel: 'Momento en vivo',
      matchId: camera.id,
      clubName: camera.clubName,
      courtName: camera.courtName,
      dateLabel: 'En vivo · Ahora',
      timeSlot: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      isLiveMoment: true,
      thumbnailUrl: camera.posterUrl,
      videoSrc: camera.videoUrl,
    };

    if (authMode === 'guest' || !user) {
      // El momento marcado queda pendiente en este navegador (30 minutos) y se guarda al ingresar con el link.
      pendingPlayService.save(moment);
      setIsAccessModalOpen(true);
      showToast({
        type: 'info',
        title: 'Creá tu cuenta para guardar jugadas',
        message: 'Acceso gratuito con tu email para guardar clips en vivo de 20s y compartirlos.',
        durationMs: 4000,
      });
      return;
    }

    setMarkedMoment(moment);
    setSaveButtonState('marked');

    showToast({
      type: 'info',
      title: '¡Momento en vivo marcado!',
      message: 'Registramos el momento. La transmisión sigue en vivo.',
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
            message: 'El momento en vivo fue cancelado.',
            durationMs: 2500,
          });
        },
      },
      durationMs: 5000,
    });

    setIsSaveSheetOpen(true);
  };

  const handleSaveConfirmed = (play: SavedPlay) => {
    setLastSavedPlayId(play.id);
    setSaveButtonState('saved');
    setTimeout(() => setSaveButtonState('idle'), 3500);
  };

  const handleSaveWithDefaultsAndClose = async (input: SavePlayInput) => {
    try {
      const play = await savePlay(input);
      setLastSavedPlayId(play.id);
      setIsSaveSheetOpen(false);
      setSaveButtonState('saved');
      showToast({
        type: 'success',
        title: 'Jugada en vivo guardada',
        message: 'Guardamos 20s de la transmisión. Podés verla en tu lista de jugadas.',
        durationMs: 4000,
      });
      setTimeout(() => setSaveButtonState('idle'), 3500);
    } catch {
      setIsSaveSheetOpen(false);
      setSaveButtonState('error');
      setTimeout(() => setSaveButtonState('idle'), 3500);
    }
  };

  const handlePlaySelected = (play: SavedPlay) => {
    navigate(ROUTES.PLAY.replace(':playId', play.id));
  };

  const handleShareSelected = (play: SavedPlay) => {
    setActiveSharePlay(play);
    setIsShareModalOpen(true);
  };

  const synthMatch: Match = {
    id: camera.id,
    title: `Transmisión en vivo — ${camera.courtName}`,
    clubId: camera.clubId,
    clubName: camera.clubName,
    courtId: camera.id,
    courtName: camera.courtName,
    dayId: 'hoy',
    dateLabel: 'Hoy · En vivo',
    timeSlot: 'En vivo',
    status: 'available',
    videoSrc: camera.videoUrl,
    poster: camera.posterUrl,
    duration: 60,
    recordedAt: new Date().toISOString(),
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current !== null) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3200);
  };

  // Calculate "Última señal hace X min" for no_signal
  const getMinutesAgo = (isoString: string): number => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    return Math.max(1, isNaN(minutes) ? 12 : minutes);
  };

  const minutesAgo = getMinutesAgo(camera.lastUpdated);

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
      {/* VIDEO / STATUS STAGE */}
      <div className="absolute inset-0 flex items-center justify-center bg-pitch overflow-hidden">
        {/* CASE 1: FORCED PLAYBACK ERROR OR VIDEO LOAD ERROR */}
        {hasPlaybackError ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-pitch-surface">
            <img
              src={camera.posterUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
            <div className="relative z-10 max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-alert/20 text-alert flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Error de reproducción en vivo
              </h2>
              <p className="text-sm text-pitch-muted leading-relaxed">
                No pudimos establecer el flujo de video con la cámara de {camera.courtName}.
                Verificá tu conexión o probá con otra cancha.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="volt"
                  size="md"
                  onClick={() => setHasPlaybackError(false)}
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Reintentar conexión</span>
                </Button>
                <Button
                  variant="darkSecondary"
                  size="md"
                  onClick={() => setIsSwitcherOpen(true)}
                >
                  <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Cambiar de cámara</span>
                </Button>
              </div>
            </div>
          </div>
        ) : currentStatus === 'live' ? (
          /* CASE 2: LIVE STREAMING STATE */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={camera.videoUrl}
              poster={camera.posterUrl}
              autoPlay
              muted={isMuted}
              playsInline
              controls={false}
              onWaiting={() => setIsVideoLoading(true)}
              onPlaying={() => {
                retryCountRef.current = 0;
                setIsVideoLoading(false);
                setIsPlaying(true);
                setAutoplayBlocked(false);
              }}
              onError={handleVideoError}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Video Loading feedback if stream takes a moment */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none z-10">
                <Radio className="w-10 h-10 text-volt animate-spin mb-3" aria-hidden="true" />
                <p className="text-xs font-mono font-medium text-white">
                  Conectando a señal de transmisión...
                </p>
              </div>
            )}

            {/* Autoplay blocked fallback */}
            {autoplayBlocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 p-6 text-center">
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Transmisión en vivo lista
                </h3>
                <p className="text-xs sm:text-sm text-pitch-muted mb-4 max-w-xs">
                  Tu navegador requiere interacción para iniciar la reproducción en vivo.
                </p>
                <Button variant="volt" size="lg" onClick={togglePlay}>
                  <Play className="w-4 h-4 fill-volt-ink" aria-hidden="true" />
                  <span>Reproducir en vivo</span>
                </Button>
              </div>
            )}
          </div>
        ) : currentStatus === 'connecting' ? (
          /* CASE 3: CONNECTING STATE */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-pitch-surface">
            <img
              src={camera.posterUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            />
            <div className="relative z-10 max-w-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Radio className="w-7 h-7 animate-spin" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Conectando con la cámara...
              </h2>
              <p className="text-xs sm:text-sm text-pitch-muted leading-relaxed">
                Estableciendo enlace de streaming en vivo con {camera.courtName}.
              </p>
              <div className="pt-2">
                <span className="font-mono text-xs text-amber-400 font-semibold animate-pulse">
                  ESTABLECIENDO STREAM HD...
                </span>
              </div>
            </div>
          </div>
        ) : currentStatus === 'no_signal' ? (
          /* CASE 4: NO SIGNAL STATE */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-pitch-surface">
            <img
              src={camera.posterUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
            <div className="relative z-10 max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-amber-400 flex items-center justify-center mx-auto border border-zinc-700">
                <WifiOff className="w-7 h-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Cámara momentáneamente sin señal
                </h2>
                {/* Requisito: Único lugar donde se usa lastUpdated */}
                <p className="mt-1.5 font-mono text-xs sm:text-sm text-amber-300 font-medium">
                  Última señal hace {minutesAgo} min
                </p>
              </div>
              <p className="text-xs sm:text-sm text-pitch-muted leading-relaxed">
                La cámara de {camera.courtName} ({camera.clubName}) tuvo una pérdida temporal de conexión.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="volt"
                  size="md"
                  onClick={() => {
                    setCurrentStatus('connecting');
                    setTimeout(() => setCurrentStatus('live'), 2000);
                  }}
                >
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Reintentar señal</span>
                </Button>
                <Button
                  variant="darkSecondary"
                  size="md"
                  onClick={() => setIsSwitcherOpen(true)}
                >
                  <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Elegir otra cámara</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 5: UNAVAILABLE STATE */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-pitch-surface">
            <div className="max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto border border-zinc-800">
                <AlertTriangle className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Transmisión no disponible
              </h2>
              <p className="text-sm text-pitch-muted leading-relaxed">
                Esta cámara se encuentra apagada o fuera de servicio por mantenimiento del club.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="volt"
                  size="md"
                  onClick={() => setIsSwitcherOpen(true)}
                >
                  <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Elegir otra cámara</span>
                </Button>
                <Button
                  variant="darkSecondary"
                  size="md"
                  onClick={() => navigate(ROUTES.HOME)}
                >
                  <span>Volver a la landing</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOP HEADER OVERLAY */}
      <div
        className={`relative z-20 w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent transition-opacity duration-200 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.LIVE)}
              aria-label="Volver al listado de cámaras en vivo"
              className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-black/60 text-pitch-ink hover:bg-black/80 border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <LiveStatusBadge status={currentStatus} size="sm" />
                <span className="text-xs text-pitch-muted hidden sm:inline">
                  {camera.location}
                </span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight truncate leading-tight mt-0.5">
                {camera.courtName} · {camera.clubName}
              </h1>
            </div>
          </div>

          {/* Right badge: Demo badge with discreet disclaimer */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden md:block">
              <span className="block font-mono text-[10px] text-volt tracking-wider uppercase font-semibold">
                Transmisión en vivo de demostración
              </span>
              <span className="block text-[10px] text-pitch-muted">
                Fuente simulada con video de prueba
              </span>
            </div>

            {/* Plays Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPlaysPanelOpen(true)}
              aria-label={`Ver jugadas en vivo guardadas (${cameraPlays.length})`}
              className="min-h-[38px] px-3 rounded-lg bg-black/60 hover:bg-black/80 border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-volt" aria-hidden="true" />
              <span className="hidden sm:inline">Jugadas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-volt text-volt-ink text-[11px] font-bold font-mono">
                {cameraPlays.length}
              </span>
            </button>

            <Button
              variant="darkSecondary"
              size="sm"
              onClick={() => setIsSwitcherOpen(true)}
              className="text-xs font-semibold"
            >
              <Camera className="w-3.5 h-3.5 text-volt" aria-hidden="true" />
              <span>Cambiar de cámara</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CENTER BIG PLAY/PAUSE OVERLAY (When paused manually in live) */}
      {!isPlaying && currentStatus === 'live' && !hasPlaybackError && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Reanudar transmisión en vivo"
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

      {/* BOTTOM CONTROLS OVERLAY (Minimal: play/pause, volume, audio badge, fullscreen) */}
      <div
        className={`relative z-20 w-full px-4 sm:px-6 pb-4 sm:pb-6 pt-8 bg-gradient-to-t from-black/90 via-black/55 to-transparent transition-opacity duration-200 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Play/Pause and Volume */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStatus === 'live' && !hasPlaybackError && (
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar transmisión' : 'Reanudar transmisión'}
                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" aria-hidden="true" />
                ) : (
                  <Play className="w-5 h-5 fill-white" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Volume control with visible mute warning */}
            <div className="flex items-center gap-2 pl-1">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Activar sonido de la cancha' : 'Silenciar sonido'}
                className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-amber-400" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" aria-hidden="true" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volumen de transmisión"
                className="hidden sm:inline-block w-20 h-1.5 rounded-lg appearance-none bg-white/20 accent-volt cursor-pointer"
              />

              {/* Indicador visible de sin sonido mientras esté silenciado */}
              {isMuted && currentStatus === 'live' && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-[11px] font-mono text-amber-300 font-semibold cursor-pointer hover:bg-amber-500/30 transition-colors"
                >
                  SIN SONIDO · Hacé clic para activar
                </button>
              )}
            </div>
          </div>

          {/* Right: Camera switcher trigger + Fullscreen toggle */}
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-pitch-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span>STREAMING EN TIEMPO REAL</span>
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Maximize className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CAMERA SWITCHER DRAWER/SIDEBAR */}
      <CameraSwitcher
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        cameras={allCameras}
        currentCameraId={camera.id}
        onSelectCamera={onSelectCamera}
      />

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
        matchId={camera.id}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setActiveSharePlay(null);
        }}
        match={synthMatch}
        activePlay={activeSharePlay}
        currentTimestamp={videoRef.current?.currentTime ?? 10}
      />

      {/* Access Email Modal for Guests */}
      <AccessEmailModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
};
