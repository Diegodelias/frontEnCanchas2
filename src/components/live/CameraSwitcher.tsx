import React, { useEffect } from 'react';
import { Camera, Check, MapPin, X } from 'lucide-react';
import { LiveCamera } from '../../types/liveCamera';
import { LiveStatusBadge } from './LiveStatusBadge';

interface CameraSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: LiveCamera[];
  currentCameraId: string;
  onSelectCamera: (cameraId: string) => void;
}

export const CameraSwitcher: React.FC<CameraSwitcherProps> = ({
  isOpen,
  onClose,
  cameras,
  currentCameraId,
  onSelectCamera,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-[var(--c3-backdrop)] transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-switcher-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel: bottom sheet in mobile (rounded-t-2xl), right sidebar in desktop (w-96) */}
      <div className="w-full md:w-96 max-h-[85vh] md:max-h-full bg-pitch-surface text-pitch-ink border-t md:border-t-0 md:border-l border-pitch-line rounded-t-2xl md:rounded-none p-5 sm:p-6 shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pitch-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pitch-elevated border border-pitch-line flex items-center justify-center text-volt">
              <Camera className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[11px] font-mono text-volt uppercase tracking-wider">
                Transmisiones activas
              </span>
              <h2
                id="camera-switcher-title"
                className="font-display text-xl font-bold tracking-tight text-white"
              >
                Cambiar de cámara
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de cámaras"
            className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-lg border border-pitch-line text-pitch-muted hover:text-white hover:bg-pitch-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Camera List */}
        <div className="mt-4 space-y-2.5 flex-1">
          <p className="text-xs text-pitch-muted">
            Seleccioná otra cancha para conectarte a su transmisión en vivo:
          </p>

          <div className="space-y-2 mt-3">
            {cameras.map((cam) => {
              const isSelected = cam.id === currentCameraId;

              return (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => {
                    onSelectCamera(cam.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-pitch-elevated border-volt shadow-xs'
                      : 'bg-pitch border-pitch-line hover:border-pitch-line/80 hover:bg-pitch-elevated/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <LiveStatusBadge status={cam.status} size="sm" />
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-volt font-semibold">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        ACTUAL
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-white leading-tight">
                    {cam.courtName}
                  </h3>

                  <p className="mt-0.5 text-xs text-pitch-muted flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-turf shrink-0" aria-hidden="true" />
                    <span className="truncate">{cam.clubName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cam.location}</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-pitch-line text-center">
          <p className="text-[11px] font-mono text-pitch-muted">
            Streaming simulado para evaluación de frontend Canchas3.
          </p>
        </div>
      </div>
    </div>
  );
};
