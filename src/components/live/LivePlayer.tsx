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
} from 'lucide-react';
import { LIVE_DEMO_NOTICE } from '../../data/mockLiveCameras';
import { ROUTES } from '../../routes/paths';
import { LiveCamera, LiveCameraStatus } from '../../types/liveCamera';
import { Button } from '../ui/Button';
import { CameraSwitcher } from './CameraSwitcher';
import { LiveStatusBadge } from './LiveStatusBadge';

// Espera antes de cada reintento (crece para no martillar a la API mientras la cámara se recupera); su largo es el tope.
const PLAYBACK_RETRY_DELAYS_MS = [2000, 5000, 10000] as const;
const MAX_PLAYBACK_RETRIES = PLAYBACK_RETRY_DELAYS_MS.length;

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
  // El selector de cámaras solo se ofrece si hay otra cámara a la que cambiar.
  const hasOtherCameras = allCameras.length > 1;

  // Playback loading and autoplay blocked states
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(forceError);

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
    // Cuando la API responde 502 o 503 al pedido del stream, el navegador suele reportarlo como «origen no soportado»
    // (la respuesta no es un video): casi siempre es un fallo pasajero de la cámara, así que también se reintenta.
    const isRecoverable =
      code === MediaError.MEDIA_ERR_DECODE ||
      code === MediaError.MEDIA_ERR_NETWORK ||
      code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;

    if (isRecoverable && retryCountRef.current < MAX_PLAYBACK_RETRIES) {
      const delay = PLAYBACK_RETRY_DELAYS_MS[retryCountRef.current]!;
      retryCountRef.current += 1;
      setIsVideoLoading(true);
      clearRetryTimeout();
      retryTimeoutRef.current = window.setTimeout(() => {
        retryTimeoutRef.current = null;
        video.load();
      }, delay);
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
                {hasOtherCameras && (
                  <Button
                    variant="darkSecondary"
                    size="md"
                    onClick={() => setIsSwitcherOpen(true)}
                  >
                    <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Cambiar de cámara</span>
                  </Button>
                )}
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
                {hasOtherCameras && (
                  <Button
                    variant="darkSecondary"
                    size="md"
                    onClick={() => setIsSwitcherOpen(true)}
                  >
                    <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Elegir otra cámara</span>
                  </Button>
                )}
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
                {hasOtherCameras && (
                  <Button
                    variant="volt"
                    size="md"
                    onClick={() => setIsSwitcherOpen(true)}
                  >
                    <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Elegir otra cámara</span>
                  </Button>
                )}
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
              {!camera.isDemo && (
                <p className="mt-0.5 text-[11px] font-medium text-volt">{LIVE_DEMO_NOTICE}</p>
              )}
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

            {hasOtherCameras && (
              <Button
                variant="darkSecondary"
                size="sm"
                onClick={() => setIsSwitcherOpen(true)}
                className="text-xs font-semibold"
              >
                <Camera className="w-3.5 h-3.5 text-volt" aria-hidden="true" />
                <span>Cambiar de cámara</span>
              </Button>
            )}
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
      {hasOtherCameras && (
        <CameraSwitcher
          isOpen={isSwitcherOpen}
          onClose={() => setIsSwitcherOpen(false)}
          cameras={allCameras}
          currentCameraId={camera.id}
          onSelectCamera={onSelectCamera}
        />
      )}
    </div>
  );
};
