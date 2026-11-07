import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface AccessEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRegistered?: () => void;
}

export const AccessEmailModal: React.FC<AccessEmailModalProps> = ({
  isOpen,
  onClose,
  onSuccessRegistered,
}) => {
  const { sendMagicLink, loginAsDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    setError(null);
    setIsSubmitting(false);
    setSuccessMessage(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Ingresá un correo electrónico válido (ej. tu_nombre@gmail.com)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendMagicLink(email.trim());
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al enviar el enlace. Probá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateInstantLogin = async () => {
    await loginAsDemoUser();
    if (onSuccessRegistered) {
      onSuccessRegistered();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-email-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-surface text-ink border border-line rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-turf-soft flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-turf" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-turf-ink">
                Acceso sin contraseña
              </span>
              <h2
                id="access-email-modal-title"
                className="font-display text-2xl font-bold tracking-tight text-ink"
              >
                Guardá tus jugadas
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de acceso"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {successMessage ? (
          <div className="pt-5 space-y-4">
            <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  ¡Revisá tu email!
                </h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  {successMessage}
                </p>
                <p className="mt-2 text-xs font-mono text-turf-ink font-semibold">
                  Enviado a: {email}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-line space-y-2.5">
              <p className="text-xs text-ink-muted">
                Para acelerar la evaluación del demo, podés activar el acceso con un clic:
              </p>
              <Button
                variant="volt"
                fullWidth
                onClick={handleSimulateInstantLogin}
              >
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Simular ingreso automático y ver jugada</span>
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
              >
                Continuar viendo el video
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="pt-5 space-y-4">
            <p className="text-sm text-ink-muted leading-relaxed">
              Ingresá tu email y te enviaremos un enlace para acceder a tus partidos y jugadas desde cualquier dispositivo.
            </p>

            <div>
              <label
                htmlFor="access-email-input"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="access-email-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ej. tu_nombre@gmail.com"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
              />
              {error && (
                <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="order-2 sm:order-1"
              >
                Cerrar y seguir viendo
              </Button>
              <Button
                type="submit"
                variant="volt"
                fullWidth
                disabled={isSubmitting}
                className="order-1 sm:order-2 font-display uppercase tracking-wider font-extrabold"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
