import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Play, Radio, Wifi, WifiOff } from 'lucide-react';
import { buildLiveStreamPath } from '../../routes/paths';
import { LiveCamera } from '../../types/liveCamera';
import { Button } from '../ui/Button';
import { ComplexImagePlaceholder } from '../ui/ComplexImagePlaceholder';
import { LiveStatusBadge } from './LiveStatusBadge';

interface LiveCourtCardProps {
  camera: LiveCamera;
  featuredBanner?: boolean;
}

export const LiveCourtCard: React.FC<LiveCourtCardProps> = ({
  camera,
  featuredBanner = false,
}) => {
  const navigate = useNavigate();

  const handleOpenStream = () => {
    navigate(buildLiveStreamPath(camera.id));
  };

  const isLive = camera.status === 'live';
  const isConnecting = camera.status === 'connecting';
  const isNoSignal = camera.status === 'no_signal';
  const isUnavailable = camera.status === 'unavailable';

  return (
    <article
      className={`group flex flex-col bg-surface border border-line rounded-xl overflow-hidden transition-all duration-200 hover:border-line-strong ${
        featuredBanner ? 'ring-2 ring-volt/40 shadow-md' : 'shadow-xs'
      }`}
    >
      {/* Thumbnail with overlay status badge and signal indicator */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-pitch">
        <ComplexImagePlaceholder
          imageUrl={camera.posterUrl}
          name={camera.clubName}
          zone={camera.location}
          sports={[camera.sport as any]}
          variant={camera.visualVariant || 'soccer-turf'}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <LiveStatusBadge status={camera.status} size="md" />

          {/* Connection signal indicator */}
          <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 flex items-center gap-1.5 text-[11px] font-mono text-white">
            {isLive && (
              <>
                <Wifi className="w-3 h-3 text-volt" aria-hidden="true" />
                <span className="hidden sm:inline">Señal activa</span>
              </>
            )}
            {isConnecting && (
              <>
                <Radio className="w-3 h-3 text-amber-400 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Conectando...</span>
              </>
            )}
            {isNoSignal && (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Sin señal</span>
              </>
            )}
            {isUnavailable && (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-500" aria-hidden="true" />
                <span className="hidden sm:inline">Fuera de línea</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom subtle gradient on image */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-pitch via-pitch/40 to-transparent pointer-events-none"
        />

        {/* Play overlay button on hover if live */}
        {isLive && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
            <div className="w-12 h-12 rounded-full bg-volt text-volt-ink flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 fill-volt-ink translate-x-0.5" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Unboxed metadata kicker */}
        <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
          <span>{camera.location}</span>
          <span aria-hidden="true">·</span>
          <span>{camera.sport}</span>
          <span aria-hidden="true">·</span>
          <span className="text-turf font-semibold">Cámara IP</span>
        </div>

        <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink leading-snug">
          {camera.courtName}
        </h3>

        <p className="mt-1 text-xs sm:text-sm text-ink-muted flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-turf shrink-0" aria-hidden="true" />
          <span className="truncate">{camera.clubName}</span>
        </p>

        {/* Copy requerido: Mirá lo que está pasando ahora */}
        <p className="mt-2.5 text-sm font-medium text-ink/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-turf shrink-0" aria-hidden="true" />
          <span>Mirá lo que está pasando ahora.</span>
        </p>

        <div className="mt-auto pt-5">
          <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-ink-muted">
              {isLive
                ? 'Transmisión lista'
                : isConnecting
                ? 'Conexión en curso'
                : isNoSignal
                ? 'Intermitente'
                : 'Mantenimiento'}
            </span>

            <Button
              variant={isLive ? 'volt' : 'secondary'}
              size="sm"
              onClick={handleOpenStream}
              className="font-semibold"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>Ver cancha en vivo</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
