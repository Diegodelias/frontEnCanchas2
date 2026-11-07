import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: string;
  type?: ToastType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { type = 'info', title, message, action, durationMs = 4000 } = toast;
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 160);
  }, [onDismiss]);

  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, handleDismiss]);

  const icons = {
    info: <Info className="w-5 h-5 text-volt shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />,
  };

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl bg-pitch-elevated border border-pitch-line text-pitch-ink shadow-xl backdrop-blur-md transition-all ${
        isExiting ? 'animate-toast-exit pointer-events-none' : 'animate-toast-enter'
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5">{icons[type]}</div>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-pitch-ink leading-tight">{title}</p>
          {message && <p className="text-xs text-pitch-muted mt-0.5 leading-snug">{message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              handleDismiss();
            }}
            className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-volt text-volt-ink hover:bg-volt-hover transition-colors cursor-pointer"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Cerrar notificación"
          onClick={handleDismiss}
          className="p-1 rounded-md text-pitch-muted hover:text-pitch-ink hover:bg-pitch-surface transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
