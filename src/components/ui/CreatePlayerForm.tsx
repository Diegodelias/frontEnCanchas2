import React, { useId, useState } from 'react';
import { Check, Copy, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { CreatePlayerInput, CreatePlayerResult } from '../../services/clubsApi';
import { Button } from './Button';

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

interface CreatePlayerFormProps {
  /** Crea al jugador en el backend; cada panel pasa la función de su propia ruta. */
  create: (input: CreatePlayerInput) => Promise<CreatePlayerResult>;
}

/**
 * Alta de un jugador por mail desde un panel de admin. Al terminar muestra el link de acceso (un solo uso, 72 horas)
 * para copiarlo y entregarlo sin depender del correo; enviarlo también por mail es opcional. Si el pedido se
 * rechaza conserva el mail escrito y no muestra ningún link.
 */
export const CreatePlayerForm: React.FC<CreatePlayerFormProps> = ({ create }) => {
  const { showToast } = useToast();
  const emailId = useId();
  const errorId = useId();

  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<CreatePlayerResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isCreating) return;
    const typed = email.trim();
    if (!typed) {
      setError('Ingresá el mail del jugador.');
      return;
    }
    setError(null);
    setResult(null);
    setCopied(false);
    setIsCreating(true);
    try {
      const created = await create({ email: typed, sendEmail });
      setResult(created);
      setEmail('');
      if (created.emailSent === false) {
        showToast({
          title: 'No pudimos enviar el mail',
          message: 'La cuenta y el link están listos: copiá el link y pasáselo al jugador.',
          type: 'error',
        });
      }
    } catch (err) {
      // El campo conserva el mail y no se muestra ningún link.
      setError(err instanceof Error ? err.message : 'No pudimos crear el jugador. Probá de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.link);
      setCopied(true);
    } catch {
      showToast({ title: 'No pudimos copiar', message: 'Seleccioná el link y copialo a mano.', type: 'error' });
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-surface border border-line space-y-4" aria-labelledby={`${emailId}-title`}>
      <div>
        <h2 id={`${emailId}-title`} className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-turf" aria-hidden="true" />
          <span>Crear jugador</span>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Cargá el mail del jugador y copiá el link de acceso para pasárselo vos (por ejemplo, por WhatsApp). No depende
          de que un mail llegue.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label htmlFor={emailId} className="block text-sm font-semibold text-ink mb-1">
            Mail del jugador
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jugador@mail.com"
            autoComplete="off"
            maxLength={254}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={FIELD_CLASS}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4 accent-turf"
          />
          <span>Enviar también por mail</span>
        </label>

        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" variant="volt" size="sm" disabled={isCreating}>
          {isCreating ? 'Creando…' : 'Crear jugador'}
        </Button>
      </form>

      {result && (
        <div role="status" className="p-4 rounded-xl border border-line bg-canvas space-y-3">
          <p className="text-sm font-semibold text-ink">
            {result.created ? 'Jugador creado.' : 'Ese jugador ya existía: generamos un link nuevo.'}{' '}
            <span className="font-normal text-ink-muted">{result.player.email}</span>
          </p>
          {result.emailSent === true && <p className="text-sm text-ink-muted">También le enviamos el link por mail.</p>}
          {result.emailSent === false && (
            <p className="text-sm text-red-600 dark:text-red-400">El mail no se pudo enviar. Pasale el link vos.</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={result.link}
              aria-label="Link de acceso del jugador"
              onFocus={(e) => e.currentTarget.select()}
              className={`${FIELD_CLASS} font-mono text-xs`}
            />
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1.5" aria-hidden="true" /> : <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <p className="text-xs text-ink-muted">
            El link se usa una sola vez y vence en 72 horas. Quien lo abra entra como ese jugador: pasáselo solo a él.
          </p>
        </div>
      )}
    </section>
  );
};
