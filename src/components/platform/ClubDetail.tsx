import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Building2, CalendarDays, LayoutGrid, Users } from 'lucide-react';
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
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Volver a los clubes</span>
      </button>

      <div className="p-5 rounded-xl bg-surface border border-line">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-turf shrink-0" aria-hidden="true" />
            <span>{club.name}</span>
          </h2>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
              club.active ? 'bg-turf-soft text-turf-ink' : 'bg-surface-muted text-ink-muted'
            }`}
          >
            {club.active ? 'Activo' : 'Desactivado'}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink-muted">{club.id}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {club.zone} · {club.address}
        </p>
        {!club.active && (
          <p className="mt-2 text-xs text-ink-muted">
            Este club está desactivado y no se muestra en el sitio. Sus canchas y sus admins se conservan.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-line overflow-x-auto pb-px">
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
            className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
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
        <BookingsList load={() => bookingsApi.fetchPlatformBookings(club.id)} clubLabel={club.name} />
      )}

      {tab === 'admins' && <ClubAdminsManager clubId={club.id} clubName={club.name} onCountChange={setAdminsCount} />}
    </div>
  );
};
