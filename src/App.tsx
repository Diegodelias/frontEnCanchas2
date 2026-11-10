import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MvpConfigProvider } from './context/MvpConfigContext';
import { PlaysProvider } from './context/PlaysContext';
import { SiteProvider } from './context/SiteContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { ROUTES } from './routes/paths';

const AccessPage = lazy(() => import('./pages/AccessPage').then((module) => ({ default: module.AccessPage })));
const ClubAdminPage = lazy(() => import('./pages/ClubAdminPage').then((module) => ({ default: module.ClubAdminPage })));
const LiveCamerasPage = lazy(() => import('./pages/LiveCamerasPage').then((module) => ({ default: module.LiveCamerasPage })));
const LivePlayerPage = lazy(() => import('./pages/LivePlayerPage').then((module) => ({ default: module.LivePlayerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const PlayerPage = lazy(() => import('./pages/PlayerPage').then((module) => ({ default: module.PlayerPage })));
const PlatformAdminPage = lazy(() => import('./pages/PlatformAdminPage').then((module) => ({ default: module.PlatformAdminPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })));

export function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
      <BrowserRouter>
        <AuthProvider>
            <MvpConfigProvider>
              <PlaysProvider>
                <ToastProvider>
                  <Suspense fallback={<div className="min-h-screen bg-pitch" />}>
                    <Routes>
                    <Route path={ROUTES.HOME} element={<LandingPage />} />
                    <Route path="/buscar" element={<Navigate to={ROUTES.HOME} replace />} />
                    <Route path={ROUTES.LIVE} element={<LiveCamerasPage />} />
                    <Route path={ROUTES.LIVE_STREAM} element={<LivePlayerPage />} />
                    <Route path={ROUTES.MATCH} element={<PlayerPage mode="match" />} />
                    <Route path={ROUTES.PLAY} element={<PlayerPage mode="play" />} />
                    <Route path={ROUTES.ACCESS} element={<AccessPage />} />
                    <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                    <Route path={ROUTES.ADMIN_INVITATION} element={<ResetPasswordPage mode="invite" />} />
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.CLUB_ADMIN} element={<ClubAdminPage />} />
                    <Route path={ROUTES.PLATFORM_ADMIN} element={<PlatformAdminPage />} />
                    <Route path="/admin" element={<Navigate to={ROUTES.CLUB_ADMIN} replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </ToastProvider>
              </PlaysProvider>
            </MvpConfigProvider>
        </AuthProvider>
      </BrowserRouter>
      </SiteProvider>
    </ThemeProvider>
  );
}

export default App;
