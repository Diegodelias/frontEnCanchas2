import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeletePlayDialogProps {
  isOpen: boolean;
  playTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeletePlayDialog: React.FC<DeletePlayDialogProps> = ({
  isOpen,
  playTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm rounded-2xl bg-surface border border-line p-6 shadow-2xl text-ink space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar confirmación"
            className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div>
          <h3 id="delete-dialog-title" className="font-display text-xl font-bold tracking-tight text-ink">
            ¿Eliminar esta jugada?
          </h3>
          <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
            Se eliminará <span className="font-semibold text-ink">"{playTitle}"</span> de tus grabaciones guardadas. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar jugada'}
          </button>
        </div>
      </div>
    </div>
  );
};
