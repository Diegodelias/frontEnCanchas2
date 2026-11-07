import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { PlayProcessingStatus } from '../../types/play';

interface PlayProcessingStateProps {
  status: PlayProcessingStatus;
  errorMessage?: string;
  onRetry?: () => void;
}

export const PlayProcessingState: React.FC<PlayProcessingStateProps> = ({
  status,
  errorMessage,
  onRetry,
}) => {
  if (status === 'error') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="p-6 text-center rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-red-300">
            No se pudo guardar la jugada
          </h3>
          <p className="text-xs text-red-300/80 mt-1 max-w-xs mx-auto">
            {errorMessage || 'Ocurrió un error temporal en la conexión simulada.'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 text-center rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3"
      >
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-emerald-300">
            ¡Jugada guardada!
          </h3>
          <p className="text-xs text-emerald-300/80 mt-1">
            Ya quedó registrada con 20 segundos de video.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-6 text-center rounded-2xl bg-pitch-elevated border border-pitch-line space-y-4"
    >
      <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-volt animate-spin" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-pitch-ink">
          {status === 'preparing' ? 'Preparando jugada...' : 'Procesando los 20 segundos...'}
        </h3>
        <p className="text-xs text-pitch-muted mt-1">
          Estamos aislando el momento con el sonido ambiente de la cancha.
        </p>
      </div>
      {/* Animated micro-progress */}
      <div className="w-36 h-1 mx-auto rounded-full bg-pitch-surface overflow-hidden">
        <div className="w-full h-full bg-volt animate-pulse" />
      </div>
    </div>
  );
};
