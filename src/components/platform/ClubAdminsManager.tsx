import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, Mail, RotateCcw, UserMinus, UserPlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { platformApi, PlatformAdmin, PlatformAdminStatus } from '../../services/platformApi';
import { Button } from '../ui/Button';

const FIELD_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-line bg-canvas text-ink placeholder:text-ink-muted focus:outline-none focus:border-turf';

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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Admins de {clubName}</h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Invitá a un admin con su mail: recibe un link de 72 horas para elegir su contraseña. Vos no ves ni cambiás
          contraseñas ni mails; si un mail está mal, dalo de baja e invitá el correcto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 rounded-xl border border-line bg-surface overflow-x-auto">
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
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {admins.map((admin) => (
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
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-600/60 bg-red-600/10 text-xs font-semibold text-red-700 hover:bg-red-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserMinus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{busyId === admin.id ? 'Guardando...' : 'Dar de baja'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={busyId === admin.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-red-700 hover:bg-red-600/10 transition-colors cursor-pointer"
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
          )}
        </div>

        <form
          onSubmit={handleInvite}
          noValidate
          className="p-5 rounded-xl border border-line bg-surface space-y-4"
          aria-label="Invitar a un admin"
        >
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-turf" aria-hidden="true" />
            <span>Invitar a un admin</span>
          </h3>

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

          {formError && (
            <p
              id={errorId}
              role="alert"
              className="text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </p>
          )}

          <Button type="submit" variant="volt" size="sm" fullWidth disabled={isInviting}>
            {isInviting ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </form>
      </div>
    </div>
  );
};
