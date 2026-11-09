import React, { useEffect, useId, useState } from 'react';
import { Type } from 'lucide-react';
import { LOGO_COLORS, LOGO_COLOR_LABELS, logoColorValue, type LogoColor } from '../../data/logoPalette';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { platformApi } from '../../services/platformApi';
import { BrandWordmark } from '../ui/BrandWordmark';
import { Button } from '../ui/Button';

const MAX_NAME_LENGTH = 40;

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

/**
 * Nombre del sitio y color del logo, editables por el superadmin en un solo formulario con vista previa. Al guardar, el
 * logo, el título de la pestaña y los textos de la interfaz cambian al instante, sin recargar. Si el servidor lo
 * rechaza, muestra el motivo y conserva lo escrito y lo elegido.
 */
export const SiteNameForm: React.FC = () => {
  const { name, logoColor, setSite } = useSite();
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();

  const [value, setValue] = useState(name);
  const [color, setColor] = useState<LogoColor | null>(logoColor);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Si el nombre o el color llegan o cambian desde afuera y nadie los editó, el formulario los acompaña.
  useEffect(() => {
    if (!dirty) {
      setValue(name);
      setColor(logoColor);
    }
  }, [name, logoColor, dirty]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      const saved = await platformApi.updateSite({ name: value, logoColor: color });
      setSite(saved);
      setValue(saved.name);
      setColor(saved.logoColor);
      setDirty(false);
      showToast({ title: 'Sitio guardado', message: `El sitio ahora se llama «${saved.name}».`, type: 'success' });
    } catch (err) {
      // El formulario conserva lo escrito y lo elegido, y lo vigente no cambia.
      setError(err instanceof Error ? err.message : 'No pudimos guardar el sitio. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-surface border border-line space-y-4" aria-labelledby={`${inputId}-title`}>
      <div>
        <h2 id={`${inputId}-title`} className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <Type className="w-5 h-5 text-turf" aria-hidden="true" />
          <span>Nombre y logo del sitio</span>
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Es el nombre del logo, de la pestaña del navegador, de los textos de la web y de los mails. Hasta {MAX_NAME_LENGTH}{' '}
          caracteres. El logo respeta las mayúsculas y los espacios que escribas, y resalta el número del final o la última
          palabra.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
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

        <fieldset>
          <legend className="block text-sm font-semibold text-ink mb-2">Color del logo</legend>
          <div className="flex flex-wrap gap-2">
            {[null, ...LOGO_COLORS].map((option) => {
              const selected = color === option;
              return (
                <button
                  key={option ?? 'default'}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setColor(option);
                    setDirty(true);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                    selected ? 'border-turf bg-turf-soft text-turf-ink' : 'border-line bg-canvas text-ink hover:bg-surface-muted'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-4 h-4 rounded-full border border-line-strong"
                    style={option ? { backgroundColor: logoColorValue(option) } : { background: 'conic-gradient(var(--c3-turf) 0 50%, var(--c3-ink) 0)' }}
                  />
                  <span>{option ? LOGO_COLOR_LABELS[option] : 'Predeterminado'}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="block text-sm font-semibold text-ink mb-2">Vista previa</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 px-4 py-3 rounded-lg border border-line bg-canvas">
              <BrandWordmark tone="light" name={value.trim() || name} logoColor={color} />
            </div>
            <div className="flex-1 px-4 py-3 rounded-lg bg-pitch">
              <BrandWordmark tone="dark" name={value.trim() || name} logoColor={color} />
            </div>
          </div>
        </div>

        <Button type="submit" variant="volt" size="sm" disabled={isSaving || (value === name && color === logoColor)}>
          {isSaving ? 'Guardando…' : 'Guardar'}
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
