import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { ROUTES } from '../../routes/paths';
import { LoginAccessModal } from '../modals/LoginAccessModal';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandWordmark } from '../ui/BrandWordmark';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { authMode, user, activeRole, logout } = useAuth();
  const { name: siteName } = useSite();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to={ROUTES.HOME}
            aria-label={`${siteName} Inicio`}
            className="inline-flex items-center shrink-0 py-1"
          >
            <BrandWordmark tone="light" />
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Navegación del sitio"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted"
          >
            <Link
              to={ROUTES.HOME}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
                isActive(ROUTES.HOME) ? 'text-ink font-semibold' : 'hover:text-ink'
              }`}
            >
              Inicio
            </Link>

            <Link
              to={ROUTES.LIVE}
              className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
                isActive(ROUTES.LIVE) ? 'text-ink font-semibold' : 'hover:text-ink'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              <span>En vivo</span>
            </Link>

            {/* Contextual links based on logged role */}
            {activeRole === 'player' && (
              <Link
                to={ROUTES.PROFILE}
                className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  isActive(ROUTES.PROFILE) ? 'text-ink font-semibold' : 'hover:text-ink'
                }`}
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Mi perfil</span>
              </Link>
            )}

            {activeRole === 'club_admin' && (
              <Link
                to={ROUTES.CLUB_ADMIN}
                className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  isActive(ROUTES.CLUB_ADMIN) ? 'text-ink font-semibold' : 'hover:text-ink'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-turf" aria-hidden="true" />
                <span>Panel Administración</span>
              </Link>
            )}

            {activeRole === 'superadmin' && (
              <Link
                to={ROUTES.PLATFORM_ADMIN}
                className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 ${
                  isActive(ROUTES.PLATFORM_ADMIN) ? 'text-ink font-semibold' : 'hover:text-ink'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-turf" aria-hidden="true" />
                <span>Panel de la plataforma</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Actions & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* If logged in: User Menu */}
            {authMode === 'registered' && user ? (
              <div className="relative hidden md:block">
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
                    {user.roleLabel ?? (activeRole === 'club_admin' ? 'Administrador' : 'Jugador')}
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

                    {activeRole === 'superadmin' && (
                      <Link
                        to={ROUTES.PLATFORM_ADMIN}
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-2 rounded-lg flex items-center gap-2 text-ink hover:bg-surface-muted transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-turf" />
                        <span>Panel de la plataforma</span>
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
                onClick={() => setLoginModalOpen(true)}
                className="hidden md:inline-flex items-center justify-center h-9 px-3.5 py-1.5 text-sm font-semibold text-ink hover:text-turf transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer self-center"
              >
                Ingresar
              </button>
            )}

            <Link to="/#complejos">
              <Button variant="volt" size="sm" className="hidden sm:inline-flex">
                <span>Reservá tu cancha</span>
              </Button>
            </Link>

            <div className="theme-toggle-container flex items-center justify-center shrink-0 self-center my-auto sm:ml-0.5">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="md:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-4 py-4 space-y-3">
            <nav aria-label="Navegación móvil" className="flex flex-col space-y-1">
              <Link
                to={ROUTES.HOME}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf"
              >
                Inicio
              </Link>
              <Link
                to={ROUTES.LIVE}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                <span>Canchas en vivo</span>
              </Link>

              {activeRole === 'player' && (
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf"
                >
                  Mi perfil y jugadas
                </Link>
              )}

              {activeRole === 'club_admin' && (
                <Link
                  to={ROUTES.CLUB_ADMIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf gap-2"
                >
                  <Building2 className="w-4 h-4 text-turf" />
                  <span>Panel de Administración</span>
                </Link>
              )}

              {activeRole === 'superadmin' && (
                <Link
                  to={ROUTES.PLATFORM_ADMIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center text-base font-medium text-ink hover:text-turf gap-2"
                >
                  <Building2 className="w-4 h-4 text-turf" />
                  <span>Panel de la plataforma</span>
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Tema visual</span>
              <div className="theme-toggle-container flex items-center shrink-0 self-center my-auto">
                <ThemeToggle variant="switch" showLabel />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link to="/#complejos" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="volt" fullWidth size="md">
                  Reservá tu cancha
                </Button>
              </Link>

              {authMode === 'registered' && user ? (
                <div className="p-3 rounded-xl bg-canvas border border-line flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink">
                    <p>{user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                >
                  Ingresar
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Access Modal */}
      <LoginAccessModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
};
