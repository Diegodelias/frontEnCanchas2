import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Building2, CalendarDays, LayoutGrid, Trash2, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { bookingsApi } from '../../services/bookingsApi';
import { ApiCourt } from '../../services/clubsApi';
import { platformApi, PlatformClub } from '../../services/platformApi';
import { BookingsList } from '../club/BookingsList';
import { CourtsManager } from '../club/CourtsManager';
import { platformCourtsApi } from '../club/courtsApi';
import { MyCourtsStatus } from '../club/useMyCourts';
import { ClubAdminsManager } from './ClubAdminsManager';

interface ClubDetailProps {
  club: PlatformClub;
  onBack: () => void;
}

/** Un club visto por el superadmin: sus datos y la gestión de sus canchas. */
export const ClubDetail: React.FC<ClubDetailProps> = ({ club, onBack }) => {
  const [courts, setCourts] = useState<ApiCourt[]>([]);
  const [courtsStatus, setCourtsStatus] = useState<MyCourtsStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(0);
  const [tab, setTab] = useState<'courts' | 'bookings' | 'admins'>('courts');
  // Cantidad de admins vigentes: la informa la pestaña de admins cuando la carga.
  const [adminsCount, setAdminsCount] = useState<number | null>(null);

  // Eliminar el club: una confirmación en el propio detalle que pide escribir el nombre.
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const nameMatches = typedName.trim() === club.name;

  const closeDelete = () => {
    setConfirmingDelete(false);
    setTypedName('');
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (deleting || !nameMatches) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await platformApi.deleteClub(club.id);
      showToast({ title: 'Club eliminado', message: `«${club.name}» se eliminó de forma definitiva.`, type: 'success' });
      onBack();
    } catch (err) {
      // La confirmación queda abierta con el motivo: por ejemplo, que el club tiene reservas o grabaciones.
      setDeleteError(err instanceof Error ? err.message : 'No pudimos eliminar el club. Probá de nuevo.');
      setDeleting(false);
    }
  };

  useEffect(() => {
    const seq = ++latest.current;
    setCourtsStatus('loading');
    platformApi
      .listCourts(club.id)
      .then((list) => {
        if (seq !== latest.current) return;
        setCourts(list);
        setCourtsStatus('ready');
      })
      .catch(() => {
        if (seq !== latest.current) return;
        setCourtsStatus('error');
      });
  }, [club.id, attempt]);

  const retryCourts = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Volver a los clubes</span>
      </button>

      <div className="min-w-0 p-4 sm:p-5 rounded-xl bg-surface border border-line">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 font-display text-xl sm:text-3xl font-extrabold tracking-tight text-ink flex items-start sm:items-center gap-2.5">
            <Building2 className="w-6 h-6 text-turf shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{club.name}</span>
          </h2>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
              club.active ? 'bg-turf-soft text-turf-ink' : 'bg-surface-muted text-ink-muted'
            }`}
          >
            {club.active ? 'Activo' : 'Desactivado'}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink-muted break-all">{club.id}</p>
        <p className="mt-0.5 text-sm text-ink-muted break-words">
          {club.zone} · {club.address}
        </p>
        {!club.active && (
          <p className="mt-2 text-xs text-ink-muted">
            Este club está desactivado y no se muestra en el sitio. Sus canchas y sus admins se conservan.
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-line">
          {confirmingDelete ? (
            <div role="alertdialog" aria-label={`Confirmar la eliminación de ${club.name}`} className="space-y-3">
              <p className="text-sm text-ink">
                ¿Eliminar «{club.name}» de forma definitiva? Se eliminan también sus canchas, sus horarios y sus admins. Solo se puede si el club no
                tiene reservas ni grabaciones, y no se puede deshacer.
              </p>
              <div>
                <label htmlFor="delete-club-name" className="block text-xs font-semibold text-ink-muted mb-1">
                  Para confirmar, escribí el nombre del club
                </label>
                <input
                  id="delete-club-name"
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={club.name}
                  autoComplete="off"
                  disabled={deleting}
                  className="w-full max-w-md min-h-[44px] px-3 rounded-lg border border-line bg-surface text-sm text-ink focus:outline-none focus:ring-2 focus:ring-turf"
                />
              </div>
              {deleteError && (
                <p role="alert" className="text-sm text-red-600">
                  {deleteError}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!nameMatches || deleting}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-lg border border-red-600 bg-red-600 text-sm font-semibold text-white hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>{deleting ? 'Eliminando...' : 'Eliminar club'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="min-h-[44px] px-3 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-lg border border-line text-sm font-semibold text-red-600 hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Eliminar club</span>
            </button>
          )}
        </div>
      </div>

      <div className="min-w-0 flex items-center gap-1 sm:gap-2 border-b border-line overflow-x-auto overscroll-x-contain pb-px">
        {(
          [
            { id: 'courts', label: `Canchas${courtsStatus === 'ready' ? ` (${courts.length})` : ''}`, icon: LayoutGrid },
            { id: 'bookings', label: 'Reservas', icon: CalendarDays },
            { id: 'admins', label: `Admins${adminsCount === null ? '' : ` (${adminsCount})`}`, icon: Users },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`min-h-[44px] px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
              tab === id ? 'border-turf text-turf-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'courts' && (
        <CourtsManager
          api={platformCourtsApi(club.id)}
          clubLabel={club.name}
          courts={courts}
          status={courtsStatus}
          onRetry={retryCourts}
          onCourtsChange={setCourts}
        />
      )}

      {tab === 'bookings' && (
        <BookingsList
          load={() => bookingsApi.fetchPlatformBookings(club.id)}
          onDelete={(booking) => bookingsApi.deletePlatformBooking(club.id, booking.id)}
          clubLabel={club.name}
        />
      )}

      {tab === 'admins' && <ClubAdminsManager clubId={club.id} clubName={club.name} onCountChange={setAdminsCount} />}
    </div>
  );
};
