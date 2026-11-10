import React, { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useAfterPlayerLogin } from '../hooks/useAfterPlayerLogin';
import { ROUTES } from '../routes/paths';
import { AuthError } from '../services/authService';

type Status =
  | { kind: 'ready' }
  | { kind: 'confirming' }
  | { kind: 'failed'; code: string; message: string };

const INPUT_CLASS =
  'w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

/**
 * Destino del link del mail. Abrir la dirección no consume el link: lo consume el botón, para que un
 * programa del correo que abre el link antes que la persona no lo gaste.
 */
export const AccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmLink, sendMagicLink } = useAuth();
  const { name: siteName } = useSite();
  const afterPlayerLogin = useAfterPlayerLogin();
  const errorId = useId();

  // El identificador se lee una sola vez y se saca de la barra de direcciones, para que no quede en el
  // historial ni viaje en un Referer.
  const [token] = useState<string | null>(() => new URLSearchParams(location.search).get('token'));
  const [status, setStatus] = useState<Status>({ kind: 'ready' });

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

  if (!token) return null;

  const handleConfirm = async () => {
    if (status.kind === 'confirming') return;
    setStatus({ kind: 'confirming' });
    try {
      await confirmLink(token);
    } catch (err) {
      setStatus(
        err instanceof AuthError
          ? { kind: 'failed', code: err.code, message: err.message }
          : { kind: 'failed', code: 'unknown_error', message: 'No pudimos iniciar la sesión. Pedí un link nuevo.' }
      );
      return;
    }

    await afterPlayerLogin();
    navigate(ROUTES.PROFILE, { replace: true });
  };

  const handleRequestAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRequesting) return;
    setRequestError(null);
    setIsRequesting(true);
    try {
      const res = await sendMagicLink(email);
      setRequestMessage(res.message);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'No pudimos enviar el link. Probá de nuevo.');
    } finally {
      setIsRequesting(false);
    }
  };

  const failed = status.kind === 'failed' ? status : null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader presentation="public" cta={{ label: 'Reservá tu cancha', compactLabel: 'Reservá', to: '/#complejos' }} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-surface border border-line p-6 sm:p-8 shadow-sm">
          {!failed ? (
            <>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-turf-ink mb-1">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Acceso sin contraseña</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                Ingresá a {siteName}
              </h1>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                Tocá el botón para entrar a tu cuenta y ver tus jugadas.
              </p>
              <Button
                type="button"
                variant="volt"
                size="lg"
                fullWidth
                disabled={status.kind === 'confirming'}
                onClick={handleConfirm}
                className="mt-6"
              >
                <span>{status.kind === 'confirming' ? 'Ingresando...' : `Ingresar a ${siteName}`}</span>
              </Button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{failed.code === 'link_used' ? 'Link ya usado' : 'Link no válido'}</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
                {failed.code === 'link_used' ? 'Este link ya se usó' : 'Este link no sirve'}
              </h1>
              <p role="alert" className="mt-2 text-sm text-ink-muted leading-relaxed">
                {failed.code === 'link_used'
                  ? 'Cada link sirve una sola vez. Pedí uno nuevo con tu mail.'
                  : failed.code === 'link_expired'
                    ? 'Los links vencen a los 15 minutos. Pedí uno nuevo con tu mail.'
                    : failed.message}
              </p>

              {requestMessage ? (
                <div className="mt-6 p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-ink leading-relaxed">{requestMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleRequestAnother} className="mt-6 space-y-3" noValidate>
                  <label htmlFor="access-email" className="block text-xs font-semibold text-ink">
                    Tu mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="access-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
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
