import React, { useEffect, useId, useState } from 'react';
import { Type } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { platformApi } from '../../services/platformApi';
import { Button } from '../ui/Button';

const MAX_NAME_LENGTH = 40;

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

/**
 * Nombre del sitio, editable por el superadmin. Al guardar, el logo, el título de la pestaña y los textos de la
 * interfaz cambian al instante, sin recargar. Si el servidor rechaza el nombre, muestra el motivo y conserva lo escrito.
 */
export const SiteNameForm: React.FC = () => {
  const { name, setName } = useSite();
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();

  const [value, setValue] = useState(name);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Si el nombre llega o cambia desde afuera y nadie lo editó, el campo lo acompaña.
  useEffect(() => {
    if (!dirty) setValue(name);
  }, [name, dirty]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      const saved = await platformApi.updateSiteName(value);
      setName(saved);
      setValue(saved);
      setDirty(false);
      showToast({ title: 'Nombre guardado', message: `El sitio ahora se llama «${saved}».`, type: 'success' });
    } catch (err) {
      // El campo conserva lo escrito y el nombre vigente no cambia.
      setError(err instanceof Error ? err.message : 'No pudimos guardar el nombre. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-surface border border-line space-y-4" aria-labelledby={`${inputId}-title`}>
      <div>
        <h2 id={`${inputId}-title`} className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <Type className="w-5 h-5 text-turf" aria-hidden="true" />
          <span>Nombre del sitio</span>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Es el nombre del logo, de la pestaña del navegador, de los textos de la web y de los mails. Hasta {MAX_NAME_LENGTH}{' '}
          caracteres.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label htmlFor={inputId} className="block text-sm font-semibold text-ink mb-1">
            Nombre
          </label>
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setDirty(true);
            }}
            maxLength={MAX_NAME_LENGTH + 20}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={FIELD_CLASS}
          />
        </div>
        <Button type="submit" variant="volt" size="sm" disabled={isSaving || value === name}>
          {isSaving ? 'Guardando…' : 'Guardar nombre'}
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
