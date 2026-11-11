import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  LayoutGrid,
  Users,
  Video,
} from 'lucide-react';
import { BookingsList } from '../components/club/BookingsList';
import { CourtsManager } from '../components/club/CourtsManager';
import { RecordingsList } from '../components/club/RecordingsList';
import { ownClubCourtsApi } from '../components/club/courtsApi';
import { useMyCourts } from '../components/club/useMyCourts';
import { AppHeader } from '../components/layout/AppHeader';
import { CreatePlayerForm } from '../components/ui/CreatePlayerForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsApi } from '../services/bookingsApi';
import { clubsApi } from '../services/clubsApi';
import { ROUTES } from '../routes/paths';

export const ClubAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeRole, isLoading } = useAuth();
  const { showToast } = useToast();

  // Solo un admin con sesión real ve el panel, y siempre el de su propio club.
  const isClubAdmin = activeRole === 'club_admin' && user?.role === 'club_admin' && !!user.clubId;
  const clubId = isClubAdmin ? user!.clubId! : null;
  // Datos reales del club y sus canchas, del backend (solo se piden cuando ya se sabe que hay un admin).
  const { club, courts, setCourts, status: courtsStatus, reload: reloadCourts } = useMyCourts(isClubAdmin);

  const redirected = useRef(false);
  useEffect(() => {
    if (isLoading || isClubAdmin || redirected.current) return;
    redirected.current = true;
    if (user && activeRole === 'superadmin') {
      // El superadmin no tiene club: su panel es el de la plataforma.
      navigate(ROUTES.PLATFORM_ADMIN, { replace: true });
    } else if (user && activeRole === 'player') {
      showToast({
        title: 'Panel solo para administradores',
        message: 'El panel del club es para administradores de club. Seguís con tu perfil de jugador.',
        type: 'info',
      });
      navigate(ROUTES.HOME, { replace: true });
    } else {
      navigate(ROUTES.HOME, { replace: true, state: { openLogin: 'admin' } });
    }
  }, [isLoading, isClubAdmin, user, activeRole, navigate, showToast]);

  const [activeTab, setActiveTab] = useState<'courts' | 'bookings' | 'matches' | 'players'>('courts');
  // Cantidad de grabaciones del club: la informa la pestaña cuando las carga.
  const [recordingsCount, setRecordingsCount] = useState<number | null>(null);

  // Mientras se consulta la sesión, o si no es admin (y se está redirigiendo), no se muestra nada del panel.
  if (isLoading || !isClubAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader presentation="compact" />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Aviso: el superadmin desactivó el club. Sigue pudiendo gestionar sus canchas, pero no se muestra en el sitio. */}
          {club && club.active === false && (
            <div
              role="status"
              className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-2.5 text-sm text-ink"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Tu club está desactivado y no se muestra en el sitio. Podés seguir gestionando tus canchas; para
                reactivarlo, consultá con la plataforma.
              </span>
            </div>
          )}

          {/* Header Panel */}
          <div className="p-6 rounded-2xl bg-surface border border-line flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-turf-ink px-2.5 py-0.5 rounded bg-turf-soft">
                  Panel de Administración de Complejo
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink flex items-center gap-3">
                <Building2 className="w-8 h-8 text-turf shrink-0" aria-hidden="true" />
                <span>{club?.name ?? user?.clubName ?? 'Tu club'}</span>
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {[club?.zone, courtsStatus === 'ready' ? `${courts.length} ${courts.length === 1 ? 'cancha' : 'canchas'}` : null].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-line overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('courts')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'courts'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Canchas{courtsStatus === 'ready' ? ` (${courts.length})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Reservas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Partidos del Complejo{recordingsCount === null ? '' : ` (${recordingsCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('players')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'players'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Jugadores</span>
            </button>

          </div>

          {/* TAB 1: Canchas del club (datos reales del backend) */}
          {activeTab === 'courts' && (
            <CourtsManager
              api={ownClubCourtsApi}
              courts={courts}
              status={courtsStatus}
              onRetry={reloadCourts}
              onCourtsChange={setCourts}
            />
          )}

          {/* Reservas de las canchas del club (datos reales del backend, solo lectura) */}
          {activeTab === 'bookings' && <BookingsList load={bookingsApi.fetchOwnBookings} onDelete={(booking) => bookingsApi.deleteOwnBooking(booking.id)} />}

          {/* Alta de jugadores: devuelve un link de acceso para entregar sin depender del mail */}
          {activeTab === 'players' && <CreatePlayerForm create={clubsApi.createPlayer} />}

          {/* Partidos del complejo: grabaciones reales del backend, solo lectura */}
          {activeTab === 'matches' && <RecordingsList onCountChange={setRecordingsCount} />}

        </div>
      </main>

    </div>
  );
};
