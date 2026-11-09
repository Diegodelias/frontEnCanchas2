import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MvpConfigProvider } from './context/MvpConfigContext';
import { PlaysProvider } from './context/PlaysContext';
import { SiteProvider } from './context/SiteContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AccessPage } from './pages/AccessPage';
import { ClubAdminPage } from './pages/ClubAdminPage';
import { LandingPage } from './pages/LandingPage';
import { LiveCamerasPage } from './pages/LiveCamerasPage';
import { LivePlayerPage } from './pages/LivePlayerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlayerPage } from './pages/PlayerPage';
import { PlatformAdminPage } from './pages/PlatformAdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ROUTES } from './routes/paths';

export function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
      <BrowserRouter>
        <AuthProvider>
            <MvpConfigProvider>
              <PlaysProvider>
                <ToastProvider>
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
