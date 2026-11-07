import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_LINKS } from '../../data/landingContent';
import { ROUTES } from '../../routes/paths';
import { CityOption } from '../../types/canchas';
import { LoginAccessModal, type LoginView } from '../modals/LoginAccessModal';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandWordmark } from '../ui/BrandWordmark';
import { Button } from '../ui/Button';

interface HeaderProps {
  cities: CityOption[];
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  onFindMatchClick: () => void;
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cities,
  selectedCityId,
  onSelectCity,
  onFindMatchClick,
  onLoginClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authMode, user, activeRole, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>('player');

  // Las guardias de /panel-club y /perfil redirigen acá con { openLogin: 'admin' | 'player' }: se abre el
  // ingreso en esa vista y se limpia el estado, para que volver atrás o recargar no lo vuelva a abrir.
  const openLoginRequest = (location.state as { openLogin?: string } | null)?.openLogin;
  useEffect(() => {
    if (openLoginRequest !== 'admin' && openLoginRequest !== 'player') return;
    setLoginView(openLoginRequest);
    setLoginModalOpen(true);
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: null }
    );
  }, [openLoginRequest, location.pathname, location.search, location.hash, navigate]);

  const handleOpenLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setLoginView('player');
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            aria-label="Canchas3 Inicio"
            className="inline-flex items-center shrink-0 py-1"
          >
            <BrandWordmark tone="light" />
          </Link>

          {/* Zone 2: Desktop Navigation & Single City Selector */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink-muted"
          >
            {NAV_LINKS.map((item) =>
              item.href.startsWith('/') ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="hover:text-ink transition-colors duration-150 whitespace-nowrap shrink-0 py-1 inline-flex items-center"
                >
                  {item.href === '/en-vivo' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1.5" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-ink transition-colors duration-150 whitespace-nowrap shrink-0 py-1"
                >
                  {item.label}
                </a>
              )
            )}

            <span className="h-4 w-px bg-line shrink-0" aria-hidden="true" />

            <div className="relative inline-flex items-center text-ink shrink-0">
              <MapPin
                className="w-4 h-4 text-turf pointer-events-none shrink-0"
                aria-hidden="true"
              />
              <select
                aria-label="Ciudad"
                value={selectedCityId}
                onChange={(e) => onSelectCity(e.target.value)}
                className="appearance-none bg-transparent pl-1.5 pr-6 py-1.5 text-sm font-semibold text-ink cursor-pointer whitespace-nowrap focus:outline-none"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 text-ink-muted pointer-events-none -ml-4 shrink-0"
                aria-hidden="true"
              />
            </div>
          </nav>

          {/* Zone 3: Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* If logged in: User Menu */}
            {authMode === 'registered' && user ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-canvas hover:bg-surface-muted text-xs font-semibold text-ink transition-colors cursor-pointer self-center"
                >
                  <span className="w-6 h-6 rounded-md bg-pitch text-volt font-bold flex items-center justify-center text-[11px]">
                    {user.avatar || 'U'}
                  </span>
                  <span>{user.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] text-turf-ink bg-turf-soft px-1.5 py-0.5 rounded">
                    {activeRole === 'club_admin' ? 'Administrador' : 'Jugador'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-ink-muted" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-1.5 w-56 rounded-xl bg-surface border border-line p-1.5 shadow-xl z-50 text-xs font-medium space-y-0.5 animate-dropdown-enter"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <p className="font-bold text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-muted font-mono truncate">{user.email}</p>
                    </div>

                    {activeRole === 'player' && (
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-ink hover:bg-surface-muted transition-colors"
                      >
                        <User className="w-4 h-4 text-turf" />
                        <span>Mi perfil y jugadas</span>
                      </Link>
                    )}

                    {activeRole === 'club_admin' && (
                      <Link
                        to={ROUTES.CLUB_ADMIN}
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-ink hover:bg-surface-muted transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-turf" />
                        <span>Panel de Administración</span>
                      </Link>
                    )}

                    <div className="pt-1 border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenLogin}
                className="hidden lg:inline-flex items-center justify-center h-10 min-h-[40px] px-3.5 py-2 text-sm font-semibold text-ink hover:text-turf transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer self-center"
              >
                Ingresar
              </button>
            )}

            <Button
              variant="volt"
              size="sm"
              onClick={onFindMatchClick}
              className="text-xs sm:text-sm h-10 self-center"
            >
              Ver mi partido
            </Button>

            <div className="theme-toggle-container flex items-center justify-center shrink-0 self-center my-auto sm:ml-0.5">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="lg:hidden w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0 self-center my-auto"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-line bg-surface px-4 py-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
              <label
                htmlFor="mobile-city-select"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted"
              >
                <MapPin className="w-3.5 h-3.5 text-turf" aria-hidden="true" />
                <span>Ciudad</span>
              </label>
              <select
                id="mobile-city-select"
                value={selectedCityId}
                onChange={(e) => {
                  onSelectCity(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="min-h-[40px] px-3 py-1.5 rounded-lg border border-line-strong bg-canvas text-sm font-semibold text-ink"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.region})
                  </option>
                ))}
              </select>
            </div>

            <nav aria-label="Navegación móvil" className="flex flex-col space-y-1">
              {NAV_LINKS.map((item) =>
                item.href.startsWith('/') ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={handleMobileNavClick}
                    className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileNavClick}
                    className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Tema visual</span>
              <div className="theme-toggle-container flex items-center shrink-0 self-center my-auto">
                <ThemeToggle variant="switch" showLabel />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Button
                variant="volt"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  onFindMatchClick();
                }}
              >
                Ver mi partido
              </Button>

              {authMode === 'registered' && user ? (
                <div className="p-3 rounded-xl bg-canvas border border-line space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={logout}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {activeRole === 'player' && (
                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-turf font-bold hover:underline"
                      >
                        Ir a Mi perfil →
                      </Link>
                    )}
                    {activeRole === 'club_admin' && (
                      <Link
                        to={ROUTES.CLUB_ADMIN}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-turf font-bold hover:underline"
                      >
                        Ir a Panel de Administración →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleOpenLogin}
                >
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login / Role Access Modal */}
      <LoginAccessModal
        isOpen={loginModalOpen}
        initialView={loginView}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
};
