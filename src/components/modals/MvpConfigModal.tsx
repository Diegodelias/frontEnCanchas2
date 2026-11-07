import React from 'react';
import {
  Check,
  Download,
  HelpCircle,
  Lock,
  QrCode,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { useMvpConfig } from '../../context/MvpConfigContext';
import { MonetizationModel, RetentionPolicy } from '../../data/mockMvpConfig';
import { Button } from '../ui/Button';

interface MvpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MvpConfigModal: React.FC<MvpConfigModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetConfig } = useMvpConfig();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mvp-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-2xl text-ink max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar configuración"
          className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-turf-ink px-2 py-0.5 rounded bg-turf-soft">
            Decisiones de Negocio · Cliente MGV
          </span>
          <span className="font-mono text-[11px] text-ink-muted">v{config.version}</span>
        </div>

        <h2
          id="mvp-config-title"
          className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink flex items-center gap-2"
        >
          <Sliders className="w-6 h-6 text-volt shrink-0" aria-hidden="true" />
          <span>Configuración del MVP</span>
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
          Estas variables representan decisiones de producto abiertas según el <strong>Prompt 6.1</strong>. Modificá las opciones para evaluar cómo se comportaría la plataforma bajo distintos modelos comerciales.
        </p>

        <div className="mt-5 space-y-4 divide-y divide-line">
          {/* 1. Obligatoriedad del Login */}
          <div className="pt-3 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-ink block">
                  ¿Requerir inicio de sesión para ver partidos?
                </label>
                <p className="text-xs text-ink-muted">
                  Si está desactivado, cualquier usuario con el enlace puede ver el reproductor como invitado.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateConfig({ requireLoginToWatch: !config.requireLoginToWatch })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.requireLoginToWatch ? 'bg-volt' : 'bg-surface-muted border-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.requireLoginToWatch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Descarga del partido completo */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-ink block">
                  Descarga de video completo (60 min)
                </label>
                <p className="text-xs text-ink-muted">
                  Permite descargar el archivo MP4 íntegro además de los clips cortos de 20s.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateConfig({ allowFullMatchDownload: !config.allowFullMatchDownload })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.allowFullMatchDownload ? 'bg-volt' : 'bg-surface-muted border-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.allowFullMatchDownload ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 3. Acceso por Código QR en Cancha */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-ink block">
                  Acceso físico con Código QR en cancha
                </label>
                <p className="text-xs text-ink-muted">
                  Escaneo con la cámara del celular para abrir directamente el partido del turno actual.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateConfig({ qrAccessInCourt: !config.qrAccessInCourt })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.qrAccessInCourt ? 'bg-volt' : 'bg-surface-muted border-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.qrAccessInCourt ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. Retención de video */}
          <div className="pt-4">
            <label className="text-sm font-bold text-ink block mb-1">
              Tiempo de retención de las grabaciones
            </label>
            <p className="text-xs text-ink-muted mb-2.5">
              Define cuántos días permanece almacenado el partido antes de purgarse.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '14_days', label: '14 días', days: 14 },
                { id: '30_days', label: '30 días', days: 30 },
                { id: '60_days', label: '60 días', days: 60 },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    updateConfig({
                      retentionPolicy: opt.id as RetentionPolicy,
                      retentionDaysNumber: opt.days,
                    })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    config.retentionPolicy === opt.id
                      ? 'border-turf bg-turf-soft text-turf-ink'
                      : 'border-line bg-canvas text-ink hover:bg-surface-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Modelo de Monetización */}
          <div className="pt-4">
            <label className="text-sm font-bold text-ink block mb-1">
              Modelo de monetización
            </label>
            <p className="text-xs text-ink-muted mb-2.5">
              Esquema de monetización simulado para el acceso a las repeticiones.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'free_demo', label: 'Demo Gratuito', hint: 'Sin pagos' },
                { id: 'freemium', label: 'Freemium', hint: 'Clips gratis, full pago' },
                { id: 'pay_per_match', label: 'Pago por Partido', hint: '$2.500 ARS/partido' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    updateConfig({ monetizationModel: m.id as MonetizationModel })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    config.monetizationModel === m.id
                      ? 'border-volt bg-pitch text-pitch-ink'
                      : 'border-line bg-canvas text-ink hover:bg-surface-muted'
                  }`}
                >
                  <p className="font-bold">{m.label}</p>
                  <p className="text-[11px] text-ink-muted">{m.hint}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetConfig}
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restablecer valores</span>
          </button>

          <Button variant="volt" size="sm" onClick={onClose}>
            Guardar y cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
