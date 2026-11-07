import React from 'react';
import { ChevronRight, Film, Mic } from 'lucide-react';
import { CaptureMode } from '../../types/play';

interface CaptureModeSelectorProps {
  selectedMode: CaptureMode;
  onChange: (mode: CaptureMode) => void;
}

export const CaptureModeSelector: React.FC<CaptureModeSelectorProps> = ({
  selectedMode,
  onChange,
}) => {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
        Modalidad de captura
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Option 1: Solo el video (Default) */}
        <button
          type="button"
          onClick={() => onChange('video')}
          aria-pressed={selectedMode === 'video'}
          className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
            selectedMode === 'video'
              ? 'border-volt bg-pitch-elevated/90 ring-1 ring-volt shadow-xs'
              : 'border-line bg-surface hover:bg-surface-muted text-ink'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedMode === 'video'
                  ? 'bg-volt text-volt-ink'
                  : 'bg-surface-muted text-ink-muted'
              }`}
            >
              <Film className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-bold leading-tight ${
                  selectedMode === 'video' ? 'text-pitch-ink' : 'text-ink'
                }`}
              >
                Solo el video
              </p>
              <p className="text-xs text-ink-muted mt-0.5 truncate">
                Con el sonido de la cancha
              </p>
            </div>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ml-2 ${
              selectedMode === 'video' ? 'bg-volt' : 'bg-transparent'
            }`}
          />
        </button>

        {/* Option 2: Con tu relato (Disabled / Próximamente) */}
        <div
          aria-disabled="true"
          title="Próximamente disponible"
          className="flex items-center justify-between p-3.5 rounded-xl border border-line/60 bg-surface/50 opacity-60 cursor-not-allowed select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-surface-muted text-ink-muted/50 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-ink-muted leading-tight">
                  Con tu relato
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-muted text-ink-muted border border-line">
                  Pronto
                </span>
              </div>
              <p className="text-xs text-ink-muted/70 mt-0.5 truncate">
                Agregale tus comentarios
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-muted/40 shrink-0 ml-2" />
        </div>
      </div>
    </div>
  );
};
