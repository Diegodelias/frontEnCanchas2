import React, { useEffect, useId, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CITIES } from '../../data/cities';
import { platformApi, PlatformClub } from '../../services/platformApi';
import { Button } from '../ui/Button';

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf disabled:opacity-60 disabled:cursor-not-allowed';

interface ClubFormModalProps {
  /** El club a editar, o null para crear uno nuevo. */
  club: PlatformClub | null;
  onClose: () => void;
  onSaved: (club: PlatformClub, wasNew: boolean) => void;
}

/**
 * Alta y edición de un club. El identificador se elige al crear y después no se puede cambiar: lo usan los
 * partidos, las cámaras y los carteles QR. Las reglas las valida el servidor; sus errores se muestran acá
 * sin cerrar el formulario ni perder lo escrito.
 */
export const ClubFormModal: React.FC<ClubFormModalProps> = ({ club, onClose, onSaved }) => {
  const { showToast } = useToast();
  const errorId = useId();
  const isEditing = club !== null;

  const [id, setId] = useState(club?.id ?? '');
  const [name, setName] = useState(club?.name ?? '');
  const [zone, setZone] = useState(club?.zone ?? '');
  const [city, setCity] = useState(club?.city ?? CITIES[0]?.id ?? 'buenos-aires');
  const [address, setAddress] = useState(club?.address ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSaving, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setFormError(null);
    setIsSaving(true);
    try {
      if (club) {
        const updated = await platformApi.updateClub(club.id, { name, zone, city, address });
        showToast({ title: 'Club actualizado', message: `Guardamos los cambios de «${updated.name}».`, type: 'success' });
        onSaved(updated, false);
      } else {
        const created = await platformApi.createClub({ id, name, zone, city, address });
        showToast({
          title: 'Club creado',
          message: `«${created.name}» se muestra en el sitio cuando tenga una cancha activa.`,
          type: 'success',
        });
        onSaved(created, true);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No pudimos guardar el club. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const invalid = formError ? true : undefined;
  const describedBy = formError ? errorId : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-surface text-ink border border-line rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-xl space-y-4"
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-line">
          <h2 id="club-form-title" className="font-display text-xl font-bold text-ink flex items-center gap-2">
            {isEditing ? (
              <Pencil className="w-4 h-4 text-turf" aria-hidden="true" />
            ) : (
              <Plus className="w-4 h-4 text-turf" aria-hidden="true" />
            )}
            <span>{isEditing ? 'Editar club' : 'Nuevo club'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div>
          <label htmlFor="club-id" className="block text-xs font-semibold text-ink mb-1.5">
            Identificador
          </label>
          <input
            id="club-id"
            type="text"
            value={id}
            maxLength={60}
            disabled={isEditing}
            onChange={(e) => setId(e.target.value)}
            placeholder="mi-club-norte"
            autoComplete="off"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`${FIELD_CLASS} font-mono`}
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            {isEditing
              ? 'El identificador no se puede cambiar: lo usan los partidos, las cámaras y los carteles QR.'
              : 'Minúsculas, números y guiones (3 a 60 caracteres). Después no se puede cambiar.'}
          </p>
        </div>

        <div>
          <label htmlFor="club-name" className="block text-xs font-semibold text-ink mb-1.5">
            Nombre
          </label>
          <input
            id="club-name"
            type="text"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Estación Norte Club"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={FIELD_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="club-zone" className="block text-xs font-semibold text-ink mb-1.5">
              Zona
            </label>
            <input
              id="club-zone"
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="Ej. Palermo"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label htmlFor="club-city" className="block text-xs font-semibold text-ink mb-1.5">
              Ciudad
            </label>
            <select id="club-city" value={city} onChange={(e) => setCity(e.target.value)} className={FIELD_CLASS}>
              {CITIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="club-address" className="block text-xs font-semibold text-ink mb-1.5">
            Dirección
          </label>
          <input
            id="club-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Av. Dorrego 1840, Palermo"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={FIELD_CLASS}
          />
        </div>

        {formError && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="volt" size="sm" disabled={isSaving}>
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear club'}
          </Button>
        </div>
      </form>
    </div>
  );
};
