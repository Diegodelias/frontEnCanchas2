import React, { useId, useState } from 'react';
import { AlertTriangle, CalendarClock, ChevronDown, ChevronUp, Pencil, Plus, Power, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ApiCourt, CourtInput } from '../../services/clubsApi';
import { SportType } from '../../types/canchas';
import { Button } from '../ui/Button';
import { formatCurrencyArs } from '../ui/ComplexCard';
import { CourtScheduleEditor } from './CourtScheduleEditor';
import { CourtsApi } from './courtsApi';
import { MyCourtsStatus } from './useMyCourts';

const SPORTS: SportType[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'];

const FIELD_CLASS =
  'w-full min-h-[44px] px-3 py-2 text-base sm:text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

interface CourtsManagerProps {
  courts: ApiCourt[];
  status: MyCourtsStatus;
  onRetry: () => void;
  onCourtsChange: (courts: ApiCourt[]) => void;
  /** Con qué API se escriben las canchas: la del propio club (admin de club) o la de un club elegido (superadmin). */
  api: CourtsApi;
  /** Cómo se llama al club en los textos: «tu club» para su admin, o el nombre del club para el superadmin. */
  clubLabel?: string;
}

/** Gestión de las canchas de un club: lista, formulario de alta y edición, activar o desactivar y borrar. */
export const CourtsManager: React.FC<CourtsManagerProps> = ({
  courts,
  status,
  onRetry,
  onCourtsChange,
  api,
  clubLabel = 'tu club',
}) => {
  const isOwnClub = clubLabel === 'tu club';
  const { showToast } = useToast();
  const errorId = useId();

  // `editing` es la cancha que se edita, o null si el formulario es para crear.
  const [editing, setEditing] = useState<ApiCourt | null>(null);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<SportType>('Fútbol 5');
  const [priceText, setPriceText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [courtQuery, setCourtQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportType | 'all'>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // `confirmingId` es la cancha cuya confirmación de borrado está abierta; `deletingId`, la que se está borrando.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // La cancha cuyo editor de horario está abierto.
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setSport('Fútbol 5');
    setPriceText('');
    setFormError(null);
  };

  const startEditing = (court: ApiCourt) => {
    setEditing(court);
    setIsFormOpen(true);
    setName(court.name);
    setSport(court.sport);
    setPriceText(String(court.price));
    setFormError(null);
  };

  const hasActiveCourt = courts.some((court) => court.active);
  const filteredCourts = courts.filter((court) => {
    const matchesQuery = court.name.toLocaleLowerCase('es-AR').includes(courtQuery.trim().toLocaleLowerCase('es-AR'));
    const matchesSport = sportFilter === 'all' || court.sport === sportFilter;
    const matchesState = stateFilter === 'all' || (stateFilter === 'active' ? court.active : !court.active);
    return matchesQuery && matchesSport && matchesState;
  });
  const hasCourtFilters = courtQuery.trim() !== '' || sportFilter !== 'all' || stateFilter !== 'all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setFormError(null);
    setIsSaving(true);

    // Las reglas las valida el servidor; los errores se muestran acá sin cerrar el formulario ni perder lo escrito.
    const input: CourtInput = { name, sport, price: priceText.trim() === '' ? NaN : Number(priceText) };
    try {
      if (editing) {
        const updated = await api.update(editing.id, input);
        onCourtsChange(courts.map((court) => (court.id === updated.id ? { ...court, ...updated } : court)));
        showToast({ title: 'Cancha actualizada', message: `Guardamos los cambios de «${updated.name}».`, type: 'success' });
      } else {
        const created = await api.create(input);
        onCourtsChange([...courts, { ...created, hasSchedule: false }]);
        showToast({ title: 'Cancha creada', message: `«${created.name}» ya se muestra en el sitio.`, type: 'success' });
      }
      resetForm();
    } catch (err) {
      setIsFormOpen(true);
      setFormError(err instanceof Error ? err.message : 'No pudimos guardar la cancha. Probá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (court: ApiCourt) => {
    if (togglingId) return;
    setTogglingId(court.id);
    try {
      const updated = await api.update(court.id, { active: !court.active });
      onCourtsChange(courts.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
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

  const handleDelete = async (court: ApiCourt) => {
    if (deletingId) return;
    setDeletingId(court.id);
    try {
      await api.remove(court.id);
      onCourtsChange(courts.filter((c) => c.id !== court.id));
      if (editing?.id === court.id) resetForm();
      setConfirmingId(null);
      showToast({ title: 'Cancha borrada', message: `«${court.name}» ya no se muestra en el sitio.`, type: 'success' });
    } catch (err) {
      // La cancha sigue en la lista y la confirmación queda abierta para reintentar o cancelar.
      showToast({
        title: 'No pudimos borrar la cancha',
        message: err instanceof Error ? err.message : 'Probá de nuevo.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="p-8 rounded-xl bg-surface border border-line text-sm text-ink-muted" role="status">
        Cargando las canchas de {clubLabel}...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="p-8 rounded-xl bg-surface border border-line text-center space-y-4">
        <p className="text-sm text-ink">No pudimos cargar las canchas de {clubLabel}. Revisá tu conexión y probá de nuevo.</p>
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
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Gestión de canchas</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          {isOwnClub ? 'Creá y editá tus canchas.' : `Creá y editá las canchas de ${clubLabel}.`} Lo que cargues se
          muestra en el sitio; una cancha desactivada deja de mostrarse y la podés reactivar, y una borrada no se puede
          recuperar.
        </p>
      </div>

      {!hasActiveCourt && (
        <div
          role="status"
          className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-2.5 text-sm text-ink"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Sin canchas activas, {clubLabel} no se muestra en el sitio.</span>
        </div>
      )}

      <section className="rounded-xl border border-line bg-surface overflow-hidden" aria-label={editing ? 'Editar cancha' : 'Crear cancha'}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 border-b border-line">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              {editing ? <Pencil className="w-4 h-4 text-turf" aria-hidden="true" /> : <Plus className="w-4 h-4 text-turf" aria-hidden="true" />}
              <span>{editing ? `Editar ${editing.name}` : 'Nueva cancha'}</span>
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">Completá los datos para registrar una instalación deportiva en el club.</p>
          </div>
          <button
            type="button"
            aria-expanded={isFormOpen}
            aria-controls="court-form-panel"
            onClick={() => setIsFormOpen((open) => !open)}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf"
          >
            <span>{isFormOpen ? 'Ocultar formulario' : 'Mostrar formulario'}</span>
            {isFormOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        <form
          id="court-form-panel"
          onSubmit={handleSubmit}
          noValidate
          className={`${isFormOpen ? 'grid' : 'hidden'} grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(150px,0.9fr)_minmax(150px,0.8fr)_auto] lg:items-end`}
          aria-label={editing ? 'Editar cancha' : 'Nueva cancha'}
          hidden={!isFormOpen}
        >
            <div className="sm:col-span-2 lg:col-span-1">
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
              <select id="court-sport" value={sport} onChange={(e) => setSport(e.target.value as SportType)} className={FIELD_CLASS}>
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

            <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
              <Button type="submit" variant="volt" size="md" disabled={isSaving} className="flex-1 lg:flex-none">
                <span>{isSaving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear cancha'}</span>
              </Button>
              {editing && (
                <Button type="button" variant="secondary" size="md" onClick={resetForm} disabled={isSaving}>
                  <span>Cancelar</span>
                </Button>
              )}
            </div>

            {formError && (
              <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed sm:col-span-2 lg:col-span-full">
                {formError}
              </p>
            )}
        </form>
      </section>

      <section className="space-y-3" aria-labelledby="courts-list-title">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="courts-list-title" className="font-display text-lg sm:text-xl font-bold text-ink">Canchas de {clubLabel}</h3>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
              {filteredCourts.length} {filteredCourts.length === 1 ? 'cancha' : 'canchas'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">Creá y editá las canchas. Una cancha desactivada deja de mostrarse en el sitio; podés reactivarla cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_minmax(145px,auto)_minmax(145px,auto)_auto] sm:items-center">
          <label className="relative block min-w-0">
            <span className="sr-only">Buscar cancha por nombre</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={courtQuery}
              onChange={(event) => setCourtQuery(event.target.value)}
              placeholder="Buscar por nombre..."
              className={`${FIELD_CLASS} pl-9 focus-visible:ring-2 focus-visible:ring-turf`}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar canchas por deporte</span>
            <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value as SportType | 'all')} className={FIELD_CLASS}>
              <option value="all">Todos los deportes</option>
              {SPORTS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar canchas por estado</span>
            <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value as 'all' | 'active' | 'inactive')} className={FIELD_CLASS}>
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Desactivadas</option>
            </select>
          </label>
          {hasCourtFilters && (
            <button
              type="button"
              onClick={() => { setCourtQuery(''); setSportFilter('all'); setStateFilter('all'); }}
              className="min-h-[44px] px-3 text-sm font-semibold text-turf-ink underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <p className="text-xs text-ink-muted" aria-live="polite">
          {hasCourtFilters ? `Mostrando ${filteredCourts.length} de ${courts.length} canchas` : `${courts.length} ${courts.length === 1 ? 'cancha registrada' : 'canchas registradas'}`}
        </p>

        {courts.length > 0 && (
          <p className="text-xs text-ink-muted sm:hidden">Deslizá la tabla hacia los lados para ver todas las columnas.</p>
        )}
        <div
          role="region"
          aria-label="Tabla de canchas; se puede desplazar horizontalmente"
          tabIndex={0}
          className="min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-line bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf"
        >
          {courts.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">
              Todavía no cargaste canchas. Creá la primera con el formulario.
            </p>
          ) : filteredCourts.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No hay canchas que coincidan con esos filtros.</p>
          ) : (
            <table className="w-full min-w-[900px] text-left text-xs sm:text-sm">
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
                {filteredCourts.map((court) => (
                  <React.Fragment key={court.id}>
                  <tr className={court.active ? '' : 'opacity-70'}>
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
                      {court.hasSchedule === false && (
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          Sin horarios
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {confirmingId === court.id ? (
                        <div role="alertdialog" aria-label={`Confirmar el borrado de ${court.name}`} className="flex flex-wrap items-center justify-end gap-2">
                          <span className="text-xs text-ink">
                            ¿Borrar «{court.name}»? No se puede deshacer.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(court)}
                            disabled={deletingId === court.id}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-600/60 bg-red-600/10 text-xs font-semibold text-red-700 hover:bg-red-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{deletingId === court.id ? 'Borrando...' : 'Borrar'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={deletingId === court.id}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditing(court)}
                          aria-label={`Editar ${court.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSchedulingId(schedulingId === court.id ? null : court.id)}
                          aria-expanded={schedulingId === court.id}
                          aria-label={`Horarios de ${court.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                        >
                          <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Horarios</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(court)}
                          disabled={togglingId === court.id}
                          aria-label={`${court.active ? 'Desactivar' : 'Activar'} ${court.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{court.active ? 'Desactivar' : 'Activar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(court.id)}
                          aria-label={`Borrar ${court.name}`}
                          className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-red-700 hover:bg-red-600/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Borrar</span>
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                  {schedulingId === court.id && (
                    <tr className="bg-canvas">
                      <td colSpan={5}>
                        <CourtScheduleEditor
                          courtName={court.name}
                          load={() => api.loadSchedule(court.id)}
                          save={(days) => api.saveSchedule(court.id, days)}
                          onSaved={(days) =>
                            onCourtsChange(courts.map((c) => (c.id === court.id ? { ...c, hasSchedule: days.length > 0 } : c)))
                          }
                          onClose={() => setSchedulingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
