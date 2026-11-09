import React, { useId, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { platformApi } from '../../services/platformApi';
import { Button } from '../ui/Button';

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

/**
 * Suma jugadas extra al cupo de un jugador puntual, por su mail. Las jugadas extra se suman a las que ya tenga. Si el
 * servidor rechaza el pedido (por ejemplo, un mail sin cuenta de jugador) muestra el motivo y conserva lo escrito.
 */
export const GrantExtraPlaysForm: React.FC = () => {
  const { showToast } = useToast();
  const baseId = useId();
  const emailId = `${baseId}-email`;
  const playsId = `${baseId}-plays`;
  const errorId = useId();

  const [email, setEmail] = useState('');
  const [plays, setPlays] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    const typed = email.trim();
    if (!typed) {
      setError('Ingresá el mail del jugador.');
      return;
    }
    if (!/^\d+$/.test(plays.trim())) {
      setError('Ingresá cuántas jugadas sumar, con un número entero.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const result = await platformApi.grantExtraPlays({ email: typed, plays: Number(plays.trim()) });
      showToast({
        title: 'Jugadas sumadas',
        message: `${result.player.email} ahora tiene un cupo de ${result.quota.total} jugadas (${result.quota.extraPlays} extra).`,
        type: 'success',
      });
      setEmail('');
      setPlays('');
    } catch (err) {
      // El formulario conserva lo escrito y no cambia nada.
      setError(err instanceof Error ? err.message : 'No pudimos sumar las jugadas. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-surface border border-line space-y-4" aria-labelledby={`${baseId}-title`}>
      <div>
        <h2 id={`${baseId}-title`} className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-turf" aria-hidden="true" />
          <span>Sumar jugadas a un jugador</span>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Le da más cupo a un jugador puntual, además del cupo gratuito. Se suman a las jugadas extra que ya tenga, hasta
          1.000 por vez.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto] gap-4 sm:items-end">
        <div>
          <label htmlFor={emailId} className="block text-sm font-semibold text-ink mb-1">
            Mail del jugador
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="off"
            placeholder="nombre@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor={playsId} className="block text-sm font-semibold text-ink mb-1">
            Jugadas a sumar
          </label>
          <input
            id={playsId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={plays}
            onChange={(e) => setPlays(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={FIELD_CLASS}
          />
        </div>
        <Button type="submit" variant="volt" size="sm" disabled={isSaving}>
          {isSaving ? 'Sumando…' : 'Sumar'}
        </Button>
      </form>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
};
