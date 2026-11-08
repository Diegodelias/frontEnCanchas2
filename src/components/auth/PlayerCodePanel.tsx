import React, { useId, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAfterPlayerLogin } from '../../hooks/useAfterPlayerLogin';
import { AuthError } from '../../services/authService';
import { Button } from '../ui/Button';

interface PlayerCodePanelProps {
  /** Mail al que se envió el link y el código. */
  email: string;
  /** Mensaje de la API al pedir el ingreso. */
  message: string;
  /** Pide otro mail con link y código; devuelve el mensaje nuevo o lanza un error con el texto a mostrar. */
  onResend: () => Promise<string>;
  /** Vuelve al formulario para escribir otro mail. */
  onChangeEmail: () => void;
  /** El jugador ingresó con el código: el formulario se cierra (el resto lo hace la función compartida). */
  onSignedIn: () => void;
}

/** Cuántos dígitos tiene el código del mail. */
const CODE_LENGTH = 6;

/**
 * Pantalla de «Revisá tu mail» de los dos formularios de ingreso: el jugador puede escribir el código del mail
 * en el mismo navegador donde lo pidió, sin tener que abrir el link (que en el celular suele abrirse en otro).
 */
export const PlayerCodePanel: React.FC<PlayerCodePanelProps> = ({
  email,
  message,
  onResend,
  onChangeEmail,
  onSignedIn,
}) => {
  const { confirmCode } = useAuth();
  const afterPlayerLogin = useAfterPlayerLogin();
  const errorId = useId();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Se aceptan solo dígitos: pegar «123 456» o «123-456» deja «123456».
  const handleChange = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (code.length !== CODE_LENGTH) {
      setError(`El código tiene ${CODE_LENGTH} dígitos.`);
      return;
    }
    setError(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      await confirmCode(email, code);
    } catch (err) {
      setError(
        err instanceof AuthError ? err.message : 'No pudimos iniciar la sesión. Probá de nuevo o pedí un código nuevo.'
      );
      if (err instanceof AuthError && err.code === 'too_many_code_attempts') setCode('');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    onSignedIn();
    await afterPlayerLogin();
  };

  const handleResend = async () => {
    if (isResending) return;
    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      await onResend();
      setCode('');
      setNotice('Te mandamos otro mail con un código nuevo. El anterior ya no sirve.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar el mail. Probá de nuevo en un momento.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-turf-soft border border-turf/25 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-turf shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-display text-base font-bold text-ink">Revisá tu mail</h3>
          <p role="status" className="mt-1 text-sm text-ink-muted leading-relaxed">
            {message}
          </p>
          <p className="mt-2 text-xs font-mono text-turf-ink font-semibold break-all">Enviado a: {email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <label htmlFor="player-code-input" className="block text-xs font-semibold text-ink">
          Escribí el código de {CODE_LENGTH} dígitos del mail
        </label>
        <input
          id="player-code-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH + 6}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="123456"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full min-h-[48px] px-3.5 py-2 rounded-lg bg-canvas border border-line-strong text-center font-mono text-2xl tracking-[0.4em] text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-turf"
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-alert flex items-start gap-1">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
        {notice && (
          <p role="status" className="text-xs font-medium text-turf-ink">
            {notice}
          </p>
        )}
        <Button
          type="submit"
          variant="volt"
          size="md"
          fullWidth
          disabled={isSubmitting || code.length !== CODE_LENGTH}
          className="font-display uppercase tracking-wider font-extrabold"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar con el código'}
        </Button>
      </form>

      <p className="text-xs text-ink-muted leading-relaxed">
        También podés tocar el link del mail. Si lo abrís en otro navegador, la sesión queda ahí: escribí el código acá.
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer disabled:opacity-60"
        >
          {isResending ? 'Reenviando...' : 'Reenviar'}
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
        >
          Cambiar mail
        </button>
      </div>
    </div>
  );
};
