import React, { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { ROUTES } from '../routes/paths';
import { AuthError, authService } from '../services/authService';

/** Largo mínimo de la contraseña; es el mismo que valida el backend. */
const MIN_PASSWORD_LENGTH = 10;

type Status =
  | { kind: 'checking' }
  | { kind: 'form' }
  | { kind: 'saving' }
  | { kind: 'done' }
  | { kind: 'failed'; code: string };

const INPUT_CLASS =
  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

interface ResetPasswordPageProps {
  /**
   * `reset`: el link de recuperación de un admin (cambia la contraseña y no abre sesión).
   * `invite`: el link de invitación de un admin nuevo (elige su contraseña por primera vez y queda con la sesión abierta).
   */
  mode?: 'reset' | 'invite';
}

/**
 * Destino del link del mail de recuperación o de invitación. El link se consume al enviar la contraseña (un
 * programa del correo que abre el link no envía formularios, así que no lo gasta).
 */
export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ mode = 'reset' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorId = useId();
  const { acceptInvite } = useAuth();
  const { showToast } = useToast();
  const { name: siteName } = useSite();
  const isInvite = mode === 'invite';

  // El identificador se lee una sola vez y se saca de la barra de direcciones, para que no quede en el
  // historial ni viaje en un Referer.
  const [token] = useState<string | null>(() => new URLSearchParams(location.search).get('token'));
  // En una invitación primero se verifica el link (sin gastarlo) para mostrar el nombre del club.
  const [status, setStatus] = useState<Status>(isInvite ? { kind: 'checking' } : { kind: 'form' });
  const [invitation, setInvitation] = useState<{ clubName: string; adminName: string | null } | null>(null);

  const [password, setPassword] = useState('');
  const [repeated, setRepeated] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.search) navigate(location.pathname, { replace: true });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!token) navigate(ROUTES.HOME, { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (!isInvite || !token) return;
    let cancelled = false;
    authService
      .fetchInvitation(token)
      .then((info) => {
        if (cancelled) return;
        setInvitation(info);
        setStatus({ kind: 'form' });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof AuthError && (err.code === 'link_used' || err.code === 'link_expired')) {
          setStatus({ kind: 'failed', code: err.code });
        } else {
          // Sin poder verificarla (por ejemplo, sin red), igual se deja intentar: el servidor decide al enviar.
          setStatus({ kind: 'form' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isInvite, token]);

  if (!token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === 'saving') return;
    setFormError(null);

    // Se valida acá antes de enviar nada al servidor.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`La contraseña debe tener ${MIN_PASSWORD_LENGTH} caracteres o más.`);
      return;
    }
    if (password !== repeated) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    setStatus({ kind: 'saving' });
    try {
      if (isInvite) {
        // Elige su contraseña por primera vez y el servidor le abre la sesión: va directo a su panel.
        await acceptInvite(token, password);
        setPassword('');
        setRepeated('');
        showToast({
          title: 'Contraseña guardada',
          message: invitation?.clubName ? `Entraste al panel de ${invitation.clubName}.` : 'Entraste al panel de tu club.',
          type: 'success',
        });
        navigate(ROUTES.CLUB_ADMIN, { replace: true });
        return;
      }
      await authService.resetPassword(token, password);
      setPassword('');
      setRepeated('');
      setStatus({ kind: 'done' });
    } catch (err) {
      if (err instanceof AuthError && (err.code === 'link_used' || err.code === 'link_expired')) {
        setStatus({ kind: 'failed', code: err.code });
        return;
      }
      // Cualquier otro error (red, contraseña rechazada): el link sigue vigente, se puede reintentar.
      setFormError(err instanceof Error ? err.message : 'No pudimos guardar la contraseña. Probá de nuevo.');
      setStatus({ kind: 'form' });
    }
  };

  const handleRequestAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRequesting) return;
    setRequestError(null);
    setIsRequesting(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setRequestMessage(res.message);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'No pudimos enviar el link. Probá de nuevo.');
    } finally {
      setIsRequesting(false);
    }
  };

  const goToAdminLogin = () => navigate(ROUTES.HOME, { replace: true, state: { openLogin: 'admin' } });

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader cta={{ label: 'Reservá tu cancha', compactLabel: 'Reservá', to: '/#complejos' }} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-surface border border-line p-6 sm:p-8 shadow-sm">
          {status.kind === 'checking' && (
            <p role="status" className="text-sm text-ink-muted">
              Verificando tu invitación...
            </p>
          )}

          {(status.kind === 'form' || status.kind === 'saving') && (
            <>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isInvite ? 'Invitación de administrador' : 'Administradores de club'}</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {isInvite ? 'Elegí tu contraseña' : 'Elegí una contraseña nueva'}
              </h1>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {isInvite
                  ? `${invitation?.adminName ? `Hola ${invitation.adminName}. ` : ''}Te invitaron a administrar ${
                      invitation?.clubName ? invitation.clubName : 'un club'
                    } en ${siteName}. Usá ${MIN_PASSWORD_LENGTH} caracteres o más: con ella vas a ingresar siempre.`
                  : `Usá ${MIN_PASSWORD_LENGTH} caracteres o más. Al cambiarla se cierran las sesiones abiertas de tu cuenta.`}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-ink mb-1.5">
                    Contraseña nueva
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={formError ? true : undefined}
                      aria-describedby={formError ? errorId : undefined}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="repeat-password" className="block text-xs font-semibold text-ink mb-1.5">
                    Repetí la contraseña
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="repeat-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={repeated}
                      onChange={(e) => setRepeated(e.target.value)}
                      aria-invalid={formError ? true : undefined}
                      aria-describedby={formError ? errorId : undefined}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {formError && (
                  <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="volt"
                  size="md"
                  fullWidth
                  disabled={status.kind === 'saving' || !password || !repeated}
                >
                  <span>
                    {status.kind === 'saving'
                      ? 'Guardando...'
                      : isInvite
                        ? 'Guardar y entrar a mi panel'
                        : 'Cambiar la contraseña'}
                  </span>
                </Button>
              </form>
            </>
          )}

          {status.kind === 'done' && (
            <>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Listo</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                Contraseña cambiada
              </h1>
              <p role="status" className="mt-2 text-sm text-ink-muted leading-relaxed">
                Ya podés ingresar con la contraseña nueva. Cerramos las sesiones que tenías abiertas.
              </p>
              <Button type="button" variant="volt" size="lg" fullWidth onClick={goToAdminLogin} className="mt-6">
                <span>Ir al ingreso de administradores</span>
              </Button>
            </>
          )}

          {status.kind === 'failed' && (
            <>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isInvite
                    ? status.code === 'link_used'
                      ? 'Invitación ya usada'
                      : 'Invitación no válida'
                    : status.code === 'link_used'
                      ? 'Link ya usado'
                      : 'Link no válido'}
                </span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {isInvite
                  ? status.code === 'link_used'
                    ? 'Esta invitación ya se usó'
                    : 'Esta invitación no sirve'
                  : status.code === 'link_used'
                    ? 'Este link ya se usó'
                    : 'Este link no sirve'}
              </h1>
              <p role="alert" className="mt-2 text-sm text-ink-muted leading-relaxed">
                {isInvite
                  ? status.code === 'link_used'
                    ? 'Cada invitación sirve una sola vez. Si ya elegiste tu contraseña, ingresá con ella; si la olvidaste, usá «Olvidé mi contraseña» en el ingreso de administradores.'
                    : 'Las invitaciones vencen a las 72 horas. Pedí que te la reenvíen, o usá «Olvidé mi contraseña» en el ingreso de administradores.'
                  : status.code === 'link_used'
                    ? 'Cada link sirve una sola vez. Pedí uno nuevo con tu mail.'
                    : 'Los links vencen a los 15 minutos. Pedí uno nuevo con tu mail.'}
              </p>

              {isInvite ? (
                <Button type="button" variant="volt" size="lg" fullWidth onClick={goToAdminLogin} className="mt-6">
                  <span>Ir al ingreso de administradores</span>
                </Button>
              ) : requestMessage ? (
                <div className="mt-6 p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
                  <p role="status" className="text-sm text-ink leading-relaxed">{requestMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleRequestAnother} className="mt-6 space-y-3" noValidate>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-ink">
                    Tu mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tuclub.com"
                      aria-invalid={requestError ? true : undefined}
                      aria-describedby={requestError ? errorId : undefined}
                      className={INPUT_CLASS}
                    />
                  </div>
                  {requestError && (
                    <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                      {requestError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="volt"
                    size="md"
                    fullWidth
                    disabled={isRequesting || !email.trim()}
                  >
                    <span>{isRequesting ? 'Enviando...' : 'Pedir un link nuevo'}</span>
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
