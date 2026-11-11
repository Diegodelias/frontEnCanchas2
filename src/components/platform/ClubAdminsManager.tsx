import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Mail, RotateCcw, Search, UserMinus, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { platformApi, PlatformAdmin, PlatformAdminStatus } from '../../services/platformApi';
import { Button } from '../ui/Button';

const FIELD_CLASS =
  'w-full min-h-[44px] px-3 py-2 text-base sm:text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

type ListStatus = 'loading' | 'ready' | 'error';

const STATUS_LABEL: Record<PlatformAdminStatus, string> = {
  invited: 'Invitado',
  active: 'Activo',
  deactivated: 'Dado de baja',
};

const STATUS_STYLE: Record<PlatformAdminStatus, string> = {
  invited: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  active: 'bg-turf-soft text-turf-ink',
  deactivated: 'bg-surface-muted text-ink-muted',
};

interface ClubAdminsManagerProps {
  clubId: string;
  clubName: string;
  /** Avisa a quien lo muestra cuántos admins vigentes (invitados y activos) tiene el club. */
  onCountChange?: (count: number) => void;
}

/**
 * Admins de un club vistos por el superadmin. Se los invita por mail (la cuenta nace sin contraseña, «Invitado») y
 * eligen su contraseña con el link. El superadmin nunca ve ni cambia contraseñas ni mails: puede reenviar la
 * invitación a un Invitado y dar de baja (lógica) a cualquiera.
 */
export const ClubAdminsManager: React.FC<ClubAdminsManagerProps> = ({ clubId, clubName, onCountChange }) => {
  const { showToast } = useToast();
  const errorId = useId();

  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(0);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(true);
  const [adminQuery, setAdminQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlatformAdminStatus | 'all'>('all');

  // Admins a los que la última invitación no se pudo enviar por mail: la cuenta existe, falta reenviar.
  const [sendFailed, setSendFailed] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const seq = ++latest.current;
    setStatus('loading');
    platformApi
      .listAdmins(clubId)
      .then((list) => {
        if (seq !== latest.current) return;
        setAdmins(list);
        setStatus('ready');
      })
      .catch(() => {
        if (seq !== latest.current) return;
        setStatus('error');
      });
  }, [clubId, attempt]);

  useEffect(() => {
    if (status === 'ready') onCountChange?.(admins.filter((a) => a.status !== 'deactivated').length);
  }, [admins, status, onCountChange]);

  /** Reemplaza (o suma) un admin en la lista, por su id. */
  const upsert = useCallback((admin: PlatformAdmin) => {
    setAdmins((prev) =>
      prev.some((a) => a.id === admin.id) ? prev.map((a) => (a.id === admin.id ? admin : a)) : [...prev, admin],
    );
  }, []);

  const markSendResult = (adminId: string, emailSent: boolean) => {
    setSendFailed((prev) => {
      const next = new Set(prev);
      if (emailSent) next.delete(adminId);
      else next.add(adminId);
      return next;
    });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInviting) return;
    setFormError(null);
    setIsInviting(true);
    try {
      const { admin, emailSent } = await platformApi.inviteAdmin(clubId, { email, name });
      upsert(admin);
      markSendResult(admin.id, emailSent);
      setEmail('');
      setName('');
      showToast(
        emailSent
          ? {
              title: 'Invitación enviada',
              message: `Le mandamos a ${admin.email} el link para elegir su contraseña.`,
              type: 'success',
            }
          : {
              title: 'No pudimos enviar la invitación',
              message: `La cuenta de ${admin.email} quedó creada. Reenviá la invitación.`,
              type: 'error',
            },
      );
    } catch (err) {
      // El formulario sigue abierto y conserva lo escrito.
      setIsInviteFormOpen(true);
      setFormError(err instanceof Error ? err.message : 'No pudimos invitar al admin. Probá de nuevo.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResend = async (admin: PlatformAdmin) => {
    if (busyId) return;
    setBusyId(admin.id);
    try {
      const result = await platformApi.resendInvitation(clubId, admin.id);
      upsert(result.admin);
      markSendResult(admin.id, result.emailSent);
      showToast(
        result.emailSent
          ? {
              title: 'Invitación reenviada',
              message: `Le mandamos un link nuevo a ${admin.email}. El anterior dejó de servir.`,
              type: 'success',
            }
          : { title: 'No pudimos enviar la invitación', message: 'Probá reenviarla de nuevo en un momento.', type: 'error' },
      );
    } catch (err) {
      showToast({
        title: 'No pudimos reenviar',
        message: err instanceof Error ? err.message : 'Probá de nuevo.',
        type: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (admin: PlatformAdmin) => {
    if (busyId) return;
    setBusyId(admin.id);
    try {
      await platformApi.removeAdmin(clubId, admin.id);
      upsert({ ...admin, status: 'deactivated', invitationExpired: false });
      markSendResult(admin.id, true);
      setConfirmingId(null);
      showToast({
        title: 'Admin dado de baja',
        message: `${admin.name ?? admin.email} ya no puede entrar. Podés volver a invitarlo cuando quieras.`,
        type: 'success',
      });
    } catch (err) {
      // La confirmación queda abierta para reintentar o cancelar.
      showToast({
        title: 'No pudimos dar de baja',
        message: err instanceof Error ? err.message : 'Probá de nuevo.',
        type: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const query = adminQuery.trim().toLocaleLowerCase('es-AR');
    const matchesQuery = !query || `${admin.name ?? ''} ${admin.email}`.toLocaleLowerCase('es-AR').includes(query);
    return matchesQuery && (statusFilter === 'all' || admin.status === statusFilter);
  });
  const hasAdminFilters = adminQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Admins de {clubName}</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Invitá a un admin con su mail: recibe un link de 72 horas para elegir su contraseña. Vos no ves ni cambiás
          contraseñas ni mails; si un mail está mal, dalo de baja e invitá el correcto.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface overflow-hidden" aria-label="Invitar a un administrador">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 border-b border-line">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-turf" aria-hidden="true" />
              <span>Invitar a un admin</span>
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">Le enviamos un enlace para que configure su contraseña.</p>
          </div>
          <button
            type="button"
            aria-expanded={isInviteFormOpen}
            aria-controls="admin-invite-form"
            onClick={() => setIsInviteFormOpen((open) => !open)}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf"
          >
            <span>{isInviteFormOpen ? 'Ocultar formulario' : 'Mostrar formulario'}</span>
            {isInviteFormOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        <form
          id="admin-invite-form"
          onSubmit={handleInvite}
          noValidate
          hidden={!isInviteFormOpen}
          className={`${isInviteFormOpen ? 'grid' : 'hidden'} grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end`}
          aria-label="Invitar a un admin"
        >
          <div>
            <label htmlFor="invite-name" className="block text-xs font-semibold text-ink mb-1.5">
              Nombre
            </label>
            <input
              id="invite-name"
              type="text"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ana Pérez"
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? errorId : undefined}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="invite-email" className="block text-xs font-semibold text-ink mb-1.5">
              Mail
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@club.com"
              autoComplete="off"
              aria-invalid={formError ? true : undefined}
              aria-describedby={formError ? errorId : undefined}
              className={FIELD_CLASS}
            />
          </div>

          <Button type="submit" variant="volt" size="md" disabled={isInviting} className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
            {isInviting ? 'Enviando...' : 'Enviar invitación'}
          </Button>

          {formError && (
            <p
              id={errorId}
              role="alert"
              className="text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-1.5 sm:col-span-2 lg:col-span-full"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </p>
          )}
        </form>
      </section>

      <section className="space-y-3" aria-labelledby="admins-list-title">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="admins-list-title" className="font-display text-lg sm:text-xl font-bold text-ink">Lista de administradores</h3>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
            {filteredAdmins.length} {filteredAdmins.length === 1 ? 'admin' : 'admins'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_minmax(165px,auto)_auto] sm:items-center">
          <label className="relative block min-w-0">
            <span className="sr-only">Buscar por nombre o mail</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={adminQuery}
              onChange={(event) => setAdminQuery(event.target.value)}
              placeholder="Buscar por nombre o mail..."
              className={`${FIELD_CLASS} pl-9 focus-visible:ring-2 focus-visible:ring-turf`}
            />
          </label>
          <label>
            <span className="sr-only">Filtrar administradores por estado</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PlatformAdminStatus | 'all')}
              className={FIELD_CLASS}
            >
              <option value="all">Todos los estados</option>
              <option value="invited">Invitados</option>
              <option value="active">Activos</option>
              <option value="deactivated">Dados de baja</option>
            </select>
          </label>
          {hasAdminFilters && (
            <button
              type="button"
              onClick={() => { setAdminQuery(''); setStatusFilter('all'); }}
              className="min-h-[44px] px-3 text-sm font-semibold text-turf-ink underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <p className="text-xs text-ink-muted" aria-live="polite">
          {hasAdminFilters ? `Mostrando ${filteredAdmins.length} de ${admins.length} admins` : `${admins.length} ${admins.length === 1 ? 'admin registrado' : 'admins registrados'}`}
        </p>

        <div className="min-w-0 rounded-xl border border-line bg-surface">
          {status === 'loading' ? (
            <p className="p-6 text-sm text-ink-muted" role="status">
              Cargando los admins...
            </p>
          ) : status === 'error' ? (
            <div role="alert" className="p-6 space-y-3">
              <p className="text-sm text-ink">No pudimos cargar los admins. Revisá tu conexión y probá de nuevo.</p>
              <Button variant="volt" size="sm" onClick={() => setAttempt((n) => n + 1)}>
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Reintentar</span>
              </Button>
            </div>
          ) : admins.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">
              Este club todavía no tiene admins. Invitá al primero con el formulario.
            </p>
          ) : (
            filteredAdmins.length === 0 ? (
              <p className="p-6 text-sm text-ink-muted">No hay administradores que coincidan con esos filtros.</p>
            ) : (
            <>
            <p className="mb-2 text-xs text-ink-muted lg:hidden">Abrí “Ver datos y acciones” para consultar el estado y gestionar cada administrador.</p>
            <div
              role="region"
              aria-label="Tabla de administradores; se puede desplazar horizontalmente"
              tabIndex={0}
              className="hidden min-w-0 overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf lg:block"
            >
            <table className="w-full min-w-[600px] text-left text-xs sm:text-sm">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className={admin.status === 'deactivated' ? 'opacity-70' : ''}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink break-words">{admin.name ?? admin.email}</p>
                      <p className="font-mono text-[11px] text-ink-muted break-all">{admin.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold whitespace-nowrap ${STATUS_STYLE[admin.status]}`}
                      >
                        {STATUS_LABEL[admin.status]}
                      </span>
                      {admin.status === 'invited' && admin.invitationExpired && (
                        <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                          La invitación venció: reenviala.
                        </p>
                      )}
                      {sendFailed.has(admin.id) && (
                        <p role="alert" className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                          No pudimos enviar la invitación, reenviala.
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {confirmingId === admin.id ? (
                        <div
                          role="alertdialog"
                          aria-label={`Confirmar la baja de ${admin.name ?? admin.email}`}
                          className="flex flex-wrap items-center justify-end gap-2"
                        >
                          <span className="text-xs text-ink max-w-[16rem] text-right">
                            ¿Dar de baja a «{admin.name ?? admin.email}»? Se cierran sus sesiones y no puede volver a
                            entrar.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemove(admin)}
                            disabled={busyId === admin.id}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-red-600/60 bg-red-600/10 text-xs font-semibold text-red-700 hover:bg-red-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserMinus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{busyId === admin.id ? 'Guardando...' : 'Dar de baja'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={busyId === admin.id}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {admin.status === 'invited' && (
                            <button
                              type="button"
                              onClick={() => handleResend(admin)}
                              disabled={busyId === admin.id}
                              aria-label={`Reenviar la invitación a ${admin.email}`}
                              className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>{busyId === admin.id ? 'Enviando...' : 'Reenviar'}</span>
                            </button>
                          )}
                          {admin.status !== 'deactivated' && (
                            <button
                              type="button"
                              onClick={() => setConfirmingId(admin.id)}
                              aria-label={`Dar de baja a ${admin.name ?? admin.email}`}
                              className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 rounded-lg border border-line text-xs font-semibold text-red-700 hover:bg-red-600/10 transition-colors cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Dar de baja</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <ul className="lg:hidden divide-y divide-line rounded-xl border border-line bg-surface" aria-label="Administradores del club">
              {filteredAdmins.map((admin) => (
                <li key={admin.id} className={`p-4 space-y-3 ${admin.status === 'deactivated' ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-ink break-words">{admin.name ?? admin.email}</p>
                      <p className="mt-0.5 font-mono text-xs text-ink-muted break-all">{admin.email}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-semibold whitespace-nowrap ${STATUS_STYLE[admin.status]}`}>
                      {STATUS_LABEL[admin.status]}
                    </span>
                  </div>
                  {admin.status === 'invited' && admin.invitationExpired && <p className="text-xs text-amber-700 dark:text-amber-400">La invitación venció: reenviala.</p>}
                  {sendFailed.has(admin.id) && <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">No pudimos enviar la invitación, reenviala.</p>}
                  <details className="group">
                    <summary className="min-h-11 flex items-center justify-between gap-2 rounded text-xs font-semibold text-turf-ink cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turf">
                      Ver datos y acciones
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="pt-2 space-y-3">
                      <div className="text-xs"><span className="text-ink-muted">Estado: </span><span className="text-ink">{STATUS_LABEL[admin.status]}</span></div>
                      {confirmingId === admin.id ? (
                        <div role="alertdialog" aria-label={`Confirmar la baja de ${admin.name ?? admin.email}`} className="space-y-2">
                          <p className="text-xs text-ink">¿Dar de baja a «{admin.name ?? admin.email}»? Se cierran sus sesiones y no puede volver a entrar.</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => handleRemove(admin)} disabled={busyId === admin.id} className="min-h-11 px-3 rounded-lg border border-red-600/60 bg-red-600/10 text-xs font-semibold text-red-700 disabled:opacity-50">{busyId === admin.id ? 'Guardando…' : 'Dar de baja'}</button>
                            <button type="button" onClick={() => setConfirmingId(null)} disabled={busyId === admin.id} className="min-h-11 px-3 rounded-lg border border-line text-xs font-semibold text-ink disabled:opacity-50">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {admin.status === 'invited' && <button type="button" onClick={() => handleResend(admin)} disabled={busyId === admin.id} aria-label={`Reenviar la invitación a ${admin.email}`} className="min-h-11 col-span-2 px-3 rounded-lg border border-line text-xs font-semibold text-ink disabled:opacity-50">{busyId === admin.id ? 'Enviando…' : 'Reenviar invitación'}</button>}
                          {admin.status !== 'deactivated' && <button type="button" onClick={() => setConfirmingId(admin.id)} aria-label={`Dar de baja a ${admin.name ?? admin.email}`} className="min-h-11 col-span-2 px-3 rounded-lg border border-line text-xs font-semibold text-red-700">Dar de baja</button>}
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            </>
            )
          )}
        </div>
      </section>
    </div>
  );
};
