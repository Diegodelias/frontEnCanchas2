import React, { useCallback, useEffect, useId, useState } from 'react';
import { Ticket } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { platformApi } from '../../services/platformApi';
import type { PlaySettings } from '../../types/quota';
import { formatPesos } from '../../utils/money';
import { Button } from '../ui/Button';

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

/** Los tres valores como texto, tal como se escriben en los campos. */
interface Draft {
  freeQuota: string;
  packPlays: string;
  packPrice: string;
}

const toDraft = (settings: PlaySettings): Draft => ({
  freeQuota: String(settings.freeQuota),
  packPlays: String(settings.packPlays),
  packPrice: String(settings.packPrice),
});

/** Un número entero escrito sin decimales ni signos raros, o null si no lo es. El rango lo decide el servidor. */
const parseWhole = (text: string): number | null => (/^-?\d+$/.test(text.trim()) ? Number(text.trim()) : null);

/**
 * Cupo gratuito de jugadas guardadas y paquete de jugadas extra (cantidad y precio), editables por el superadmin. Los
 * valores vigentes se leen del servidor. Si el servidor rechaza el guardado, muestra el motivo y conserva lo escrito.
 */
export const PlaySettingsForm: React.FC = () => {
  const { showToast } = useToast();
  const baseId = useId();
  const errorId = useId();

  const [saved, setSaved] = useState<PlaySettings | null>(null);
  const [draft, setDraft] = useState<Draft>({ freeQuota: '', packPlays: '', packPrice: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const settings = await platformApi.getPlaySettings();
      setSaved(settings);
      setDraft(toDraft(settings));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No pudimos cargar el cupo de jugadas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = saved !== null && JSON.stringify(draft) !== JSON.stringify(toDraft(saved));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    const freeQuota = parseWhole(draft.freeQuota);
    const packPlays = parseWhole(draft.packPlays);
    const packPrice = parseWhole(draft.packPrice);
    if (freeQuota === null || packPlays === null || packPrice === null) {
      setError('Completá los tres valores con números enteros, sin decimales.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const next = await platformApi.updatePlaySettings({ freeQuota, packPlays, packPrice });
      setSaved(next);
      setDraft(toDraft(next));
      showToast({
        title: 'Cupo guardado',
        message: `Cada jugador puede guardar ${next.freeQuota} jugadas gratis. Paquete: ${next.packPlays} por ${formatPesos(next.packPrice)}.`,
        type: 'success',
      });
    } catch (err) {
      // El formulario conserva lo escrito y lo vigente no cambia.
      setError(err instanceof Error ? err.message : 'No pudimos guardar el cupo. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof Draft, label: string, hint: string) => {
    const id = `${baseId}-${key}`;
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-ink mb-1">
          {label}
        </label>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft[key]}
          onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint${error ? ` ${errorId}` : ''}`}
          className={FIELD_CLASS}
        />
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      </div>
    );
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-surface border border-line space-y-4" aria-labelledby={`${baseId}-title`}>
      <div>
        <h2 id={`${baseId}-title`} className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <Ticket className="w-5 h-5 text-turf" aria-hidden="true" />
          <span>Cupo de jugadas y paquete extra</span>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Cuántas jugadas puede tener guardadas cada jugador sin pagar y qué paquete de jugadas extra puede comprar al llegar
          al límite. Bajar el cupo no borra las jugadas que ya tiene cada jugador: solo le impide guardar más.
        </p>
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          El pago es de demostración: no se cobra nada.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted" aria-live="polite">
          Cargando el cupo…
        </p>
      ) : loadError ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {field('freeQuota', 'Jugadas gratis por jugador', 'De 0 a 10.000. Con 0 nadie puede guardar sin comprar.')}
            {field('packPlays', 'Jugadas del paquete', 'De 1 a 1.000 jugadas extra por compra.')}
            {field('packPrice', 'Precio del paquete (pesos)', 'Entero, de $1 a $1.000.000, sin centavos.')}
          </div>

          <Button type="submit" variant="volt" size="sm" disabled={isSaving || !dirty}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
};
