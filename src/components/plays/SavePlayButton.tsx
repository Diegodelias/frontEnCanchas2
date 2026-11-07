import React from 'react';
import { AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { PlayProcessingStatus } from '../../types/play';

export type SaveButtonVisualState = 'idle' | 'marked' | 'processing' | 'saved' | 'error';

interface SavePlayButtonProps {
  status?: SaveButtonVisualState;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const SavePlayButton: React.FC<SavePlayButtonProps> = ({
  status = 'idle',
  onClick,
  className = '',
  disabled = false,
}) => {
  const getButtonConfig = () => {
    switch (status) {
      case 'marked':
        return {
          icon: <Sparkles className="w-5 h-5 text-volt animate-pulse shrink-0" aria-hidden="true" />,
          label: '¡Momento marcado!',
          style:
            'bg-[#111a14]/95 backdrop-blur-md border-2 border-volt text-volt shadow-[0_0_35px_rgba(196,242,54,0.55)]',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 text-volt animate-spin shrink-0" aria-hidden="true" />,
          label: 'Procesando los 20s...',
          style:
            'bg-[#111a14]/95 backdrop-blur-md border border-volt/60 text-white shadow-xl',
        };
      case 'saved':
        return {
          icon: <Check className="w-5 h-5 text-emerald-400 stroke-[3] shrink-0" aria-hidden="true" />,
          label: '¡Jugada guardada!',
          style:
            'bg-emerald-950/95 backdrop-blur-md border-2 border-emerald-400 text-emerald-300 shadow-[0_0_35px_rgba(52,211,153,0.45)]',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />,
          label: 'No se pudo guardar',
          style:
            'bg-red-950/95 backdrop-blur-md border-2 border-red-500 text-red-200 shadow-[0_0_35px_rgba(239,68,68,0.45)]',
        };
      case 'idle':
      default:
        return {
          icon: (
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer broadcast glowing ring */}
              <span className="absolute -inset-1.5 rounded-full bg-red-600/40 animate-ping opacity-75" />
              {/* Inner concentric white circle matching 1_0134639b.png */}
              <span className="relative w-6 h-6 rounded-full border-2 border-white bg-black/40 flex items-center justify-center shadow-md">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              </span>
            </div>
          ),
          label: 'Guardar jugada',
          style:
            'bg-gradient-to-r from-volt via-volt to-[#b8ec25] text-black border-2 border-white/40 shadow-[0_6px_32px_rgba(196,242,54,0.5)] hover:shadow-[0_8px_42px_rgba(196,242,54,0.7)] hover:scale-[1.04]',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || status === 'processing'}
      aria-label={config.label}
      aria-live="polite"
      className={`group relative inline-flex items-center justify-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold tracking-tight transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer active:scale-[0.97] disabled:opacity-75 disabled:cursor-not-allowed select-none ${config.style} ${className}`}
    >
      {config.icon}
      <span className="font-display uppercase tracking-wider text-base sm:text-lg font-extrabold whitespace-nowrap">
        {config.label}
      </span>
    </button>
  );
};
