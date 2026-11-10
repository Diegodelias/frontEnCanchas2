import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { ClubDetail } from '../components/platform/ClubDetail';
import { ClubsList } from '../components/platform/ClubsList';
import { GrantExtraPlaysForm } from '../components/platform/GrantExtraPlaysForm';
import { PlaySettingsForm } from '../components/platform/PlaySettingsForm';
import { SiteNameForm } from '../components/platform/SiteNameForm';
import { CreatePlayerForm } from '../components/ui/CreatePlayerForm';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { platformApi, PlatformClub } from '../services/platformApi';
import { ROUTES } from '../routes/paths';

/**
 * Panel de la plataforma: solo para el superadmin. Gestiona clubes, canchas de cualquier club y admins de club.
 * La guarda es de pantalla; el backend rechaza igual cualquier pedido de otro rol.
 */
export const PlatformAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeRole, isLoading } = useAuth();
  const { showToast } = useToast();
  const { name: siteName } = useSite();

  const isSuperadmin = activeRole === 'superadmin' && user?.role === 'superadmin';

  // La búsqueda y la página de la lista de clubes viven acá, así vuelven como estaban al salir del detalle de un club.
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  // El club que se está gestionando (sus canchas y admins), o null si se ve la lista.
  const [selected, setSelected] = useState<PlatformClub | null>(null);
  const handleQueryChange = useCallback((next: string) => {
    setQuery(next);
    setPage(1);
  }, []);

  const redirected = useRef(false);
  useEffect(() => {
    if (isLoading || isSuperadmin || redirected.current) return;
    redirected.current = true;
    if (user) {
      // Con sesión de admin de club o de jugador: vuelve a la home con el aviso.
      showToast({
        title: 'Panel solo para el superadmin',
        message: 'El panel de la plataforma es para el superadmin. Seguís con tu sesión actual.',
        type: 'info',
      });
      navigate(ROUTES.HOME, { replace: true });
    } else {
      // Sin sesión: a la home con el formulario de ingreso de admin abierto.
      navigate(ROUTES.HOME, { replace: true, state: { openLogin: 'admin' } });
    }
  }, [isLoading, isSuperadmin, user, navigate, showToast]);

  // Mientras se sabe si hay sesión, y para quien no es superadmin, no se muestra nada del panel.
  if (isLoading || !isSuperadmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader />

      <main className="flex-1 py-5 sm:py-8 lg:py-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-line">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-turf-ink px-2.5 py-0.5 rounded bg-turf-soft">
              Panel de la plataforma
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink flex items-start sm:items-center gap-2 sm:gap-3">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-turf shrink-0 mt-1 sm:mt-0" aria-hidden="true" />
              <span className="min-w-0 break-words">Clubes de {siteName}</span>
            </h1>
            <p className="mt-2 sm:mt-1 text-sm text-ink-muted leading-relaxed">
              Creá clubes, gestioná sus canchas e invitá a sus administradores.
            </p>
          </div>

          {!selected && <SiteNameForm />}

          {!selected && <PlaySettingsForm />}

          {!selected && <CreatePlayerForm create={platformApi.createPlayer} />}

          {!selected && <GrantExtraPlaysForm />}

          {selected ? (
            <ClubDetail club={selected} onBack={() => setSelected(null)} />
          ) : (
            <ClubsList
              query={query}
              onQueryChange={handleQueryChange}
              page={page}
              onPageChange={setPage}
              onManage={setSelected}
            />
          )}
        </div>
      </main>
    </div>
  );
};
