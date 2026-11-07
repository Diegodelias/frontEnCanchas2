import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastData } from '../components/feedback/Toast';

interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => string;
  dismissToast: (id: string) => void;
  toasts: ToastData[];
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (toastInput: Omit<ToastData, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastData = {
      ...toastInput,
      id,
      durationMs: toastInput.durationMs ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
      {children}
      {/* Toast container floating at bottom-center or top-center */}
      <aside
        aria-label="Notificaciones"
        aria-live="polite"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={() => dismissToast(toast.id)} />
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
