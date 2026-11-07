import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Server,
  Shield,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { UserRole } from '../../types/user';
import { Button } from '../ui/Button';

interface FutureRolePanelModalProps {
  role: UserRole | null;
  onClose: () => void;
  onContinueAsPlayer: () => void;
}

export const FutureRolePanelModal: React.FC<FutureRolePanelModalProps> = ({
  role,
  onClose,
  onContinueAsPlayer,
}) => {
  if (!role || role === 'player') return null;

  const isClubAdmin = role === 'club_admin';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="future-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-2xl text-ink max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-volt-ink px-2.5 py-0.5 rounded bg-volt">
            {isClubAdmin ? 'Rol: Administrador de Club' : 'Rol: Superadmin Canchas3'}
          </span>
          <span className="font-mono text-[11px] text-ink-muted px-2 py-0.5 rounded bg-surface-muted border border-line">
            MVP Etapa 2 · En desarrollo
          </span>
        </div>

        {/* Title */}
        <h2
          id="future-panel-title"
          className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink flex items-center gap-2.5"
        >
          {isClubAdmin ? (
            <>
              <Building2 className="w-6 h-6 text-turf shrink-0" aria-hidden="true" />
              <span>Panel de Administración de Club</span>
            </>
          ) : (
            <>
              <Shield className="w-6 h-6 text-volt shrink-0" aria-hidden="true" />
              <span>Panel de Superadministración Canchas3</span>
            </>
          )}
        </h2>

        <p className="mt-2.5 text-sm sm:text-base text-ink-muted leading-relaxed">
          {isClubAdmin
            ? 'Este módulo permitirá a los dueños y encargados de complejos deportivos gestionar sus cámaras IP, definir reglas de acceso a las grabaciones y establecer tarifas.'
            : 'Módulo de supervisión global de la plataforma Canchas3 para el equipo de dirección MGV, con métricas de streaming, almacenamiento e infraestructura de servidores.'}
        </p>

        {/* Modeled Capabilities for the Role */}
        <div className="mt-5 space-y-3 p-4 rounded-xl bg-canvas border border-line">
          <p className="text-xs font-semibold uppercase tracking-wider text-turf-ink">
            Capacidades modeladas para este rol
          </p>

          <ul className="space-y-2 text-xs sm:text-sm text-ink-muted">
            {isClubAdmin ? (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-turf shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Gestión de cámaras RTSP:</strong> asignación de feeds en vivo a Cancha 1, Cancha 2 y canchas techadas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-turf shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Reglas de privacidad y acceso:</strong> definir si los partidos son públicos, exclusivos para jugadores del turno o protegidos con código QR.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-turf shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Tarifas y monetización:</strong> fijar precio por acceso a grabación HD o вклюir en el valor del alquiler de la cancha.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-turf shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Panel de métricas del club:</strong> cantidad de visualizaciones, jugadas guardadas y viralización en redes sociales.
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Directorio multiclub:</strong> onboarding y activación de complejos asociados en Buenos Aires y otras regiones.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Políticas de retención:</strong> parametrización de ciclo de vida de almacenamiento (14, 30 o 60 días) y auto-purga.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Infraestructura y encoders:</strong> monitoreo de estado de enlaces RTSP, latencia y disponibilidad de cámaras.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-ink">Facturación y comisiones:</strong> reportes de ingresos por venta de repeticiones y membresías de clubes.
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Notice of Focus on Player Experience */}
        <div className="mt-4 p-3 rounded-lg bg-surface-muted border border-line flex items-center gap-2.5 text-xs text-ink-muted">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span>
            Siguiendo los requerimientos del Prompt 6.1, en esta etapa se prioriza al 100% la experiencia interactiva del <strong>jugador</strong>.
          </span>
        </div>

        {/* Footer CTAs */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Button
            variant="volt"
            size="md"
            fullWidth
            onClick={onContinueAsPlayer}
          >
            Continuar como Jugador
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
