import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_CLUB_ADMIN, DEMO_REGISTERED_USER } from '../../data/mockUsers';
import { ROUTES } from '../../routes/paths';
import { UserRole } from '../../types/user';
import { Button } from '../ui/Button';

interface LoginAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginAccessModal: React.FC<LoginAccessModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { switchRole, sendMagicLink } = useAuth();
  const { showToast } = useToast();

  const [emailInput, setEmailInput] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  if (!isOpen) return null;

  const handleSelectRole = async (role: UserRole, targetRoute: string) => {
    await switchRole(role);
    onClose();

    if (role === 'player') {
      showToast({
        title: 'Sesión iniciada como Jugador',
        message: 'Bienvenido, Matías Rossi. Accediste a tus jugadas y partidos.',
        type: 'success',
      });
    } else if (role === 'club_admin') {
      showToast({
        title: 'Acceso a Panel de Administración',
        message: 'Sesión iniciada como Administrador de Canchas3 y sedes deportivas.',
        type: 'success',
      });
    }

    navigate(targetRoute);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSendingMagicLink(true);
    try {
      const res = await sendMagicLink(emailInput);
      onClose();
      showToast({
        title: 'Enlace enviado',
        message: res.message,
        type: 'success',
      });
      // Default to player profile
      await switchRole('player');
      navigate(ROUTES.PROFILE);
    } catch (err: any) {
      showToast({
        title: 'Error de acceso',
        message: err.message || 'No se pudo enviar el enlace',
        type: 'error',
      });
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-access-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-modal-backdrop"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-line p-6 sm:p-7 shadow-2xl text-ink max-h-[92vh] overflow-y-auto animate-modal-content">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Acceso a la plataforma</span>
          </div>
          <h2 id="login-access-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Ingresar a Canchas3
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Elegí con qué perfil querés operar en la plataforma o ingresá con tu correo.
          </p>
        </div>

        {/* Profiles / Roles Options */}
        <div className="mt-6 space-y-3">
          {/* 1. JUGADOR */}
          <button
            type="button"
            onClick={() => handleSelectRole('player', ROUTES.PROFILE)}
            className="w-full text-left p-4 rounded-xl border border-line bg-canvas hover:border-turf hover:bg-surface-muted transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-turf-soft text-turf flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-ink">
                      {DEMO_REGISTERED_USER.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase text-turf-ink bg-turf-soft px-1.5 py-0.5 rounded">
                      Jugador
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted font-mono">{DEMO_REGISTERED_USER.email}</p>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    Acceso a partidos grabados, historial de jugadas marcadas y perfil personal.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-turf group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
          </button>

          {/* 2. ADMINISTRADOR DE CLUB */}
          <button
            type="button"
            onClick={() => handleSelectRole('club_admin', ROUTES.CLUB_ADMIN)}
            className="w-full text-left p-4 rounded-xl border border-line bg-canvas hover:border-turf hover:bg-surface-muted transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-turf-soft text-turf flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-ink">
                      {DEMO_CLUB_ADMIN.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase text-volt-ink bg-volt px-1.5 py-0.5 rounded">
                      Admin Club
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted font-mono">{DEMO_CLUB_ADMIN.clubName}</p>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                    Panel general de administración: gestión de clubes, canchas, fechas, horarios, cámaras y usuarios.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-volt group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-2 text-ink-muted font-medium">O ingresá con tu correo</span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf"
              />
            </div>
            <Button
              type="submit"
              variant="volt"
              size="md"
              disabled={isSendingMagicLink}
              className="shrink-0"
            >
              <span>{isSendingMagicLink ? 'Enviando...' : 'Continuar'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
