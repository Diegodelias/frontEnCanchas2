import React, { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, KeyRound, Lock, Mail, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_REGISTERED_USER } from '../../data/mockUsers';
import { ROUTES } from '../../routes/paths';
import { AuthError } from '../../services/authService';
import { Button } from '../ui/Button';

export type LoginView = 'player' | 'admin';

interface LoginAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Vista con la que abre el modal: la del jugador (por defecto) o el formulario de admin. */
  initialView?: LoginView;
}

const INPUT_CLASS =
  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

export const LoginAccessModal: React.FC<LoginAccessModalProps> = ({
  isOpen,
  onClose,
  initialView = 'player',
}) => {
  const navigate = useNavigate();
  const { switchRole, sendMagicLink, loginAdmin } = useAuth();
  const { showToast } = useToast();
  const errorId = useId();

  const [view, setView] = useState<LoginView>(initialView);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Cada apertura arranca en la vista pedida y sin restos del intento anterior.
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setAdminPassword('');
      setAdminError(null);
      setLinkMessage(null);
      setLinkError(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSelectPlayer = async () => {
    await switchRole('player');
    onClose();
    showToast({
      title: 'Sesión iniciada como Jugador',
      message: 'Bienvenido, Matías Rossi. Accediste a tus jugadas y partidos.',
      type: 'success',
    });
    navigate(ROUTES.PROFILE);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setAdminError(null);
    setIsLoggingIn(true);
    try {
      const profile = await loginAdmin(adminEmail, adminPassword);
      setAdminPassword('');
      onClose();
      showToast({
        title: 'Sesión iniciada',
        message: profile.clubName
          ? `Entraste al panel de ${profile.clubName}.`
          : 'Entraste al panel de tu club.',
        type: 'success',
      });
      navigate(ROUTES.CLUB_ADMIN);
    } catch (err) {
      setAdminError(
        err instanceof AuthError ? err.message : 'No pudimos iniciar la sesión. Probá de nuevo.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || isSendingMagicLink) return;

    setLinkError(null);
    setIsSendingMagicLink(true);
    try {
      // El mail pide un link: la sesión se abre recién cuando el jugador lo confirma en /acceso.
      const res = await sendMagicLink(emailInput);
      setLinkMessage(res.message);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'No pudimos enviar el link. Probá de nuevo.');
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

        {view === 'admin' ? (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Administradores de club</span>
              </div>
              <h2 id="login-access-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Ingresar al panel del club
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Usá el mail y la contraseña de la cuenta de tu club.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-ink mb-1.5">
                  Mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@tuclub.com"
                    aria-invalid={adminError ? true : undefined}
                    aria-describedby={adminError ? errorId : undefined}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-ink mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    aria-invalid={adminError ? true : undefined}
                    aria-describedby={adminError ? errorId : undefined}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {adminError && (
                <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                  {adminError}
                </p>
              )}

              <Button
                type="submit"
                variant="volt"
                size="md"
                disabled={isLoggingIn || !adminEmail.trim() || !adminPassword}
                className="w-full"
              >
                <span>{isLoggingIn ? 'Ingresando...' : 'Ingresar al panel'}</span>
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setView('player')}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Volver al ingreso de jugadores</span>
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Acceso a la plataforma</span>
              </div>
              <h2 id="login-access-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Ingresar a Canchas3
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Entrá con el perfil de jugador de ejemplo o con tu correo.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSelectPlayer}
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
            {linkMessage ? (
              <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-bold text-ink">Revisá tu mail</h3>
                  <p role="status" className="mt-1 text-sm text-ink-muted leading-relaxed">
                    {linkMessage}
                  </p>
                </div>
              </div>
            ) : (
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
                    aria-label="Tu correo"
                    className={INPUT_CLASS}
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
              {linkError && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                  {linkError}
                </p>
              )}
            </form>
            )}

            <div className="mt-5 pt-4 border-t border-line text-center">
              <button
                type="button"
                onClick={() => setView('admin')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>Soy administrador</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
