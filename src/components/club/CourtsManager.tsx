import React, { useId, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Power, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ApiCourt, clubsApi, CourtInput } from '../../services/clubsApi';
import { SportType } from '../../types/canchas';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';
import { MyCourtsStatus } from './useMyCourts';

const SPORTS: SportType[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'];

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

interface CourtsManagerProps {
  courts: ApiCourt[];
  status: MyCourtsStatus;
  onRetry: () => void;
  onCourtsChange: (courts: ApiCourt[]) => void;
}

/** Gestión de las canchas del club: lista, formulario de alta y edición, y activar o desactivar. */
export const CourtsManager: React.FC<CourtsManagerProps> = ({ courts, status, onRetry, onCourtsChange }) => {
  const { showToast } = useToast();
  const errorId = useId();

  // `editing` es la cancha que se edita, o null si el formulario es para crear.
  const [editing, setEditing] = useState<ApiCourt | null>(null);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('Fútbol 5');
  const [priceText, setPriceText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setSport('Fútbol 5');
    setPriceText('');
    setFormError(null);
  };

  const startEditing = (court: ApiCourt) => {
    setEditing(court);
    setName(court.name);
    setSport(court.sport);
    setPriceText(String(court.price));
    setFormError(null);
  };

  const hasActiveCourt = courts.some((court) => court.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setFormError(null);
    setIsSaving(true);

    // Las reglas las valida el servidor; los errores se muestran acá sin cerrar el formulario ni perder lo escrito.
    const input: CourtInput = { name, sport, price: priceText.trim() === '' ? NaN : Number(priceText) };
    try {
      if (editing) {
        const updated = await clubsApi.updateCourt(editing.id, input);
        onCourtsChange(courts.map((court) => (court.id === updated.id ? updated : court)));
        showToast({ title: 'Cancha actualizada', message: `Guardamos los cambios de «${updated.name}».`, type: 'success' });
      } else {
        const created = await clubsApi.createCourt(input);
        onCourtsChange([...courts, created]);
        showToast({ title: 'Cancha creada', message: `«${created.name}» ya se muestra en el sitio.`, type: 'success' });
      }
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No pudimos guardar la cancha. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (court: ApiCourt) => {
    if (togglingId) return;
    setTogglingId(court.id);
    try {
      const updated = await clubsApi.updateCourt(court.id, { active: !court.active });
      onCourtsChange(courts.map((c) => (c.id === updated.id ? updated : c)));
      showToast({
        title: updated.active ? 'Cancha activada' : 'Cancha desactivada',
        message: updated.active
          ? `«${updated.name}» vuelve a mostrarse en el sitio.`
          : `«${updated.name}» deja de mostrarse en el sitio. Podés reactivarla cuando quieras.`,
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'No pudimos cambiar el estado',
        message: err instanceof Error ? err.message : 'Probá de nuevo.',
        type: 'error',
      });
    } finally {
      setTogglingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
        Cargando las canchas de tu club...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="p-8 rounded-xl bg-surface border border-line text-center space-y-4">
        <p className="text-sm text-ink">No pudimos cargar las canchas de tu club. Revisá tu conexión y probá de nuevo.</p>
        <Button variant="volt" size="sm" onClick={onRetry}>
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Reintentar</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Canchas de tu club</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Creá y editá tus canchas. Lo que cargues se muestra en el sitio; una cancha desactivada deja de mostrarse y la podés reactivar.
        </p>
      </div>

      {!hasActiveCourt && (
        <div
          role="status"
          className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-2.5 text-sm text-ink"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Sin canchas activas, tu club no se muestra en el sitio.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Lista */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-surface overflow-x-auto">
          {courts.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">
              Todavía no cargaste canchas. Creá la primera con el formulario.
            </p>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Cancha</th>
                  <th className="py-3 px-4">Deporte</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {courts.map((court) => (
                  <tr key={court.id} className={court.active ? '' : 'opacity-70'}>
                    <td className="py-3 px-4 font-semibold text-ink">{court.name}</td>
                    <td className="py-3 px-4 text-ink-muted whitespace-nowrap">{court.sport}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-ink whitespace-nowrap">{formatCurrencyArs(court.price)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          court.active ? 'bg-turf-soft text-turf-ink' : 'bg-surface-muted text-ink-muted'
                        }`}
                      >
                        {court.active ? 'Activa' : 'Desactivada'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditing(court)}
                          aria-label={`Editar ${court.name}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(court)}
                          disabled={togglingId === court.id}
                          aria-label={`${court.active ? 'Desactivar' : 'Activar'} ${court.name}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{court.active ? 'Desactivar' : 'Activar'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-5 rounded-xl border border-line bg-surface space-y-4"
          aria-label={editing ? 'Editar cancha' : 'Nueva cancha'}
        >
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            {editing ? <Pencil className="w-4 h-4 text-turf" aria-hidden="true" /> : <Plus className="w-4 h-4 text-turf" aria-hidden="true" />}
            <span>{editing ? 'Editar cancha' : 'Nueva cancha'}</span>
          </h3>

          <div>
            <label htmlFor="court-name" className="block text-xs font-semibold text-ink mb-1.5">
              Nombre
            </label>
            <input
              id="court-name"
              type="text"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Cancha 3 · Fútbol 7"
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? errorId : undefined}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="court-sport" className="block text-xs font-semibold text-ink mb-1.5">
              Deporte
            </label>
            <select
              id="court-sport"
              value={sport}
              onChange={(e) => setSport(e.target.value as SportType)}
              className={FIELD_CLASS}
            >
              {SPORTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="court-price" className="block text-xs font-semibold text-ink mb-1.5">
              Precio por turno (en pesos)
            </label>
            <input
              id="court-price"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="Ej. 30000"
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? errorId : undefined}
              className={FIELD_CLASS}
            />
          </div>

          {formError && (
            <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" variant="volt" size="md" disabled={isSaving} className="flex-1">
              <span>{isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cancha'}</span>
            </Button>
            {editing && (
              <Button type="button" variant="secondary" size="md" onClick={resetForm} disabled={isSaving}>
                <span>Cancelar</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
