import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface OwnerInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerInquiryModal: React.FC<OwnerInquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [complexName, setComplexName] = useState('');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('Buenos Aires');
  const [errors, setErrors] = useState<{
    complexName?: string;
    contact?: string;
    city?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setComplexName('');
    setContact('');
    setCity('Buenos Aires');
    setErrors({});
    setSubmitted(false);
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

  const validateContact = (value: string): boolean => {
    const trimmed = value.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const digitsCount = trimmed.replace(/\D/g, '').length;
    return isEmail || digitsCount >= 8;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { complexName?: string; contact?: string; city?: string } = {};

    if (complexName.trim().length < 2) {
      nextErrors.complexName = 'Ingresá el nombre de tu complejo.';
    }

    if (!validateContact(contact)) {
      nextErrors.contact = 'Ingresá un WhatsApp o email de contacto válido.';
    }

    if (city.trim().length < 2) {
      nextErrors.city = 'Indicá la ciudad donde está ubicado.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)] animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto overflow-x-hidden bg-surface text-ink border border-line rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-modal-content">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-turf">
              <Building2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Sumá tu club a Canchas3</span>
            </span>
            <h2
              id="owner-modal-title"
              className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink"
            >
              Quiero sumar mi complejo
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario para complejos"
            className="w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="pt-5 space-y-5">
            <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
              <CheckCircle2
                className="w-5 h-5 text-turf shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-xl font-bold text-ink">
                  ¡Solicitud registrada!
                </h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  Simulación visual: esta vista previa no guarda ni envía datos reales. En
                  la versión activa, nuestro equipo se contacta para configurar tus canchas.
                </p>
              </div>
            </div>

            <dl className="divide-y divide-line border border-line rounded-xl bg-canvas px-4 text-sm">
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Complejo</dt>
                <dd className="font-medium text-ink text-right">{complexName.trim()}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Contacto</dt>
                <dd className="font-medium text-ink text-right">{contact.trim()}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <dt className="text-ink-muted">Ciudad</dt>
                <dd className="font-medium text-ink text-right">{city.trim()}</dd>
              </div>
            </dl>

            <Button variant="primary" fullWidth onClick={onClose}>
              Volver a Canchas3
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="pt-5 space-y-4">
            <p className="text-sm text-ink-muted leading-relaxed">
              Dejanos los datos básicos de tu complejo para coordinar la carga de canchas,
              horarios y tarifas.
            </p>

            <div>
              <label
                htmlFor="owner-complex-name"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Nombre del complejo
              </label>
              <input
                id="owner-complex-name"
                type="text"
                value={complexName}
                onChange={(e) => {
                  setComplexName(e.target.value);
                  if (errors.complexName)
                    setErrors((prev) => ({ ...prev, complexName: undefined }));
                }}
                placeholder="Ej. Club Deportivo Sur"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-turf"
              />
              {errors.complexName && (
                <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.complexName}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-contact"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Contacto (WhatsApp o email)
              </label>
              <input
                id="owner-contact"
                type="text"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (errors.contact)
                    setErrors((prev) => ({ ...prev, contact: undefined }));
                }}
                placeholder="Ej. 11 4567 8901 o info@miclub.com.ar"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-turf"
              />
              {errors.contact && (
                <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.contact}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="owner-city"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Ciudad
              </label>
              <input
                id="owner-city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                }}
                placeholder="Ej. Buenos Aires"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-surface border border-line-strong text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-turf"
              />
              {errors.city && (
                <p className="mt-1.5 text-xs font-medium text-alert flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errors.city}</span>
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
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="volt"
                fullWidth
                className="order-1 sm:order-2 font-display uppercase tracking-wider font-extrabold"
              >
                Enviar consulta
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
