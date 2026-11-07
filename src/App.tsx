import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplexesProvider } from './context/ComplexesContext';
import { MvpConfigProvider } from './context/MvpConfigContext';
import { PlaysProvider } from './context/PlaysContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AccessPage } from './pages/AccessPage';
import { ClubAdminPage } from './pages/ClubAdminPage';
import { CourtQrPage } from './pages/CourtQrPage';
import { LandingPage } from './pages/LandingPage';
import { LiveCamerasPage } from './pages/LiveCamerasPage';
import { LivePlayerPage } from './pages/LivePlayerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlayerPage } from './pages/PlayerPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ROUTES } from './routes/paths';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ComplexesProvider>
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
                    <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.CLUB_ADMIN} element={<ClubAdminPage />} />
                    <Route path="/admin" element={<Navigate to={ROUTES.CLUB_ADMIN} replace />} />
                    <Route path={ROUTES.QR_SCAN} element={<CourtQrPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ToastProvider>
              </PlaysProvider>
            </MvpConfigProvider>
          </ComplexesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
