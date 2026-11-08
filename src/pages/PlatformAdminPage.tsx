import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { ClubDetail } from '../components/platform/ClubDetail';
import { ClubsList } from '../components/platform/ClubsList';
import { CreatePlayerForm } from '../components/ui/CreatePlayerForm';
import { useAuth } from '../context/AuthContext';
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
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="p-6 rounded-2xl bg-surface border border-line">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-turf-ink px-2.5 py-0.5 rounded bg-turf-soft">
              Panel de la plataforma
            </span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink flex items-center gap-3">
              <Building2 className="w-8 h-8 text-turf shrink-0" aria-hidden="true" />
              <span>Clubes de Canchas3</span>
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Creá clubes, gestioná sus canchas e invitá a sus administradores.
            </p>
          </div>

          {!selected && <CreatePlayerForm create={platformApi.createPlayer} />}

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
