import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { ProfileView } from '../components/profile/ProfileView';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Solo ve el perfil quien tiene una sesión abierta en el backend. Sin sesión, a la home con el
  // ingreso de jugador abierto; el perfil nunca se muestra mientras tanto.
  const redirected = useRef(false);
  useEffect(() => {
    if (isLoading || user || redirected.current) return;
    redirected.current = true;
    navigate(ROUTES.HOME, { replace: true, state: { openLogin: 'player' } });
  }, [isLoading, user, navigate]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader presentation="profile" cta={{ label: 'Reservá tu cancha', compactLabel: 'Reservá', to: '/#complejos' }} />
      <main className="flex-1">
        <ProfileView />
      </main>
    </div>
  );
};
