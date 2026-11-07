import React, { useState } from 'react';
import {
  Building2,
  Check,
  Shield,
  ShieldCheck,
  Sliders,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { FutureRolePanelModal } from '../modals/FutureRolePanelModal';
import { MvpConfigModal } from '../modals/MvpConfigModal';

export const DemoBar: React.FC = () => {
  const { authMode, setAuthMode, user } = useAuth();
  const [selectedFutureRole, setSelectedFutureRole] = useState<UserRole | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  return (
    <>
      <aside
        aria-label="Barra de control y roles del MVP Canchas3"
        className="bg-pitch-surface text-pitch-ink border-b border-pitch-line px-3 sm:px-4 py-1.5 text-xs font-mono transition-colors"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Role Indicator & Branding */}
          <div className="flex items-center gap-2 text-pitch-muted">
            <ShieldCheck className="w-4 h-4 text-volt shrink-0" aria-hidden="true" />
            <span className="font-bold text-pitch-ink">MVP CANCHAS3 (MGV):</span>
            <span className="hidden md:inline">
              Demostración funcional del jugador + accesos preparados para administración.
            </span>
          </div>

          {/* Right: Role Switcher & MVP Decisions Config */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Roles Bar */}
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-pitch border border-pitch-line">
              {/* 1. Jugador Registrado */}
              <button
                type="button"
                onClick={() => setAuthMode('registered')}
                title="Experiencia interactiva del jugador registrado"
                className={`min-h-[26px] px-2 py-0.5 rounded text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  authMode === 'registered'
                    ? 'bg-volt text-volt-ink font-bold shadow-xs'
                    : 'text-pitch-muted hover:text-pitch-ink'
                }`}
              >
                <UserCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Jugador {user ? `(${user.name.split(' ')[0]})` : ''}</span>
              </button>

              {/* 2. Jugador Invitado */}
              <button
                type="button"
                onClick={() => setAuthMode('guest')}
                title="Experiencia de jugador invitado sin login"
                className={`min-h-[26px] px-2 py-0.5 rounded text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  authMode === 'guest'
                    ? 'bg-surface text-ink font-bold shadow-xs'
                    : 'text-pitch-muted hover:text-pitch-ink'
                }`}
              >
                <UserX className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Invitado</span>
              </button>

              <span className="h-3 w-px bg-pitch-line mx-0.5" aria-hidden="true" />

              {/* 3. Acceso a Panel Administración */}
              <button
                type="button"
                onClick={() => setSelectedFutureRole('club_admin')}
                title="Acceso al Panel de Administración (Clubes, Canchas, Fechas, Usuarios)"
                className="min-h-[26px] px-2 py-0.5 rounded text-[11px] font-sans text-pitch-muted hover:text-pitch-ink hover:bg-pitch-surface flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Building2 className="w-3 h-3 text-turf shrink-0" aria-hidden="true" />
                <span>Administrador</span>
              </button>
            </div>

            {/* MVP Open Decisions Config Button */}
            <button
              type="button"
              onClick={() => setConfigModalOpen(true)}
              title="Abrir panel de decisiones abiertas y parámetros de negocio"
              className="min-h-[28px] px-2.5 py-1 rounded-md bg-pitch border border-pitch-line text-volt hover:bg-pitch-surface text-[11px] font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Decisiones MVP</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Future Role Preview Modal */}
      <FutureRolePanelModal
        role={selectedFutureRole}
        onClose={() => setSelectedFutureRole(null)}
        onContinueAsPlayer={() => {
          setSelectedFutureRole(null);
          setAuthMode('registered');
        }}
      />

      {/* Editable MVP Decisions Modal */}
      <MvpConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </>
  );
};
