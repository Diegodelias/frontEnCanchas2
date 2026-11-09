import React, { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, Lock, Mail, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { useRememberedEmail } from '../../hooks/useRememberedEmail';
import { ROUTES } from '../../routes/paths';
import { AuthError, authService } from '../../services/authService';
import { PlayerCodePanel } from '../auth/PlayerCodePanel';
import { Button } from '../ui/Button';

/** Vista con la que se puede abrir el modal. «Olvidé mi contraseña» es una vista interna del admin. */
export type LoginView = 'player' | 'admin';

type View = LoginView | 'recover';

interface LoginAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Vista con la que abre el modal: la del jugador (por defecto) o el formulario de admin. */
  initialView?: LoginView;
}

const INPUT_CLASS =
  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

const SENT_BOX_CLASS = 'p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3';

export const LoginAccessModal: React.FC<LoginAccessModalProps> = ({
  isOpen,
  onClose,
  initialView = 'player',
}) => {
  const navigate = useNavigate();
  const { sendMagicLink, loginAdmin } = useAuth();
  const { showToast } = useToast();
  const { name: siteName } = useSite();
  const errorId = useId();
  const { remembered, reload: reloadRemembered, forget: forgetRemembered } = useRememberedEmail();

  const [view, setView] = useState<View>(initialView);

  // Jugador: pide el link por mail.
  const [emailInput, setEmailInput] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  // Mail al que se pidió el ingreso (el que se muestra en «Revisá tu mail»).
  const [sentTo, setSentTo] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // Admin: mail y contraseña.
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin: recuperar la contraseña.
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Cada apertura arranca en la vista pedida y sin restos del intento anterior.
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      // El formulario del jugador viene con el último mail con el que ingresó (si el navegador lo recuerda).
      setEmailInput(reloadRemembered());
      setAdminPassword('');
      setAdminError(null);
      setLinkMessage(null);
      setLinkError(null);
      setRecoverMessage(null);
      setRecoverError(null);
    }
  }, [isOpen, initialView, reloadRemembered]);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setAdminError(null);
    setIsLoggingIn(true);
    try {
      const profile = await loginAdmin(adminEmail, adminPassword);
      setAdminPassword('');
      onClose();
      const isSuperadmin = profile.role === 'superadmin';
      showToast({
        title: 'Sesión iniciada',
        message: isSuperadmin
          ? 'Entraste al panel de la plataforma.'
          : profile.clubName
            ? `Entraste al panel de ${profile.clubName}.`
            : 'Entraste al panel de tu club.',
        type: 'success',
      });
      // Cada rol entra a su propio panel.
      navigate(isSuperadmin ? ROUTES.PLATFORM_ADMIN : ROUTES.CLUB_ADMIN);
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
      // El mail trae un link y un código: la sesión se abre recién cuando el jugador confirma uno de los dos.
      const res = await sendMagicLink(emailInput);
      setSentTo(emailInput.trim());
      setLinkMessage(res.message);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'No pudimos enviar el link. Probá de nuevo.');
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail.trim() || isRecovering) return;

    setRecoverError(null);
    setIsRecovering(true);
    try {
      // La respuesta es la misma sea cual sea el mail: no dice si tiene cuenta.
      const res = await authService.requestPasswordReset(recoverEmail);
      setRecoverMessage(res.message);
    } catch (err) {
      setRecoverError(err instanceof Error ? err.message : 'No pudimos enviar el link. Probá de nuevo.');
    } finally {
      setIsRecovering(false);
    }
  };

  const openRecover = () => {
    // Si el admin ya escribió su mail, no se lo pedimos de nuevo.
    if (!recoverEmail && adminEmail) setRecoverEmail(adminEmail);
    setRecoverMessage(null);
    setRecoverError(null);
    setView('recover');
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

        {view === 'admin' && (
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
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="admin-password" className="block text-xs font-semibold text-ink">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={openRecover}
                    className="text-xs font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
                  >
                    Olvidé mi contraseña
                  </button>
                </div>
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
        )}

        {view === 'recover' && (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Administradores de club</span>
              </div>
              <h2 id="login-access-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Recuperar mi contraseña
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Ponemos tu mail y te enviamos un link para elegir una contraseña nueva.
              </p>
            </div>

            {recoverMessage ? (
              <div className={`mt-6 ${SENT_BOX_CLASS}`}>
                <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-base font-bold text-ink">Revisá tu mail</h3>
                  <p role="status" className="mt-1 text-sm text-ink-muted leading-relaxed">
                    {recoverMessage}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecoverSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="recover-email" className="block text-xs font-semibold text-ink mb-1.5">
                    Mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="recover-email"
                      type="email"
                      autoComplete="username"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="admin@tuclub.com"
                      aria-invalid={recoverError ? true : undefined}
                      aria-describedby={recoverError ? errorId : undefined}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
                {recoverError && (
                  <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                    {recoverError}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="volt"
                  size="md"
                  disabled={isRecovering || !recoverEmail.trim()}
                  className="w-full"
                >
                  <span>{isRecovering ? 'Enviando...' : 'Enviarme el link'}</span>
                </Button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setView('admin')}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Volver al ingreso de administradores</span>
            </button>
          </>
        )}

        {view === 'player' && (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Acceso a la plataforma</span>
              </div>
              <h2 id="login-access-title" className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Ingresar a {siteName}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
                Ingresá tu correo y te enviamos un código y un link para entrar. Sin contraseña.
              </p>
            </div>

            <div className="mt-6">
              {linkMessage ? (
                <PlayerCodePanel
                  email={sentTo}
                  message={linkMessage}
                  onResend={async () => {
                    const res = await sendMagicLink(sentTo);
                    setLinkMessage(res.message);
                    return res.message;
                  }}
                  onChangeEmail={() => {
                    setLinkMessage(null);
                    setLinkError(null);
                  }}
                  onSignedIn={onClose}
                />
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
                  {remembered && emailInput.trim() === remembered && (
                    <button
                      type="button"
                      onClick={() => {
                        forgetRemembered();
                        setEmailInput('');
                      }}
                      className="text-xs font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
                    >
                      No soy yo, usar otro mail
                    </button>
                  )}
                  {linkError && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                      {linkError}
                    </p>
                  )}
                </form>
              )}
            </div>

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
