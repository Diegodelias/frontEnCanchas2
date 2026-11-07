import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { PlaceholderModalInfo } from '../../types/canchas';
import { Button } from '../ui/Button';

interface PlaceholderInfoModalProps {
  info: PlaceholderModalInfo | null;
  onClose: () => void;
}

export const PlaceholderInfoModal: React.FC<PlaceholderInfoModalProps> = ({
  info,
  onClose,
}) => {
  useEffect(() => {
    if (!info) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [info, onClose]);

  if (!info) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placeholder-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-surface text-ink border border-line rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <Info className="w-3.5 h-3.5 text-turf shrink-0" aria-hidden="true" />
              <span>{info.subtitle}</span>
            </span>
            <h2
              id="placeholder-modal-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-ink"
            >
              {info.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana informativa"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm text-ink-muted leading-relaxed">
          {info.description}
        </p>

        <div className="mt-6">
          <Button variant="primary" fullWidth onClick={onClose}>
            {info.actionLabel ?? 'Cerrar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
